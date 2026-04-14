# DATA

Datasets and data sources used by the ClickLess AI travel agent.

## Structure

```
DATA/
├── supabase/                   # Database schema and migrations
│   ├── migrations/
│   │   └── 001_initial.sql     # Initial schema (users, trips, saved_plans)
│   └── seed.sql                # Seed data for development
└── scrapers/                   # Python scrapers for live data collection
    ├── flight_scraper.py       # Flight data scraper
    ├── weather_scraper.py      # OpenWeatherMap data collector
    └── wikivoyage_scraper.py   # Wikivoyage content scraper
```

## Data Sources

| Source | Type | Description |
|---|---|---|
| OpenWeatherMap API | Live | 5-day weather forecasts with 3-hour intervals |
| Wikivoyage API | Live | Activities (See/Do/Buy/Eat) and cultural norms |
| Demo flight/hotel cache | Static | 5 seeded cities with realistic pricing |
| Static weather cache | Static | 90 days of real forecasts for Tokyo, London, Paris |

## Static Cache

Pre-seeded JSON cache files are stored in `CODE/src/lib/cache/` and contain 90-day weather, activity, and cultural data for:
- Tokyo
- London
- Paris

These were generated using `CODE/scripts/seed-cache.ts` from live API calls and committed to git for offline/demo use.

## Supabase Schema

The database schema includes:
- `trip_results` - Stores generated trip plans
- `saved_plans` - User-saved trips (with RLS policies)
- Row Level Security ensuring users can only access their own data
