import { ScannedAsset } from "@shared/schema";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { HunterRadar, HunterRadarScores } from "@/components/HunterRadar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Lock,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Mail,
  TrendingUp,
  TrendingDown,
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
  Calendar,
  X
} from "lucide-react";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox } from "react-icons/si";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

// Get the appropriate icon for a marketplace
function getPlatformIcon(marketplace: string): typeof SiGooglechrome {
  const iconMap: Record<string, typeof SiGooglechrome> = {
    "Chrome Extension": SiGooglechrome,
    "Firefox Extension": SiFirefox,
    "Shopify App": SiShopify,
    "WordPress Plugin": SiWordpress,
    "Slack App": SiSlack,
    "chrome": SiGooglechrome,
    "firefox": SiFirefox,
    "shopify": SiShopify,
    "wordpress": SiWordpress,
    "slack": SiSlack,
    "vscode": SiGooglechrome,
  };
  return iconMap[marketplace] || iconMap[marketplace.toLowerCase()] || (Globe as unknown as typeof SiGooglechrome);
}

// Generate masked name for non-premium users
function getMaskedName(asset: { marketplace: string; id: number; category: string | null }): string {
  const platformPrefixes: Record<string, string> = {
    "Chrome Extension": "Browser Extension",
    "Firefox Extension": "Browser Extension",
    "Shopify App": "E-commerce App",
    "WordPress Plugin": "CMS Plugin",
    "Slack App": "Team Integration",
    "Marketplace": "Marketplace Platform",
    "SaaS": "SaaS Platform",
    "chrome": "Browser Extension",
    "firefox": "Browser Extension",
    "shopify": "E-commerce App",
    "wordpress": "CMS Plugin",
    "slack": "Team Integration",
    "vscode": "Code Extension",
  };

  const prefix = platformPrefixes[asset.marketplace] || platformPrefixes[asset.marketplace.toLowerCase()] || asset.category || "Software Asset";
  const numericId = String(asset.id).slice(-4);
  return `${prefix} #${numericId}`;
}

// Generate masked description for non-premium users
function getMaskedDescription(category: string | null): string {
  const descriptions: Record<string, string> = {
    "Browser Extension": "Productivity tool with established user base showing signs of reduced maintenance",
    "E-commerce": "Commerce solution with active merchant installs and recurring revenue potential",
    "SaaS": "Software platform with verified revenue and growth metrics",
    "Mobile App": "Mobile application with engaged user community",
    "Marketplace": "Marketplace platform connecting buyers and sellers",
  };
  return descriptions[category || ""] || "Software asset with established distribution and monetization opportunity";
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



const CATEGORIES = ["All Categories", "Browser Extension", "Shopify App", "WordPress Plugin", "SaaS", "E-commerce", "Mobile App", "Marketplace"];

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
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showOtherTiers, setShowOtherTiers] = useState(false);

  const handleFoundingMemberCheckout = async () => {
    if (!user) {
      // Redirect to login first
      window.location.href = "/api/login";
      return;
    }

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
          <DialogTitle className="text-xl font-bold text-center text-white">Unlock Full Intelligence</DialogTitle>
          <DialogDescription className="text-center text-slate-400 text-sm">
            Get contact info and acquisition playbooks
          </DialogDescription>
        </DialogHeader>

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
            <p className="text-sm text-slate-300 mb-2">Already have an account?</p>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-paywall"
            >
              Sign in to your account
            </Button>
          </div>
        )}

        {foundingMember && (
          <div className="relative rounded-xl p-4 pt-5 bg-slate-800 ring-2 ring-accent mt-2">
            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-0 text-xs px-3 py-0.5">
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
          {showOtherTiers ? 'Hide' : 'View'} other plans (Beta Full)
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
                      Beta Full
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
  onReveal,
  isSaved = false,
  isSaving = false,
  onSave,
  isPremium = false,
  isRevealed = false,
  isRevealing = false,
  creditsRemaining = 0
}: {
  asset: ScannedAsset | null;
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onReveal: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onSave: () => void;
  isPremium?: boolean;
  isRevealed?: boolean;
  isRevealing?: boolean;
  creditsRemaining?: number;
}) {
  if (!asset) return null;

  const { toast } = useToast();

  const Icon = getPlatformIcon(asset.marketplace);
  const hasAccess = isPremium || isRevealed;
  const displayName = hasAccess ? asset.name : getMaskedName(asset);
  const displayDescription = hasAccess ? (asset.description || "") : getMaskedDescription(asset.category);

  const uniqueTags = Array.from(new Set(asset.tags || []));

  // Calculate scores (0-10 scale)
  const distressVal = (asset.distressScore || 0) / 10;
  const monetizationVal = asset.monetizationAxis || 7;
  const technicalVal = asset.technicalAxis || 4;
  const marketVal = asset.marketAxis || 6.5;
  const flipVal = asset.flipAxis || 7.5;
  const overallScore = Math.round((distressVal + monetizationVal + technicalVal + marketVal + flipVal) / 5 * 10);

  const distressSignals = [
    { text: distressVal >= 7 ? "No updates in 12+ months" : distressVal >= 5 ? "Sporadic updates" : "Active development", critical: distressVal >= 7 },
    { text: distressVal >= 6 ? "Support tickets ignored" : "Support responsive", critical: distressVal >= 6 },
    { text: distressVal >= 7 ? "Manifest V2 at risk" : "Platform compliant", critical: distressVal >= 7 }
  ];

  const opportunities = [
    { text: flipVal >= 7 ? "High flip potential - strong user base" : "Moderate growth opportunity", highValue: flipVal >= 7 },
    { text: monetizationVal >= 6 ? "Untapped monetization potential" : "Already monetized well", highValue: monetizationVal >= 6 },
    { text: marketVal >= 6 ? "Strong market position" : "Room for market expansion", highValue: marketVal >= 6 }
  ];

  const lastUpdated = asset.lastUpdatedByOwner ? new Date(asset.lastUpdatedByOwner).toLocaleDateString() : 'Unknown';
  const isTrendingUp = (asset.distressScore || 0) < 40; // Low distress usually correlates with growth

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-950 border-slate-800 text-white overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <SheetTitle className="text-white text-xl truncate" data-testid="text-detail-name">{displayName}</SheetTitle>
                <SheetDescription className="text-slate-400">{asset.marketplace}</SheetDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueTags.slice(0, 3).map((tag, idx) => (
                    <Badge key={`${tag}-${idx}`} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full hover:bg-slate-800 shrink-0 ${isSaved ? 'text-red-500' : 'text-slate-400'}`}
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full bg-slate-900">
            <TabsTrigger value="overview" className="flex-1" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence" className="flex-1" data-testid="tab-intelligence">Hunter Intelligence</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1" data-testid="tab-contact">Owner Contact</TabsTrigger>
          </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-sm flex-1 mr-4" data-testid="text-detail-description">{displayDescription}</p>
              {hasAccess && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full border-slate-700 bg-slate-900 text-slate-300 shrink-0"
                  onClick={() => asset.url && window.open(asset.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Store
                </Button>
              )}
            </div>

            {/* Asset Metadata Row */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 py-2 border-y border-slate-900">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated: <span className="text-slate-300">{lastUpdated}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Niche: <span className="text-slate-300 capitalize">{asset.category || 'General'}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                {isTrendingUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
                <span className={isTrendingUp ? 'text-emerald-400' : 'text-amber-400'}>{isTrendingUp ? 'Growing' : 'Dormant'}</span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Est. Acquisition</div>
                <div className="text-xl font-bold text-white" data-testid="text-detail-price">{calculateAcquisitionCost(asset.estimatedMrr || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">3x annual revenue</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Est. MRR</div>
                <div className="text-xl font-bold text-emerald-400" data-testid="text-detail-mrr">{"$" + (asset.estimatedMrr?.toLocaleString() || "0")}</div>
                <div className="text-xs text-slate-500 mt-1">${((asset.estimatedMrr || 0) * 12).toLocaleString()}/yr</div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <div className="text-sm font-semibold text-white" data-testid="text-detail-users">{asset.users?.toLocaleString() || 0}</div>
                <div className="text-xs text-slate-500">Users</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <div className="text-sm font-semibold text-white" data-testid="text-detail-rating">{asset.rating?.toFixed(1) || 'N/A'}</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${distressVal >= 7 ? 'text-red-400' : distressVal >= 5 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div className={`text-sm font-semibold ${distressVal >= 7 ? 'text-red-400' : distressVal >= 5 ? 'text-amber-400' : 'text-emerald-400'}`} data-testid="text-detail-distress">
                  {distressVal.toFixed(1)}/10
                </div>
                <div className="text-xs text-slate-500">Distress</div>
              </div>
            </div>

            {/* Mini Hunter Radar */}
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">Quick Score</h4>
                <Badge variant="outline" className={`text-xs ${overallScore >= 70 ? 'border-emerald-500 text-emerald-400' : overallScore >= 50 ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-400'}`}>
                  {overallScore}/100
                </Badge>
              </div>
              <div className="flex justify-center">
                <HunterRadar
                  scores={{ distress: distressVal, monetizationGap: monetizationVal, technicalRisk: technicalVal, marketPosition: marketVal, flipPotential: flipVal }}
                  size="sm"
                  showLabels={true}
                  showValues={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="mt-6 space-y-6">
            {/* Full Hunter Radar */}
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">Hunter Radar Analysis</h4>
                <Badge variant="outline" className={`text-xs ${overallScore >= 70 ? 'border-emerald-500 text-emerald-400' : overallScore >= 50 ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-400'}`}>
                  Overall: {overallScore}/100
                </Badge>
              </div>
              <div className="flex justify-center">
                <HunterRadar
                  scores={{ distress: distressVal, monetizationGap: monetizationVal, technicalRisk: technicalVal, marketPosition: marketVal, flipPotential: flipVal }}
                  size="md"
                  showLabels={true}
                  showValues={true}
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-slate-900 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-white mb-3">Score Breakdown</h4>
              {[
                { label: "Distress Level", value: distressVal, desc: "How abandoned is this asset?" },
                { label: "Monetization Gap", value: monetizationVal, desc: "Untapped revenue potential" },
                { label: "Technical Risk", value: technicalVal, desc: "Platform compliance issues" },
                { label: "Market Position", value: marketVal, desc: "Competitive strength" },
                { label: "Flip Potential", value: flipVal, desc: "Resale opportunity" }
              ].map((score) => (
                <div key={score.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{score.label}</span>
                      <span className={score.value >= 7 ? 'text-emerald-400' : score.value >= 5 ? 'text-amber-400' : 'text-slate-400'}>
                        {score.value.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score.value >= 7 ? 'bg-emerald-500' : score.value >= 5 ? 'bg-amber-500' : 'bg-slate-600'}`}
                        style={{ width: `${score.value * 10}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{score.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Distress Signals */}
            <div className="bg-slate-900 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Distress Signals
              </h4>
              <ul className="space-y-2">
                {distressSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${signal.critical ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-emerald-400'}`} />
                    <span className={signal.critical ? 'text-red-400 font-medium' : ''}>{signal.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-slate-900 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Opportunities
              </h4>
              <ul className="space-y-2">
                {opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${opp.highValue ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={opp.highValue ? 'text-emerald-50' : ''}>{opp.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6 space-y-6">
            {hasAccess ? (
              <>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">{isPremium ? 'Premium Access' : 'Asset Revealed'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isPremium ? 'Full access included with your subscription.' : 'You revealed this asset. All info unlocked.'}
                  </p>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">Asset URL</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-slate-400 hover:text-white px-2"
                      onClick={() => {
                        if (asset.url) {
                          navigator.clipboard.writeText(asset.url);
                          toast({ title: "URL copied to clipboard" });
                        }
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-700 text-slate-200"
                    onClick={() => asset.url && window.open(asset.url, '_blank')}
                    data-testid="button-detail-url-unlocked"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 text-emerald-400" />
                    <span className="truncate text-left flex-1">{asset.url || 'View on Marketplace'}</span>
                  </Button>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white">Contact Owner</h4>
                  <p className="text-xs text-slate-400">
                    Reach out to discuss acquisition opportunities. Use our AI-generated template for better response rates.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-700 text-slate-200"
                      onClick={async () => {
                        try {
                          const domain = asset.url ? new URL(asset.url).hostname.replace('www.', '') : 'example.com';
                          const subject = `Inquiry regarding ${asset.name}`;
                          
                          // Log outreach to track contact history
                          try {
                            await apiRequest('POST', '/api/outreach', {
                              assetId: String(asset.id),
                              assetName: asset.name,
                              marketplace: asset.marketplace,
                              channel: 'email',
                              subject: subject,
                            });
                            queryClient.invalidateQueries({ queryKey: ['/api/outreach'] });
                            toast({ title: "Outreach logged", description: "Track your conversation in Inbox" });
                          } catch (e) {
                            console.error('Failed to log outreach:', e);
                            toast({ 
                              title: "Opening email client", 
                              description: "Note: outreach tracking unavailable" 
                            });
                          }
                          
                          window.location.href = `mailto:owner@${domain}?subject=${encodeURIComponent(subject)}`;
                        } catch {
                          window.location.href = 'mailto:contact@assethunter.io';
                        }
                      }}
                      data-testid="button-detail-contact-unlocked"
                    >
                      <Mail className="w-4 h-4 mr-2 text-emerald-400" />
                      Email
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-700 text-slate-200"
                      onClick={() => {
                        const template = `Hi, I noticed ${asset.name} on the ${asset.marketplace} and I'm interested in discussing its future. Are you open to acquisition offers?`;
                        navigator.clipboard.writeText(template);
                        toast({ title: "Template copied", description: "Ready to paste into your email" });
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                      Template
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    Asset URL
                  </h4>
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

                <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    Owner Contact
                  </h4>
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

                <div className="border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white">Unlock This Asset</h4>
                  <p className="text-xs text-slate-400">
                    Reveal the full asset details including URL, owner contact, and complete analysis.
                  </p>

                  {creditsRemaining > 0 ? (
                    <>
                      <Button
                        className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={onReveal}
                        disabled={isRevealing}
                        data-testid="button-detail-reveal"
                      >
                        {isRevealing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Revealing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Reveal Details (1 credit)
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-slate-500">
                        You have {creditsRemaining} reveal{creditsRemaining === 1 ? '' : 's'} remaining
                      </p>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full rounded-xl bg-accent text-white hover:bg-accent/90"
                        onClick={onUnlock}
                        data-testid="button-detail-unlock"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Get Credits to Reveal
                      </Button>
                      <p className="text-center text-xs text-slate-500">
                        Subscribe to get reveal credits
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
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
  asset: ScannedAsset;
  onUnlock: () => void;
  onViewDetails: () => void;
  onSave: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  isPremium?: boolean;
  showRealName?: boolean;
}) {
  const Icon = getPlatformIcon(asset.marketplace);
  const displayName = (isPremium || showRealName) ? asset.name : getMaskedName(asset);
  const displayDescription = (isPremium || showRealName) ? (asset.description || "") : getMaskedDescription(asset.category);

  // Calculate distress score for display using flat properties
  const distressVal = (asset.distressScore || 0) / 10; // 0-100 -> 0-10 scale
  const distressScore = distressVal > 0 ? distressVal : 5;

  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors w-full max-w-full" data-testid={`card-asset-${asset.id}`}>
      <div className="p-5 overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap gap-y-1">
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-500">
              <Icon className="w-3 h-3 mr-1" />
              {asset.marketplace}
            </Badge>
            <Badge variant="outline" className="text-xs border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
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

        <div className="flex items-start gap-3 mb-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate" data-testid={`text-name-${asset.id}`}>{displayName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 break-words" data-testid={`text-desc-${asset.id}`}>{displayDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {Array.from(new Set(asset.tags || [])).slice(0, 3).map((tag, idx) => (
            <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
          <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-500">Est. MRR</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid={`text-mrr-${asset.id}`}>{"$" + (asset.estimatedMrr?.toLocaleString() || "0")}</div>
          </div>
          <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-500">Users</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white" data-testid={`text-users-${asset.id}`}>{asset.users}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-500">Distress</div>
            <div className={`text-sm font-semibold ${distressScore >= 7 ? 'text-red-500' : distressScore >= 5 ? 'text-amber-500' : 'text-emerald-500'}`} data-testid={`text-distress-${asset.id}`}>
              {distressScore.toFixed(1)}/10
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500">Est. Acquisition</div>
            <div className="text-base font-bold text-slate-900 dark:text-white" data-testid={`text-price-${asset.id}`}>{calculateAcquisitionCost(asset.estimatedMrr || 0)}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <div className="text-xs text-slate-500">Annual Rev</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400" data-testid={`text-revenue-${asset.id}`}>
              ${(asset.estimatedMrr || 0).toLocaleString()}
            </div>
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

// Transform API scan result to ScannedAsset format
// Note: HunterRadar expects scores on 0-10 scale
function transformApiAsset(apiAsset: any, index: number): ScannedAsset {
  const userCount = apiAsset.user_count || apiAsset.users || 5000;
  const mrrPotential = apiAsset.mrr_potential || Math.round(userCount * 0.02 * 5);
  // Distress score from API is 0-100, convert to 0-10 for radar
  const distressScore = Math.min(10, Math.max(0, (apiAsset.distress_score || 70) / 10));

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

  const platformLabel = platformMap[apiAsset.marketplace] || platformMap[apiAsset.type] || "SaaS";
  const category = categoryMap[platformLabel] || "SaaS";

  const tags = apiAsset.tags || [platformLabel, category].filter(Boolean);

  // Return object matching ScannedAsset schema
  return {
    id: typeof apiAsset.id === 'number' ? apiAsset.id : index,
    externalId: apiAsset.externalId || apiAsset.id?.toString() || `live-${index}`,
    name: apiAsset.name || apiAsset.title || "Unknown Asset",
    description: apiAsset.description || apiAsset.snippet || "Distressed software asset with acquisition potential.",
    marketplace: apiAsset.marketplace || platformLabel,
    category,
    tags,
    users: userCount,
    estimatedMrr: mrrPotential,
    rating: apiAsset.rating || 4.2,
    distressScore: Math.round(distressScore * 10), // Convert 0-10 to 0-100 scale
    url: apiAsset.url || "",
  } as ScannedAsset;
}

export default function Feed() {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<ScannedAsset | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Track revealed assets (assets user has spent credits to reveal)
  const [revealedAssetIds, setRevealedAssetIds] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);

  // Fetch user's revealed assets from server on mount
  const { data: revealedData } = useQuery<{ revealedAssetIds: string[] }>({
    queryKey: ["/api/revealed-assets"],
    enabled: !!user,
  });

  // Sync server-side revealed assets with local state
  useEffect(() => {
    if (revealedData?.revealedAssetIds?.length) {
      setRevealedAssetIds(new Set(revealedData.revealedAssetIds.map(id => Number(id))));
    }
  }, [revealedData]);

  // Fetch user credits to track daily usage for progressive disclosure
  const { data: creditsData, refetch: refetchCredits } = useQuery<{
    credits: number;
    tier: string;
    dailyUsed: number;
    dailyLimit: number;
    unlimited?: boolean;
  }>({
    queryKey: ["/api/credits"],
    enabled: !!user,
  });

  // Check if user has unlimited reveals (premium users)
  const hasUnlimitedReveals = creditsData?.unlimited === true;

  // Show daily limit banner only after 10 reveals (progressive disclosure)
  // Only applies to tiers with daily limits (dailyLimit > 0) and NOT unlimited users
  const showDailyLimitBanner = !hasUnlimitedReveals &&
    creditsData &&
    creditsData.dailyLimit > 0 &&
    creditsData.dailyUsed >= 10;

  // Calculate remaining reveals (handle unlimited users and tiers without daily limits)
  const revealsRemainingNum = hasUnlimitedReveals
    ? Infinity
    : (creditsData && creditsData.dailyLimit > 0
      ? Math.max(0, Math.min(creditsData.credits, creditsData.dailyLimit - creditsData.dailyUsed))
      : Math.max(0, creditsData?.credits || 0));

  // Format for display - convert Infinity to "Unlimited" for safe rendering
  const revealsRemaining = revealsRemainingNum === Infinity
    ? "Unlimited"
    : revealsRemainingNum;

  // Handle revealing an asset (consumes 1 credit)
  const handleRevealAsset = async (asset: ScannedAsset) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reveal asset details",
        variant: "destructive"
      });
      return;
    }

    if (revealsRemainingNum <= 0 && !isPremium) {
      setShowPaywall(true);
      return;
    }

    setIsRevealing(true);
    try {
      const response = await apiRequest("POST", `/api/assets/${asset.id}/reveal`);
      const data = await response.json();

      if (response.ok) {
        // Mark asset as revealed
        setRevealedAssetIds(prev => new Set(prev).add(asset.id));
        // Refresh credit balance and refetch scanned assets for updated data
        refetchCredits();
        queryClient.invalidateQueries({ queryKey: ["/api/scanned-assets"] });
        toast({
          title: "Asset Revealed",
          description: `You now have access to full details. ${data.creditsRemaining !== undefined ? `${data.creditsRemaining} credits remaining.` : ''}`
        });
      } else {
        toast({
          title: "Reveal Failed",
          description: data.message || "Unable to reveal asset",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reveal asset",
        variant: "destructive"
      });
    } finally {
      setIsRevealing(false);
    }
  };

  // Added waitlist state
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setIsSubmittingWaitlist(true);
    try {
      const res = await apiRequest("POST", "/api/waitlist", { email: waitlistEmail, tier: "scout" });
      if (res.ok) {
        toast({ title: "Joined Waitlist", description: "We'll notify you when a spot opens up!" });
        setShowWaitlist(false);
        setWaitlistEmail("");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to join waitlist. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Distress Score");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedAssetIds, setSavedAssetIds] = useState<Set<number>>(new Set());
  const [savingAssetId, setSavingAssetId] = useState<number | null>(null);

  // Live search state
  const [liveAssets, setLiveAssets] = useState<ScannedAsset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // NO auto-fetch - Feed starts empty until user searches
  // This ensures we only show search results, not default data
  const dbAssets: ScannedAsset[] = [];
  const isLoadingDbAssets = false;

  // Assets come from live search only
  const realAssets = liveAssets;

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
      const response = await fetch('/api/engine/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && !data.assets) {
        const msg = data.message || 'Search failed';
        setSearchMessage(msg);
        setLiveAssets([]);
        setHasSearched(false);
        return;
      }

      const assets = (data.assets || []).map((a: any, i: number) => transformApiAsset(a, i));

      setLiveAssets(assets);
      setHasSearched(true);

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
      let errorMsg = error.message || 'Search failed';
      if (errorMsg.includes('rate') || errorMsg.includes('limit')) {
        setHasSearched(false);
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
        const ids = new Set<number>(data.assets?.map((a: any) => Number(a.assetId)) || []);
        setSavedAssetIds(ids);
      }
    } catch (error) {
      console.error('Failed to load saved assets:', error);
    }
  };

  const handleSaveAsset = async (asset: ScannedAsset) => {
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
          assetId: String(asset.id),
          assetName: asset.name,
          assetUrl: `#${asset.id}`,
          marketplace: asset.marketplace,
          description: asset.description || "",
          users: asset.users,
          estimatedMrr: asset.estimatedMrr || 0,
          distressScore: asset.distressScore || 0,
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

  // Use ONLY real database assets - no mock data fallback
  const qualityAssets = realAssets;

  // Use live search results when a search has been performed, otherwise show database data
  const baseAssets = hasSearched ? liveAssets : qualityAssets;

  const filteredAssets = baseAssets
    .filter(asset => {
      const matchesSearch = hasSearched ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "Distress Score") {
        // Use flat distressScore property (0-100 scale)
        return (b.distressScore || 0) - (a.distressScore || 0);
      }
      if (sortBy === "Highest MRR") {
        return (b.estimatedMrr || 0) - (a.estimatedMrr || 0);
      }
      if (sortBy === "Most Users") {
        return (b.users || 0) - (a.users || 0);
      }
      if (sortBy === "Best Value") {
        // Best Value = lowest acquisition cost = lowest MRR
        return (a.estimatedMrr || 0) - (b.estimatedMrr || 0);
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

  const [, navigate] = useLocation();

  const handleViewDetails = (asset: ScannedAsset) => {
    // For live search results (which have temporary IDs), show detail sheet
    // For real database assets, we could navigate - but sheet is better UX
    setSelectedAsset(asset);
    setShowDetail(true);
  };

  const isLoading = isLoadingDbAssets;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <Link href="/" data-testid="link-back-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="sm" />
                <span className="font-semibold text-slate-900 dark:text-white">AssetHunter</span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {/* Credit balance display for logged-in users */}
              {user && creditsData && !isPremium && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300" data-testid="text-credit-balance">
                    {creditsData.unlimited ? 'Unlimited' : creditsData.credits} credits
                  </span>
                </div>
              )}
              {user && isPremium && (
                <Badge variant="outline" className="hidden sm:flex border-emerald-500 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Link href="/watchlist" data-testid="link-watchlist">
                <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </span>
              </Link>
              <Link href="/" data-testid="link-home">
                <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {showDailyLimitBanner && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <Sparkles className="w-4 h-4" />
              <span>
                You're on fire today! Security check: You have <strong>{revealsRemaining}</strong> reveals left for today to ensure fair access.
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
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
            <Button
              variant="outline"
              className={`gap-2 border-slate-200 dark:border-slate-800 ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {selectedCategory !== "All Categories" && (
                <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
              )}
            </Button>
          </div>

          {searchMessage && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{searchMessage}</span>
            </div>
          )}

          {/* Collapsible filters section */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
                {selectedCategory !== "All Categories" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => setSelectedCategory("All Categories")}
                    data-testid="button-clear-category"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    onClick={() => setSelectedCategory(cat)}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
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

        {/* Loading state */}
        {isLoadingDbAssets && !hasSearched && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  </div>
                </div>
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4" />
                <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </Card>
            ))}
          </div>
        )}

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
              Try a different search term or run a scan to discover new opportunities.
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
              Clear Search
            </Button>
          </div>
        )}

        {/* Empty state when no real data exists (no mock fallback) */}
        {!hasSearched && !isLoadingDbAssets && filteredAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No assets discovered yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Run your first scan to discover dormant software assets across 14 marketplaces.
              Search for niches like "tab manager", "email popup", or "inventory sync".
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                onClick={() => {
                  setSearchQuery("tab manager");
                  performLiveSearch("tab manager");
                }}
                data-testid="button-scan-example"
              >
                <Search className="w-4 h-4" />
                Try "tab manager"
              </Button>
              <Link href="/pricing">
                <Button variant="outline" className="gap-2" data-testid="link-pricing-empty">
                  <Sparkles className="w-4 h-4" />
                  Get Full Access
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Asset grid */}
        {filteredAssets.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full">
            {paginatedAssets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="min-w-0 w-full overflow-hidden"
              >
                <AssetCard
                  asset={asset}
                  onUnlock={() => setShowPaywall(true)}
                  onViewDetails={() => handleViewDetails(asset)}
                  onSave={() => handleSaveAsset(asset)}
                  isSaved={savedAssetIds.has(asset.id)}
                  isSaving={savingAssetId === asset.id}
                  isPremium={isPremium}
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
        onReveal={() => {
          if (selectedAsset) {
            handleRevealAsset(selectedAsset);
          }
        }}
        isSaved={selectedAsset ? savedAssetIds.has(selectedAsset.id) : false}
        isSaving={selectedAsset ? savingAssetId === selectedAsset.id : false}
        onSave={() => selectedAsset && handleSaveAsset(selectedAsset)}
        isPremium={isPremium}
        isRevealed={selectedAsset ? (isPremium || revealedAssetIds.has(selectedAsset.id)) : false}
        isRevealing={isRevealing}
        creditsRemaining={typeof revealsRemaining === 'number' ? revealsRemaining : 999}
      />

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
