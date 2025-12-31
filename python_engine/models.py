from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Marketplace(str, Enum):
    CHROME = "chrome"
    FIREFOX = "firefox"
    SHOPIFY = "shopify"
    WORDPRESS = "wordpress"
    SLACK = "slack"
    ZAPIER = "zapier"
    NOTION = "notion"
    FIGMA = "figma"
    ATLASSIAN = "atlassian"
    SALESFORCE = "salesforce"
    HUBSPOT = "hubspot"
    IOS = "ios"
    ANDROID = "android"
    VSCODE = "vscode"


class DistressSignal(str, Enum):
    NO_UPDATES = "no_updates"
    BROKEN_SUPPORT = "broken_support"
    MANIFEST_V2 = "manifest_v2"
    DECLINING_REVIEWS = "declining_reviews"
    OWNER_INACTIVE = "owner_inactive"


class Asset(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    url: str
    marketplace: Marketplace
    users: int = 0
    rating: Optional[float] = None
    reviews_count: int = 0
    last_updated: Optional[str] = None
    developer: Optional[str] = None
    developer_email: Optional[str] = None
    estimated_mrr: Optional[float] = None
    estimated_valuation: Optional[float] = None
    distress_signals: List[DistressSignal] = Field(default_factory=list)
    distress_score: int = 0
    verified: bool = False
    verification_notes: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)


class ScanRequest(BaseModel):
    query: str = ""
    marketplaces: List[Marketplace] = Field(default_factory=lambda: list(Marketplace))
    min_users: int = 1000
    max_results_per_marketplace: int = 20


class ScanResponse(BaseModel):
    assets: List[Asset]
    total_found: int
    marketplaces_scanned: int
    scan_duration_ms: int
    cached: bool = False


class VerifyRequest(BaseModel):
    asset_id: str
    asset_url: str
    marketplace: Marketplace


class VerifyResponse(BaseModel):
    asset_id: str
    verified: bool
    distress_score: int
    distress_signals: List[DistressSignal]
    estimated_mrr: Optional[float]
    estimated_valuation: Optional[float]
    owner_contact: Optional[str]
    verification_notes: str
