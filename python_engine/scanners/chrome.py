from typing import List, Dict, Any
import re


def extract_chrome_extension_data(serp_result: Dict[str, Any]) -> Dict[str, Any]:
    url = serp_result.get("link", "")
    title = serp_result.get("title", "")
    snippet = serp_result.get("snippet", "")
    
    extension_id = None
    id_match = re.search(r'/detail/[^/]+/([a-z]{32})', url)
    if id_match:
        extension_id = id_match.group(1)
    
    users = 0
    users_match = re.search(r'([\d,]+)\s*users?', snippet, re.I)
    if users_match:
        users = int(users_match.group(1).replace(",", ""))
    
    rating = None
    rating_match = re.search(r'(\d+\.?\d*)\s*/?\s*5\s*(?:stars?|rating)?', snippet, re.I)
    if rating_match:
        rating = float(rating_match.group(1))
    
    return {
        "id": extension_id,
        "name": title.replace(" - Chrome Web Store", "").strip(),
        "url": url,
        "description": snippet,
        "users": users,
        "rating": rating,
        "marketplace": "chrome",
    }


def is_valid_chrome_url(url: str) -> bool:
    return bool(re.search(r'chromewebstore\.google\.com/detail/', url))


def detect_manifest_v2(snippet: str) -> bool:
    indicators = [
        "manifest v2",
        "mv2",
        "deprecated",
        "will stop working",
        "update required",
    ]
    snippet_lower = snippet.lower()
    return any(ind in snippet_lower for ind in indicators)
