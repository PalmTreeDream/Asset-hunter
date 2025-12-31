from pydantic import BaseModel
from typing import List, Optional

class ScanRequest(BaseModel):
    target_url: str
    scan_type: str = "all"  # "chrome", "shopify", or "all"

class Asset(BaseModel):
    id: str
    name: str
    type: str  # "chrome_extension" or "shopify_app"
    url: str
    description: str
    revenue: str
    details: str
    status: str
    user_count: int = 0

class ScanResult(BaseModel):
    assets: List[Asset]
    total_found: int

class AnalyzeRequest(BaseModel):
    asset_name: str
    users: int
    url: Optional[str] = None
    asset_type: str = "chrome_extension"

class AnalyzeResult(BaseModel):
    valuation: str
    potential_mrr: str
    the_play: str
    cold_email: str
    manifest_v2_risk: str
    owner_contact: Optional[str] = None
    negotiation_script: Optional[str] = None
