# ClickLess AI — Your AI Travel Concierge

End-to-end AI travel planner that takes a natural language query and generates a complete trip brief: flights, hotels, itinerary, weather, cultural tips, packing list, and budget — all in seconds.

## Architecture

```
Input (text/voice) → NLU Parser → Provider Orchestration → Semantic Extraction
→ Knowledge Graph → LLM Trip Synthesis → UI Output
```

| Module | Path | Description |
|--------|------|-------------|
| NLU | `src/lib/nlu/parser.ts` | Deterministic regex+Zod intent parser |
| Providers | `src/lib/providers/demo-data.ts` | Cached demo adapters for 5 cities |
| Extraction | `src/lib/extraction/normalize.ts` | Zod-validated normalization layer |
| Knowledge | `src/lib/knowledge/graph.ts` | In-memory knowledge graph linking trip entities |
| Synthesis | `src/lib/synthesis/brief.ts` | Template + optional LLM summary generation |
| API | `src/app/api/plan/route.ts` | POST endpoint orchestrating the full pipeline |
| UI | `src/components/trip/` | Chat input, flight/hotel cards, itinerary, etc. |

## Quick Start

```bash
npm install
npm run dev       # Development server
npm test          # Run tests (16 tests)
npm run typecheck # TypeScript check
npm run build     # Production build
```

## Demo Flow

Enter this query (or click the example prompt):

> Plan a 5-night Tokyo trip from Phoenix in April under $2000, I like temples and food tours.

The system will:
1. Parse intent (destination, origin, dates, budget, activities)
2. Fetch cached demo data for flights, hotels, weather, cultural tips, activities
3. Normalize all data through Zod schemas
4. Build a knowledge graph linking all trip entities
5. Generate a day-by-day itinerary + packing list + budget summary
6. Render results in the UI
7. Support voice readback (click speaker icon)
8. Save trip to local storage

## Seeded Demo Cities

Tokyo, London, Paris, Cancun, New York — all with flights (from Phoenix), hotels, weather, cultural tips, and activities.

## Environment Variables

Copy `.env.example` to `.env.local`. **All variables are optional** — the app runs fully in demo mode without any external services.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for LLM summaries |

## Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration: `supabase/migrations/001_initial.sql`
3. Run the seed: `supabase/seed.sql`
4. Add credentials to `.env.local`

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Zod · Supabase · OpenRouter · Web Speech API · Vitest

## Voice Support

- **Input:** Mic button for speech-to-text (Chrome/Edge)
- **Output:** Speaker icon for voice readback

## Deploy

```bash
npm i -g vercel && vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new).

## Limitations

- Demo data only — no live API calls to flight/hotel providers
- LLM summary requires OpenRouter API key (optional, falls back to template)
- Voice input requires Chrome/Edge
- No user auth in demo mode
- See `SCRAPING_LATER.md` for the live data roadmap
