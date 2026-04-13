"""
Flight scraper — Playwright-based Google Flights scraping.
THIS IS THE HIGH-RISK COMPONENT. Tests whether live scraping is feasible
given bot detection, CAPTCHAs, and dynamic JS rendering.
"""
import asyncio
import json
from typing import Dict, List, Optional

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


async def scrape_google_flights(
    origin: str,
    destination: str,
    depart_date: str,
    return_date: str = None,
) -> Dict:
    """
    Attempt to scrape Google Flights using Playwright.
    Returns structured flight data or failure info for feasibility assessment.
    """
    if not PLAYWRIGHT_AVAILABLE:
        return {"success": False, "error": "Playwright not installed", "source": "Google Flights"}

    # Build Google Flights URL
    url = f"https://www.google.com/travel/flights?q=flights+from+{origin}+to+{destination}+on+{depart_date}"

    result = {
        "source": "Google Flights",
        "origin": origin,
        "destination": destination,
        "depart_date": depart_date,
        "url": url,
        "flights": [],
        "success": False,
        "blocked": False,
        "error": None,
    }

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800},
            )
            page = await context.new_page()

            # Navigate
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(3000)  # Wait for JS render

            # Check for CAPTCHA / block
            page_text = await page.content()
            if "captcha" in page_text.lower() or "unusual traffic" in page_text.lower():
                result["blocked"] = True
                result["error"] = "Bot detection triggered (CAPTCHA)"
                await browser.close()
                return result

            # Try to extract flight cards
            # Google Flights uses dynamic class names — this is fragile by design
            flight_cards = await page.query_selector_all('[class*="flight"], li[class*="pIav2d"]')

            if not flight_cards:
                # Try alternative selectors
                flight_cards = await page.query_selector_all('[data-ved] [role="listitem"]')

            if not flight_cards:
                # Last resort: get all text and try to parse
                all_text = await page.inner_text("body")
                result["error"] = "No flight cards found — DOM structure may have changed"
                result["page_text_sample"] = all_text[:500]
                await browser.close()
                return result

            for card in flight_cards[:10]:
                try:
                    text = await card.inner_text()
                    # Attempt to parse price, airline, times from text
                    flight_info = parse_flight_text(text)
                    if flight_info:
                        result["flights"].append(flight_info)
                except:
                    continue

            result["success"] = len(result["flights"]) > 0
            await browser.close()

    except Exception as e:
        result["error"] = str(e)

    return result


def parse_flight_text(text: str) -> Optional[Dict]:
    """Try to extract structured flight info from raw text."""
    import re

    price_match = re.search(r'\$[\d,]+', text)
    time_match = re.findall(r'\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?', text)
    duration_match = re.search(r'(\d+\s*h(?:r)?(?:\s*\d+\s*m(?:in)?)?)', text)

    if not price_match:
        return None

    return {
        "price": price_match.group(0) if price_match else None,
        "departure_time": time_match[0] if len(time_match) > 0 else None,
        "arrival_time": time_match[1] if len(time_match) > 1 else None,
        "duration": duration_match.group(0) if duration_match else None,
        "raw_text": text[:200],
    }


def get_mock_flights(origin: str, destination: str) -> Dict:
    """Mock flight data for testing pipeline when live scraping fails."""
    return {
        "source": "MockFlights (cached)",
        "origin": origin,
        "destination": destination,
        "success": True,
        "flights": [
            {"airline": "United", "price": "$850", "departure_time": "10:30 AM",
             "arrival_time": "3:45 PM +1", "duration": "13h 15m", "stops": "Nonstop"},
            {"airline": "ANA", "price": "$920", "departure_time": "1:15 PM",
             "arrival_time": "5:30 PM +1", "duration": "12h 15m", "stops": "Nonstop"},
            {"airline": "Delta", "price": "$780", "departure_time": "6:00 PM",
             "arrival_time": "11:20 PM +1", "duration": "14h 20m", "stops": "1 stop (LAX)"},
            {"airline": "Japan Airlines", "price": "$1050", "departure_time": "11:00 AM",
             "arrival_time": "3:15 PM +1", "duration": "12h 15m", "stops": "Nonstop"},
            {"airline": "American", "price": "$720", "departure_time": "8:45 AM",
             "arrival_time": "4:30 PM +1", "duration": "15h 45m", "stops": "1 stop (DFW)"},
        ],
        "extraction_rate": 1.0,
    }


async def test_flight_scraping():
    """Test live flight scraping feasibility."""
    print("=" * 60)
    print("FLIGHT SCRAPING FEASIBILITY TEST")
    print("=" * 60)

    test_cases = [
        ("Phoenix", "Tokyo", "2026-04-15"),
        ("New York", "London", "2026-05-01"),
    ]

    for origin, dest, date in test_cases:
        print(f"\nTest: {origin} → {dest} on {date}")
        result = await scrape_google_flights(origin, dest, date)

        if result["success"]:
            print(f"  ✓ SUCCESS: Found {len(result['flights'])} flights")
            for f in result["flights"][:3]:
                print(f"    {f.get('price', '?')} - {f.get('departure_time', '?')}")
        elif result["blocked"]:
            print(f"  ✗ BLOCKED: {result['error']}")
        else:
            print(f"  ✗ FAILED: {result['error']}")

        print(f"  → Falling back to mock data...")
        mock = get_mock_flights(origin, dest)
        print(f"  Mock: {len(mock['flights'])} flights available")


if __name__ == "__main__":
    asyncio.run(test_flight_scraping())
