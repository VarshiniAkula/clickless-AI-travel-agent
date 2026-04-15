"""
NLU Intent Parsing — spaCy NER baseline vs LLM-based extraction.
Tests whether F1 targets (≥0.65 spaCy, ≥0.85 LLM) are achievable.
"""
import spacy
import json
import re
from typing import Dict, List, Optional

# ── spaCy baseline ──────────────────────────────────────────────
nlp = spacy.load("en_core_web_lg")

ACTIVITY_KEYWORDS = [
    "hiking", "snorkeling", "surfing", "skiing", "trekking", "biking",
    "diving", "climbing", "sightseeing", "shopping", "nightlife",
    "museum", "temple", "beach", "food tour", "cooking class",
    "photography", "kayaking", "camping", "fishing"
]

def spacy_extract(utterance: str) -> Dict:
    """Classical spaCy NER + rule-based extraction."""
    doc = nlp(utterance)
    result = {
        "destination": None,
        "origin": None,
        "dates": [],
        "budget": None,
        "activities": [],
        "traveler_count": None,
        "duration": None,
    }

    # Extract named entities
    for ent in doc.ents:
        if ent.label_ == "GPE":
            if result["destination"] is None:
                # Heuristic: first GPE after "to" is destination
                # Check context
                token_idx = ent.start
                if token_idx > 0 and doc[token_idx - 1].text.lower() == "from":
                    result["origin"] = ent.text
                else:
                    if result["destination"] is None:
                        result["destination"] = ent.text
                    elif result["origin"] is None:
                        result["origin"] = ent.text
            elif result["origin"] is None:
                result["origin"] = ent.text
        elif ent.label_ == "DATE":
            result["dates"].append(ent.text)
        elif ent.label_ == "MONEY":
            result["budget"] = ent.text
        elif ent.label_ == "CARDINAL":
            # Check if it's traveler count
            if any(w in utterance.lower() for w in ["people", "travelers", "persons", "adults", "guests"]):
                result["traveler_count"] = ent.text

    # Rule-based: detect "from X to Y" pattern
    from_to = re.search(r'from\s+(\w[\w\s]*?)\s+to\s+(\w[\w\s]*?)(?:\s+(?:in|for|on|under|around|with|,|$))', utterance, re.I)
    if from_to:
        result["origin"] = from_to.group(1).strip()
        result["destination"] = from_to.group(2).strip()

    # Rule-based: duration
    dur_match = re.search(r'(\d+)\s*(?:day|night|week)s?', utterance, re.I)
    if dur_match:
        result["duration"] = dur_match.group(0)

    # Rule-based: budget
    budget_match = re.search(r'(?:under|below|max|budget|less than)?\s*\$[\d,]+', utterance, re.I)
    if budget_match and not result["budget"]:
        result["budget"] = budget_match.group(0).strip()

    # Activity keyword matching
    utterance_lower = utterance.lower()
    for activity in ACTIVITY_KEYWORDS:
        if activity in utterance_lower:
            result["activities"].append(activity)

    return result


def llm_extract(utterance: str, client=None) -> Dict:
    """LLM-based structured intent extraction using OpenAI-compatible API."""
    if client is None:
        from openai import OpenAI
        client = OpenAI()

    system_prompt = """You are a travel intent parser. Extract structured travel information from the user's utterance.
Return ONLY valid JSON with these fields:
{
  "destination": string or null,
  "origin": string or null,
  "dates": [list of date strings],
  "budget": string or null,
  "activities": [list of activity strings],
  "traveler_count": string or null,
  "duration": string or null
}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": utterance}
        ],
        temperature=0,
        response_format={"type": "json_object"}
    )

    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM response"}


# ── Test utterances with ground truth (sample of 50) ───────────
TEST_UTTERANCES = [
    {
        "utterance": "I want to go to Tokyo for a week in April under $2000",
        "ground_truth": {
            "destination": "Tokyo",
            "origin": None,
            "dates": ["April"],
            "budget": "$2000",
            "activities": [],
            "traveler_count": None,
            "duration": "a week"
        }
    },
    {
        "utterance": "Plan a trip from Phoenix to London for 5 nights, budget $3000, interested in museums and food tours",
        "ground_truth": {
            "destination": "London",
            "origin": "Phoenix",
            "dates": [],
            "budget": "$3000",
            "activities": ["museum", "food tour"],
            "traveler_count": None,
            "duration": "5 nights"
        }
    },
    {
        "utterance": "Cancun beach vacation in July for 2 people, under $1500 per person",
        "ground_truth": {
            "destination": "Cancun",
            "origin": None,
            "dates": ["July"],
            "budget": "$1500",
            "activities": ["beach"],
            "traveler_count": "2",
            "duration": None
        }
    },
    {
        "utterance": "I'd like to visit Paris next March for 4 days, love sightseeing and photography",
        "ground_truth": {
            "destination": "Paris",
            "origin": None,
            "dates": ["next March"],
            "budget": None,
            "activities": ["sightseeing", "photography"],
            "traveler_count": None,
            "duration": "4 days"
        }
    },
    {
        "utterance": "New York City trip from LA, 3 nights in December, budget around $2500, nightlife and shopping",
        "ground_truth": {
            "destination": "New York City",
            "origin": "LA",
            "dates": ["December"],
            "budget": "$2500",
            "activities": ["nightlife", "shopping"],
            "traveler_count": None,
            "duration": "3 nights"
        }
    },
    {
        "utterance": "Take me to Bali for hiking and surfing, 10 days, under $1800",
        "ground_truth": {
            "destination": "Bali",
            "origin": None,
            "dates": [],
            "budget": "$1800",
            "activities": ["hiking", "surfing"],
            "traveler_count": None,
            "duration": "10 days"
        }
    },
    {
        "utterance": "Family trip to Orlando for 5 people, one week in June, max $4000",
        "ground_truth": {
            "destination": "Orlando",
            "origin": None,
            "dates": ["June"],
            "budget": "$4000",
            "activities": [],
            "traveler_count": "5",
            "duration": "one week"
        }
    },
    {
        "utterance": "Fly from San Francisco to Tokyo, April 15 to April 22, budget $2000, want to visit temples",
        "ground_truth": {
            "destination": "Tokyo",
            "origin": "San Francisco",
            "dates": ["April 15", "April 22"],
            "budget": "$2000",
            "activities": ["temple"],
            "traveler_count": None,
            "duration": None
        }
    },
    {
        "utterance": "Weekend getaway to Las Vegas from Phoenix, $500 budget",
        "ground_truth": {
            "destination": "Las Vegas",
            "origin": "Phoenix",
            "dates": [],
            "budget": "$500",
            "activities": [],
            "traveler_count": None,
            "duration": "weekend"
        }
    },
    {
        "utterance": "I want to go somewhere warm in February for diving, around $3000",
        "ground_truth": {
            "destination": None,
            "origin": None,
            "dates": ["February"],
            "budget": "$3000",
            "activities": ["diving"],
            "traveler_count": None,
            "duration": None
        }
    },
    {
        "utterance": "2 week honeymoon to Maldives in September",
        "ground_truth": {
            "destination": "Maldives",
            "origin": None,
            "dates": ["September"],
            "budget": None,
            "activities": [],
            "traveler_count": "2",
            "duration": "2 week"
        }
    },
    {
        "utterance": "Skiing trip to Aspen for 4 days in January, $2000 max for 3 adults",
        "ground_truth": {
            "destination": "Aspen",
            "origin": None,
            "dates": ["January"],
            "budget": "$2000",
            "activities": ["skiing"],
            "traveler_count": "3",
            "duration": "4 days"
        }
    },
]


def evaluate_extraction(predicted: Dict, ground_truth: Dict) -> Dict:
    """Compute per-field precision, recall, F1."""
    fields = ["destination", "origin", "dates", "budget", "activities", "traveler_count", "duration"]
    results = {}

    for field in fields:
        pred = predicted.get(field)
        gt = ground_truth.get(field)

        # Normalize
        if pred is None or pred == "" or pred == []:
            pred_set = set()
        elif isinstance(pred, list):
            pred_set = {str(v).lower().strip() for v in pred if v}
        else:
            pred_set = {str(pred).lower().strip()}

        if gt is None or gt == "" or gt == []:
            gt_set = set()
        elif isinstance(gt, list):
            gt_set = {str(v).lower().strip() for v in gt if v}
        else:
            gt_set = {str(gt).lower().strip()}

        # Handle empty cases
        if not gt_set and not pred_set:
            tp, fp, fn = 1, 0, 0  # Both correctly empty
        elif not gt_set:
            tp, fp, fn = 0, len(pred_set), 0
        elif not pred_set:
            tp, fp, fn = 0, 0, len(gt_set)
        else:
            # Fuzzy match: check if prediction contains ground truth or vice versa
            tp = 0
            for g in gt_set:
                for p in pred_set:
                    if g in p or p in g:
                        tp += 1
                        break
            fp = max(0, len(pred_set) - tp)
            fn = max(0, len(gt_set) - tp)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

        results[field] = {"precision": precision, "recall": recall, "f1": f1}

    return results


def run_spacy_evaluation():
    """Run spaCy NER baseline on all test utterances and report F1."""
    print("=" * 60)
    print("spaCy NER Baseline Evaluation")
    print("=" * 60)

    all_results = {}
    for test in TEST_UTTERANCES:
        predicted = spacy_extract(test["utterance"])
        field_results = evaluate_extraction(predicted, test["ground_truth"])

        print(f"\nUtterance: {test['utterance'][:60]}...")
        print(f"  Predicted: {json.dumps(predicted, indent=2)[:200]}")

        for field, metrics in field_results.items():
            if field not in all_results:
                all_results[field] = []
            all_results[field].append(metrics)

    # Aggregate
    print("\n" + "=" * 60)
    print("AGGREGATE RESULTS — spaCy NER Baseline")
    print("=" * 60)
    total_f1 = []
    for field, metrics_list in all_results.items():
        avg_p = sum(m["precision"] for m in metrics_list) / len(metrics_list)
        avg_r = sum(m["recall"] for m in metrics_list) / len(metrics_list)
        avg_f1 = sum(m["f1"] for m in metrics_list) / len(metrics_list)
        total_f1.append(avg_f1)
        print(f"  {field:20s}  P={avg_p:.3f}  R={avg_r:.3f}  F1={avg_f1:.3f}")

    overall = sum(total_f1) / len(total_f1)
    print(f"\n  {'OVERALL':20s}  F1={overall:.3f}")
    print(f"  Target: F1 ≥ 0.65  →  {'✓ PASS' if overall >= 0.65 else '✗ FAIL'}")
    return overall


if __name__ == "__main__":
    overall_f1 = run_spacy_evaluation()
