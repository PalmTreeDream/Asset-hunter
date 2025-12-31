import os
import json
from google import genai
from fastapi import APIRouter
from app.schemas import AnalyzeRequest, AnalyzeResult

router = APIRouter()

# Use Replit AI Integrations (no personal API key needed)
GEMINI_API_KEY = os.getenv("AI_INTEGRATIONS_GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_BASE_URL = os.getenv("AI_INTEGRATIONS_GEMINI_BASE_URL")

@router.post("/", response_model=AnalyzeResult)
async def analyze_asset(request: AnalyzeRequest):
    if not GEMINI_API_KEY:
        print("CRITICAL: No Gemini API key available.")
        return AnalyzeResult(
            valuation="Error: API Key Missing",
            potential_mrr="$0",
            the_play="Configure GOOGLE_API_KEY or use Replit AI Integrations",
            cold_email="",
            manifest_v2_risk="Unknown"
        )

    # Configure client - use Replit AI Integrations if available
    if GEMINI_BASE_URL:
        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={"api_version": "", "base_url": GEMINI_BASE_URL}
        )
        model_name = "gemini-2.5-flash"
    else:
        client = genai.Client(api_key=GEMINI_API_KEY)
        model_name = "gemini-2.0-flash"

    # Calculate MRR using the formula: Users * 2% conversion * $5/mo
    users = request.users
    conversion_rate = 0.02
    price_per_month = 5
    calculated_mrr = users * conversion_rate * price_per_month
    annual_revenue = calculated_mrr * 12
    valuation_low = annual_revenue * 3
    valuation_high = annual_revenue * 5

    asset_type_context = ""
    if request.asset_type == "chrome_extension":
        asset_type_context = "This is a Chrome Extension. Note: Google is deprecating Manifest V2 in 2025, forcing all extensions to migrate to Manifest V3 or die."
    elif request.asset_type == "shopify_app":
        asset_type_context = "This is a Shopify App. Focus on merchant retention and recurring revenue potential."

    system_prompt = f"""You are a ruthless Distressed Asset Fund Manager specializing in digital micro-acquisitions.

INPUT:
- Asset Name: {request.asset_name}
- Users: {users:,}
- URL: {request.url or "N/A"}
- Asset Type: {request.asset_type}
{asset_type_context}

PRE-CALCULATED METRICS (use these exact numbers):
- Potential MRR: ${calculated_mrr:,.0f}/month (Formula: {users:,} users x 2% conversion x $5/mo)
- Annual Revenue Potential: ${annual_revenue:,.0f}
- Valuation Range: ${valuation_low:,.0f} - ${valuation_high:,.0f} (3-5x annual revenue)

YOUR TASK:
1. Assess the "Manifest V2 Risk" (for Chrome) or "Platform Risk" (for Shopify) - rate as High/Medium/Low with specific reasoning.
2. Write "The Play" - your acquisition and monetization strategy. Be specific about:
   - How to approach the owner
   - What to offer
   - How to monetize post-acquisition
3. Write a "Pattern Interrupt" cold email that gets the developer's attention. Make it short, direct, and intriguing.
4. Generate a fake but realistic "Owner Contact" (for demo purposes).
5. Write a "Negotiation Script" for the first call.

Return ONLY valid JSON with these exact keys:
{{
  "valuation": "${valuation_low:,.0f} - ${valuation_high:,.0f}",
  "potential_mrr": "${calculated_mrr:,.0f}/month",
  "the_play": "string describing full acquisition strategy",
  "cold_email": "string with the full cold email",
  "manifest_v2_risk": "High/Medium/Low with specific reasoning",
  "owner_contact": "Generated owner name and email for demo",
  "negotiation_script": "Script for first acquisition call"
}}"""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=system_prompt
        )
        text = response.text.strip()
        
        # Clean JSON from markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        
        return AnalyzeResult(
            valuation=data.get("valuation", f"${valuation_low:,.0f} - ${valuation_high:,.0f}"),
            potential_mrr=data.get("potential_mrr", f"${calculated_mrr:,.0f}/month"),
            the_play=data.get("the_play", "Analysis pending"),
            cold_email=data.get("cold_email", ""),
            manifest_v2_risk=data.get("manifest_v2_risk", "Unknown"),
            owner_contact=data.get("owner_contact", "Contact info locked"),
            negotiation_script=data.get("negotiation_script", "Script locked")
        )

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        # Return calculated values even if AI fails
        return AnalyzeResult(
            valuation=f"${valuation_low:,.0f} - ${valuation_high:,.0f}",
            potential_mrr=f"${calculated_mrr:,.0f}/month",
            the_play="AI analysis failed - manual review required",
            cold_email="",
            manifest_v2_risk="Unknown - requires manual assessment",
            owner_contact=None,
            negotiation_script=None
        )
    except Exception as e:
        print(f"ANALYZE ERROR: {e}")
        return AnalyzeResult(
            valuation=f"${valuation_low:,.0f} - ${valuation_high:,.0f}",
            potential_mrr=f"${calculated_mrr:,.0f}/month",
            the_play=str(e),
            cold_email="",
            manifest_v2_risk="Error during analysis",
            owner_contact=None,
            negotiation_script=None
        )
