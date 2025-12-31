import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { HunterRadar, HunterRadarScores } from "@/components/HunterRadar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Lock, 
  ArrowLeft, 
  AlertTriangle, 
  ExternalLink,
  Mail,
  TrendingUp,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Loader2,
  X
} from "lucide-react";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox } from "react-icons/si";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

// Get the appropriate icon for a platform
function getPlatformIcon(platform: string): typeof SiGooglechrome {
  const iconMap: Record<string, typeof SiGooglechrome> = {
    "Chrome Extension": SiGooglechrome,
    "Firefox Extension": SiFirefox,
    "Shopify App": SiShopify,
    "WordPress Plugin": SiWordpress,
    "Slack App": SiSlack,
  };
  return iconMap[platform] || (Globe as unknown as typeof SiGooglechrome);
}

// Generate masked name for non-premium users
function getMaskedName(asset: { platform: string; id: string; category: string }): string {
  const platformPrefixes: Record<string, string> = {
    "Chrome Extension": "Browser Extension",
    "Firefox Extension": "Browser Extension",
    "Shopify App": "E-commerce App",
    "WordPress Plugin": "CMS Plugin",
    "Slack App": "Team Integration",
    "Marketplace": "Marketplace Platform",
    "SaaS": "SaaS Platform",
  };
  
  const prefix = platformPrefixes[asset.platform] || asset.category;
  const numericId = asset.id.replace(/\D/g, '').slice(-4);
  return `${prefix} #${numericId}`;
}

// Generate masked description for non-premium users
function getMaskedDescription(category: string): string {
  const descriptions: Record<string, string> = {
    "Browser Extension": "Productivity tool with established user base showing signs of reduced maintenance",
    "E-commerce": "Commerce solution with active merchant installs and recurring revenue potential", 
    "SaaS": "Software platform with verified revenue and growth metrics",
    "Mobile App": "Mobile application with engaged user community",
    "Marketplace": "Marketplace platform connecting buyers and sellers",
  };
  return descriptions[category] || "Software asset with established distribution and monetization opportunity";
}

// Blocklist of known successful companies that should never appear as "distressed"
const KNOWN_SUCCESSFUL_COMPANIES = [
  "cursor", "notion", "figma", "slack", "discord", "zoom", "stripe", "shopify",
  "grammarly", "canva", "airtable", "asana", "trello", "dropbox", "evernote",
  "mailchimp", "hubspot", "intercom", "zendesk", "salesforce", "twilio",
  "lastpass", "1password", "bitwarden", "todoist", "linear", "superhuman"
];

// Parse currency string with K/M suffixes to numeric value
function parseCurrencyValue(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '').toUpperCase();
  const match = cleaned.match(/^([\d.]+)(K|M)?/);
  if (!match) return 0;
  
  let num = parseFloat(match[1]);
  if (match[2] === 'K') num *= 1000;
  if (match[2] === 'M') num *= 1000000;
  
  return Math.round(num);
}

// Validate if an asset's metrics are realistic given its user count
function validateAssetMetrics(asset: { 
  name: string; 
  usersNum: number; 
  mrr: string; 
  platform: string;
}): boolean {
  // Check blocklist
  const nameLower = asset.name.toLowerCase();
  if (KNOWN_SUCCESSFUL_COMPANIES.some(company => nameLower.includes(company))) {
    return false;
  }
  
  // Parse MRR value with K/M suffix support
  const mrrValue = parseCurrencyValue(asset.mrr);
  
  // Minimum MRR thresholds based on user count
  // These ensure we don't show something like "500K users with $600 MRR"
  const minMRRByUsers = (users: number): number => {
    if (users >= 100000) return 5000;   // 100K+ users should have at least $5K MRR
    if (users >= 50000) return 2000;    // 50K+ users should have at least $2K MRR
    if (users >= 10000) return 500;     // 10K+ users should have at least $500 MRR
    if (users >= 5000) return 200;      // 5K+ users should have at least $200 MRR
    return 50;                          // Baseline minimum
  };
  
  // Maximum MRR thresholds - prevent unrealistic high MRR for low users
  const maxMRRByUsers = (users: number): number => {
    if (users >= 100000) return 500000;
    if (users >= 50000) return 200000;
    if (users >= 10000) return 100000;
    if (users >= 5000) return 50000;
    return 20000;
  };
  
  const minMRR = minMRRByUsers(asset.usersNum);
  const maxMRR = maxMRRByUsers(asset.usersNum);
  
  // Filter out assets with unrealistic metrics
  if (mrrValue < minMRR || mrrValue > maxMRR) {
    return false;
  }
  
  return true;
}

// Apply filters to get quality assets only
function getQualityAssets(assets: MockAsset[]): MockAsset[] {
  return assets.filter(asset => validateAssetMetrics(asset));
}

interface MockAsset {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  icon?: typeof SiGooglechrome;
  users: string;
  usersNum: number;
  revenue?: string;
  mrr: string;
  churn?: string;
  profit?: string;
  growth?: string;
  scores: HunterRadarScores;
  featured?: boolean;
  tags: string[];
  rating?: number;
  distressSignals?: string[];
  url?: string;
}

function calculateAcquisitionCost(mrrValue: number): string {
  const annualRevenue = mrrValue * 12;
  const acquisitionCost = annualRevenue * 3;
  if (acquisitionCost >= 1000000) {
    return `$${(acquisitionCost / 1000000).toFixed(1)}M`;
  } else if (acquisitionCost >= 1000) {
    return `$${Math.round(acquisitionCost / 1000)}K`;
  }
  return `$${Math.round(acquisitionCost)}`;
}

const MOCK_ASSETS: MockAsset[] = [
  {
    id: "AH-47291",
    name: "ProductivityPro Tab",
    description: "Browser extension helping users manage time and tasks",
    platform: "Chrome Extension",
    category: "Browser Extension",
    icon: SiGooglechrome,
    users: "47,200",
    usersNum: 47200,
    revenue: "$57K ARR",
    mrr: "$4,720",
    churn: "2.4%",
    profit: "$38K",
    growth: "+85%",
    scores: { distress: 8.7, monetizationGap: 9.2, technicalRisk: 3.1, marketPosition: 7.8, flipPotential: 8.5 },
    featured: true,
    tags: ["High Growth", "Productivity"]
  },
  {
    id: "AH-38472",
    name: "QuickShip Tracker",
    description: "Shopify app for real-time shipping updates and customer notifications",
    platform: "Shopify App",
    category: "E-commerce",
    icon: SiShopify,
    users: "12,400",
    usersNum: 12400,
    revenue: "$35K ARR",
    mrr: "$2,890",
    churn: "3.1%",
    profit: "$18K",
    growth: "+42%",
    scores: { distress: 7.9, monetizationGap: 8.1, technicalRisk: 4.2, marketPosition: 6.5, flipPotential: 7.8 },
    featured: false,
    tags: ["E-commerce", "Shipping"]
  },
  {
    id: "AH-29183",
    name: "SEO Analyzer Plus",
    description: "Enterprise analytics solution serving Fortune 500 companies",
    platform: "WordPress Plugin",
    category: "SaaS",
    icon: SiWordpress,
    users: "89,000",
    usersNum: 89000,
    revenue: "$74K ARR",
    mrr: "$6,200",
    churn: "1.8%",
    profit: "$52K",
    growth: "+120%",
    scores: { distress: 9.1, monetizationGap: 7.8, technicalRisk: 5.1, marketPosition: 8.2, flipPotential: 9.0 },
    featured: true,
    tags: ["Enterprise", "B2B", "High-Ticket"]
  },
  {
    id: "AH-51029",
    name: "TeamSync Bot",
    description: "Slack integration for team coordination and meeting management",
    platform: "Slack App",
    category: "Mobile App",
    icon: SiSlack,
    users: "8,900",
    usersNum: 8900,
    revenue: "$21K ARR",
    mrr: "$1,780",
    churn: "4.2%",
    profit: "$11K",
    growth: "+35%",
    scores: { distress: 6.8, monetizationGap: 7.2, technicalRisk: 3.8, marketPosition: 5.9, flipPotential: 7.1 },
    featured: false,
    tags: ["Mobile", "Productivity"]
  },
  {
    id: "AH-62841",
    name: "AdBlock Shield Pro",
    description: "Privacy-focused browser extension with premium tier",
    platform: "Firefox Extension",
    category: "Browser Extension",
    icon: SiFirefox,
    users: "156,000",
    usersNum: 156000,
    revenue: "$101K ARR",
    mrr: "$8,400",
    churn: "2.1%",
    profit: "$72K",
    growth: "+95%",
    scores: { distress: 9.4, monetizationGap: 8.9, technicalRisk: 6.2, marketPosition: 7.1, flipPotential: 8.8 },
    featured: true,
    tags: ["High Growth", "Privacy"]
  },
  {
    id: "AH-73920",
    name: "InventorySync Pro",
    description: "Multi-channel inventory management for Shopify merchants",
    platform: "Shopify App",
    category: "E-commerce",
    icon: SiShopify,
    users: "5,600",
    usersNum: 5600,
    revenue: "$47K ARR",
    mrr: "$3,920",
    churn: "2.8%",
    profit: "$28K",
    growth: "+65%",
    scores: { distress: 8.2, monetizationGap: 8.5, technicalRisk: 4.0, marketPosition: 7.0, flipPotential: 8.1 },
    featured: false,
    tags: ["E-commerce", "Inventory"]
  },
  {
    id: "AH-84012",
    name: "FormBuilder Express",
    description: "Drag-and-drop form builder with advanced analytics",
    platform: "WordPress Plugin",
    category: "SaaS",
    icon: SiWordpress,
    users: "34,500",
    usersNum: 34500,
    revenue: "$61K ARR",
    mrr: "$5,100",
    churn: "3.2%",
    profit: "$35K",
    growth: "+78%",
    scores: { distress: 8.5, monetizationGap: 7.6, technicalRisk: 4.8, marketPosition: 6.8, flipPotential: 8.3 },
    featured: false,
    tags: ["Forms", "Analytics"]
  },
  {
    id: "AH-95103",
    name: "TabMaster Pro",
    description: "Tab management and session saving for power users",
    platform: "Chrome Extension",
    category: "Browser Extension",
    icon: SiGooglechrome,
    users: "78,300",
    usersNum: 78300,
    revenue: "$86K ARR",
    mrr: "$7,200",
    churn: "1.9%",
    profit: "$58K",
    growth: "+110%",
    scores: { distress: 8.9, monetizationGap: 9.0, technicalRisk: 5.5, marketPosition: 7.5, flipPotential: 8.7 },
    featured: true,
    tags: ["High Growth", "Productivity"]
  },
  {
    id: "AH-10294",
    name: "Design Assets Marketplace",
    description: "Marketplace for buying and selling design resources",
    platform: "Marketplace",
    category: "Marketplace",
    icon: SiGooglechrome,
    users: "18,000",
    usersNum: 18000,
    revenue: "$272K ARR",
    mrr: "$57K",
    churn: "3.4%",
    profit: "$290K",
    growth: "+90%",
    scores: { distress: 7.5, monetizationGap: 8.8, technicalRisk: 4.5, marketPosition: 8.5, flipPotential: 9.2 },
    featured: true,
    tags: ["Design", "Marketplace"]
  },
  {
    id: "AH-20385",
    name: "Content Creation Platform",
    description: "All-in-one platform for content creators to manage and monetize their audience",
    platform: "SaaS",
    category: "SaaS",
    icon: SiWordpress,
    users: "5,200",
    usersNum: 5200,
    revenue: "$192K ARR",
    mrr: "$40K",
    churn: "3.2%",
    profit: "$220K",
    growth: "+140%",
    scores: { distress: 6.9, monetizationGap: 9.1, technicalRisk: 3.8, marketPosition: 8.0, flipPotential: 8.9 },
    featured: false,
    tags: ["Creator Economy", "High Growth"]
  }
];

const CATEGORIES = ["All Categories", "SaaS", "E-commerce", "Mobile App", "EdTech", "Marketplace", "Browser Extension"];

const PRICING_TIERS = [
  {
    name: "Scout",
    price: "$49",
    period: "/month",
    soldOut: true,
    cohort: "NEXT COHORT FEB 2026",
    features: [
      "5 asset unlocks/month",
      "Basic distress metrics",
      "Email alerts"
    ]
  },
  {
    name: "Hunter",
    price: "$99",
    period: "/month",
    soldOut: true,
    cohort: "NEXT COHORT FEB 2026",
    features: [
      "25 asset unlocks/month",
      "Hunter Intelligence reports",
      "Contact owner tools",
      "Priority support"
    ]
  },
  {
    name: "Founding Member",
    price: "$149",
    period: "Lifetime",
    soldOut: false,
    featured: true,
    spotsRemaining: 7,
    features: [
      "Unlimited asset unlocks",
      "Full Hunter Intelligence",
      "Direct owner contact",
      "Acquisition playbooks",
      "Private deal flow",
      "Lifetime updates"
    ]
  }
];

function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showOtherTiers, setShowOtherTiers] = useState(false);

  const handleFoundingMemberCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/founding-member-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsCheckingOut(false);
    }
  };

  const foundingMember = PRICING_TIERS.find(t => t.featured);
  const otherTiers = PRICING_TIERS.filter(t => !t.featured);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white" data-testid="paywall-modal">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-center">Unlock Full Intelligence</DialogTitle>
          <DialogDescription className="text-center text-slate-400 text-sm">
            Get contact info and acquisition playbooks
          </DialogDescription>
        </DialogHeader>
        
        {foundingMember && (
          <div className="relative rounded-xl p-4 bg-slate-800 ring-2 ring-accent">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent/20 text-accent border-accent/30 text-xs">
              Best Value
            </Badge>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="font-semibold text-white" data-testid="text-tier-name-founding-member">Founding Member</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white" data-testid="text-tier-price-founding-member">$149</span>
                  <span className="text-slate-400 text-xs">lifetime</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-indigo-400 text-xs font-medium">
                  <Sparkles className="w-3 h-3 fill-indigo-400" />
                  <span>{foundingMember.spotsRemaining} spots left</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs text-slate-300">
              {foundingMember.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-accent shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4 rounded-full bg-foreground text-background"
              disabled={isCheckingOut}
              onClick={handleFoundingMemberCheckout}
              data-testid="button-tier-founding-member"
            >
              {isCheckingOut ? 'Redirecting...' : 'Secure Lifetime Access'}
            </Button>
          </div>
        )}
        
        <p className="text-center text-xs text-slate-500">
          One-time payment. No recurring fees.
        </p>
        
        <button 
          onClick={() => setShowOtherTiers(!showOtherTiers)}
          className="text-xs text-slate-500 hover:text-slate-400 text-center flex items-center justify-center gap-1 mx-auto"
          data-testid="button-show-other-tiers"
        >
          {showOtherTiers ? 'Hide' : 'View'} other plans (sold out)
          <ChevronDown className={`w-3 h-3 transition-transform ${showOtherTiers ? 'rotate-180' : ''}`} />
        </button>
        
        {showOtherTiers && (
          <div className="space-y-2 pt-2">
            {otherTiers.map((tier) => (
              <div 
                key={tier.name}
                className="rounded-lg p-3 bg-slate-900/50 border border-slate-800 opacity-60"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white">{tier.name}</span>
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                      Sold Out
                    </Badge>
                  </div>
                  <span className="text-sm text-slate-400">{tier.price}/mo</span>
                </div>
                <div className="text-xs text-slate-500">
                  {tier.features.slice(0, 2).join(' • ')}
                </div>
                {tier.cohort && (
                  <p className="text-xs text-red-400 mt-1">{tier.cohort}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssetDetailSheet({ 
  asset, 
  open, 
  onClose, 
  onUnlock,
  isPremium = false
}: { 
  asset: MockAsset | null; 
  open: boolean; 
  onClose: () => void;
  onUnlock: () => void;
  isPremium?: boolean;
}) {
  if (!asset) return null;
  
  const Icon = asset.icon || getPlatformIcon(asset.platform);
  const displayName = isPremium ? asset.name : getMaskedName(asset);
  const displayDescription = isPremium ? asset.description : getMaskedDescription(asset.category);
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-950 border-slate-800 text-white overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <SheetTitle className="text-white text-xl" data-testid="text-detail-name">{displayName}</SheetTitle>
              <SheetDescription className="text-slate-400">{asset.platform}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <p className="text-slate-300 text-sm" data-testid="text-detail-description">{displayDescription}</p>
          
          <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Est. Acquisition</div>
              <div className="text-xl font-bold text-white" data-testid="text-detail-price">{calculateAcquisitionCost(parseCurrencyValue(asset.mrr))}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Revenue</div>
              <div className="text-xl font-bold text-white" data-testid="text-detail-revenue">{asset.revenue}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Profit</div>
              <div className="text-lg font-semibold text-white" data-testid="text-detail-profit">{asset.profit}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Growth</div>
              <div className="text-lg font-semibold text-emerald-400" data-testid="text-detail-growth">{asset.growth}</div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4">
            <h4 className="text-sm font-medium text-white mb-4">Hunter Radar</h4>
            <div className="flex justify-center">
              <HunterRadar 
                scores={asset.scores} 
                size="md" 
                showLabels={true}
                showValues={false}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">MRR</div>
              <div className="text-sm font-semibold text-emerald-400" data-testid="text-detail-mrr">{asset.mrr}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Churn</div>
              <div className="text-sm font-semibold text-white" data-testid="text-detail-churn">{asset.churn}</div>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">Users</div>
              <div className="text-sm font-semibold text-white" data-testid="text-detail-users">{asset.users}</div>
            </div>
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                disabled
                data-testid="button-detail-url-locked"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="blur-sm select-none">https://store.example...</span>
                <Lock className="w-3 h-3 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                disabled
                data-testid="button-detail-contact-locked"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span className="blur-sm select-none">owner@example...</span>
                <Lock className="w-3 h-3 ml-2" />
              </Button>
            </div>
            <Button 
              className="w-full rounded-xl bg-accent text-white hover:bg-accent/90"
              onClick={onUnlock}
              data-testid="button-detail-unlock"
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Full Intelligence
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AssetCard({ 
  asset, 
  onUnlock,
  onViewDetails,
  onSave,
  isSaved = false,
  isSaving = false,
  isPremium = false,
  showRealName = false
}: { 
  asset: MockAsset; 
  onUnlock: () => void;
  onViewDetails: () => void;
  onSave: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  isPremium?: boolean;
  showRealName?: boolean;
}) {
  const Icon = asset.icon || getPlatformIcon(asset.platform);
  const displayName = (isPremium || showRealName) ? asset.name : getMaskedName(asset);
  const displayDescription = (isPremium || showRealName) ? asset.description : getMaskedDescription(asset.category);
  
  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors" data-testid={`card-asset-${asset.id}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap gap-y-1">
            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {asset.category}
            </Badge>
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-500">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Distressed
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={isSaved ? "text-accent" : "text-slate-400"}
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            disabled={isSaving}
            data-testid={`button-save-${asset.id}`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate" data-testid={`text-name-${asset.id}`}>{displayName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2" data-testid={`text-desc-${asset.id}`}>{displayDescription}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(asset.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Est. Acquisition</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white" data-testid={`text-price-${asset.id}`}>{calculateAcquisitionCost(parseCurrencyValue(asset.mrr))}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Revenue</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white" data-testid={`text-revenue-${asset.id}`}>{asset.revenue}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Profit</div>
            <div className="text-base font-semibold text-slate-900 dark:text-white" data-testid={`text-profit-${asset.id}`}>{asset.profit}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500">Growth</div>
            <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400" data-testid={`text-growth-${asset.id}`}>{asset.growth}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
          <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-500">MRR</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid={`text-mrr-${asset.id}`}>{asset.mrr}</div>
          </div>
          <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-500">Churn</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white" data-testid={`text-churn-${asset.id}`}>{asset.churn}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-500">Users</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white" data-testid={`text-users-${asset.id}`}>{asset.users}</div>
          </div>
        </div>
        
        <Button 
          className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onViewDetails}
          data-testid={`button-view-details-${asset.id}`}
        >
          View Details
          <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
        </Button>
      </div>
    </Card>
  );
}

const ITEMS_PER_PAGE = 12;

// Transform API scan result to MockAsset format
function transformApiAsset(apiAsset: any, index: number): MockAsset {
  const userCount = apiAsset.user_count || apiAsset.users || 5000;
  const mrrPotential = apiAsset.mrr_potential || Math.round(userCount * 0.02 * 5);
  const distressScore = (apiAsset.distress_score || 7) / 10;
  
  const platformMap: Record<string, string> = {
    "Chrome Web Store": "Chrome Extension",
    "Firefox Add-ons": "Firefox Extension",
    "Shopify App Store": "Shopify App",
    "WordPress.org": "WordPress Plugin",
    "Slack App Directory": "Slack App",
    "chrome_extension": "Chrome Extension",
    "firefox_addon": "Firefox Extension",
    "shopify_app": "Shopify App",
    "wordpress_plugin": "WordPress Plugin",
    "slack_app": "Slack App",
  };
  
  const categoryMap: Record<string, string> = {
    "Chrome Extension": "Browser Extension",
    "Firefox Extension": "Browser Extension",
    "Shopify App": "E-commerce",
    "WordPress Plugin": "SaaS",
    "Slack App": "SaaS",
  };
  
  const platform = platformMap[apiAsset.marketplace] || platformMap[apiAsset.type] || "SaaS";
  const category = categoryMap[platform] || "SaaS";
  
  const tags = apiAsset.tags || [platform, category].filter(Boolean);
  
  return {
    id: apiAsset.id || `live-${index}`,
    name: apiAsset.name || apiAsset.title || "Unknown Asset",
    description: apiAsset.description || apiAsset.snippet || "Distressed software asset with acquisition potential.",
    platform,
    category,
    tags,
    users: userCount >= 1000 ? `${(userCount / 1000).toFixed(userCount >= 10000 ? 0 : 1)}K` : `${userCount}`,
    usersNum: userCount,
    mrr: mrrPotential >= 1000 ? `$${(mrrPotential / 1000).toFixed(1)}K` : `$${mrrPotential}`,
    rating: apiAsset.rating || 4.2,
    scores: {
      distress: distressScore,
      monetizationGap: 0.7,
      technicalRisk: 0.6,
      marketPosition: 0.65,
      flipPotential: 0.75,
    },
    distressSignals: apiAsset.details ? [apiAsset.details] : ["No updates in 6+ months", "Support tickets ignored"],
    url: apiAsset.url || "",
  };
}

export default function Feed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MockAsset | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Distress Score");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedAssetIds, setSavedAssetIds] = useState<Set<string>>(new Set());
  const [savingAssetId, setSavingAssetId] = useState<string | null>(null);
  
  // Live search state
  const [liveAssets, setLiveAssets] = useState<MockAsset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced live search function
  const performLiveSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setLiveAssets([]);
      setHasSearched(false);
      setSearchMessage("");
      return;
    }
    
    setIsSearching(true);
    setSearchMessage("Scanning marketplaces...");
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: query, scan_type: 'all' }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      // Handle errors (but not rate limited with demo results)
      if (!response.ok && !data.assets) {
        const msg = data.message || 'Search failed';
        setSearchMessage(msg);
        setLiveAssets([]);
        setHasSearched(false); // Keep showing curated assets
        return;
      }
      
      const assets = (data.assets || []).map((a: any, i: number) => transformApiAsset(a, i));
      
      setLiveAssets(assets);
      setHasSearched(true);
      
      // Build appropriate message
      let msg = '';
      if (data.rateLimited && data.isDemo) {
        msg = `Rate limited - showing ${assets.length} demo results. Upgrade for unlimited live scans.`;
      } else if (data.isDemo) {
        msg = `Showing ${assets.length} demo results`;
      } else if (data.isCached) {
        msg = `Found ${assets.length} cached results`;
      } else {
        msg = `Found ${assets.length} assets across ${data.stats?.topMarketplace || 'marketplaces'}`;
      }
      setSearchMessage(msg);
    } catch (error: any) {
      console.error('Live search failed:', error);
      // Try to get error message from response
      let errorMsg = error.message || 'Search failed';
      if (errorMsg.includes('rate') || errorMsg.includes('limit')) {
        setHasSearched(false); // Keep showing curated assets on rate limit
      } else {
        setHasSearched(true);
      }
      setSearchMessage(errorMsg);
      setLiveAssets([]);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Trigger search with debounce when user types
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce: wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performLiveSearch(value);
    }, 500);
  }, [performLiveSearch]);
  
  // Manual search trigger (for Enter key or button click)
  const triggerSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performLiveSearch(searchQuery);
  }, [searchQuery, performLiveSearch]);
  
  // Load saved assets on mount
  useEffect(() => {
    if (user) {
      loadSavedAssets();
    }
  }, [user]);
  
  const loadSavedAssets = async () => {
    try {
      const response = await fetch('/api/saved');
      if (response.ok) {
        const data = await response.json();
        const ids = new Set<string>(data.assets?.map((a: any) => a.assetId) || []);
        setSavedAssetIds(ids);
      }
    } catch (error) {
      console.error('Failed to load saved assets:', error);
    }
  };
  
  const handleSaveAsset = async (asset: MockAsset) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save assets to your watchlist",
        variant: "destructive"
      });
      return;
    }
    
    const isSaved = savedAssetIds.has(asset.id);
    setSavingAssetId(asset.id);
    
    try {
      if (isSaved) {
        await apiRequest('DELETE', `/api/saved/${asset.id}`);
        setSavedAssetIds(prev => {
          const next = new Set(prev);
          next.delete(asset.id);
          return next;
        });
        toast({
          title: "Removed from watchlist",
          description: "Asset removed from your watchlist"
        });
      } else {
        await apiRequest('POST', '/api/saved', {
          assetId: asset.id,
          assetName: asset.name,
          assetUrl: `#${asset.id}`,
          marketplace: asset.platform,
          description: asset.description,
          users: asset.usersNum,
          estimatedMrr: parseCurrencyValue(asset.mrr),
          distressScore: Math.round(asset.scores.distress * 10),
          assetData: asset
        });
        setSavedAssetIds(prev => new Set(prev).add(asset.id));
        toast({
          title: "Added to watchlist",
          description: "Asset saved to your watchlist"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update watchlist",
        variant: "destructive"
      });
    } finally {
      setSavingAssetId(null);
    }
  };
  
  // Apply quality filtering first to ensure only realistic assets are shown
  const qualityAssets = getQualityAssets(MOCK_ASSETS);
  
  // Use live search results when a search has been performed, otherwise show mock data
  // If search returned 0 results, show empty state (don't fall back to mock)
  const baseAssets = hasSearched ? liveAssets : qualityAssets;
  
  const filteredAssets = baseAssets
    .filter(asset => {
      // For live search results, skip additional text filtering (API already filtered)
      const matchesSearch = hasSearched || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "Distress Score") {
        return b.scores.distress - a.scores.distress;
      }
      if (sortBy === "Highest MRR") {
        return parseCurrencyValue(b.mrr) - parseCurrencyValue(a.mrr);
      }
      if (sortBy === "Most Users") {
        return b.usersNum - a.usersNum;
      }
      if (sortBy === "Best Value") {
        return parseCurrencyValue(a.mrr) - parseCurrencyValue(b.mrr);
      }
      return 0;
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);
  
  const handleViewDetails = (asset: MockAsset) => {
    setSelectedAsset(asset);
    setShowDetail(true);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" data-testid="link-back-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="sm" />
                <span className="font-semibold text-slate-900 dark:text-white">AssetHunter</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-sm text-slate-500">Back to Home</span>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Browse All Businesses</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Discover verified businesses ready for acquisition
          </p>
        </motion.div>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              )}
              <Input
                placeholder="Search 14 marketplaces... e.g. 'tab manager', 'email popup'"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                data-testid="input-search"
              />
            </div>
            <Button 
              onClick={triggerSearch}
              disabled={isSearching || searchQuery.length < 2}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="button-search"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Scan
            </Button>
            <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-800" data-testid="button-filters">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
          
          {searchMessage && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{searchMessage}</span>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={`rounded-full ${
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
                onClick={() => setSelectedCategory(cat)}
                data-testid={`button-category-${cat.toLowerCase().replace(' ', '-')}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="text-count">
            Showing <span className="font-medium text-slate-900 dark:text-white">{paginatedAssets.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredAssets.length}</span> {hasSearched ? "search results" : "curated assets"}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-400"
              data-testid="select-sort"
            >
              <option value="Distress Score">Distress Score</option>
              <option value="Highest MRR">Highest MRR</option>
              <option value="Most Users">Most Users</option>
              <option value="Best Value">Best Value</option>
            </select>
          </div>
        </div>
        
        {/* Empty state for zero search results */}
        {hasSearched && filteredAssets.length === 0 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No assets found for "{searchQuery}"
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Try a different search term or browse our curated collection of distressed assets.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setHasSearched(false);
                setLiveAssets([]);
                setSearchMessage("");
              }}
              data-testid="button-clear-search"
            >
              Browse All Assets
            </Button>
          </div>
        )}
        
        {/* Asset grid */}
        {filteredAssets.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAssets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              >
                <AssetCard 
                  asset={asset} 
                  onUnlock={() => setShowPaywall(true)}
                  onViewDetails={() => handleViewDetails(asset)}
                  onSave={() => handleSaveAsset(asset)}
                  isSaved={savedAssetIds.has(asset.id)}
                  isSaving={savingAssetId === asset.id}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-slate-200 dark:border-slate-700"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage 
                    ? "bg-indigo-600 text-white" 
                    : "border-slate-200 dark:border-slate-700"
                  }
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-200 dark:border-slate-700"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>
      
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      <AssetDetailSheet 
        asset={selectedAsset}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onUnlock={() => {
          setShowDetail(false);
          setShowPaywall(true);
        }}
      />
    </div>
  );
}
