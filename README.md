# ClickLess AI - Conversational Travel Agent

An end-to-end AI travel planning agent that converts a single natural-language utterance (text or voice) into a complete, budget-aware trip brief - flights, hotels, day-by-day itinerary, live weather, cultural tips, packing list, and budget breakdown - all in seconds.

**Live demo:** [clickless-ai-travel-agent.vercel.app](https://clickless-ai-travel-agent.vercel.app)

---

## Team

**Group 7 - Project 4 (SP26)**

| Member | Contribution |
|---|---|
| Varshini Akula | UI/UX, Auth, Supabase integration, budget-aware provider, deployment |
| Pradeep Reddy Venuthurla | Live data providers, Wikivoyage scraping, hotel + activity cache seeding, Groq price estimation |
| Thushar | Speechmatics real-time speech-to-text integration |
| Akshay Kuttetira | LLM-based intent extraction (Groq NLU) |

---

## Architecture

```
Voice / Text Input
      |
      v
+-------------+     +--------------------+     +------------------+
|  NLU Parser |---->| Provider Layer     |---->| Knowledge Graph  |
|  (Groq LLM) |     | (parallel fetch)   |     | Entity linking   |
+-------------+     |                    |     | Itinerary build  |
                    | Supabase DB        |     | Budget scaling   |
                    |  - cached_flights  |     +--------+---------+
                    |  - cached_hotels   |              |
                    |  - cached_activities|              v
                    | Cache JSON files   |     +------------------+
                    | OpenWeatherMap     |     |  LLM Synthesis   |
                    | Wikivoyage API     |     | Gemini 2.0 Flash |
                    +--------------------+     +--------+---------+
                                                        |
                                                        v
                                                 Trip Brief UI
                                                (Compare / Refine)
```

### Pipeline Modules

| Module | Path | Description |
|---|---|---|
| NLU | `src/lib/nlu/parser.ts` | Groq llama-3.1-8b structured JSON extraction with regex fallback |
| Supabase Provider | `src/lib/providers/supabase-data.ts` | Budget-aware SQL queries across flights, hotels, activities |
| Weather Provider | `src/lib/providers/weather-live.ts` | OpenWeatherMap live forecasts with 90-day cache fallback |
| Wikivoyage Provider | `src/lib/providers/wikivoyage.ts` | Live scraping of activities and cultural tips |
| Demo Fallback | `src/lib/providers/demo-data.ts` | Static demo data for 5 cities when DB/API unavailable |
| Cache Loader | `src/lib/cache/index.ts` | Loads static JSON cache files (tokyo, london, paris) |
| Extraction | `src/lib/extraction/normalize.ts` | Zod-validated data normalization layer |
| Knowledge Graph | `src/lib/knowledge/graph.ts` | In-memory graph linking flights, hotels, weather, activities |
| Synthesis | `src/lib/synthesis/brief.ts` | Template + Gemini 2.0 Flash / OpenRouter LLM summary |
| Plan API | `src/app/api/plan/route.ts` | POST endpoint orchestrating the full pipeline |
| Trips API | `src/app/api/trips/route.ts` | GET/POST/DELETE saved trips with RLS |
| Speech | `src/app/api/speech-token/route.ts` | Speechmatics JWT vending for real-time STT |
| Auth | `src/lib/supabase/auth.tsx` | Google OAuth + email/password auth via Supabase |
| Types | `src/lib/types.ts` | Zod schemas for all 12 data structures |

---

## Features

- **Budget-aware dynamic data** - Same destination, different budget = entirely different results. $5k gets economy + hostels; $40k gets first class + ultra-luxury hotels
- **Voice input** - Real-time speech-to-text via Speechmatics WebSocket streaming
- **Conversational refinement** - Chat to add filters (budget, interests, duration) after initial search
- **Live weather** - OpenWeatherMap forecasts with 90-day static cache fallback
- **Wikivoyage integration** - 1,255 activities and cultural tips scraped from Wikivoyage
- **Authentication** - Google OAuth, email/password sign-up, or guest mode
- **Trip persistence** - Save trips to Supabase (authenticated) or localStorage (guest)
- **Compare page** - Top 5 flights and hotels shown by default, expandable to full list
- **Day-by-day itinerary** - Auto-generated with time slots, weather, and activity costs
- **Smart packing list** - Derived from weather conditions and planned activities
- **Budget breakdown** - Flights, hotels, activities, food, transport, miscellaneous with scaling
- **Trip state preservation** - Navigate away and return to your trip without losing results
- **Sign-out redirect** - Clean session reset back to sign-in page
- **Responsive design** - Mobile, tablet, and desktop optimized

---

## Data Sources

The app pulls from a 3-layer data stack, merging results with deduplication:

### Layer 1: Supabase Database (Primary)

Dynamic SQL queries filtered by user budget, destination, and interests.

| Table | Records | Cities | Source | What It Contains |
|---|---|---|---|---|
| `cached_flights` | 31 | 5 (Tokyo, London, Paris, Cancun, New York) | Google Flights, SkyScanner, Expedia, Southwest | Economy through first class, $128-$6,500 |
| `cached_hotels` | 216 | 3 (Tokyo, London, Paris) | Wikivoyage "Sleep" sections, Booking.com | Budget ($12/night) to ultra-luxury ($1,200/night) |
| `cached_activities` | 1,255 | 3 (Tokyo, London, Paris) | Wikivoyage + Groq LLM price estimation | Free temples to $20,000 premium omakase |

**Budget allocation logic:**
- 30% of budget -> flight cabin class filter (economy/premium/business/first)
- 35% of budget / nights -> hotel tier filter (budget/mid-range/luxury/ultra-luxury)
- 15% of budget -> per-activity cost ceiling

### Layer 2: Static Cache Files (Merge)

Git-committed JSON files auto-merged with Supabase results.

| File | Size | Contents |
|---|---|---|
| `src/lib/cache/tokyo.json` | 135 KB | 50 hotels, 284 activities, 90-day weather, cultural tips |
| `src/lib/cache/london.json` | 249 KB | 89 hotels, 660 activities, 90-day weather, cultural tips |
| `src/lib/cache/paris.json` | 149 KB | 77 hotels, 311 activities, 90-day weather, cultural tips |

**How cache was built:**
1. `seed-hotels.ts` scraped Wikivoyage "Sleep" sections, extracted hotel listings with prices converted to USD
2. `estimate-prices.ts` used Groq (llama-3.1-8b) to estimate activity costs in batches of 30
3. `seed-cache.ts` fetched 90-day weather from OpenWeatherMap and activities from Wikivoyage API

### Layer 3: Demo Data (Fallback)

Hardcoded in `demo-data.ts` for 5 cities. Ensures the app always works even without DB or API keys.

- 21 flights (4-5 per city from Phoenix)
- 25 hotels (5 per city)
- 50 activities (10 per city)
- Weather profiles, cultural tips per city

### Live APIs (Runtime)

| API | Purpose | Fallback |
|---|---|---|
| Groq (llama-3.1-8b) | Intent parsing from user query | Regex parser |
| OpenWeatherMap | 5-day live weather forecast | 90-day static cache |
| Wikivoyage | Activities and cultural tips | Supabase + demo data |
| Gemini 2.0 Flash | Trip summary generation | OpenRouter, then template |
| Speechmatics | Real-time voice-to-text | Text input only |

---

## Supabase Schema

### Core Tables

```sql
users (id, email, display_name, created_at)
trip_requests (id, user_id, query, intent JSONB, created_at)
trip_results (id, query, intent JSONB, result JSONB, created_at)
saved_plans (id, user_id, trip_result_id, notes, saved_at)
```

### Cached Data Tables

```sql
cached_flights (id, origin, destination, destination_code, airline,
  departure_time, arrival_time, duration, stops, price, currency,
  cabin_class, booking_url, source)

cached_hotels (id, destination, name, rating, price_per_night, currency,
  neighborhood, amenities JSONB, image_url, booking_url, star_class, source)

cached_activities (id, destination, name, category, description,
  estimated_cost, duration, location, rating, source)
```

Indexes on destination, price, rating, category, cabin_class, star_class for fast filtered queries. RLS policies allow public read access on all cached tables.

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
npm run typecheck

# Production build
npm run build
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. The app runs in full demo mode without any keys.

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

## Demo Flow

### Basic Trip Planning

Enter a query like:

> Plan a 10-day trip to Tokyo from Phoenix, budget $5000, I love temples and food tours

The system will:

1. **Parse intent** - Extract destination, origin, duration, budget, interests via Groq LLM
2. **Query Supabase** - Fetch budget-filtered flights (economy, $598-$742), hotels ($45-$194/night), and interest-matched activities
3. **Fetch live data** - Weather from OpenWeatherMap, additional activities from Wikivoyage
4. **Normalize** - Validate all data through Zod schemas, merge and deduplicate
5. **Build knowledge graph** - Link entities, score activities by interest relevance, build itinerary
6. **Synthesize brief** - Generate summary via Gemini LLM, compute budget breakdown
7. **Render results** - Interactive trip brief with top 5 flights/hotels, itinerary timeline, weather
8. **Refine via chat** - "Increase my budget to $40,000" completely changes the results

### Budget-Aware Dynamic Results

| Component | $5,000 Budget | $40,000 Budget |
|---|---|---|
| Flights | Delta $598 (economy) | JAL $3,200 (business) |
| Hotels | UNPLAN Shinjuku $45/night | Aman Tokyo $1,100/night |
| Activities | Free temples, $85 food tours | $350 omakase, $120 Mt. Fuji trip |
| Total | Under $5,000 | Scales to use $40k effectively |

### Seeded Cities

Tokyo, London, Paris, Cancun, New York - with pre-cached flights (from Phoenix), hotels, weather, and activities.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Auth & DB | Supabase (Google OAuth + Email Auth + PostgreSQL + RLS) |
| NLU | Groq SDK (llama-3.1-8b-instant) |
| Synthesis | Google Gemini 2.0 Flash, OpenRouter fallback |
| Voice | Speechmatics Real-Time API |
| Validation | Zod v4 |
| Testing | Vitest, Playwright, Testing Library |
| Deployment | Vercel |

---

## Testing

16 tests across 3 suites (Vitest):

| Suite | Tests | What It Covers |
|---|---|---|
| NLU Parser | 10 | Destination parsing, budget extraction, activity detection, date parsing, traveler count, duration semantics |
| Trip Synthesis | 4 | Complete brief generation, flight sorting by price, budget calculation, packing list |
| API Integration | 2 | Successful plan generation, error handling for missing destination |

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Evaluation Results

From `EVALUATIONS/feasibility_results.json`:

| Metric | Result |
|---|---|
| NLU spaCy F1 Score | 0.893 |
| Weather API Success Rate | 100% |
| Wikivoyage Extraction Rate | 61.5% |
| TF-IDF Extraction F1 | 0.861 |
| Synthesis Time | 0.0002s |
| Flight Live Scraping | Blocked (uses cached data) |

---

## Repository Structure

```
clickless-AI-travel-agent/
|
|-- CODE/                           # Application source (symlinks to root)
|   |-- src -> ../src               # Next.js source code
|   |-- public -> ../public         # Static assets
|   |-- scripts/
|       |-- seed-cache.ts           # Generate static JSON cache from APIs
|       |-- seed-hotels.ts          # Scrape Wikivoyage hotels into cache
|       |-- estimate-prices.ts      # Groq LLM activity price estimation
|
|-- DATA/                           # Datasets and data infrastructure
|   |-- supabase/
|   |   |-- migrations/
|   |       |-- 001_initial.sql     # Core schema (users, trips, saved_plans)
|   |       |-- 002_cached_data_tables.sql  # Cached flights/hotels/activities
|   |   |-- seed.sql                # Demo user seed
|   |-- scrapers/
|       |-- flight_scraper.py       # Playwright-based Google Flights scraper
|       |-- weather_scraper.py      # OpenWeatherMap data collector
|       |-- wikivoyage_scraper.py   # Wikivoyage content scraper
|
|-- EVALUATIONS/                    # Tests and evaluation baselines
|   |-- tests/
|   |   |-- nlu.test.ts            # 10 NLU parser tests
|   |   |-- synthesis.test.ts      # 4 synthesis tests
|   |   |-- api-plan.test.ts       # 2 API integration tests
|   |-- nlu/                       # spaCy NER baseline evaluation
|   |-- extraction/                # TF-IDF extraction baseline
|   |-- synthesis/                 # Trip synthesis baseline
|   |-- run_feasibility.py         # Full feasibility test runner
|   |-- feasibility_results.json   # Evaluation metrics
|
|-- src/                           # Next.js application source
|   |-- app/
|   |   |-- page.tsx               # Main app state machine (7 states)
|   |   |-- layout.tsx             # Root layout with auth provider
|   |   |-- api/plan/route.ts      # Trip planning POST endpoint
|   |   |-- api/trips/route.ts     # Saved trips CRUD
|   |   |-- api/speech-token/route.ts  # Speechmatics JWT vending
|   |-- components/
|   |   |-- trip/
|   |       |-- hero-home.tsx          # Landing page with voice input
|   |       |-- conversational-planning.tsx  # Chat refinement interface
|   |       |-- trip-brief-view.tsx     # Results with compare/itinerary tabs
|   |       |-- login-page.tsx         # Auth UI (Google + email)
|   |       |-- profile-page.tsx       # User profile + sign out
|   |       |-- saved-trips-view.tsx   # Saved trips gallery
|   |       |-- search-progress.tsx    # Loading animation
|   |   |-- ui/                    # 10 shadcn/ui primitives
|   |-- lib/
|       |-- nlu/parser.ts         # Groq LLM + regex intent parser
|       |-- providers/
|       |   |-- supabase-data.ts   # Dynamic budget-aware DB queries
|       |   |-- weather-live.ts    # OpenWeatherMap + cache
|       |   |-- wikivoyage.ts      # Wikivoyage API scraper
|       |   |-- demo-data.ts       # Static fallback data
|       |-- cache/
|       |   |-- index.ts           # Cache file loader
|       |   |-- types.ts           # CacheEntry interface
|       |   |-- tokyo.json         # 50 hotels, 284 activities, 90-day weather
|       |   |-- london.json        # 89 hotels, 660 activities, 90-day weather
|       |   |-- paris.json         # 77 hotels, 311 activities, 90-day weather
|       |-- extraction/normalize.ts  # Zod validation layer
|       |-- knowledge/graph.ts       # Knowledge graph + itinerary builder
|       |-- synthesis/brief.ts       # LLM summary generation
|       |-- supabase/
|       |   |-- client.ts          # Supabase client singleton
|       |   |-- auth.tsx           # Auth context provider
|       |-- types.ts               # 12 Zod schemas
|
|-- README.md
|-- package.json
|-- tsconfig.json
|-- next.config.ts
|-- vitest.config.ts
|-- .env.example
```

---

## Deployment

The app auto-deploys to Vercel on every push to `main`. To deploy your own:

1. Fork the repo
2. Connect at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Push to `main` - Vercel builds with Turbopack automatically

---

## License

MIT
