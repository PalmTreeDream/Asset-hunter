from typing import List, Dict, Any, Optional
import re


def extract_shopify_app_data(serp_result: Dict[str, Any]) -> Dict[str, Any]:
    url = serp_result.get("link", "")
    title = serp_result.get("title", "")
    snippet = serp_result.get("snippet", "")
    
    app_slug = None
    slug_match = re.search(r'apps\.shopify\.com/([a-z0-9-]+)', url)
    if slug_match:
        app_slug = slug_match.group(1)
    
    reviews = 0
    reviews_match = re.search(r'([\d,]+)\s*reviews?', snippet, re.I)
    if reviews_match:
        reviews = int(reviews_match.group(1).replace(",", ""))
    
    rating = None
    rating_match = re.search(r'(\d+\.?\d*)\s*(?:out of 5|/5|stars?)', snippet, re.I)
    if rating_match:
        rating = float(rating_match.group(1))
    
    installs = reviews * 10 if reviews else 1000
    
    price = None
    price_match = re.search(r'\$(\d+(?:\.\d{2})?)\s*/?\s*month', snippet, re.I)
    if price_match:
        price = float(price_match.group(1))
    
    return {
        "id": app_slug,
        "name": title.replace(" - Shopify App Store", "").strip(),
        "url": url,
        "description": snippet,
        "users": installs,
        "rating": rating,
        "reviews": reviews,
        "price_per_month": price,
        "marketplace": "shopify",
    }


def is_valid_shopify_url(url: str) -> bool:
    if not re.search(r'apps\.shopify\.com/[a-z0-9-]+$', url):
        return False
    
    invalid_patterns = [
        r'/collections/',
        r'/categories/',
        r'/blog',
        r'/partners',
    ]
    
    return not any(re.search(p, url) for p in invalid_patterns)


def estimate_shopify_mrr(installs: int, price: Optional[float] = None, rating: float = 4.0) -> float:
    if price:
        conversion_rate = 0.05
        mrr = installs * price * conversion_rate
    else:
        mrr = installs * 0.50
    
    rating_factor = rating / 4.0 if rating else 1.0
    return round(mrr * rating_factor, 2)
