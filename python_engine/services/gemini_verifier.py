import os
from typing import Optional, List, Dict, Any
from google import genai
from ..models import Asset, Marketplace, DistressSignal


class GeminiVerifier:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("AI_INTEGRATIONS_GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY or AI_INTEGRATIONS_GEMINI_API_KEY environment variable required")
        
        self.client = genai.Client(api_key=self.api_key)
    
    def estimate_mrr(self, marketplace: Marketplace, users: int, rating: float = 4.0) -> float:
        base_rates = {
            Marketplace.CHROME: 0.02,
            Marketplace.FIREFOX: 0.015,
            Marketplace.SHOPIFY: 0.50,
            Marketplace.WORDPRESS: 0.03,
            Marketplace.SLACK: 0.25,
            Marketplace.ZAPIER: 0.20,
            Marketplace.NOTION: 0.15,
            Marketplace.FIGMA: 0.10,
            Marketplace.ATLASSIAN: 0.40,
            Marketplace.SALESFORCE: 0.60,
            Marketplace.HUBSPOT: 0.35,
            Marketplace.VSCODE: 0.01,
            Marketplace.IOS: 0.08,
            Marketplace.ANDROID: 0.05,
        }
        
        base_rate = base_rates.get(marketplace, 0.05)
        rating_multiplier = rating / 4.0 if rating else 1.0
        
        estimated_mrr = users * base_rate * rating_multiplier
        return round(estimated_mrr, 2)
    
    def calculate_valuation(self, mrr: float, distress_score: int) -> float:
        if distress_score >= 8:
            multiple = 24
        elif distress_score >= 6:
            multiple = 30
        elif distress_score >= 4:
            multiple = 36
        else:
            multiple = 42
        
        return round(mrr * multiple, 2)
    
    def calculate_distress_score(self, signals: List[DistressSignal]) -> int:
        signal_weights = {
            DistressSignal.NO_UPDATES: 3,
            DistressSignal.BROKEN_SUPPORT: 2,
            DistressSignal.MANIFEST_V2: 4,
            DistressSignal.DECLINING_REVIEWS: 2,
            DistressSignal.OWNER_INACTIVE: 3,
        }
        
        total = sum(signal_weights.get(s, 1) for s in signals)
        return min(10, total)
    
    async def verify_asset(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""Analyze this software asset for acquisition potential:

Name: {asset_data.get('title', 'Unknown')}
URL: {asset_data.get('url', '')}
Description: {asset_data.get('snippet', '')}
Marketplace: {asset_data.get('marketplace', 'unknown')}

Provide a brief analysis in JSON format:
{{
    "is_valid_asset": true/false,
    "distress_signals": ["no_updates", "broken_support", "manifest_v2", "declining_reviews", "owner_inactive"],
    "estimated_users": number,
    "estimated_rating": number (1-5),
    "verification_notes": "brief notes about the asset",
    "owner_likely_selling": true/false
}}

Only include distress signals that are likely based on the information provided.
Respond ONLY with valid JSON, no markdown."""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            
            import json
            import re
            
            text = (response.text or "").strip()
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                result = json.loads(json_match.group())
                return result
            
            return {
                "is_valid_asset": True,
                "distress_signals": [],
                "estimated_users": 5000,
                "estimated_rating": 4.0,
                "verification_notes": "Unable to parse AI response",
                "owner_likely_selling": False
            }
            
        except Exception as e:
            print(f"[Gemini] Verification error: {e}")
            return {
                "is_valid_asset": True,
                "distress_signals": [],
                "estimated_users": 5000,
                "estimated_rating": 4.0,
                "verification_notes": f"Verification failed: {str(e)}",
                "owner_likely_selling": False
            }
    
    def enrich_asset(self, raw_result: Dict[str, Any], verification: Dict[str, Any]) -> Asset:
        marketplace = Marketplace(raw_result.get("marketplace", "chrome"))
        users = verification.get("estimated_users", 5000)
        rating = verification.get("estimated_rating", 4.0)
        
        distress_signals = []
        for signal_name in verification.get("distress_signals", []):
            try:
                distress_signals.append(DistressSignal(signal_name))
            except ValueError:
                pass
        
        distress_score = self.calculate_distress_score(distress_signals)
        mrr = self.estimate_mrr(marketplace, users, rating)
        valuation = self.calculate_valuation(mrr, distress_score)
        
        import hashlib
        asset_id = hashlib.md5(raw_result.get("url", "").encode()).hexdigest()[:12]
        
        return Asset(
            id=asset_id,
            name=raw_result.get("title", "Unknown Asset"),
            description=raw_result.get("snippet", ""),
            url=raw_result.get("url", ""),
            marketplace=marketplace,
            users=users,
            rating=rating,
            estimated_mrr=mrr,
            estimated_valuation=valuation,
            distress_signals=distress_signals,
            distress_score=distress_score,
            verified=verification.get("is_valid_asset", False),
            verification_notes=verification.get("verification_notes", "")
        )
