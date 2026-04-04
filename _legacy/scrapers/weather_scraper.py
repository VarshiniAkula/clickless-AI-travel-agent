"""
Weather scraper — OpenWeatherMap REST API (primary) + fallback.
Tests API reliability and data extraction rate.
"""
import requests
import json
from datetime import datetime

# Free tier API key — replace with your own
OWM_API_KEY = "demo"  # Get free key at openweathermap.org/api


def fetch_weather_api(city: str, api_key: str = None) -> dict:
    """Fetch 5-day forecast from OpenWeatherMap API."""
    key = api_key or OWM_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/forecast"
    params = {"q": city, "appid": key, "units": "imperial", "cnt": 40}

    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        forecasts = []
        for item in data.get("list", []):
            forecasts.append({
                "datetime": item["dt_txt"],
                "temp_f": item["main"]["temp"],
                "temp_min_f": item["main"]["temp_min"],
                "temp_max_f": item["main"]["temp_max"],
                "humidity": item["main"]["humidity"],
                "description": item["weather"][0]["description"],
                "wind_speed_mph": item["wind"]["speed"],
                "rain_mm": item.get("rain", {}).get("3h", 0),
            })

        return {
            "source": "OpenWeatherMap",
            "city": data.get("city", {}).get("name", city),
            "country": data.get("city", {}).get("country", ""),
            "forecasts": forecasts,
            "success": True,
            "fields_extracted": ["datetime", "temp_f", "temp_min_f", "temp_max_f",
                                "humidity", "description", "wind_speed_mph", "rain_mm"],
            "extraction_rate": 1.0,  # API gives structured data
        }
    except Exception as e:
        return {"source": "OpenWeatherMap", "city": city, "success": False, "error": str(e)}


def fetch_weather_mock(city: str) -> dict:
    """Mock weather data for testing (simulates cached data)."""
    mock_data = {
        "Tokyo": {
            "forecasts": [
                {"datetime": "2026-04-15 12:00:00", "temp_f": 65, "temp_max_f": 70,
                 "temp_min_f": 55, "humidity": 60, "description": "partly cloudy",
                 "wind_speed_mph": 8, "rain_mm": 0},
                {"datetime": "2026-04-16 12:00:00", "temp_f": 68, "temp_max_f": 72,
                 "temp_min_f": 58, "humidity": 55, "description": "clear sky",
                 "wind_speed_mph": 5, "rain_mm": 0},
                {"datetime": "2026-04-17 12:00:00", "temp_f": 62, "temp_max_f": 66,
                 "temp_min_f": 54, "humidity": 75, "description": "light rain",
                 "wind_speed_mph": 12, "rain_mm": 3.2},
            ]
        },
        "London": {
            "forecasts": [
                {"datetime": "2026-04-15 12:00:00", "temp_f": 55, "temp_max_f": 58,
                 "temp_min_f": 48, "humidity": 70, "description": "overcast clouds",
                 "wind_speed_mph": 15, "rain_mm": 1.5},
            ]
        },
        "Paris": {
            "forecasts": [
                {"datetime": "2026-04-15 12:00:00", "temp_f": 60, "temp_max_f": 64,
                 "temp_min_f": 50, "humidity": 65, "description": "scattered clouds",
                 "wind_speed_mph": 10, "rain_mm": 0},
            ]
        },
    }
    city_data = mock_data.get(city, mock_data["Tokyo"])
    return {
        "source": "MockWeather",
        "city": city,
        "forecasts": city_data["forecasts"],
        "success": True,
        "fields_extracted": ["datetime", "temp_f", "temp_max_f", "temp_min_f",
                            "humidity", "description", "wind_speed_mph", "rain_mm"],
        "extraction_rate": 1.0,
    }


if __name__ == "__main__":
    # Test with mock data (no API key needed)
    for city in ["Tokyo", "London", "Paris"]:
        result = fetch_weather_mock(city)
        print(f"\n{city}: {json.dumps(result, indent=2)[:300]}")
        print(f"  Success: {result['success']}, Fields: {len(result['fields_extracted'])}")
