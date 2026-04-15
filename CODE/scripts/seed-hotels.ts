/**
 * seed-hotels.ts — Patch hotel data into existing cache JSON files.
 * Reads src/lib/cache/{slug}.json, fetches hotels from Wikivoyage "sleep"
 * sections (district sub-pages), fixes price/amenity data, merges in.
 * Weather/activities untouched.
 *
 * Usage:
 *   npm run seed-hotels                        # Tokyo, London, Paris
 *   npm run seed-hotels Berlin Amsterdam       # custom cities
 *
 * Fixes vs previous version:
 *   - Tracks Budget/Mid-range/Splurge subsection → price band fallback
 *   - Converts ¥/€/£ to approximate USD
 *   - Extracts amenities from name + content combined
 *   - Filters entries with no price AND no bookingUrl (low quality)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { HotelOption } from "@/lib/types";

const DEFAULT_CITIES = ["Tokyo", "London", "Paris"];
const CITIES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_CITIES;
const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "..", "src", "lib", "cache");

// Approximate FX rates (good enough for display purposes)
const FX_TO_USD: Record<string, number> = {
  "¥": 0.0067,   // JPY
  "€": 1.08,     // EUR
  "£": 1.27,     // GBP
  "$": 1.0,      // USD
};

const SYMBOL_TO_CODE: Record<string, string> = {
  "¥": "JPY",
  "€": "EUR",
  "£": "GBP",
  "$": "USD",
};

// Price bands per city per tier (USD/night) — kept for reference only
const PRICE_BANDS: Record<string, Record<string, [number, number]>> = {
  Tokyo: { budget: [30, 80], midrange: [80, 200], splurge: [200, 600] },
  London: { budget: [40, 90], midrange: [90, 250], splurge: [250, 700] },
  Paris: { budget: [35, 85], midrange: [85, 220], splurge: [220, 650] },
  default: { budget: [30, 80], midrange: [80, 200], splurge: [200, 500] },
};

// ── Curated demo hotels (high quality, committed prices + amenities) ───────
const DEMO_HOTELS: Record<string, HotelOption[]> = {
  Tokyo: [
    { id: "h-tok-1", name: "Park Hyatt Tokyo", rating: 4.8, pricePerNight: 520, currency: "USD", neighborhood: "Shinjuku", amenities: ["Pool", "Spa", "Restaurant", "Gym", "Concierge"], location: "3-7-1-2 Nishi Shinjuku, Shinjuku, Tokyo", googleMapsUrl: "https://maps.google.com/?q=Park+Hyatt+Tokyo", source: "demo" },
    { id: "h-tok-2", name: "Shinjuku Granbell Hotel", rating: 4.2, pricePerNight: 130, currency: "USD", neighborhood: "Shinjuku", amenities: ["Bar", "Restaurant", "WiFi"], location: "2-14-5 Kabukicho, Shinjuku, Tokyo", googleMapsUrl: "https://maps.google.com/?q=Shinjuku+Granbell+Hotel+Tokyo", source: "demo" },
    { id: "h-tok-3", name: "Dormy Inn Asakusa", rating: 4.3, pricePerNight: 90, currency: "USD", neighborhood: "Asakusa", amenities: ["Onsen", "WiFi", "Breakfast"], location: "2-26-12 Kaminarimon, Taito, Tokyo", googleMapsUrl: "https://maps.google.com/?q=Dormy+Inn+Asakusa+Tokyo", source: "demo" },
    { id: "h-tok-4", name: "Aman Tokyo", rating: 4.9, pricePerNight: 1100, currency: "USD", neighborhood: "Otemachi", amenities: ["Spa", "Pool", "Restaurant", "Gym", "Concierge"], location: "1-5-6 Otemachi, Chiyoda, Tokyo", googleMapsUrl: "https://maps.google.com/?q=Aman+Tokyo", source: "demo" },
    { id: "h-tok-5", name: "Khaosan Tokyo Kabuki", rating: 3.9, pricePerNight: 35, currency: "USD", neighborhood: "Asakusa", amenities: ["WiFi", "Shared Kitchen", "Lockers", "Bar"], location: "2-16-2 Asakusa, Taito, Tokyo", googleMapsUrl: "https://maps.google.com/?q=Khaosan+Tokyo+Kabuki", source: "demo" },
  ],
  London: [
    { id: "h-lon-1", name: "The Savoy", rating: 4.8, pricePerNight: 650, currency: "USD", neighborhood: "Strand", amenities: ["Spa", "Pool", "Restaurant", "Bar", "Concierge"], location: "Strand, London WC2R 0EZ", googleMapsUrl: "https://maps.google.com/?q=The+Savoy+London", source: "demo" },
    { id: "h-lon-2", name: "citizenM Tower of London", rating: 4.4, pricePerNight: 160, currency: "USD", neighborhood: "Tower Hill", amenities: ["Bar", "WiFi", "Gym"], location: "40 Trinity Square, London EC3N 4DJ", googleMapsUrl: "https://maps.google.com/?q=citizenM+Tower+of+London", source: "demo" },
    { id: "h-lon-3", name: "Premier Inn London City", rating: 4.1, pricePerNight: 110, currency: "USD", neighborhood: "Aldgate", amenities: ["Restaurant", "WiFi", "Bar"], location: "1 Aldgate High St, London EC3N 1AH", googleMapsUrl: "https://maps.google.com/?q=Premier+Inn+London+City+Aldgate", source: "demo" },
    { id: "h-lon-4", name: "The Hoxton Shoreditch", rating: 4.5, pricePerNight: 200, currency: "USD", neighborhood: "Shoreditch", amenities: ["Restaurant", "Bar", "WiFi", "Gym"], location: "81 Great Eastern St, London EC2A 3HU", googleMapsUrl: "https://maps.google.com/?q=The+Hoxton+Shoreditch+London", source: "demo" },
    { id: "h-lon-5", name: "Generator London", rating: 3.8, pricePerNight: 40, currency: "USD", neighborhood: "King's Cross", amenities: ["Bar", "WiFi", "Lockers", "Common Room"], location: "37 Tavistock Pl, London WC1H 9SE", googleMapsUrl: "https://maps.google.com/?q=Generator+Hostel+London", source: "demo" },
  ],
  Paris: [
    { id: "h-par-1", name: "Hôtel Ritz Paris", rating: 4.9, pricePerNight: 1200, currency: "USD", neighborhood: "1st Arr.", amenities: ["Spa", "Pool", "Restaurant", "Bar", "Concierge"], location: "15 Place Vendôme, 75001 Paris", googleMapsUrl: "https://maps.google.com/?q=Hotel+Ritz+Paris", source: "demo" },
    { id: "h-par-2", name: "Hôtel des Arts Montmartre", rating: 4.2, pricePerNight: 120, currency: "USD", neighborhood: "Montmartre", amenities: ["WiFi", "Breakfast", "Bar"], location: "5 Rue Tholozé, 75018 Paris", googleMapsUrl: "https://maps.google.com/?q=Hotel+des+Arts+Montmartre+Paris", source: "demo" },
    { id: "h-par-3", name: "ibis Paris Tour Eiffel", rating: 4.0, pricePerNight: 95, currency: "USD", neighborhood: "15th Arr.", amenities: ["Restaurant", "WiFi", "Bar"], location: "2 Rue Cambronne, 75015 Paris", googleMapsUrl: "https://maps.google.com/?q=ibis+Paris+Tour+Eiffel", source: "demo" },
    { id: "h-par-4", name: "Le Marais Boutique Hotel", rating: 4.5, pricePerNight: 210, currency: "USD", neighborhood: "Le Marais", amenities: ["WiFi", "Breakfast", "Concierge"], location: "30 Rue de Turenne, 75003 Paris", googleMapsUrl: "https://maps.google.com/?q=Le+Marais+Boutique+Hotel+Paris", source: "demo" },
    { id: "h-par-5", name: "Generator Paris", rating: 3.9, pricePerNight: 38, currency: "USD", neighborhood: "10th Arr.", amenities: ["Bar", "WiFi", "Lockers", "Common Room"], location: "9-11 Place du Colonel Fabien, 75010 Paris", googleMapsUrl: "https://maps.google.com/?q=Generator+Hostel+Paris", source: "demo" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
function cityToSlug(city: string): string {
  return city.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function wvFetch(params: Record<string, string>, retries = 3): Promise<unknown> {
  const url = new URL("https://en.wikivoyage.org/w/api.php");
  for (const [k, v] of Object.entries({ format: "json", origin: "*", ...params })) {
    url.searchParams.set(k, v);
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url.toString());
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < retries) {
      const wait = attempt * 15000;
      console.log(`  [wikivoyage] Rate limited — waiting ${wait / 1000}s...`);
      await delay(wait);
      continue;
    }
    throw new Error(`Wikivoyage ${res.status}`);
  }
  throw new Error("wvFetch exhausted retries");
}

function cleanWiki(text: string): string {
  return text
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, "")
    .replace(/\[\[[^\]]*#Q\d+[^\]]*\]\]/g, "")
    .replace(/\[\[[^\]]+\]\]/g, "")
    .replace(/#Q\d+/g, "")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/&(?:yen|euro|pound);/gi, (m) =>
      m.toLowerCase() === "&yen;" ? "¥" : m.toLowerCase() === "&euro;" ? "€" : "£"
    )
    .replace(/&[a-z]+;/gi, "")
    .replace(/'{2,3}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse price string to USD + original currency code.
 * Handles: "¥6930", "€26+", "Double from €229", "£85/night", "$120", empty
 * Returns undefined if unparseable — caller skips the hotel entirely.
 */
function parsePriceToUSD(raw: string): { usd: number; currency: string } | undefined {
  if (!raw || !raw.trim()) return undefined;
  const cleaned = cleanWiki(raw);

  // Detect currency symbol
  const currencyMatch = cleaned.match(/[¥€£$]/);
  const symbol = currencyMatch ? currencyMatch[0] : null;
  if (!symbol) return undefined; // no currency symbol = unparseable

  const rate = FX_TO_USD[symbol] ?? 1.0;
  const currencyCode = SYMBOL_TO_CODE[symbol] ?? "USD";

  // Extract first number (handles "from €229", "¥6,930", "€26+")
  const numMatch = cleaned.replace(/,/g, "").match(/[\d]+(?:\.\d+)?/);
  if (!numMatch) return undefined;

  const localPrice = parseFloat(numMatch[0]);
  if (isNaN(localPrice) || localPrice <= 0) return undefined;

  const usd = Math.round(localPrice * rate);

  // Sanity check — ignore implausible values
  if (usd < 5 || usd > 10000) return undefined;
  return { usd, currency: currencyCode };
}

// ── Parse sleep section wikitext, tracking Budget/Mid-range/Splurge tiers ─
function parseProps(body: string): Record<string, string> {
  const props: Record<string, string> = {};
  const parts = body.replace(/^\{\{[^|{}\n]+/, "").replace(/\}\}$/, "").split(/\n?\|/);
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim().toLowerCase();
    const v = part.slice(eq + 1).trim();
    if (k) props[k] = v;
  }
  return props;
}

function extractTemplateBody(wikitext: string, templateName: string): string[] {
  const pattern = new RegExp(`\\{\\{${templateName}[\\s\\S]*?\\}\\}`, "gi");
  const matches: string[] = [];
  let m;
  while ((m = pattern.exec(wikitext)) !== null) matches.push(m[0]);
  return matches;
}

/** Extract amenities from name + content combined */
function extractAmenities(name: string, content: string): string[] {
  const combined = `${name} ${content}`.toLowerCase();
  const keywords: [string, string][] = [
    ["wifi", "WiFi"], ["wi-fi", "WiFi"], ["internet", "WiFi"],
    ["pool", "Pool"], ["swimming", "Pool"],
    ["spa", "Spa"], ["sauna", "Spa"], ["onsen", "Onsen"],
    ["gym", "Gym"], ["fitness", "Gym"],
    ["restaurant", "Restaurant"], ["dining", "Restaurant"],
    ["bar", "Bar"], ["cafe", "Café"], ["café", "Café"],
    ["breakfast", "Breakfast"],
    ["parking", "Parking"],
    ["concierge", "Concierge"],
    ["air conditioning", "A/C"], ["air-conditioning", "A/C"],
    ["kitchen", "Kitchen"], ["kitchenette", "Kitchen"],
    ["laundry", "Laundry"],
    ["lounge", "Lounge"],
    ["rooftop", "Rooftop"],
    ["capsule", "Capsule"],
    ["hostel", "Hostel"], ["dormitor", "Dorms"],
    ["ryokan", "Ryokan"], ["tatami", "Tatami"],
    ["luggage", "Luggage Storage"],
  ];
  const found = new Set<string>();
  for (const [kw, label] of keywords) {
    if (combined.includes(kw)) found.add(label);
  }
  return [...found].slice(0, 6);
}

function parseRating(starsField: string, tier: string): number {
  const n = parseFloat(starsField);
  if (!isNaN(n) && n >= 1 && n <= 5) return Math.min(5, Math.max(1, n));
  // Estimate from tier
  if (tier === "splurge") return 4.5;
  if (tier === "midrange") return 4.0;
  return 3.5; // budget
}

// ── Parse sleep section wikitext, tracking Budget/Mid-range/Splurge tiers ─
function parseSleepListings(wikitext: string, city: string, startId: number): HotelOption[] {
  const results: HotelOption[] = [];
  let id = startId;

  // Split wikitext into lines to track tier headers
  const lines = wikitext.split("\n");
  const tierMap: Record<string, string> = {
    budget: "budget", "mid-range": "midrange", midrange: "midrange", splurge: "splurge",
  };

  // Rebuild wikitext annotated with tier markers so we can associate each {{sleep}} with its tier
  // Strategy: find all {{sleep}} template positions and the nearest preceding ===Header=== 
  const tierPositions: { pos: number; tier: string }[] = [];
  let pos = 0;
  for (const line of lines) {
    const headerMatch = line.match(/^===+\s*(.+?)\s*===+/);
    if (headerMatch) {
      const tier = tierMap[headerMatch[1].toLowerCase().replace(/<[^>]+>/g, "").trim()];
      if (tier) tierPositions.push({ pos, tier });
    }
    pos += line.length + 1;
  }

  function getTierAtPos(templatePos: number): string {
    let tier = "midrange";
    for (const tp of tierPositions) {
      if (tp.pos <= templatePos) tier = tp.tier;
      else break;
    }
    return tier;
  }

  const pattern = /\{\{sleep[\s\S]*?\}\}/gi;
  let m;
  while ((m = pattern.exec(wikitext)) !== null) {
    const body = m[0];
    const tier = getTierAtPos(m.index);
    const props = parseProps(body);

    const name = cleanWiki(props["name"] || props["alt"] || "");
    if (name.length < 3 || /\[\[|#Q\d+|^\//i.test(name)) continue;

    // Only include hotels with a real parseable price — skip if missing or unparseable
    const parsed = parsePriceToUSD(props["price"] || "");
    if (!parsed) continue;

    const { usd: pricePerNight, currency } = parsed;

    const address = cleanWiki(props["address"] || props["directions"] || "");
    const neighborhood = address.slice(0, 60) || city;
    const location = address ? `${address}, ${city}` : city;
    const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${name}, ${city}`)}`;
    const bookingUrl = props["url"] ? cleanWiki(props["url"]) : undefined;

    const content = cleanWiki(props["content"] || props["description"] || "");
    const amenities = extractAmenities(name, content);
    const rating = parseRating(props["stars"] || props["star"] || "", tier);

    results.push({
      id: `wv-h-${id++}`,
      name,
      rating,
      pricePerNight,
      currency,
      neighborhood,
      amenities,
      location,
      googleMapsUrl,
      ...(bookingUrl ? { bookingUrl } : {}),
      source: "wikivoyage",
    });
  }
  return results;
}

// ── Fetch sleep section wikitext from a Wikivoyage page ───────────────────
async function fetchSleepWikitext(page: string): Promise<string> {
  const sectionsJson = await wvFetch({ action: "parse", page, prop: "sections" }) as {
    parse?: { sections: { index: string; line: string }[] };
    error?: { code: string };
  };
  if (sectionsJson.error) return "";

  const sections = sectionsJson.parse?.sections ?? [];
  const sleepSec = sections.find((s) =>
    s.line.toLowerCase().replace(/<[^>]+>/g, "").trim() === "sleep"
  );
  if (!sleepSec) return "";

  const json = await wvFetch({ action: "parse", page, prop: "wikitext", section: sleepSec.index }) as {
    parse?: { wikitext: { "*": string } };
  };
  return json.parse?.wikitext?.["*"] ?? "";
}

// ── Find district sub-pages ───────────────────────────────────────────────
async function findDistrictPages(city: string): Promise<string[]> {
  const pages = new Set<string>();

  // Check intro section (section 0) for [[City/District]] links
  const introJson = await wvFetch({ action: "parse", page: city, prop: "wikitext", section: "0" }) as {
    parse?: { wikitext: { "*": string } };
  };
  const introText = introJson.parse?.wikitext?.["*"] ?? "";
  const re1 = new RegExp(`\\[\\[${city}/([^\\]|#]+)`, "gi");
  let m;
  while ((m = re1.exec(introText)) !== null) pages.add(`${city}/${m[1].trim()}`);

  // Also check the Districts section
  const sectionsJson = await wvFetch({ action: "parse", page: city, prop: "sections" }) as {
    parse?: { sections: { index: string; line: string }[] };
  };
  const districtSec = sectionsJson.parse?.sections?.find((s) =>
    s.line.toLowerCase().replace(/<[^>]+>/g, "").trim() === "districts"
  );
  if (districtSec) {
    const distJson = await wvFetch({ action: "parse", page: city, prop: "wikitext", section: districtSec.index }) as {
      parse?: { wikitext: { "*": string } };
    };
    const distText = distJson.parse?.wikitext?.["*"] ?? "";
    const re2 = new RegExp(`\\[\\[${city}/([^\\]|#]+)`, "gi");
    while ((m = re2.exec(distText)) !== null) pages.add(`${city}/${m[1].trim()}`);
  }

  return [...pages].slice(0, 15);
}

// ── Fetch all hotels for a city ───────────────────────────────────────────
async function fetchHotels(city: string): Promise<HotelOption[]> {
  console.log(`  [wikivoyage] Finding district pages for ${city}...`);
  const districtPages = await findDistrictPages(city);
  console.log(`  [wikivoyage] ${districtPages.length} districts: ${districtPages.slice(0, 5).join(", ")}`);

  const allHotels: HotelOption[] = [];
  let idCounter = 1;

  // Try main city page first
  const mainText = await fetchSleepWikitext(city);
  if (mainText) {
    const h = parseSleepListings(mainText, city, idCounter);
    idCounter += h.length;
    allHotels.push(...h);
  }
  await delay(300);

  // Scrape each district
  for (const page of districtPages) {
    try {
      console.log(`    → ${page}`);
      const text = await fetchSleepWikitext(page);
      if (text) {
        const h = parseSleepListings(text, city, idCounter);
        idCounter += h.length;
        allHotels.push(...h);
      }
      await delay(400);
    } catch {
      console.warn(`    ✗ failed: ${page}`);
    }
  }

  // Dedupe by name
  const seen = new Set<string>();
  const deduped = allHotels.filter((h) => {
    const key = h.name.toLowerCase().slice(0, 25);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  const zeroPriceCount = deduped.filter((h) => h.pricePerNight === 0).length;
  const noAmenitiesCount = deduped.filter((h) => h.amenities.length === 0).length;
  console.log(`  [wikivoyage] ${deduped.length} listings | pricePerNight=0: ${zeroPriceCount} | no amenities: ${noAmenitiesCount}`);
  return deduped;
}

// ── Merge wiki + demo ─────────────────────────────────────────────────────
function mergeHotels(city: string, wikiHotels: HotelOption[]): HotelOption[] {
  const demo = DEMO_HOTELS[city] ?? [];
  if (wikiHotels.length === 0) {
    console.log(`  → Using demo only (no wiki data)`);
    return demo;
  }
  const seen = new Set(demo.map((h) => h.name.toLowerCase().slice(0, 25)));
  const filtered = wikiHotels.filter((h) => !seen.has(h.name.toLowerCase().slice(0, 25)));
  console.log(`  → ${demo.length} demo + ${filtered.length} wiki = ${demo.length + filtered.length} total`);
  return [...demo, ...filtered];
}

// ── Patch a city's cache file ─────────────────────────────────────────────
async function patchCity(city: string) {
  console.log(`\n🏨 Patching hotels for ${city}...`);
  const slug = cityToSlug(city);
  const filePath = join(CACHE_DIR, `${slug}.json`);

  if (!existsSync(filePath)) {
    console.warn(`  ✗ Cache file not found: ${slug}.json — run seed-cache first`);
    return;
  }

  const existing = JSON.parse(readFileSync(filePath, "utf-8"));

  let wikiHotels: HotelOption[] = [];
  try {
    wikiHotels = await fetchHotels(city);
    await delay(500);
  } catch (err) {
    console.warn(`  ✗ Wikivoyage fetch failed:`, err);
  }

  const hotels = mergeHotels(city, wikiHotels);
  const patched = { ...existing, hotels };
  writeFileSync(filePath, JSON.stringify(patched, null, 2), "utf-8");
  console.log(`  ✓ ${hotels.length} hotels written → src/lib/cache/${slug}.json`);
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌍 Patching hotels for: ${CITIES.join(", ")}`);
  console.log("─".repeat(50));
  for (const city of CITIES) {
    try { await patchCity(city); }
    catch (err) { console.error(`  ✗ ${city}:`, err); }
  }
  console.log("\n✅ Done! Hotels patched into cache files.\n");
}

main();
