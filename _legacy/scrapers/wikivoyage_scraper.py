"""
Wikivoyage cultural context scraper — CC BY-SA, no bot issues.
Tests BeautifulSoup + spaCy extraction vs LLM extraction.
"""
import requests
from bs4 import BeautifulSoup
import json
import re
from typing import Dict, List


def fetch_wikivoyage(destination: str) -> Dict:
    """Fetch and parse Wikivoyage page for a destination."""
    url = f"https://en.wikivoyage.org/wiki/{destination.replace(' ', '_')}"

    try:
        resp = requests.get(url, timeout=15, headers={
            "User-Agent": "ClickLessAI/1.0 (university research project)"
        })
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Extract sections
        sections = {}
        current_section = "intro"
        sections[current_section] = []

        # Wikivoyage may have multiple mw-parser-output divs — pick the largest
        candidates = soup.find_all("div", {"class": "mw-parser-output"})
        content = max(candidates, key=lambda d: len(d.get_text())) if candidates else None
        if not content:
            return {"success": False, "error": "Could not find page content"}

        # Wikivoyage wraps content in <section> tags
        for section_elem in content.find_all("section"):
            # Get section heading
            heading = section_elem.find(["h2", "h3"])
            if heading:
                heading_text = heading.get_text(strip=True).lower()
                # Remove [edit] links etc
                heading_text = re.sub(r'\[.*?\]', '', heading_text).strip()
                current_section = heading_text
                sections[current_section] = []

            # Get paragraphs in this section
            for p in section_elem.find_all("p", recursive=False):
                text = p.get_text(strip=True)
                if text:
                    sections.setdefault(current_section, []).append(text)

        # Fallback: if sections didn't work, try flat h2/h3/p
        if len(sections) <= 1:
            for elem in content.find_all(["h2", "h3", "p"]):
                if elem.name in ["h2", "h3"]:
                    heading_text = elem.get_text(strip=True).lower()
                    heading_text = re.sub(r'\[.*?\]', '', heading_text).strip()
                    current_section = heading_text
                    sections[current_section] = []
                elif elem.name == "p":
                    text = elem.get_text(strip=True)
                    if text:
                        sections.setdefault(current_section, []).append(text)

        # Extract key cultural/travel info
        result = {
            "source": "Wikivoyage",
            "destination": destination,
            "url": url,
            "success": True,
            "sections_found": list(sections.keys()),
            "raw_sections": {k: " ".join(v)[:500] for k, v in sections.items() if v},
        }

        # Classical extraction: look for key sections
        cultural_keys = ["respect", "cope", "stay safe", "understand", "talk"]
        activity_keys = ["see", "do", "eat", "drink", "buy"]
        practical_keys = ["get in", "get around", "sleep"]

        result["cultural_context"] = {k: " ".join(sections.get(k, []))[:300] for k in cultural_keys if k in sections}
        result["activities"] = {k: " ".join(sections.get(k, []))[:300] for k in activity_keys if k in sections}
        result["practical_info"] = {k: " ".join(sections.get(k, []))[:300] for k in practical_keys if k in sections}

        # Count extraction success
        target_fields = cultural_keys + activity_keys + practical_keys
        found = sum(1 for k in target_fields if k in sections and sections[k])
        result["extraction_rate"] = found / len(target_fields) if target_fields else 0
        result["fields_found"] = found
        result["fields_target"] = len(target_fields)

        return result

    except Exception as e:
        return {"success": False, "destination": destination, "error": str(e)}


def extract_cultural_norms_classical(text: str) -> List[str]:
    """Rule-based extraction of cultural norms from text."""
    norms = []
    # Pattern matching for cultural advice
    patterns = [
        r'(?:you should|it is (?:important|customary|polite|common)|remember to|don\'t forget to|avoid|never)[^.]+\.',
        r'(?:tipping|bowing|shoes|dress code|etiquette)[^.]+\.',
        r'(?:it is considered (?:rude|impolite|disrespectful))[^.]+\.',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.I)
        norms.extend(matches)
    return norms


if __name__ == "__main__":
    for dest in ["Tokyo", "London", "Paris", "Cancun"]:
        print(f"\n{'='*50}")
        print(f"Fetching Wikivoyage: {dest}")
        result = fetch_wikivoyage(dest)
        if result["success"]:
            print(f"  Sections found: {len(result['sections_found'])}")
            print(f"  Extraction rate: {result['extraction_rate']:.2%}")
            print(f"  Cultural sections: {list(result['cultural_context'].keys())}")
            print(f"  Activity sections: {list(result['activities'].keys())}")
            if result.get("cultural_context"):
                first_key = list(result["cultural_context"].keys())[0]
                text = result["cultural_context"][first_key]
                norms = extract_cultural_norms_classical(text)
                print(f"  Cultural norms extracted: {len(norms)}")
                for n in norms[:3]:
                    print(f"    - {n[:100]}")
        else:
            print(f"  FAILED: {result.get('error')}")
