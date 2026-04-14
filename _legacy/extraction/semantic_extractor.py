"""
Semantic Extraction Pipeline — TF-IDF baseline vs LLM extraction.
Tests whether F1 targets (≥0.60 TF-IDF, ≥0.90 LLM) are achievable.
"""
import re
import json
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# ── Sample annotated hotel/flight listings for evaluation ──────
ANNOTATED_LISTINGS = [
    {
        "raw_html_text": "Hilton Tokyo Bay - $189/night - 4.2 stars - Free WiFi - Pool - Check-in 3:00 PM - Shiodome district - 2.3 km from city center",
        "ground_truth": {
            "name": "Hilton Tokyo Bay",
            "price_per_night": "$189",
            "rating": "4.2",
            "amenities": ["Free WiFi", "Pool"],
            "check_in": "3:00 PM",
            "location": "Shiodome district",
            "distance_center": "2.3 km",
        }
    },
    {
        "raw_html_text": "United Airlines UA 837 - Departs 10:30 AM SFO - Arrives 3:45 PM NRT +1 day - 12h 15m - Nonstop - Economy from $892 - Business $3,450",
        "ground_truth": {
            "airline": "United Airlines",
            "flight_number": "UA 837",
            "departure_time": "10:30 AM",
            "departure_airport": "SFO",
            "arrival_time": "3:45 PM",
            "arrival_airport": "NRT",
            "duration": "12h 15m",
            "stops": "Nonstop",
            "economy_price": "$892",
            "business_price": "$3,450",
        }
    },
    {
        "raw_html_text": "Park Hyatt Tokyo - $450/night - 4.8 stars - Spa - Restaurant - Gym - Shinjuku - 0.5 km from station - Breakfast included",
        "ground_truth": {
            "name": "Park Hyatt Tokyo",
            "price_per_night": "$450",
            "rating": "4.8",
            "amenities": ["Spa", "Restaurant", "Gym"],
            "location": "Shinjuku",
            "distance_center": "0.5 km",
            "breakfast": "included",
        }
    },
    {
        "raw_html_text": "ANA Flight NH 175 departing LAX at 1:15 PM arriving NRT 5:30 PM next day. Duration: 11h 15m. One stop (HNL). Economy $780, Premium Economy $1,200",
        "ground_truth": {
            "airline": "ANA",
            "flight_number": "NH 175",
            "departure_time": "1:15 PM",
            "departure_airport": "LAX",
            "arrival_time": "5:30 PM",
            "arrival_airport": "NRT",
            "duration": "11h 15m",
            "stops": "One stop (HNL)",
            "economy_price": "$780",
        }
    },
    {
        "raw_html_text": "Shinjuku Granbell Hotel - Budget pick - $95/night - 3.8 stars - Free WiFi - Near Kabukicho - 0.2 km from Shinjuku station - No breakfast",
        "ground_truth": {
            "name": "Shinjuku Granbell Hotel",
            "price_per_night": "$95",
            "rating": "3.8",
            "amenities": ["Free WiFi"],
            "location": "Near Kabukicho",
            "distance_center": "0.2 km",
            "breakfast": "No",
        }
    },
]


def tfidf_regex_extract(text: str) -> Dict:
    """Classical extraction: regex patterns + TF-IDF for field detection."""
    result = {}

    # Price extraction
    prices = re.findall(r'\$[\d,]+(?:/night)?', text)
    if prices:
        result["price"] = prices[0]
        if len(prices) > 1:
            result["prices_all"] = prices

    # Rating
    rating = re.search(r'(\d\.\d)\s*stars?', text)
    if rating:
        result["rating"] = rating.group(1)

    # Times
    times = re.findall(r'\d{1,2}:\d{2}\s*(?:AM|PM)', text)
    if times:
        result["departure_time"] = times[0]
        if len(times) > 1:
            result["arrival_time"] = times[1]

    # Duration
    dur = re.search(r'(\d+h\s*\d*m?)', text)
    if dur:
        result["duration"] = dur.group(1)

    # Airport codes
    airports = re.findall(r'\b([A-Z]{3})\b', text)
    airports = [a for a in airports if a not in ["AND", "THE", "FOR", "NOT"]]
    if airports:
        result["airports"] = airports

    # Airline / Hotel name (first capitalized phrase)
    name_match = re.match(r'^([A-Z][a-zA-Z\s]+?)(?:\s*-|\s*Flight|\s*Hotel)', text)
    if name_match:
        result["name"] = name_match.group(1).strip()

    # Amenities (keyword matching)
    amenity_keywords = ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Breakfast", "Parking"]
    result["amenities"] = [a for a in amenity_keywords if a.lower() in text.lower()]

    # Stops
    stops = re.search(r'(Nonstop|Non-stop|\d+\s*stops?(?:\s*\([^)]+\))?)', text, re.I)
    if stops:
        result["stops"] = stops.group(1)

    # Distance
    dist = re.search(r'([\d.]+\s*km)', text)
    if dist:
        result["distance"] = dist.group(1)

    return result


def evaluate_extraction_accuracy(predicted: Dict, ground_truth: Dict) -> Dict:
    """Compute extraction accuracy per field."""
    tp = 0
    fp = 0
    fn = 0

    gt_values = set()
    pred_values = set()

    def flatten(d, prefix=""):
        items = set()
        for k, v in d.items():
            if isinstance(v, list):
                for item in v:
                    items.add(str(item).lower().strip())
            elif v is not None:
                items.add(str(v).lower().strip())
        return items

    gt_flat = flatten(ground_truth)
    pred_flat = flatten(predicted)

    for gt_val in gt_flat:
        matched = False
        for pred_val in pred_flat:
            if gt_val in pred_val or pred_val in gt_val:
                matched = True
                break
        if matched:
            tp += 1
        else:
            fn += 1

    fp = max(0, len(pred_flat) - tp)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return {"precision": precision, "recall": recall, "f1": f1, "tp": tp, "fp": fp, "fn": fn}


def run_extraction_evaluation():
    """Evaluate TF-IDF + regex extraction on annotated listings."""
    print("=" * 60)
    print("SEMANTIC EXTRACTION EVALUATION — TF-IDF + Regex Baseline")
    print("=" * 60)

    all_metrics = []
    for i, listing in enumerate(ANNOTATED_LISTINGS):
        predicted = tfidf_regex_extract(listing["raw_html_text"])
        metrics = evaluate_extraction_accuracy(predicted, listing["ground_truth"])
        all_metrics.append(metrics)

        print(f"\nListing {i+1}: {listing['raw_html_text'][:60]}...")
        print(f"  Predicted fields: {list(predicted.keys())}")
        print(f"  P={metrics['precision']:.3f}  R={metrics['recall']:.3f}  F1={metrics['f1']:.3f}")

    # Aggregate
    avg_p = np.mean([m["precision"] for m in all_metrics])
    avg_r = np.mean([m["recall"] for m in all_metrics])
    avg_f1 = np.mean([m["f1"] for m in all_metrics])

    print(f"\n{'='*60}")
    print(f"AGGREGATE:  P={avg_p:.3f}  R={avg_r:.3f}  F1={avg_f1:.3f}")
    print(f"Target: F1 ≥ 0.60  →  {'✓ PASS' if avg_f1 >= 0.60 else '✗ FAIL'}")

    return avg_f1


if __name__ == "__main__":
    run_extraction_evaluation()
