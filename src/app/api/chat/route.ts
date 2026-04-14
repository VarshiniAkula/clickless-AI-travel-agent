import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import type { TravelIntent } from "@/lib/types";

const VALID_ACTIVITIES = [
  "temples", "food tours", "hiking", "museums", "beaches",
  "nightlife", "shopping", "sightseeing", "adventure", "culture",
];

// Rough token budget: ~4 chars per token. Reserve ~3 000 tokens for the system
// prompt + current intent + model response. Use the remaining budget for history.
const HISTORY_CHAR_BUDGET = 12_000;

type HistoryMessage = { role: "user" | "assistant"; content: string };

function trimHistory(history: HistoryMessage[]): HistoryMessage[] {
  let used = 0;
  const kept: HistoryMessage[] = [];
  // Walk newest → oldest, keep as many complete turns as fit the budget.
  for (let i = history.length - 1; i >= 0; i--) {
    const len = history[i].content.length;
    if (used + len > HISTORY_CHAR_BUDGET) break;
    kept.unshift(history[i]);
    used += len;
  }
  return kept;
}

function buildSystemPrompt(intent: TravelIntent): string {
  // Strip rawQuery — it's internal bookkeeping, not useful context for the model.
  const { rawQuery: _raw, ...displayIntent } = intent;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD in server-local time

  return `You are a warm, concise travel concierge helping a user refine their trip preferences.

Today's date is ${today}. Use this to resolve relative date expressions like "in 3 days", "next Friday", "this weekend", etc.

━━━ CURRENT TRIP INTENT (ground truth) ━━━
${JSON.stringify(displayIntent, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the authoritative state of the trip. Your job for each user message:
1. Read what the user said and identify ONLY the fields they explicitly changed.
2. Copy ALL other fields from the current intent above — exactly as shown, same value, same type.
3. Write a reply: 1–3 sentences, warm tone, confirm what changed, and ask about whichever fields are still null.
4. Suggest 2–4 short chip labels (≤ 4 words, action-oriented). Include "Search Now" as the last chip once destination is known and non-null.

Return ONLY valid JSON, no markdown, no extra keys:
{
  "reply": string,
  "chips": string[],
  "intent": {
    "destination": string,
    "origin": string | null,
    "duration": number | null,
    "budget": number | null,
    "travelers": number,
    "activities": string[],
    "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" } | null
  }
}

Field rules — read carefully:
- destination  : canonical city name. Copy current value unless user changed it. Use "Unknown" only if completely absent.
- origin       : departure city or null. Copy current value unless user changed it.
- duration     : nights as integer (days - 1, weeks × 7). Copy current value unless user changed it. null only if truly unknown.
- budget       : total USD as integer. Copy current value unless user changed it. null only if truly unknown.
- travelers    : integer count. couple / two of us = 2; family = 4; solo / just me = 1. Copy current value unless user changed it.
- activities   : MERGE new mentions into the existing list — do NOT reset or remove items the user didn't mention. Remove only if user explicitly says to drop one. Values must come from: ${JSON.stringify(VALID_ACTIVITIES)}.
- dates        : If the user mentions ANY departure timing — relative ("in 3 days", "next Friday", "this weekend") or absolute ("April 20", "May 10th") — you MUST compute and output a dates object. Do NOT copy the existing null. start = today + expressed offset; end = start + duration nights (use current duration field, default 5 if null). If the user said nothing about departure timing, copy the existing dates value (null or otherwise).

CRITICAL: If a field already has a non-null value and the user said nothing about it, output that exact value. Never silently set a field to null.`;
}

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY ?? "";

  if (!groqKey) {
    return NextResponse.json({ error: "Groq not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { intent, message, history } = body as {
      intent: TravelIntent;
      message: string;
      history?: HistoryMessage[];
    };

    if (!message || !intent) {
      return NextResponse.json({ error: "intent and message are required" }, { status: 400 });
    }

    const client = new Groq({ apiKey: groqKey });

    const trimmedHistory = trimHistory(history ?? []);

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        // Intent lives in the system prompt — always the authoritative base.
        { role: "system", content: buildSystemPrompt(intent) },
        // Full (budget-trimmed) conversation so the model has context for references
        // like "actually", "change that back", "remove the last one", etc.
        ...trimmedHistory,
        // Plain user message — no intent JSON here; model already has it above.
        { role: "user", content: message },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    const p = parsed.intent ?? {};

    // ── Defensive field-by-field merge ──────────────────────────────────────
    // For each field: accept Groq's value only when it is a valid non-null
    // replacement. Fall back to the existing intent value otherwise.
    // This prevents a single hallucinated null from wiping out real data.

    const safeStr = (next: unknown, fallback: string | undefined) =>
      typeof next === "string" && next.trim().length > 0 ? next : fallback;

    const safeNum = (next: unknown, fallback: number | undefined) =>
      typeof next === "number" && !isNaN(next) ? next : fallback;

    // activities: merge, never replace wholesale
    const activities: string[] = (() => {
      if (!Array.isArray(p.activities)) return intent.activities;
      const incoming = p.activities.filter(
        (a: unknown) => typeof a === "string" && VALID_ACTIVITIES.includes(a)
      ) as string[];
      // Union of existing + incoming, preserving order
      return Array.from(new Set([...intent.activities, ...incoming]));
    })();

    // dates: accept only if it looks structurally valid
    const dates = (() => {
      if (p.dates === null) return intent.dates ?? null;
      if (
        p.dates &&
        typeof p.dates.start === "string" &&
        typeof p.dates.end === "string"
      )
        return p.dates as { start: string; end: string };
      return intent.dates ?? null;
    })();

    const mergedIntent: TravelIntent = {
      destination:
        safeStr(p.destination, intent.destination) ?? intent.destination ?? "Unknown",
      origin:
        typeof p.origin === "string" && p.origin.trim().length > 0
          ? p.origin
          : (p.origin === null ? (intent.origin ?? null) : (intent.origin ?? undefined)),
      duration: safeNum(p.duration, intent.duration),
      budget: safeNum(p.budget, intent.budget),
      travelers: safeNum(p.travelers, intent.travelers) ?? 1,
      activities,
      dates: dates ?? undefined,
      rawQuery: intent.rawQuery,
    };

    return NextResponse.json({
      reply:
        typeof parsed.reply === "string"
          ? parsed.reply
          : "Got it, I've updated your preferences.",
      chips:
        Array.isArray(parsed.chips) && parsed.chips.length > 0
          ? parsed.chips
          : ["Search Now"],
      intent: mergedIntent,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
