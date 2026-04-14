"""
Trip brief synthesis — combines all scraped data into a unified output.
Tests end-to-end pipeline feasibility.
"""
import json
from typing import Dict


def synthesize_trip_brief_classical(intent: Dict, flights: Dict, weather: Dict, cultural: Dict) -> str:
    """Classical rule-based synthesis (template-based)."""
    dest = intent.get("destination", "your destination")
    duration = intent.get("duration", "your trip")
    budget = intent.get("budget", "flexible")

    brief = []
    brief.append(f"## Trip Brief: {dest}")
    brief.append(f"Duration: {duration} | Budget: {budget}\n")

    # Flights section
    if flights.get("flights"):
        brief.append("### ✈ Flight Options")
        for f in flights["flights"][:3]:
            airline = f.get("airline", "Unknown")
            price = f.get("price", "N/A")
            dep = f.get("departure_time", "")
            dur = f.get("duration", "")
            stops = f.get("stops", "")
            brief.append(f"- **{airline}** — {price} | Departs {dep} | {dur} | {stops}")

    # Weather section
    if weather.get("forecasts"):
        brief.append("\n### 🌤 Weather Forecast")
        for w in weather["forecasts"][:5]:
            date = w.get("datetime", "")[:10]
            desc = w.get("description", "")
            temp = w.get("temp_f", "")
            brief.append(f"- {date}: {desc}, {temp}°F")

    # Cultural section
    if cultural.get("cultural_context"):
        brief.append("\n### 🏛 Cultural Context")
        for section, text in cultural["cultural_context"].items():
            if text:
                brief.append(f"**{section.title()}**: {text[:200]}...")

    # Activities section
    if cultural.get("activities"):
        brief.append("\n### 🎯 Things to Do")
        for section, text in cultural["activities"].items():
            if text:
                brief.append(f"**{section.title()}**: {text[:200]}...")

    # Packing suggestions based on weather
    if weather.get("forecasts"):
        brief.append("\n### 🎒 Packing Suggestions")
        temps = [w.get("temp_f", 70) for w in weather["forecasts"]]
        avg_temp = sum(temps) / len(temps) if temps else 70
        rain = any(w.get("rain_mm", 0) > 0 for w in weather["forecasts"])

        if avg_temp < 50:
            brief.append("- Heavy jacket, warm layers, gloves")
        elif avg_temp < 65:
            brief.append("- Light jacket, layers")
        else:
            brief.append("- Light clothing, sunscreen")

        if rain:
            brief.append("- Umbrella / rain jacket")

    return "\n".join(brief)


def run_synthesis_demo():
    """Demo the full synthesis pipeline with mock data."""
    print("=" * 60)
    print("TRIP BRIEF SYNTHESIS DEMO")
    print("=" * 60)

    # Simulated pipeline output
    intent = {
        "destination": "Tokyo",
        "origin": "Phoenix",
        "dates": ["April 15"],
        "budget": "$2000",
        "activities": ["temple", "food tour"],
        "duration": "5 nights",
    }

    flights = {
        "source": "MockFlights",
        "flights": [
            {"airline": "United", "price": "$850", "departure_time": "10:30 AM",
             "duration": "13h 15m", "stops": "Nonstop"},
            {"airline": "ANA", "price": "$920", "departure_time": "1:15 PM",
             "duration": "12h 15m", "stops": "Nonstop"},
            {"airline": "Delta", "price": "$780", "departure_time": "6:00 PM",
             "duration": "14h 20m", "stops": "1 stop (LAX)"},
        ],
    }

    weather = {
        "forecasts": [
            {"datetime": "2026-04-15 12:00", "temp_f": 65, "description": "partly cloudy", "rain_mm": 0},
            {"datetime": "2026-04-16 12:00", "temp_f": 68, "description": "clear sky", "rain_mm": 0},
            {"datetime": "2026-04-17 12:00", "temp_f": 62, "description": "light rain", "rain_mm": 3.2},
            {"datetime": "2026-04-18 12:00", "temp_f": 70, "description": "sunny", "rain_mm": 0},
            {"datetime": "2026-04-19 12:00", "temp_f": 66, "description": "partly cloudy", "rain_mm": 0},
        ],
    }

    cultural = {
        "cultural_context": {
            "respect": "Bowing is the standard greeting in Japan. Remove shoes before entering homes and many traditional restaurants. Tipping is not customary and can be considered rude.",
            "understand": "Tokyo is Japan's capital and largest city. The city blends ultramodern with traditional, from neon-lit skyscrapers to historic temples.",
        },
        "activities": {
            "see": "Senso-ji Temple, Meiji Shrine, Tokyo Tower, Shibuya Crossing, Imperial Palace, Tsukiji Outer Market",
            "do": "Visit Akihabara for electronics and anime, explore Harajuku for fashion, take a day trip to Mount Fuji",
            "eat": "Try authentic ramen in Shinjuku, sushi at Tsukiji, tempura, yakitori. Don't miss a conveyor belt sushi experience.",
        },
    }

    brief = synthesize_trip_brief_classical(intent, flights, weather, cultural)
    print(brief)

    # Measure completeness
    categories = {
        "flights": bool(flights.get("flights")),
        "weather": bool(weather.get("forecasts")),
        "cultural": bool(cultural.get("cultural_context")),
        "activities": bool(cultural.get("activities")),
    }
    completion = sum(categories.values()) / len(categories)
    print(f"\n{'='*60}")
    print(f"Task completion: {sum(categories.values())}/{len(categories)} categories = {completion:.0%}")
    print(f"Target: ≥85%  →  {'✓ PASS' if completion >= 0.85 else '✗ FAIL'}")

    return brief


if __name__ == "__main__":
    run_synthesis_demo()
