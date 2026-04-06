import { describe, it, expect } from "vitest";
import { parseIntent } from "@/lib/nlu/parser";
import { getFlights, getHotels, getWeather, getCulturalTips, getActivities } from "@/lib/providers/demo-data";
import { normalizePayload } from "@/lib/extraction/normalize";
import { buildKnowledgeGraph } from "@/lib/knowledge/graph";
import { synthesizeTripBrief } from "@/lib/synthesis/brief";

describe("Trip Synthesis Pipeline", () => {
  const query = "Plan a 5-night Tokyo trip from Phoenix in April under $2000, I like temples and food tours.";

  it("produces a complete trip brief for the demo query", () => {
    const intent = parseIntent(query);
    const normalized = normalizePayload({
      flights: getFlights(intent.destination),
      hotels: getHotels(intent.destination),
      weather: getWeather(intent.destination, intent.duration || 5),
      cultural: getCulturalTips(intent.destination),
      activities: getActivities(intent.destination, intent.activities),
    });

    const graph = buildKnowledgeGraph(
      intent,
      normalized.flights,
      normalized.hotels,
      normalized.weather,
      normalized.cultural,
      normalized.activities
    );

    const brief = synthesizeTripBrief(graph);

    // Validate structure
    expect(brief.id).toBeDefined();
    expect(brief.intent.destination).toBe("Tokyo");
    expect(brief.flights.length).toBeGreaterThanOrEqual(1);
    expect(brief.flights.length).toBeLessThanOrEqual(3);
    expect(brief.hotels.length).toBeGreaterThanOrEqual(1);
    expect(brief.weather.length).toBeGreaterThanOrEqual(5);
    expect(brief.culturalTips.length).toBeGreaterThan(0);
    expect(brief.activities.length).toBeGreaterThan(0);
    expect(brief.itinerary.length).toBe(6); // 5 nights + 1 departure day
    expect(brief.packingList.length).toBeGreaterThan(5);
    expect(brief.budget.total).toBeGreaterThan(0);
    expect(brief.summary).toContain("Tokyo");
  });

  it("flights are sorted by price (cheapest first)", () => {
    const intent = parseIntent(query);
    const flights = getFlights("Tokyo");
    const graph = buildKnowledgeGraph(
      intent,
      flights,
      getHotels("Tokyo"),
      getWeather("Tokyo", 5),
      getCulturalTips("Tokyo"),
      getActivities("Tokyo", ["temples"])
    );
    const brief = synthesizeTripBrief(graph);

    for (let i = 1; i < brief.flights.length; i++) {
      expect(brief.flights[i].price).toBeGreaterThanOrEqual(brief.flights[i - 1].price);
    }
  });

  it("budget includes all categories", () => {
    const intent = parseIntent(query);
    const graph = buildKnowledgeGraph(
      intent,
      getFlights("Tokyo"),
      getHotels("Tokyo"),
      getWeather("Tokyo", 5),
      getCulturalTips("Tokyo"),
      getActivities("Tokyo", ["temples"])
    );
    const brief = synthesizeTripBrief(graph);

    expect(brief.budget.flights).toBeGreaterThan(0);
    expect(brief.budget.hotels).toBeGreaterThan(0);
    expect(brief.budget.food).toBeGreaterThan(0);
    expect(brief.budget.transport).toBeGreaterThan(0);
    expect(brief.budget.total).toBe(
      brief.budget.flights +
        brief.budget.hotels +
        brief.budget.activities +
        brief.budget.food +
        brief.budget.transport +
        brief.budget.misc
    );
  });

  it("packing list includes temple-specific items for temple interest", () => {
    const intent = parseIntent("Tokyo trip, I like temples");
    const graph = buildKnowledgeGraph(
      intent,
      getFlights("Tokyo"),
      getHotels("Tokyo"),
      getWeather("Tokyo", 5),
      getCulturalTips("Tokyo"),
      getActivities("Tokyo", ["temples"])
    );
    const brief = synthesizeTripBrief(graph);

    const itemNames = brief.packingList.map((i) => i.item.toLowerCase());
    expect(itemNames.some((i) => i.includes("modest") || i.includes("slip-on"))).toBe(true);
  });
});
