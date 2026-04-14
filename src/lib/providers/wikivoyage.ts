import type { ActivityOption, CulturalNorm } from "@/lib/types";
import { getCulturalTips, getActivities } from "@/lib/providers/demo-data";
import { loadCityCache } from "@/lib/cache";

// In-memory cache: city → { data, fetchedAt }
const cache = new Map<string, { activities: ActivityOption[]; cultural: CulturalNorm[]; fetchedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const BASE = "https://en.wikivoyage.org/w/api.php";

// Section names that contain activities
const ACTIVITY_SECTIONS = ["see", "do", "buy", "eat"];
// Section names that contain cultural tips
const CULTURAL_SECTIONS = ["understand", "culture", "stay safe", "cope", "talk", "respect"];

// ── Fetch all section indices for a city page ──
async function fetchSections(city: string): Promise<{ index: string; line: string }[]> {
  const url = new URL(BASE);
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", city);
  url.searchParams.set("prop", "sections");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Wikivoyage sections fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.parse?.sections ?? []) as { index: string; line: string }[];
}

// ── Fetch plain text of a specific section ──
async function fetchSectionText(city: string, sectionIndex: string): Promise<string> {
  const url = new URL(BASE);
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", city);
  url.searchParams.set("prop", "wikitext");
  url.searchParams.set("section", sectionIndex);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString());
  if (!res.ok) return "";
  const json = await res.json();
  return json.parse?.wikitext?.["*"] ?? "";
}

// ── Strip wiki markup and return clean lines ──
function isCleanLine(line: string): boolean {
  if (line.length < 30 || line.length > 350) return false;
  if (/thumb\|/i.test(line)) return false;
  if (/<!--/.test(line)) return false;
  if (/^\[\[(?:File|Image):/i.test(line)) return false;
  if ((line.match(/\|/g) || []).length > 3) return false;
  if (/^[|{}\[\]<>]/.test(line)) return false;
  return true;
}

function stripWikiMarkup(text: string): string[] {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, "")
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/'{2,3}/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/^[*#:;=]+\s*/, "")
        .trim()
    )
    .filter(isCleanLine);
}

// ── Parse activities from See/Do section wikitext ──
function parseActivities(wikitext: string, sectionName: string, city: string, startId: number): ActivityOption[] {
  const activities: ActivityOption[] = [];
  const lines = stripWikiMarkup(wikitext);

  // Try to extract {{listing}} templates first
  const listingRegex = /\{\{listing\s*\|([^}]+)\}\}/gi;
  let match;
  let id = startId;

  while ((match = listingRegex.exec(wikitext)) !== null) {
    const props: Record<string, string> = {};
    match[1].split("|").forEach((part) => {
      const [k, ...v] = part.split("=");
      if (k && v.length) props[k.trim().toLowerCase()] = v.join("=").trim();
    });

    const name = props["name"] || props["alt"] || "";
    const description = props["content"] || props["description"] || props["url"] || "";
    if (!name || name.length < 3) continue;

    activities.push({
      id: `wv-${id++}`,
      name: cleanText(name),
      category: sectionName,
      description: trimAtSentence(cleanText(description), 200) || `Notable ${sectionName} spot in ${city}`,
      estimatedCost: parseCost(props["price"] || "", city),
      duration: props["hours"] ? undefined : "2h",
      location: props["address"] || city,
    });
  }

  // Fallback: parse bullet points if no listings found
  if (activities.length === 0) {
    for (const line of lines.slice(0, 8)) {
      if (line.length < 15) continue;
      const parts = line.split(/[.–—:]/);
      const name = parts[0]?.trim().slice(0, 60) || line.slice(0, 60);
      const desc = parts.slice(1).join(".").trim().slice(0, 200);
      if (name.length < 5) continue;

      activities.push({
        id: `wv-${id++}`,
        name: cleanText(name),
        category: sectionName,
        description: cleanText(desc) || `${sectionName} in ${city}`,
        location: city,
      });
    }
  }

  return activities;
}

// ── Parse cultural tips from Understand/Culture/Stay Safe sections ──
function parseCulturalTips(wikitext: string, sectionName: string): CulturalNorm[] {
  const tips: CulturalNorm[] = [];
  const lines = stripWikiMarkup(wikitext);

  const categoryMap: Record<string, string> = {
    "understand": "Culture",
    "culture": "Culture",
    "stay safe": "Safety",
    "cope": "Etiquette",
    "talk": "Language",
    "respect": "Etiquette",
  };
  const category = categoryMap[sectionName] || "Etiquette";

  const importanceMap: Record<string, "high" | "medium" | "low"> = {
    "stay safe": "high",
    "understand": "medium",
    "culture": "medium",
    "cope": "low",
    "talk": "medium",
    "respect": "medium",
  };
  const importance = importanceMap[sectionName] || "medium";

  for (const line of lines.slice(0, 6)) {
    if (line.length < 20 || line.length > 300) continue;
    tips.push({
      category,
      tip: cleanText(line),
      importance,
    });
  }

  return tips;
}

function cleanText(text: string): string {
  return text
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/'{2,3}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const trimmed = text.slice(0, maxLen);
  const lastPeriod = trimmed.lastIndexOf(".");
  if (lastPeriod > maxLen * 0.4) return trimmed.slice(0, lastPeriod + 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return lastSpace > 0 ? trimmed.slice(0, lastSpace) + "..." : trimmed + "...";
}

// Approximate exchange rates to USD for common travel currencies
const CURRENCY_TO_USD: Record<string, number> = {
  "¥": 0.0067, "JPY": 0.0067,   // Japanese Yen
  "€": 1.08, "EUR": 1.08,       // Euro
  "£": 1.27, "GBP": 1.27,       // British Pound
  "MXN": 0.058, "MX$": 0.058,   // Mexican Peso
  "THB": 0.028, "฿": 0.028,     // Thai Baht
  "IDR": 0.000063, "Rp": 0.000063, // Indonesian Rupiah
};

// Map destination cities to their likely local currency symbol
const CITY_CURRENCY: Record<string, string> = {
  tokyo: "¥", kyoto: "¥", osaka: "¥",
  paris: "€", rome: "€", barcelona: "€", berlin: "€", amsterdam: "€",
  london: "£", edinburgh: "£",
  cancún: "MXN", cancun: "MXN",
  bangkok: "THB",
  bali: "IDR", jakarta: "IDR",
};

function parseCost(price: string, city?: string): number | undefined {
  if (!price) return undefined;
  const match = price.match(/[\d,]+/);
  if (!match) return undefined;
  const val = parseInt(match[0].replace(",", ""), 10);
  if (isNaN(val)) return undefined;

  // Detect currency from the price string or fall back to city default
  const currencyMatch = price.match(/([¥€£$฿]|JPY|EUR|GBP|MXN|THB|IDR|Rp)/i);
  let currencyKey = currencyMatch?.[0];

  // If no currency symbol in the price string, infer from city
  if (!currencyKey && city) {
    currencyKey = CITY_CURRENCY[city.toLowerCase()];
  }

  // Convert to USD if non-USD currency detected
  if (currencyKey && currencyKey !== "$" && currencyKey !== "USD") {
    const rate = CURRENCY_TO_USD[currencyKey];
    if (rate) return Math.round(val * rate);
  }

  return val;
}

// ── Main export ──
export async function getWikivoyageData(city: string, interests: string[]): Promise<{
  activities: ActivityOption[];
  cultural: CulturalNorm[];
}> {
  // 1. Static git-committed cache (highest priority — always available)
  const staticCache = loadCityCache(city);
  if (staticCache) {
    console.log(`[wikivoyage] Serving "${city}" from static cache (seeded ${staticCache.seededAt.slice(0, 10)})`);
    return {
      activities: filterByInterests(staticCache.activities, interests),
      cultural: staticCache.cultural,
    };
  }

  // 2. In-memory cache
  const cached = cache.get(city);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      activities: filterByInterests(cached.activities, interests),
      cultural: cached.cultural,
    };
  }

  try {
    const sections = await fetchSections(city);

    if (sections.length === 0) {
      console.warn(`[wikivoyage] No sections found for "${city}" — falling back to demo`);
      return fallback(city, interests);
    }

    const activities: ActivityOption[] = [];
    const cultural: CulturalNorm[] = [];
    let activityIdCounter = 1;

    for (const section of sections) {
      const name = section.line.toLowerCase().replace(/<[^>]+>/g, "").trim();

      if (ACTIVITY_SECTIONS.some((s) => name === s)) {
        const wikitext = await fetchSectionText(city, section.index);
        const parsed = parseActivities(wikitext, name, city, activityIdCounter);
        activityIdCounter += parsed.length;
        activities.push(...parsed);
      }

      if (CULTURAL_SECTIONS.some((s) => name === s)) {
        const wikitext = await fetchSectionText(city, section.index);
        const parsed = parseCulturalTips(wikitext, name);
        cultural.push(...parsed);
      }
    }

    // Store in cache
    cache.set(city, { activities, cultural, fetchedAt: Date.now() });
    console.log(`[wikivoyage] Live data for "${city}" — ${activities.length} activities, ${cultural.length} cultural tips`);

    return {
      activities: filterByInterests(activities, interests),
      cultural,
    };
  } catch (err) {
    console.warn(`[wikivoyage] Failed for "${city}" — falling back to demo:`, err);
    return fallback(city, interests);
  }
}

function filterByInterests(activities: ActivityOption[], interests: string[]): ActivityOption[] {
  if (interests.length === 0) return activities;
  const matched = activities.filter((a) =>
    interests.some((i) => a.category.toLowerCase().includes(i.toLowerCase()))
  );
  const others = activities.filter((a) => !matched.includes(a));
  return [...matched, ...others];
}

function fallback(city: string, interests: string[]) {
  return {
    activities: getActivities(city, interests),
    cultural: getCulturalTips(city),
  };
}
