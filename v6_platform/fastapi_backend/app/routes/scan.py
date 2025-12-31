import os
import requests
from fastapi import APIRouter
from app.schemas import ScanRequest, ScanResult, Asset
from typing import List

router = APIRouter()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

@router.post("/", response_model=ScanResult)
async def trigger_scan(request: ScanRequest):
    if not SERPAPI_KEY:
        print("CRITICAL: SERPAPI_KEY is missing.")
        return ScanResult(assets=[], total_found=0)

    found_assets = []
    
    # Determine scan type
    scan_type = getattr(request, 'scan_type', 'chrome')
    
    if scan_type == "chrome" or scan_type == "all":
        chrome_assets = await scan_chrome_web_store(request.target_url)
        found_assets.extend(chrome_assets)
    
    if scan_type == "shopify" or scan_type == "all":
        shopify_assets = await scan_shopify_app_store(request.target_url)
        found_assets.extend(shopify_assets)
    
    return ScanResult(assets=found_assets, total_found=len(found_assets))


async def scan_chrome_web_store(niche: str) -> List[Asset]:
    """Scan Chrome Web Store for distressed extensions with users but no recent updates."""
    print(f"Scanning Chrome Web Store for niche: {niche}")
    
    params = {
        "engine": "google",
        "q": f'site:chromewebstore.google.com/detail "{niche}" "users" -"updated 2025"',
        "api_key": SERPAPI_KEY,
        "num": 10
    }

    try:
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        results = data.get("organic_results", [])
        
        found_assets = []
        for item in results:
            snippet = item.get("snippet", "")
            title = item.get("title", "").replace(" - Chrome Web Store", "")
            link = item.get("link", "")
            
            # Extract user count from snippet
            user_count = extract_user_count(snippet)
            
            # Filter: Must have >1000 users (leverage threshold)
            if user_count >= 1000:
                found_assets.append(Asset(
                    id=link,
                    name=title,
                    type="chrome_extension",
                    url=link,
                    description=f"{snippet[:150]}...",
                    revenue=f"{user_count:,} users",
                    details="DISTRESS SIGNAL: No updates in 2025. Manifest V2 risk.",
                    status="distressed",
                    user_count=user_count
                ))
        
        return found_assets

    except Exception as e:
        print(f"Chrome Scan Error: {e}")
        return []


async def scan_shopify_app_store(niche: str) -> List[Asset]:
    """Scan Shopify App Store for distressed apps."""
    print(f"Scanning Shopify App Store for niche: {niche}")
    
    params = {
        "engine": "google",
        "q": f'site:apps.shopify.com "{niche}" "reviews" -"updated 2025" -"new"',
        "api_key": SERPAPI_KEY,
        "num": 10
    }

    try:
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        results = data.get("organic_results", [])
        
        found_assets = []
        for item in results:
            snippet = item.get("snippet", "")
            title = item.get("title", "").replace(" - Shopify App Store", "").replace(" | Shopify App Store", "")
            link = item.get("link", "")
            
            # Extract review count as proxy for users
            review_count = extract_review_count(snippet)
            estimated_users = review_count * 50  # ~2% review rate
            
            if estimated_users >= 1000:
                found_assets.append(Asset(
                    id=link,
                    name=title,
                    type="shopify_app",
                    url=link,
                    description=f"{snippet[:150]}...",
                    revenue=f"~{estimated_users:,} estimated installs ({review_count} reviews)",
                    details="DISTRESS SIGNAL: Potential abandoned app. Acquisition target.",
                    status="distressed",
                    user_count=estimated_users
                ))
        
        return found_assets

    except Exception as e:
        print(f"Shopify Scan Error: {e}")
        return []


def extract_user_count(text: str) -> int:
    """Extract user count from text like '50,000 users' or '10K users'."""
    import re
    
    # Match patterns like "50,000 users", "10K users", "1M users"
    patterns = [
        r'([\d,]+)\s*users',
        r'([\d.]+)[Kk]\s*users',
        r'([\d.]+)[Mm]\s*users',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            num_str = match.group(1).replace(',', '')
            if 'k' in pattern.lower():
                return int(float(num_str) * 1000)
            elif 'm' in pattern.lower():
                return int(float(num_str) * 1000000)
            else:
                return int(num_str)
    
    return 0


def extract_review_count(text: str) -> int:
    """Extract review count from text."""
    import re
    
    patterns = [
        r'([\d,]+)\s*reviews?',
        r'([\d.]+)\s*star.*?([\d,]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            num_str = match.group(1).replace(',', '')
            return int(num_str)
    
    return 20  # Default assumption
