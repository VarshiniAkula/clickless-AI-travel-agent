/**
 * estimate-prices.ts — Fill missing estimatedCost values in cache JSON files using Groq.
 * Batches 30 activities per API call to minimize usage.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json CODE/scripts/estimate-prices.ts
 *   npx tsx --tsconfig tsconfig.json CODE/scripts/estimate-prices.ts Tokyo
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Groq from "groq-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const CACHE_DIR = join(ROOT, "src", "lib", "cache");

// Load .env.local manually
const envPath = join(ROOT, ".env.local");
try {
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=");
    if (k?.trim() && !k.startsWith("#")) process.env[k.trim()] = v.join("=").trim();
  }
  console.log("✓ Loaded .env.local");
} catch { console.warn("⚠ No .env.local found"); }

const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
if (!GROQ_KEY) { console.error("❌ GROQ_API_KEY missing"); process.exit(1); }

const groq = new Groq({ apiKey: GROQ_KEY });

const CITIES = process.argv.slice(2).length > 0
  ? process.argv.slice(2)
  : ["Tokyo", "London", "Paris"];

function cityToSlug(city: string): string {
  return city.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedCost: number;
  duration: string;
  location: string;
}

interface CacheEntry {
  city: string;
  seededAt: string;
  weather90Days: unknown[];
  activities: Activity[];
  cultural: unknown[];
  hotels?: unknown[];
}

// Known free activities — skip Groq for these
const FREE_KEYWORDS = [
  "temple", "shrine", "crossing", "park", "garden", "beach", "walk",
  "market stroll", "street", "viewpoint", "neighbourhood", "neighborhood",
  "square", "cathedral", "basilica", "church", "mosque", "bridge",
  "promenade", "riverside", "waterfront", "free", "cemetery", "memorial",
];

function isLikelyFree(name: string, category: string): boolean {
  const text = (name + " " + category).toLowerCase();
  return FREE_KEYWORDS.some(k => text.includes(k));
}

async function estimateBatch(
  city: string,
  activities: { idx: number; name: string; category: string }[]
): Promise<Record<number, number>> {
  const list = activities.map((a, i) =>
    `${i + 1}. "${a.name}" (${a.category})`
  ).join("\n");

  const prompt = `You are a travel cost estimator. For each activity in ${city}, estimate the typical tourist entry/participation cost in USD per person.
Rules:
- Free attractions (temples, parks, beaches, street walks, viewpoints): 0
- Budget (street food, cheap museums): 5–15
- Mid (restaurants, mid museums, tours): 15–40
- Premium (top attractions, experiences): 40–100
- Luxury (fine dining, exclusive tours): 100+
Return ONLY a JSON object mapping number → cost. Example: {"1":0,"2":15,"3":35}

Activities:
${list}`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    const result: Record<number, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const idx = activities[parseInt(k) - 1]?.idx;
      if (idx !== undefined && typeof v === "number") result[idx] = Math.round(v);
    }
    return result;
  } catch {
    return {};
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function processCity(city: string) {
  const slug = cityToSlug(city);
  const filePath = join(CACHE_DIR, `${slug}.json`);
  const cache = JSON.parse(readFileSync(filePath, "utf-8")) as CacheEntry;

  const missing = cache.activities
    .map((a, idx) => ({ idx, name: a.name, category: a.category, cost: a.estimatedCost }))
    .filter(a => !a.cost || a.cost === 0);

  console.log(`\n📍 ${city}: ${missing.length} activities need pricing`);

  // Mark free ones without API call
  let freeCount = 0;
  const toEstimate: typeof missing = [];
  for (const a of missing) {
    if (isLikelyFree(a.name, a.category)) {
      cache.activities[a.idx].estimatedCost = 0;
      freeCount++;
    } else {
      toEstimate.push(a);
    }
  }
  console.log(`  ✓ Marked ${freeCount} as free (parks/temples/streets)`);
  console.log(`  → Sending ${toEstimate.length} to Groq for estimates...`);

  // Batch in groups of 30
  const BATCH = 30;
  let estimated = 0;
  for (let i = 0; i < toEstimate.length; i += BATCH) {
    const batch = toEstimate.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    const totalBatches = Math.ceil(toEstimate.length / BATCH);
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}... `);

    try {
      const prices = await estimateBatch(city, batch);
      for (const [idx, price] of Object.entries(prices)) {
        cache.activities[parseInt(idx)].estimatedCost = price;
        estimated++;
      }
      console.log(`done (${Object.keys(prices).length} priced)`);
    } catch (err) {
      console.log(`failed — ${err}`);
    }

    // Respect rate limits
    if (i + BATCH < toEstimate.length) await sleep(1200);
  }

  // Save back
  writeFileSync(filePath, JSON.stringify(cache, null, 2));
  console.log(`  ✓ Estimated ${estimated} prices — saved → src/lib/cache/${slug}.json`);

  // Stats
  const withPrice = cache.activities.filter(a => a.estimatedCost > 0).length;
  const free = cache.activities.filter(a => a.estimatedCost === 0).length;
  console.log(`  📊 ${withPrice} paid | ${free} free | ${cache.activities.length} total`);
}

(async () => {
  console.log(`\n💰 Estimating activity prices for: ${CITIES.join(", ")}`);
  console.log("─".repeat(50));
  for (const city of CITIES) {
    await processCity(city);
  }
  console.log("\n✅ Done! Commit src/lib/cache/*.json to Git.");
})();
