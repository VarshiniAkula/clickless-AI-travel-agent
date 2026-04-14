# CODE

Source code for the ClickLess AI travel agent application.

## Structure

```
CODE/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── plan/           # Trip planning pipeline endpoint
│   │   │   ├── speech-token/   # Speechmatics JWT endpoint
│   │   │   └── trips/          # Saved trips CRUD
│   │   ├── layout.tsx          # Root layout with auth provider
│   │   ├── page.tsx            # Main app state machine
│   │   └── globals.css         # Tailwind CSS 4 styles
│   ├── components/
│   │   ├── trip/               # Application components
│   │   │   ├── hero-home.tsx           # Landing page with voice input
│   │   │   ├── conversational-planning.tsx  # Chat refinement UI
│   │   │   ├── trip-brief-view.tsx     # Results display
│   │   │   ├── saved-trips-view.tsx    # Saved trips gallery
│   │   │   ├── search-progress.tsx     # Loading/progress animation
│   │   │   ├── login-page.tsx          # Email/password auth
│   │   │   └── profile-page.tsx        # User profile page
│   │   └── ui/                 # Shared UI primitives (shadcn/ui)
│   ├── lib/
│   │   ├── nlu/                # Intent parsing (Groq LLM + regex fallback)
│   │   ├── providers/          # Data fetchers (demo, weather, wikivoyage)
│   │   ├── extraction/         # Zod normalization layer
│   │   ├── knowledge/          # Knowledge graph builder
│   │   ├── synthesis/          # Trip brief generation (Gemini/OpenRouter)
│   │   ├── cache/              # Static + in-memory cache system
│   │   └── supabase/           # Auth context + Supabase client
│   └── types/                  # TypeScript declarations
├── public/                     # Static assets
└── scripts/                    # Build scripts (cache seeding)
```

## Tech Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS 4 + shadcn/ui
- Groq SDK (llama-3.1-8b-instant) for NLU
- Google Gemini 2.0 Flash for trip synthesis
- Supabase for authentication and persistence
- Speechmatics for real-time speech-to-text
- Zod for data validation
