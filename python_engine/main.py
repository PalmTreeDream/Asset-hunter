import os
import time
import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from python_engine.models import (
    Marketplace,
    Asset,
    ScanRequest,
    ScanResponse,
    VerifyRequest,
    VerifyResponse,
    DistressSignal,
)
from python_engine.services.serpapi_client import SerpAPIClient
from python_engine.services.gemini_verifier import GeminiVerifier

app = FastAPI(
    title="Asset Hunter Revenue Engine",
    description="Python microservice for marketplace scanning and asset verification",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

serpapi_client: Optional[SerpAPIClient] = None
gemini_verifier: Optional[GeminiVerifier] = None


@app.on_event("startup")
async def startup():
    global serpapi_client, gemini_verifier
    
    try:
        serpapi_client = SerpAPIClient()
        print("[Engine] SerpAPI client initialized")
    except ValueError as e:
        print(f"[Engine] Warning: SerpAPI not available - {e}")
    
    try:
        gemini_verifier = GeminiVerifier()
        print("[Engine] Gemini verifier initialized")
    except ValueError as e:
        print(f"[Engine] Warning: Gemini not available - {e}")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "serpapi_available": serpapi_client is not None,
        "gemini_available": gemini_verifier is not None,
    }


@app.post("/scan", response_model=ScanResponse)
async def scan_marketplaces(request: ScanRequest):
    if not serpapi_client:
        raise HTTPException(status_code=503, detail="SerpAPI client not configured")
    
    start_time = time.time()
    
    marketplaces_to_scan = request.marketplaces or list(Marketplace)
    
    raw_results = serpapi_client.search_all_marketplaces(
        query=request.query,
        marketplaces=marketplaces_to_scan,
        max_results_per_marketplace=request.max_results_per_marketplace,
    )
    
    assets: List[Asset] = []
    
    for raw_result in raw_results:
        if gemini_verifier:
            try:
                verification = await gemini_verifier.verify_asset(raw_result)
                asset = gemini_verifier.enrich_asset(raw_result, verification)
                
                if asset.users >= request.min_users:
                    assets.append(asset)
            except Exception as e:
                print(f"[Engine] Verification failed for {raw_result.get('title')}: {e}")
                import hashlib
                marketplace = Marketplace(raw_result.get("marketplace", "chrome"))
                asset_id = hashlib.md5(raw_result.get("url", "").encode()).hexdigest()[:12]
                assets.append(Asset(
                    id=asset_id,
                    name=raw_result.get("title", "Unknown"),
                    description=raw_result.get("snippet", ""),
                    url=raw_result.get("url", ""),
                    marketplace=marketplace,
                    users=5000,
                    estimated_mrr=gemini_verifier.estimate_mrr(marketplace, 5000),
                ))
        else:
            import hashlib
            marketplace = Marketplace(raw_result.get("marketplace", "chrome"))
            asset_id = hashlib.md5(raw_result.get("url", "").encode()).hexdigest()[:12]
            assets.append(Asset(
                id=asset_id,
                name=raw_result.get("title", "Unknown"),
                description=raw_result.get("snippet", ""),
                url=raw_result.get("url", ""),
                marketplace=marketplace,
                users=5000,
            ))
    
    scan_duration_ms = int((time.time() - start_time) * 1000)
    
    return ScanResponse(
        assets=assets,
        total_found=len(assets),
        marketplaces_scanned=len(marketplaces_to_scan),
        scan_duration_ms=scan_duration_ms,
    )


@app.post("/verify", response_model=VerifyResponse)
async def verify_asset(request: VerifyRequest):
    if not gemini_verifier:
        raise HTTPException(status_code=503, detail="Gemini verifier not configured")
    
    raw_data = {
        "title": "Asset to verify",
        "url": request.asset_url,
        "snippet": "",
        "marketplace": request.marketplace.value,
    }
    
    verification = await gemini_verifier.verify_asset(raw_data)
    
    distress_signals = []
    for signal_name in verification.get("distress_signals", []):
        try:
            distress_signals.append(DistressSignal(signal_name))
        except ValueError:
            pass
    
    distress_score = gemini_verifier.calculate_distress_score(distress_signals)
    users = verification.get("estimated_users", 5000)
    rating = verification.get("estimated_rating", 4.0)
    mrr = gemini_verifier.estimate_mrr(request.marketplace, users, rating)
    valuation = gemini_verifier.calculate_valuation(mrr, distress_score)
    
    return VerifyResponse(
        asset_id=request.asset_id,
        verified=verification.get("is_valid_asset", False),
        distress_score=distress_score,
        distress_signals=distress_signals,
        estimated_mrr=mrr,
        estimated_valuation=valuation,
        owner_contact=None,
        verification_notes=verification.get("verification_notes", ""),
    )


@app.get("/marketplaces")
async def list_marketplaces():
    return {
        "marketplaces": [m.value for m in Marketplace],
        "total": len(Marketplace),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
