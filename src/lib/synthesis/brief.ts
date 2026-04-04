import type { TripKnowledgeGraph } from "@/lib/knowledge/graph";
import type { TripBrief } from "@/lib/types";
import { v4 as uuid } from "uuid";

export function synthesizeTripBrief(graph: TripKnowledgeGraph): TripBrief {
  const { intent, nodes, derived } = graph;

  const summary = generateSummary(graph);

  return {
    id: uuid(),
    intent,
    flights: nodes.flights,
    hotels: nodes.hotels,
    weather: nodes.weather,
    culturalTips: nodes.cultural,
    activities: nodes.activities,
    itinerary: derived.itinerary,
    packingList: derived.packingList,
    budget: derived.budget,
    summary,
    createdAt: new Date().toISOString(),
  };
}

function generateSummary(graph: TripKnowledgeGraph): string {
  const { intent, nodes, derived } = graph;
  const nights = intent.duration || 5;
  const dest = intent.destination;
  const bestFlight = nodes.flights[0];
  const bestHotel = nodes.hotels[0];
  const avgTemp = nodes.weather.length
    ? Math.round(nodes.weather.reduce((s, w) => s + w.tempHighF, 0) / nodes.weather.length)
    : null;
  const hasRain = nodes.weather.some((w) => w.condition.toLowerCase().includes("rain"));

  const parts: string[] = [];

  parts.push(
    `Your ${nights}-night trip to ${dest}${intent.origin ? ` from ${intent.origin}` : ""} is looking great!`
  );

  if (bestFlight) {
    parts.push(
      `Best flight: ${bestFlight.airline} at $${bestFlight.price} (${bestFlight.duration}, ${bestFlight.stops === 0 ? "nonstop" : bestFlight.stops + " stop" + (bestFlight.stops > 1 ? "s" : "")}).`
    );
  }

  if (bestHotel) {
    parts.push(
      `Top hotel: ${bestHotel.name} in ${bestHotel.neighborhood || dest} — $${bestHotel.pricePerNight}/night (${bestHotel.rating}★).`
    );
  }

  if (avgTemp !== null) {
    parts.push(
      `Expect ${avgTemp}°F highs${hasRain ? " with some rain — pack an umbrella" : ""}.`
    );
  }

  if (intent.activities.length > 0) {
    parts.push(
      `We've lined up activities matching your interests: ${intent.activities.join(", ")}.`
    );
  }

  parts.push(
    `Estimated total: $${derived.budget.total}${intent.budget ? ` (${derived.budget.total <= intent.budget ? "within" : "over"} your $${intent.budget} budget)` : ""}.`
  );

  return parts.join(" ");
}

// LLM-enhanced summary (calls OpenRouter free tier)
export async function synthesizeWithLLM(
  graph: TripKnowledgeGraph,
  apiKey?: string
): Promise<string> {
  // Fallback to deterministic template if no API key
  if (!apiKey) {
    return generateSummary(graph);
  }

  const { intent, nodes, derived } = graph;

  const prompt = `You are a concise travel advisor. Summarize this trip plan in 3-4 sentences:
Destination: ${intent.destination}
Duration: ${intent.duration || 5} nights
Budget: $${intent.budget || "flexible"}
Top flight: ${nodes.flights[0]?.airline} at $${nodes.flights[0]?.price}
Hotel: ${nodes.hotels[0]?.name} at $${nodes.hotels[0]?.pricePerNight}/night
Activities: ${nodes.activities.map((a) => a.name).slice(0, 5).join(", ")}
Weather: ${nodes.weather.slice(0, 3).map((w) => `${w.condition} ${w.tempHighF}°F`).join(", ")}
Total budget: $${derived.budget.total}

Be warm, specific, and actionable. Mention the best value proposition.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.warn("LLM call failed, using template summary");
      return generateSummary(graph);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || generateSummary(graph);
  } catch {
    return generateSummary(graph);
  }
}
