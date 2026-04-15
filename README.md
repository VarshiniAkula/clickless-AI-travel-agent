# ClickLess AI — Conversational Travel Agent

An end-to-end AI travel planning agent that converts a single natural-language utterance (text or voice) into a complete trip brief — flights, hotels, day-by-day itinerary, live weather, cultural tips, packing list, and budget breakdown — all in seconds.

**Live demo:** [clickless-ai-travel-agent.vercel.app](https://clickless-ai-travel-agent.vercel.app)

---

## Team

**Group 7 — Project 4 (SP26)**

| Member | Contribution |
|---|---|
| Varshini Akula | UI/UX, Auth, Supabase integration, deployment |
| Pradeep Reddy Vemireddy | Live data providers, weather, Wikivoyage scraping, static cache |
| Thushar | Speechmatics real-time speech-to-text integration |
| Akshay Kuttetira | LLM-based intent extraction (Groq) |

---

## Architecture

```
Voice / Text Input
      │
      ▼
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  NLU Parser │────▶│ Provider Layer   │────▶│ Knowledge Graph  │
│  (Groq LLM) │     │ Flights · Hotels │     │ Entity linking   │
└─────────────┘     │ Weather · Wiki   │     │ Itinerary build  │
                    └──────────────────┘     └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  LLM Synthesis   │
                                            │ Gemini / Router  │
                                            └────────┬─────────┘
                                                     │
                                                     ▼
                                              Trip Brief UI
```

| Module | Path | Description |
|---|---|---|
| NLU | `src/lib/nlu/parser.ts` | Groq llama-3.1-8b structured JSON extraction with regex fallback |
| Providers | `src/lib/providers/` | Demo data + live weather (OpenWeatherMap) + Wikivoyage scraping |
| Cache | `src/lib/cache/` | 90-day static git-committed cache + in-memory TTL cache |
| Extraction | `src/lib/extraction/normalize.ts` | Zod-validated data normalization layer |
| Knowledge Graph | `src/lib/knowledge/graph.ts` | In-memory graph linking flights, hotels, weather, activities |
| Synthesis | `src/lib/synthesis/brief.ts` | Template + Gemini 2.0 Flash / OpenRouter LLM summary |
| API | `src/app/api/plan/route.ts` | POST endpoint orchestrating the full pipeline |
| Speech | `src/app/api/speech-token/route.ts` | Speechmatics JWT vending for real-time STT |
| Auth | `src/lib/supabase/auth.tsx` | Email/password authentication via Supabase Auth |
| Trips API | `src/app/api/trips/route.ts` | GET/POST/DELETE saved trips with RLS |
| UI | `src/components/trip/` | Hero, chat, trip brief, saved trips, login, profile |

---

## Features

- **Voice input** — Real-time speech-to-text via Speechmatics WebSocket streaming
- **Conversational refinement** — Chat to add filters (budget, activities, preferences) after initial search
- **Live weather** — OpenWeatherMap forecasts with 90-day static cache fallback
- **Wikivoyage integration** — Activities and cultural tips scraped from Wikivoyage
- **Authentication** — Email/password sign-up and sign-in via Supabase Auth
- **Trip persistence** — Save trips to Supabase (authenticated) or localStorage (guest)
- **Day-by-day itinerary** — Auto-generated from knowledge graph with time slots
- **Smart packing list** — Derived from weather conditions and planned activities
- **Budget breakdown** — Flights, hotels, activities, food, transport, miscellaneous
- **Responsive design** — Mobile, tablet, and desktop optimized

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys (see Environment Variables below)

# Start development server
npm run dev

# Run tests
npm test

# TypeScript check
node node_modules/typescript/lib/tsc.js --noEmit

# Production build
node node_modules/next/dist/bin/next build --webpack
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. The app runs in demo mode without any keys.

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Recommended | Groq API key for LLM intent parsing (llama-3.1-8b) |
| `GEMINI_API_KEY` | No | Google Gemini 2.0 Flash for trip summary generation |
| `OPENROUTER_API_KEY` | No | OpenRouter fallback for LLM summaries |
| `OPENWEATHER_API_KEY` | No | OpenWeatherMap for live weather (falls back to cache) |
| `SPEECHMATICS_API_KEY` | No | Speechmatics for real-time voice input |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |

---

## Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial.sql`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
4. Enable email/password auth in Supabase dashboard under Authentication > Providers

---

## Demo Flow

Enter a query like:

> Plan a 5-night Tokyo trip from Phoenix in April under $2000, I like temples and food tours.

The system will:

1. **Parse intent** — Extract destination, origin, dates, budget, activities via Groq LLM
2. **Fetch data** — Flights and hotels from demo cache, live weather from OpenWeatherMap, activities and cultural tips from Wikivoyage
3. **Normalize** — Validate all data through Zod schemas
4. **Build knowledge graph** — Link all trip entities with semantic edges
5. **Synthesize brief** — Generate day-by-day itinerary, packing list, budget via Gemini LLM
6. **Render results** — Interactive trip brief with flight/hotel cards, itinerary timeline, weather forecast
7. **Refine via chat** — Add filters like "add museum visits" or "lower budget to $1500"
8. **Save trip** — Persist to Supabase (authenticated) or localStorage (guest)

### Seeded Cities

Tokyo, London, Paris, Cancun, New York — with pre-cached flights (from Phoenix), hotels, 90-day weather forecasts, and Wikivoyage content.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| NLU | Groq SDK (llama-3.1-8b-instant) |
| Synthesis | Google Gemini 2.0 Flash, OpenRouter |
| Voice | Speechmatics Real-Time API |
| Validation | Zod |
| Testing | Vitest, Playwright |
| Deployment | Vercel |

---

## Deployment

The app is deployed on Vercel. To deploy your own:

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new). Add all environment variables in Vercel project settings.

---

## Repository Structure

```
├── CODE/                      # Application source code
│   ├── src/
│   │   ├── app/               # Next.js App Router (pages + API routes)
│   │   ├── components/trip/   # UI components (hero, chat, results, auth)
│   │   └── lib/               # Core logic (NLU, providers, knowledge graph, synthesis)
│   ├── public/                # Static assets
│   └── scripts/               # Build scripts (cache seeding)
│
├── DATA/                      # Datasets and data sources
│   ├── supabase/              # Database schema and migrations
│   └── scrapers/              # Python scrapers for live data collection
│
├── EVALUATIONS/               # Tests and evaluation results
│   ├── tests/                 # Vitest unit + integration tests (16 tests)
│   ├── nlu/                   # spaCy NER baseline evaluation
│   ├── extraction/            # TF-IDF extraction baseline
│   ├── synthesis/             # Trip synthesis baseline
│   ├── run_feasibility.py     # Full feasibility test runner
│   └── feasibility_results.json  # Evaluation metrics
│
├── README.md                  # This file
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```
