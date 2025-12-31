import os
import requests
from typing import List, Dict, Any, Optional
from ..models import Marketplace, Asset
import hashlib
from datetime import datetime, timedelta


SERPAPI_BASE_URL = "https://serpapi.com/search.json"

MARKETPLACE_SEARCH_CONFIG = {
    Marketplace.CHROME: {
        "site": "chromewebstore.google.com",
        "url_pattern": r"chromewebstore\.google\.com/detail/",
        "engine": "google",
    },
    Marketplace.FIREFOX: {
        "site": "addons.mozilla.org",
        "url_pattern": r"addons\.mozilla\.org/.*/addon/",
        "engine": "google",
    },
    Marketplace.SHOPIFY: {
        "site": "apps.shopify.com",
        "url_pattern": r"apps\.shopify\.com/[a-z0-9-]+$",
        "engine": "google",
    },
    Marketplace.WORDPRESS: {
        "site": "wordpress.org/plugins",
        "url_pattern": r"wordpress\.org/plugins/[a-z0-9-]+",
        "engine": "google",
    },
    Marketplace.SLACK: {
        "site": "slack.com/apps",
        "url_pattern": r"slack\.com/apps/[A-Z0-9]+",
        "engine": "google",
    },
    Marketplace.ZAPIER: {
        "site": "zapier.com/apps",
        "url_pattern": r"zapier\.com/apps/[a-z0-9-]+",
        "engine": "google",
    },
    Marketplace.NOTION: {
        "site": "notion.so/integrations",
        "url_pattern": r"notion\.so/integrations/",
        "engine": "google",
    },
    Marketplace.FIGMA: {
        "site": "figma.com/community",
        "url_pattern": r"figma\.com/community/",
        "engine": "google",
    },
    Marketplace.ATLASSIAN: {
        "site": "marketplace.atlassian.com",
        "url_pattern": r"marketplace\.atlassian\.com/apps/",
        "engine": "google",
    },
    Marketplace.SALESFORCE: {
        "site": "appexchange.salesforce.com",
        "url_pattern": r"appexchange\.salesforce\.com/",
        "engine": "google",
    },
    Marketplace.HUBSPOT: {
        "site": "ecosystem.hubspot.com/marketplace",
        "url_pattern": r"ecosystem\.hubspot\.com/marketplace/",
        "engine": "google",
    },
    Marketplace.VSCODE: {
        "site": "marketplace.visualstudio.com",
        "url_pattern": r"marketplace\.visualstudio\.com/items",
        "engine": "google",
    },
    Marketplace.IOS: {
        "site": "apps.apple.com",
        "url_pattern": r"apps\.apple\.com/.*/app/",
        "engine": "google",
    },
    Marketplace.ANDROID: {
        "site": "play.google.com/store/apps",
        "url_pattern": r"play\.google\.com/store/apps/details",
        "engine": "google",
    },
}

_cache: Dict[str, tuple] = {}
CACHE_TTL_HOURS = 6


def _get_cache_key(query: str, marketplace: str) -> str:
    return hashlib.md5(f"{query}:{marketplace}".encode()).hexdigest()


def _is_cache_valid(cached_time: datetime) -> bool:
    return datetime.utcnow() - cached_time < timedelta(hours=CACHE_TTL_HOURS)


class SerpAPIClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SERPAPI_KEY")
        if not self.api_key:
            raise ValueError("SERPAPI_KEY environment variable is required")
    
    def search_marketplace(
        self, 
        query: str, 
        marketplace: Marketplace, 
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        cache_key = _get_cache_key(query, marketplace.value)
        
        if cache_key in _cache:
            cached_results, cached_time = _cache[cache_key]
            if _is_cache_valid(cached_time):
                print(f"[SerpAPI] Cache HIT: {marketplace.value} - {query}")
                return cached_results
        
        config = MARKETPLACE_SEARCH_CONFIG.get(marketplace)
        if not config:
            print(f"[SerpAPI] No config for marketplace: {marketplace}")
            return []
        
        search_query = f"site:{config['site']} {query}" if query else f"site:{config['site']}"
        
        if marketplace == Marketplace.CHROME:
            search_query += " extension OR addon"
        elif marketplace == Marketplace.SHOPIFY:
            search_query += " app"
        
        try:
            response = requests.get(
                SERPAPI_BASE_URL,
                params={
                    "q": search_query,
                    "api_key": self.api_key,
                    "engine": config["engine"],
                    "num": max_results,
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            results = data.get("organic_results", [])
            
            import re
            pattern = config["url_pattern"]
            filtered_results = [
                r for r in results 
                if re.search(pattern, r.get("link", ""))
            ]
            
            parsed_results = []
            for r in filtered_results:
                parsed_results.append({
                    "title": r.get("title", "Unknown"),
                    "url": r.get("link", ""),
                    "snippet": r.get("snippet", ""),
                    "marketplace": marketplace.value,
                })
            
            _cache[cache_key] = (parsed_results, datetime.utcnow())
            print(f"[SerpAPI] Found {len(parsed_results)} results for {marketplace.value}")
            
            return parsed_results
            
        except requests.RequestException as e:
            print(f"[SerpAPI] Error searching {marketplace.value}: {e}")
            return []
    
    def search_all_marketplaces(
        self, 
        query: str, 
        marketplaces: List[Marketplace],
        max_results_per_marketplace: int = 20
    ) -> List[Dict[str, Any]]:
        all_results = []
        
        for marketplace in marketplaces:
            results = self.search_marketplace(query, marketplace, max_results_per_marketplace)
            all_results.extend(results)
        
        return all_results
