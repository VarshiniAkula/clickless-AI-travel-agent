# Scraping Strategy — Future Implementation

## Current State
ClickLess AI uses **cached demo data** for all providers (flights, hotels, weather, cultural tips, activities). No live scraping or external API calls are made in production.

## Path to Live Data

### Phase 1: Manual On-Demand Refresh
- Add admin-triggered "refresh" endpoint per provider per destination
- Run on a schedule (e.g., weekly cron) or manually
- Store results in `cached_provider_payloads` table with TTL

### Phase 2: One Source at a Time
Add providers incrementally, starting with those that have official APIs:

| Priority | Source | Method | Difficulty |
|----------|--------|--------|------------|
| 1 | OpenWeatherMap | REST API (free tier) | Easy |
| 2 | Amadeus / Skyscanner | REST API (free tier) | Medium |
| 3 | Booking.com Affiliate | REST API | Medium |
| 4 | Wikivoyage | BeautifulSoup scraping | Medium |
| 5 | Google Flights | Playwright (last resort) | Hard |

### Phase 3: Playwright Scraping (if needed)
Only for sources without APIs. Architecture:

```
Playwright browser -> raw HTML/JSON -> Supabase Storage
  -> parser -> normalized records -> Postgres
  -> cache-first reads, background refresh
```

### Storage Schema
```sql
cached_provider_payloads:
  source TEXT        -- "amadeus", "wikivoyage", etc.
  destination TEXT   -- "Tokyo"
  payload JSONB      -- raw response
  fetched_at TIMESTAMPTZ
  ttl_seconds INTEGER
  hash TEXT          -- SHA256 of payload for dedup
```

### Scraping Guidelines
- **Prefer official APIs** whenever available
- **Cache-first reads**: always serve from cache, refresh in background
- **Document selectors**: CSS selectors break — document them with screenshots
- **Retry with backoff**: 3 retries, exponential backoff (1s, 4s, 16s)
- **Rate limiting**: max 1 request per source per 10 seconds
- **Fallback to cache**: if scraping fails, serve stale data with a warning badge
- **Store raw + normalized**: keep raw HTML/JSON in Storage, normalized in Postgres
- **TTL per source**: flights 6h, hotels 24h, weather 3h, cultural 7d

### Anti-Detection (for Playwright)
- Rotate user agents
- Random delays between actions (2-5s)
- Use stealth plugin (`playwright-extra`)
- Respect robots.txt
- Consider residential proxies for production scale

### Monitoring
- Track `extraction_rate` per source per destination
- Alert if rate drops below 50%
- Dashboard showing freshness of cached data per destination
