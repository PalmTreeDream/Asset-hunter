import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, Loader2, Target, TrendingUp, Users, User, DollarSign, ExternalLink, ChevronRight, Sparkles, Gauge, Mail, CheckCircle, AlertCircle, HelpCircle, Globe, FileText, Lock, Zap, Flame, Activity, Download, Filter, X, ArrowUpDown, SlidersHorizontal, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { AnalysisInterstitial } from "@/components/AnalysisInterstitial";
import { AssetDetailPanel } from "@/components/AssetDetailPanel";
import { AssetDetailMobile } from "@/components/AssetDetailMobile";

interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  description: string;
  revenue: string;
  details: string;
  user_count: number;
  marketplace: string;
  mrr_potential: number;
  status: string;
  last_update?: string;
}

interface Analysis {
  valuation: string;
  potential_mrr: string;
  the_play: string;
  cold_email: string;
  manifest_v2_risk: string;
  owner_contact?: string;
  negotiation_script?: string;
  // Enrichment data
  performance_score?: number | null;
  performance_metrics?: {
    fcp: string;
    lcp: string;
    cls: string;
    tbt: string;
  } | null;
  // Owner contact (custom scraper)
  verified_email?: string | null;
  email_confidence?: number | null;
  email_status?: "verified" | "hidden" | "dark";
  email_source?: string;
  contact_form?: string | null;
  developer_website?: string | null;
}

const MARKETPLACE_COLORS: Record<string, string> = {
  chrome_extension: "bg-primary/20 text-primary border-primary/30",
  firefox_addon: "bg-accent/20 text-accent border-accent/30",
  shopify_app: "bg-primary/20 text-primary border-primary/30",
  wordpress_plugin: "bg-muted text-muted-foreground border-border",
  slack_app: "bg-accent/20 text-accent border-accent/30",
  zapier_integration: "bg-accent/20 text-accent border-accent/30",
  saas_product: "bg-primary/20 text-primary border-primary/30",
  saas_forsale: "bg-primary/20 text-primary border-primary/30",
  // New marketplaces
  ios_app: "bg-muted text-muted-foreground border-border",
  android_app: "bg-primary/20 text-primary border-primary/30",
  edge_addon: "bg-muted text-muted-foreground border-border",
  microsoft_app: "bg-primary/20 text-primary border-primary/30",
  salesforce_app: "bg-muted text-muted-foreground border-border",
  atlassian_app: "bg-muted text-muted-foreground border-border",
  gumroad_product: "bg-accent/20 text-accent border-accent/30",
};

const TYPE_LABELS: Record<string, string> = {
  chrome_extension: "Chrome",
  firefox_addon: "Firefox",
  shopify_app: "Shopify",
  wordpress_plugin: "WordPress",
  slack_app: "Slack",
  zapier_integration: "Zapier",
  saas_product: "SaaS",
  saas_forsale: "For Sale",
  // New marketplaces
  ios_app: "iOS",
  android_app: "Android",
  edge_addon: "Edge",
  microsoft_app: "Microsoft",
  salesforce_app: "Salesforce",
  atlassian_app: "Atlassian",
  gumroad_product: "Gumroad",
};

// Clean up asset names by removing common prefixes
function cleanAssetName(name: string): string {
  const prefixes = [
    /^reviews?:\s*/i,
    /^best\s+/i,
    /^top\s+/i,
    /^\d+\.\s*/,
    /^#\d+\s*/,
  ];
  let cleaned = name;
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, "");
  }
  cleaned = cleaned.replace(/:\s*:/g, ":").replace(/\s+/g, " ").trim();
  return cleaned;
}

// Generate anonymized asset name for non-premium users
function getAssetDisplayName(asset: Asset, isPro: boolean, index?: number): string {
  if (isPro) {
    return cleanAssetName(asset.name);
  }
  // Generate consistent hash from asset URL for unique ID
  const hash = asset.id ? Math.abs(asset.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) : (index || 0);
  const assetNum = String(hash).slice(-4).padStart(4, '0');
  return `Hidden Asset #${assetNum}`;
}

// Sanitize description to remove asset name for free users
function sanitizeDescription(description: string, assetName: string, isPro: boolean): string {
  if (isPro) return description;
  
  // Extract potential name parts from the asset name
  const nameParts = assetName.split(/[\s\-–—:;|]+/).filter(part => part.length > 2);
  let sanitized = description;
  
  // Remove name parts that appear at the start of description or as standalone words
  for (const part of nameParts) {
    // Skip very common words
    if (['the', 'for', 'and', 'with', 'app', 'plugin', 'extension', 'tool'].includes(part.toLowerCase())) continue;
    // Remove the name part if it appears as a word boundary match
    const regex = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[...]');
  }
  
  // Clean up multiple [...] in a row
  sanitized = sanitized.replace(/(\[\.\.\.\]\s*)+/g, '[...] ').trim();
  // Remove [...] at the start
  sanitized = sanitized.replace(/^\[\.\.\.\]\s*[-–—:;]?\s*/i, '');
  
  return sanitized || 'Asset description hidden for free users.';
}

// Diversify and sort results - prioritize popular platforms and spread across types
function diversifyResults(assets: Asset[]): Asset[] {
  if (assets.length === 0) return assets;
  
  // Platform priority (higher = more prominent)
  const platformPriority: Record<string, number> = {
    chrome_extension: 10,
    ios_app: 9,
    android_app: 8,
    shopify_app: 7,
    firefox_addon: 6,
    wordpress_plugin: 5,
    slack_app: 4,
    atlassian_app: 4,
    salesforce_app: 4,
    edge_addon: 3,
    zapier_integration: 3,
    microsoft_app: 3,
    saas_product: 2,
    saas_forsale: 2,
    gumroad_product: 1,
  };
  
  // Group by platform type
  const byPlatform: Record<string, Asset[]> = {};
  for (const asset of assets) {
    const type = asset.type || 'other';
    if (!byPlatform[type]) byPlatform[type] = [];
    byPlatform[type].push(asset);
  }
  
  // Sort each platform's assets by distress score (higher = better opportunity)
  for (const type in byPlatform) {
    byPlatform[type].sort((a, b) => {
      const scoreA = a.user_count * (a.mrr_potential || 1);
      const scoreB = b.user_count * (b.mrr_potential || 1);
      return scoreB - scoreA;
    });
  }
  
  // Get sorted platform types by priority
  const sortedPlatforms = Object.keys(byPlatform).sort((a, b) => 
    (platformPriority[b] || 0) - (platformPriority[a] || 0)
  );
  
  // Round-robin through platforms to diversify
  const diversified: Asset[] = [];
  let added = true;
  let round = 0;
  
  while (added && diversified.length < assets.length) {
    added = false;
    for (const platform of sortedPlatforms) {
      if (byPlatform[platform] && byPlatform[platform].length > round) {
        diversified.push(byPlatform[platform][round]);
        added = true;
      }
    }
    round++;
  }
  
  return diversified;
}

// Calculate distress score based on asset signals (0-100)
function calculateDistressScore(asset: Asset): { score: number; label: string; color: string } {
  let score = 50; // Base score
  
  // User count signals (more users = higher opportunity)
  if (asset.user_count >= 50000) score += 20;
  else if (asset.user_count >= 10000) score += 15;
  else if (asset.user_count >= 5000) score += 10;
  else if (asset.user_count >= 1000) score += 5;
  
  // Marketplace signals (some are more valuable)
  if (asset.type === "chrome_extension") score += 10; // Manifest V2 risk
  if (asset.type === "saas_forsale") score += 15; // Motivated seller
  if (asset.type === "shopify_app") score += 8; // Recurring revenue potential
  
  // Status signals
  if (asset.status === "for_sale") score += 10;
  if (asset.status === "distressed") score += 5;
  
  // MRR potential boost
  if (asset.mrr_potential >= 1000) score += 10;
  else if (asset.mrr_potential >= 500) score += 5;
  
  // Cap at 100
  score = Math.min(100, score);
  
  // Determine label and color using unified viz color system
  if (score >= 80) return { score, label: "Hot", color: "bg-[hsl(var(--viz-red)/0.2)] text-[hsl(var(--viz-red))] border-[hsl(var(--viz-red)/0.3)]" };
  if (score >= 60) return { score, label: "Warm", color: "bg-[hsl(var(--viz-amber)/0.2)] text-[hsl(var(--viz-amber))] border-[hsl(var(--viz-amber)/0.3)]" };
  if (score >= 40) return { score, label: "Active", color: "bg-[hsl(var(--viz-blue)/0.2)] text-[hsl(var(--viz-blue))] border-[hsl(var(--viz-blue)/0.3)]" };
  return { score, label: "Cool", color: "bg-[hsl(var(--viz-gray)/0.2)] text-[hsl(var(--viz-gray))] border-[hsl(var(--viz-gray)/0.3)]" };
}

// Filter/Sort types
type SortOption = 'distress_desc' | 'mrr_desc' | 'users_desc' | 'name_asc';
type StatusFilter = 'all' | 'for_sale' | 'distressed';

const ALL_MARKETPLACES = [
  'chrome_extension', 'firefox_addon', 'shopify_app', 'wordpress_plugin',
  'slack_app', 'zapier_integration', 'saas_product', 'saas_forsale',
  'ios_app', 'android_app', 'edge_addon', 'microsoft_app', 'salesforce_app', 'atlassian_app', 'gumroad_product'
] as const;

export default function Hunt() {
  const [query, setQuery] = useState("productivity");
  const [scanType, setScanType] = useState("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [hunterIntel, setHunterIntel] = useState<any>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [pendingScan, setPendingScan] = useState(false);
  
  // Filter/Sort state
  const [sortBy, setSortBy] = useState<SortOption>('distress_desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [marketplaceFilters, setMarketplaceFilters] = useState<string[]>([]);
  const [minDistressScore, setMinDistressScore] = useState(0);
  const [minMrr, setMinMrr] = useState(0);
  const [minUsers, setMinUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  // Check subscription status using ONLY secure session (no fallback to prevent spoofing)
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['/api/session/status'],
    queryFn: async () => {
      const res = await fetch('/api/session/status', { credentials: 'include' });
      return res.json();
    },
    staleTime: 30000,
  });
  
  // SECURITY: User is Premium ONLY if verified session says so (no client-side email checks)
  const isPro = (sessionData as any)?.isPremium || false;
  const isAuthenticated = (sessionData as any)?.authenticated || false;
  
  // Helper function to request magic link (sends email for secure login)
  const requestMagicLink = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/session/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message || 'Check your email for a sign-in link' };
    } catch (error) {
      console.error('Magic link request error:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  };
  
  // State for auto-load functionality
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  
  // Check for query params (q for search query, verified for magic link redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for search query from Feed page redirect
    const searchQuery = params.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      setInitialQuery(searchQuery);
      // Clean URL but keep on hunt page
      window.history.replaceState({}, '', '/hunt');
    } else {
      // No query param - set default for auto-load
      setInitialQuery("productivity");
    }
    
    // Check for verified=true (redirected from magic link)
    if (params.get('verified') === 'true') {
      analytics.sessionVerified();
      refetchSession();
      toast({
        title: "Welcome back!",
        description: "You are now signed in.",
      });
      // Clean URL
      window.history.replaceState({}, '', '/hunt');
    }
  }, []);
  
  // Get Stripe products for pricing
  const { data: productsData } = useQuery({
    queryKey: ['/api/stripe/products'],
  });

  // Find all tier prices from Stripe products
  const products = (productsData as any)?.data || [];
  const findTierPrice = (tierName: string) => {
    const product = products.find((p: any) => 
      p.name?.toLowerCase().includes(tierName.toLowerCase()) ||
      p.metadata?.tier?.toLowerCase() === tierName.toLowerCase()
    );
    return product?.prices?.find((p: any) => p.recurring?.interval === 'month')?.id;
  };
  const scoutPriceId = findTierPrice('scout');
  const hunterPriceId = findTierPrice('hunter');
  const syndicatePriceId = findTierPrice('syndicate');
  // Default to hunter for upgrade prompts
  const priceId = hunterPriceId;
  
  // State for selected tier during checkout
  const [selectedTier, setSelectedTier] = useState<'scout' | 'hunter' | 'syndicate'>('hunter');

  // Newsletter signup mutation - uses context to track which email was submitted
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/newsletter/signup", { email, source: "hunt_page" });
      return res.json();
    },
    onSuccess: async (data, submittedEmail) => {
      analytics.newsletterSignup('hunt_page');
      setNewsletterSubmitted(true);
      // Save the actual submitted email to localStorage
      if (submittedEmail) {
        const normalizedEmail = submittedEmail.toLowerCase().trim();
        localStorage.setItem('userEmail', normalizedEmail);
        // Request magic link for secure login
        analytics.magicLinkRequested('newsletter');
        const result = await requestMagicLink(normalizedEmail);
        if (result.success) {
          toast({
            title: "Check your email",
            description: result.message,
          });
        }
      } else {
        toast({
          title: "Success!",
          description: data.message,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  // State for checkout email input and Premium login
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [showProLoginPrompt, setShowProLoginPrompt] = useState(false);
  const [proLoginEmail, setProLoginEmail] = useState("");
  
  const handleProLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proLoginEmail.trim() || !proLoginEmail.includes("@")) return;
    const normalizedEmail = proLoginEmail.toLowerCase().trim();
    localStorage.setItem('userEmail', normalizedEmail);
    // Request magic link for secure login
    const result = await requestMagicLink(normalizedEmail);
    setShowProLoginPrompt(false);
    if (result.success) {
      toast({
        title: "Check your email",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ email, tier }: { email: string; tier: 'scout' | 'hunter' | 'syndicate' }) => {
      const tierPriceMap = { scout: scoutPriceId, hunter: hunterPriceId, syndicate: syndicatePriceId };
      const selectedPriceId = tierPriceMap[tier];
      if (!selectedPriceId) throw new Error('Price not found for tier');
      analytics.checkoutStarted(tier, tier === 'scout' ? 2900 : tier === 'hunter' ? 9900 : 24900);
      const res = await apiRequest("POST", "/api/stripe/checkout", {
        priceId: selectedPriceId,
        email,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        // Save email to localStorage before redirecting to Stripe
        // Session will be claimed when user returns with verified payment
        if (checkoutEmail) {
          const normalizedEmail = checkoutEmail.toLowerCase().trim();
          localStorage.setItem('userEmail', normalizedEmail);
        }
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleUpgradeClick = (tier: 'scout' | 'hunter' | 'syndicate' = 'hunter') => {
    analytics.upgradeClicked(tier, 'hunt_page');
    setSelectedTier(tier);
    // Get email from localStorage or newsletter form, otherwise prompt
    const existingEmail = localStorage.getItem('userEmail') || newsletterEmail;
    if (existingEmail) {
      setCheckoutEmail(existingEmail);
      checkoutMutation.mutate({ email: existingEmail, tier });
    } else {
      setShowEmailPrompt(true);
    }
  };
  
  const handleEmailSubmitForCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutEmail.trim() || !checkoutEmail.includes("@")) return;
    checkoutMutation.mutate({ email: checkoutEmail, tier: selectedTier });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) return;
    newsletterMutation.mutate(newsletterEmail);
  };

  // Starter Scan - uses cached demo results (no API cost for free users)
  const starterScanMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await apiRequest("POST", "/api/starter-scan", {
        target_url: searchQuery,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAssets(diversifyResults(data.assets || []));
      // Show info toast about demo results
      if (data.isDemo) {
        toast({
          title: "Demo Results",
          description: data.scanCount > 1 
            ? "Showing cached results. Upgrade for live marketplace scans."
            : "Explore these sample deals. Upgrade to scan 14 live marketplaces!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Unable to scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Live Scan - uses SerpAPI (for premium users)
  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/scan", {
        target_url: query,
        scan_type: scanType,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAssets(diversifyResults(data.assets || []));
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Unable to scan marketplaces. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      // Note: Premium status is now determined by secure session cookie (credentials: include)
      const res = await apiRequest("POST", "/api/analyze", {
        asset_name: asset.name,
        users: asset.user_count,
        url: asset.url,
        asset_type: asset.type,
        marketplace: asset.marketplace,
        mrr_potential: asset.mrr_potential,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      setAnalysis(data);
      // Fetch Hunter Intelligence after analysis succeeds
      if (selectedAsset) {
        setIsLoadingIntel(true);
        setHunterIntel(null);
        try {
          const intelRes = await apiRequest("POST", "/api/hunter-intelligence", {
            asset_name: selectedAsset.name,
            asset_type: selectedAsset.type,
            marketplace: selectedAsset.marketplace || selectedAsset.type,
            users: selectedAsset.user_count,
            description: `${selectedAsset.name} - ${selectedAsset.type} with ${selectedAsset.user_count} users`,
            last_updated: selectedAsset.last_update,
          });
          const intelData = await intelRes.json();
          setHunterIntel(intelData);
        } catch (err) {
          console.error("[HunterIntelligence] Fetch error:", err);
        } finally {
          setIsLoadingIntel(false);
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze this asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    analytics.searchInitiated(query, scanType);
    analytics.scanStarted(query, scanType === 'all' ? 14 : 1);
    
    // Authenticated users get live scans (pro features like contact info still gated)
    // Only non-authenticated users get demo results
    if (isAuthenticated) {
      // Authenticated users get live API scan
      scanMutation.mutate();
    } else {
      // Non-authenticated users get starter scan (demo results, no API cost)
      starterScanMutation.mutate(query);
    }
    setSelectedAsset(null);
    setAnalysis(null);
  };
  
  // After lead capture (for Save to Watchlist), create account and save
  const handleLeadCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.includes("@")) return;
    
    analytics.leadCaptured('watchlist_save_gate');
    
    // Save email and request magic link for secure login
    const normalizedEmail = leadEmail.toLowerCase().trim();
    localStorage.setItem('userEmail', normalizedEmail);
    
    // Request magic link (will send email)
    analytics.magicLinkRequested('lead_capture');
    const result = await requestMagicLink(normalizedEmail);
    
    // Sign them up for newsletter too
    newsletterMutation.mutate(leadEmail);
    
    // Close modal
    setShowLeadCapture(false);
    
    toast({
      title: "Account created!",
      description: result.success 
        ? "Check your email for a secure sign-in link. Asset saved to watchlist!"
        : "Your asset has been saved to your watchlist.",
    });
  };

  const handleAnalyze = (asset: Asset) => {
    analytics.analysisRequested(asset.id, asset.marketplace);
    setSelectedAsset(asset);
    analyzeMutation.mutate(asset);
  };

  const triggerScan = (searchQuery: string = "productivity") => {
    analytics.searchInitiated(searchQuery, scanType);
    setQuery(searchQuery);
    analytics.scanStarted(searchQuery, scanType === 'all' ? 14 : 1);
    
    // Authenticated users get live scans, others get demo
    if (isAuthenticated) {
      scanMutation.mutate();
    } else {
      starterScanMutation.mutate(searchQuery);
    }
    setSelectedAsset(null);
    setAnalysis(null);
  };
  
  // AUTO-LOAD: Trigger initial scan when page loads (Alpha Feed experience)
  useEffect(() => {
    if (initialQuery && !hasAutoLoaded && !scanMutation.isPending && !starterScanMutation.isPending) {
      setHasAutoLoaded(true);
      // Slight delay to ensure UI is ready
      const timer = setTimeout(() => {
        triggerScan(initialQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, hasAutoLoaded, scanMutation.isPending, starterScanMutation.isPending]);
  
  // Combined loading state for either scan type
  const isScanning = scanMutation.isPending || starterScanMutation.isPending;
  const scanError = scanMutation.isError || starterScanMutation.isError;

  // Pre-calculate distress scores once per asset to avoid re-computation
  const assetsWithScores = useMemo(() => {
    return assets.map(asset => {
      const distressData = calculateDistressScore(asset);
      return {
        ...asset,
        _distressScore: distressData.score,
        _distressLabel: distressData.label,
        _distressColor: distressData.color,
        _marketplaceKey: asset.type || asset.marketplace || 'unknown'
      };
    });
  }, [assets]);
  
  // Filter and sort assets using useMemo for performance
  const filteredAssets = useMemo(() => {
    let result = [...assetsWithScores];
    
    // Apply marketplace filter (use _marketplaceKey which falls back to marketplace)
    if (marketplaceFilters.length > 0) {
      result = result.filter(a => marketplaceFilters.includes(a._marketplaceKey));
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    
    // Apply minimum distress score filter (use pre-calculated score)
    if (minDistressScore > 0) {
      result = result.filter(a => a._distressScore >= minDistressScore);
    }
    
    // Apply minimum MRR filter
    if (minMrr > 0) {
      result = result.filter(a => a.mrr_potential >= minMrr);
    }
    
    // Apply minimum users filter
    if (minUsers > 0) {
      result = result.filter(a => a.user_count >= minUsers);
    }
    
    // Sort results (use pre-calculated distress score)
    result.sort((a, b) => {
      switch (sortBy) {
        case 'distress_desc':
          return b._distressScore - a._distressScore;
        case 'mrr_desc':
          return b.mrr_potential - a.mrr_potential;
        case 'users_desc':
          return b.user_count - a.user_count;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return result;
  }, [assetsWithScores, marketplaceFilters, statusFilter, minDistressScore, minMrr, minUsers, sortBy]);
  
  // Check if any filters are active
  const hasActiveFilters = marketplaceFilters.length > 0 || statusFilter !== 'all' || minDistressScore > 0 || minMrr > 0 || minUsers > 0;
  
  // Clear all filters and close filter panel
  const clearAllFilters = () => {
    setMarketplaceFilters([]);
    setStatusFilter('all');
    setMinDistressScore(0);
    setMinMrr(0);
    setMinUsers(0);
    setShowFilters(false); // Close the filter panel
  };
  
  // Toggle marketplace filter
  const toggleMarketplaceFilter = (marketplace: string) => {
    setMarketplaceFilters(prev => 
      prev.includes(marketplace) 
        ? prev.filter(m => m !== marketplace)
        : [...prev, marketplace]
    );
  };

  const totalUsers = assets.reduce((sum, a) => sum + a.user_count, 0);
  const totalMrr = assets.reduce((sum, a) => sum + a.mrr_potential, 0);

  return (
    <div className="space-y-6">
      
      {/* ALPHA TERMINAL HEADER */}
      <div className="relative pt-2 pb-4">
        {/* Terminal header with live status */}
        <div className="flex flex-col gap-4">
          
          {/* Top bar: Terminal status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Live terminal indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md glass-terminal">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">14 MKTS LIVE</span>
              </div>
              
              {isPro && (
                <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/25 rounded-md font-mono text-[10px]">
                  <Zap className="w-3 h-3 mr-1" />
                  PRO ACCESS
                </Badge>
              )}
              {isAuthenticated && !isPro && (
                <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-white/10 rounded-md font-mono text-[10px]">
                  <User className="w-3 h-3 mr-1" />
                  AUTHENTICATED
                </Badge>
              )}
            </div>
            
            {!isPro && !isAuthenticated && (
              <button 
                onClick={() => setShowProLoginPrompt(true)}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-pro-login"
              >
                EXISTING ACCESS? SIGN IN
              </button>
            )}
            {isAuthenticated && !isPro && (
              <Link 
                href="/pricing"
                className="text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                data-testid="button-upgrade-pro"
              >
                UPGRADE FOR CONTACT DATA
              </Link>
            )}
          </div>

          {/* Search Form - Terminal style */}
          <form 
            onSubmit={handleSearch} 
            className="w-full"
          >
            <div className="p-3 glass-terminal rounded-lg">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search niche (productivity, CRM, inventory...)"
                    className="h-12 pl-11 font-mono text-sm rounded-md border-white/10 bg-white/5 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                    data-testid="input-niche"
                  />
                </div>
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger className="w-full md:w-[160px] h-12 rounded-md border-white/10 bg-white/5 font-mono text-sm" data-testid="select-marketplace">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Markets" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] rounded-md glass-terminal font-mono text-sm">
                    <SelectItem value="all">ALL (14)</SelectItem>
                    <SelectItem value="chrome">Chrome</SelectItem>
                    <SelectItem value="firefox">Firefox</SelectItem>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="wordpress">WordPress</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="zapier">Zapier</SelectItem>
                    <SelectItem value="producthunt">Product Hunt</SelectItem>
                    <SelectItem value="forsale">For Sale</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="microsoft">Microsoft</SelectItem>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="atlassian">Atlassian</SelectItem>
                    <SelectItem value="gumroad">Gumroad</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="submit"
                  disabled={isScanning || !query.trim()}
                  size="lg"
                  className="h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm uppercase tracking-wider"
                  data-testid="button-hunt"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      SCANNING
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      SCAN
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Stats Bar - Terminal glassmorphic panel */}
      {assets.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-terminal rounded-lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground font-mono" data-testid="text-assets-count">{assets.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ASSETS</p>
                </div>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground font-mono" data-testid="text-total-users">{totalUsers.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">USERS</p>
                </div>
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-primary font-mono" data-testid="text-mrr-potential">${totalMrr.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">MRR EST.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State - Terminal shimmer */}
      {isScanning && (
        <div className="space-y-6">
          {/* Scanning indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-3 glass-terminal rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs font-mono text-foreground uppercase tracking-wider">SCANNING 14 MARKETPLACES</span>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="glass-terminal rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20 rounded bg-white/5" />
                    <Skeleton className="h-3 w-14 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset card skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 glass-card rounded-lg animate-pulse">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Skeleton className="h-4 w-16 rounded bg-white/5" />
                  <Skeleton className="h-5 w-20 rounded bg-white/5" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2 rounded bg-white/5" />
                <Skeleton className="h-4 w-full mb-3 rounded bg-white/5" />
                <div className="flex items-center gap-4 mb-3">
                  <Skeleton className="h-4 w-20 rounded bg-white/5" />
                  <Skeleton className="h-4 w-16 rounded bg-white/5" />
                </div>
                <Skeleton className="h-8 w-full rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State - Terminal styling */}
      {scanError && !isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center space-y-4 py-8"
        >
          <div className="w-12 h-12 mx-auto rounded-md bg-destructive/15 border border-destructive/25 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground font-mono">SCAN FAILED</h3>
            <p className="text-xs text-muted-foreground">
              Unable to connect to marketplace scanners. Rate limits or service issues.
            </p>
          </div>
          <Button 
            onClick={() => scanMutation.mutate()}
            className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-wider"
            data-testid="button-retry-scan"
          >
            <Activity className="w-4 h-4 mr-2" />
            RETRY
          </Button>
        </motion.div>
      )}

      {/* Empty State - Terminal Design */}
      {assets.length === 0 && !isScanning && !scanError && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="py-4 md:py-6 max-w-xl mx-auto"
        >
          {/* Terminal glass card for empty state */}
          <div className="glass-terminal rounded-lg p-4 space-y-4">
            {/* Header row with icon and message */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground font-mono uppercase">READY TO SCAN</h2>
                <p className="text-xs text-muted-foreground">
                  Enter a niche above or select quick start
                </p>
              </div>
            </div>
            
            {/* Quick start pills - inline compact */}
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">QUICK START</p>
              <div className="flex flex-wrap gap-2">
                {["productivity", "analytics", "crm", "email", "seo"].map((niche) => (
                  <button
                    key={niche}
                    onClick={() => {
                      setQuery(niche);
                      triggerScan(niche);
                    }}
                    className="px-2.5 py-1 rounded-md glass-card text-[10px] font-mono uppercase tracking-wider text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all"
                    data-testid={`button-niche-${niche}`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("calendar");
                  triggerScan("calendar");
                }}
                className="rounded-md font-mono text-[10px] uppercase tracking-wider"
                data-testid="button-sample-scan"
              >
                <Zap className="w-3 h-3 mr-1.5" />
                DEMO SCAN
              </Button>
              <Link to="/watchlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-md font-mono text-[10px] uppercase tracking-wider"
                  data-testid="button-view-watchlist"
                >
                  <Eye className="w-3 h-3 mr-1.5" />
                  WATCHLIST
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter/Sort Controls - Terminal styling */}
      {assets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px] h-9 rounded-md border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-wider" data-testid="select-sort">
                <ArrowUpDown className="w-3 h-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="SORT" />
              </SelectTrigger>
              <SelectContent className="rounded-md glass-terminal font-mono text-xs">
                <SelectItem value="distress_desc">DISTRESS (HIGH)</SelectItem>
                <SelectItem value="mrr_desc">MRR (HIGH)</SelectItem>
                <SelectItem value="users_desc">USERS (HIGH)</SelectItem>
                <SelectItem value="name_asc">NAME (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[120px] h-9 rounded-md border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-wider" data-testid="select-status">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-md glass-terminal font-mono text-xs">
                <SelectItem value="all">ALL</SelectItem>
                <SelectItem value="for_sale">FOR SALE</SelectItem>
                <SelectItem value="distressed">DISTRESSED</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter Toggle */}
            <Button 
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 rounded-md font-mono text-[10px] uppercase tracking-wider"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-3 h-3 mr-2" />
              FILTERS
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary font-mono text-[9px]">
                  {marketplaceFilters.length + (minDistressScore > 0 ? 1 : 0) + (minMrr > 0 ? 1 : 0) + (minUsers > 0 ? 1 : 0)}
                </Badge>
              )}
            </Button>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-9 rounded-md font-mono text-[10px] uppercase tracking-wider"
                data-testid="button-clear-filters"
              >
                <X className="w-3 h-3 mr-1" />
                CLEAR
              </Button>
            )}
            
            {/* Results Count */}
            <div className="ml-auto text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {filteredAssets.length}/{assets.length} ASSETS
            </div>
          </div>
          
          {/* Expanded Filter Panel - Terminal styling */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-terminal rounded-lg p-4 space-y-4">
                  {/* Marketplace Filters */}
                  <div>
                    <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">MARKETPLACES</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_MARKETPLACES.map(marketplace => (
                        <Badge 
                          key={marketplace}
                          variant={marketplaceFilters.includes(marketplace) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors font-mono text-[9px] rounded-md ${marketplaceFilters.includes(marketplace) ? "" : "hover:bg-white/5"}`}
                          onClick={() => toggleMarketplaceFilter(marketplace)}
                          data-testid={`filter-marketplace-${marketplace}`}
                        >
                          {TYPE_LABELS[marketplace] || marketplace}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Numeric Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Min Distress Score */}
                    <div>
                      <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                        MIN DISTRESS: {minDistressScore}
                      </Label>
                      <Slider
                        value={[minDistressScore]}
                        onValueChange={(v) => setMinDistressScore(v[0])}
                        max={100}
                        step={10}
                        className="w-full"
                        data-testid="slider-distress"
                      />
                    </div>
                    
                    {/* Min MRR */}
                    <div>
                      <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                        MIN MRR: ${minMrr.toLocaleString()}
                      </Label>
                      <Slider
                        value={[minMrr]}
                        onValueChange={(v) => setMinMrr(v[0])}
                        max={10000}
                        step={100}
                        className="w-full"
                        data-testid="slider-mrr"
                      />
                    </div>
                    
                    {/* Min Users */}
                    <div>
                      <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                        MIN USERS: {minUsers.toLocaleString()}
                      </Label>
                      <Slider
                        value={[minUsers]}
                        onValueChange={(v) => setMinUsers(v[0])}
                        max={100000}
                        step={1000}
                        className="w-full"
                        data-testid="slider-users"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5">
              {marketplaceFilters.map(m => (
                <Badge 
                  key={m} 
                  variant="secondary" 
                  className="cursor-pointer gap-1 font-mono text-[9px] uppercase rounded-md"
                  onClick={() => toggleMarketplaceFilter(m)}
                >
                  {TYPE_LABELS[m] || m}
                  <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
              {statusFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer gap-1 font-mono text-[9px] uppercase rounded-md"
                  onClick={() => setStatusFilter('all')}
                >
                  {statusFilter === 'for_sale' ? 'FOR SALE' : 'DISTRESSED'}
                  <X className="w-2.5 h-2.5" />
                </Badge>
              )}
              {minDistressScore > 0 && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer gap-1 font-mono text-[9px] uppercase rounded-md"
                  onClick={() => setMinDistressScore(0)}
                >
                  DIST {minDistressScore}+
                  <X className="w-2.5 h-2.5" />
                </Badge>
              )}
              {minMrr > 0 && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer gap-1 font-mono text-[9px] uppercase rounded-md"
                  onClick={() => setMinMrr(0)}
                >
                  MRR ${minMrr.toLocaleString()}+
                  <X className="w-2.5 h-2.5" />
                </Badge>
              )}
              {minUsers > 0 && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer gap-1 font-mono text-[9px] uppercase rounded-md"
                  onClick={() => setMinUsers(0)}
                >
                  USERS {minUsers.toLocaleString()}+
                  <X className="w-2.5 h-2.5" />
                </Badge>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Zero State - Terminal styling */}
      {assets.length > 0 && filteredAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/5 border border-white/10 mb-3">
            <Filter className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold font-mono uppercase mb-1">NO MATCHES</h3>
          <p className="text-xs text-muted-foreground mb-3">Adjust filter criteria</p>
          <Button variant="outline" size="sm" className="rounded-md font-mono text-[10px] uppercase tracking-wider" onClick={clearAllFilters} data-testid="button-clear-filters-empty">
            <X className="w-3 h-3 mr-1" />
            CLEAR FILTERS
          </Button>
        </motion.div>
      )}

      {/* Results Grid - Alpha Feed */}
      <AnimatePresence>
        {filteredAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.015 }}
              >
                {/* Terminal Asset Card with glassmorphism */}
                <div 
                  className={`p-4 h-full flex flex-col glass-card rounded-lg cursor-pointer hover:border-primary/40 transition-all ${!isPro ? 'relative overflow-hidden' : ''}`}
                  onClick={() => handleAnalyze(asset)}
                  data-testid={`card-asset-${index}`}
                >
                  {/* Blur overlay for non-premium users on select cards */}
                  {!isPro && index >= 3 && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/40 z-10 flex items-center justify-center rounded-lg">
                      <div className="text-center p-4">
                        <Lock className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="text-xs font-mono text-muted-foreground">UNLOCK FULL ACCESS</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-primary uppercase tracking-widest font-mono">
                        {TYPE_LABELS[asset._marketplaceKey] || asset._marketplaceKey}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/15 text-primary font-mono">
                        {asset._distressScore}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary font-mono shrink-0">
                      ${asset.mrr_potential.toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-sm text-foreground mb-1.5 line-clamp-1">
                    {(isAuthenticated || isPro) ? cleanAssetName(asset.name) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        {getAssetDisplayName(asset, isPro, index)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{sanitizeDescription(asset.description, asset.name, isAuthenticated || isPro)}</p>
                  
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-mono">{asset.user_count.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-mono ${asset.status === "for_sale" ? "text-primary" : "text-muted-foreground"}`}>
                      {asset.status === "for_sale" ? "FOR SALE" : "DISTRESSED"}
                    </span>
                  </div>

                  <div className="bg-primary/5 border border-primary/15 rounded px-2 py-1.5 mb-2">
                    <p className="text-primary text-[10px] font-mono line-clamp-1">{asset.details}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                    {(isAuthenticated || isPro) ? (
                      <a 
                        href={asset.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 font-mono"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        VIEW
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                    <Button size="sm" variant="ghost" className="text-[10px] font-mono h-7 px-2">
                      ANALYZE <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Drawer */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[hsl(var(--panel))] max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-end p-2 border-b border-[hsl(var(--border))]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedAsset(null)}
                  className="text-[hsl(var(--panel-foreground))]/60 hover:text-[hsl(var(--panel-foreground))]"
                >
                  <span className="text-xl">&times;</span>
                </Button>
              </div>

              <div className="max-h-[calc(85vh-48px)] overflow-y-auto">
                {analyzeMutation.isPending ? (
                  <div className="p-6">
                    <AnalysisInterstitial 
                      assetName={selectedAsset.name}
                      marketplace={selectedAsset.marketplace}
                    />
                  </div>
                ) : analysis ? (
                  <>
                    {/* Mobile: Use accordion-based layout */}
                    <div className="md:hidden">
                      <AssetDetailMobile
                        asset={selectedAsset}
                        analysis={analysis}
                        isPro={isPro}
                        hunterIntel={hunterIntel}
                        isLoadingIntel={isLoadingIntel}
                        onUpgrade={handleUpgradeClick}
                        onAddToWatchlist={() => {
                          const existingEmail = localStorage.getItem('userEmail');
                          if (!existingEmail && !isPro) {
                            setShowLeadCapture(true);
                            toast({ 
                              title: "Sign up to save", 
                              description: "Enter your email to save assets to your watchlist." 
                            });
                            return;
                          }
                          toast({ 
                            title: "Added to Watchlist", 
                            description: `${isPro ? selectedAsset.name : 'Asset'} has been added to your watchlist.` 
                          });
                        }}
                        onDownloadDossier={() => {
                          const dossier = {
                            asset: {
                              name: selectedAsset.name,
                              type: selectedAsset.type,
                              url: selectedAsset.url,
                              users: selectedAsset.user_count,
                              mrr_potential: selectedAsset.mrr_potential,
                            },
                            analysis: {
                              valuation: analysis.valuation,
                              potential_mrr: analysis.potential_mrr,
                              strategy: analysis.the_play,
                              owner_contact: analysis.verified_email || analysis.owner_contact,
                              negotiation_script: analysis.negotiation_script,
                              cold_email: analysis.cold_email,
                            },
                            generated: new Date().toISOString(),
                          };
                          const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `deal-dossier-${selectedAsset.name.slice(0, 30).replace(/\s+/g, '-')}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast({ title: "Deal Dossier downloaded", description: "Use this for your acquisition due diligence" });
                        }}
                      />
                    </div>
                    {/* Desktop: Use tabbed layout */}
                    <div className="hidden md:block">
                      <AssetDetailPanel
                        asset={selectedAsset}
                        analysis={analysis}
                        isPro={isPro}
                        hunterIntelProp={hunterIntel}
                        isLoadingIntelProp={isLoadingIntel}
                        onUpgrade={handleUpgradeClick}
                        onAddToWatchlist={() => {
                          const existingEmail = localStorage.getItem('userEmail');
                          if (!existingEmail && !isPro) {
                            setShowLeadCapture(true);
                            toast({ 
                              title: "Sign up to save", 
                              description: "Enter your email to save assets to your watchlist." 
                            });
                            return;
                          }
                          toast({ 
                            title: "Added to Watchlist", 
                            description: `${isPro ? selectedAsset.name : 'Asset'} has been added to your watchlist.` 
                          });
                        }}
                        onDownloadDossier={() => {
                          const dossier = {
                            asset: {
                              name: selectedAsset.name,
                              type: selectedAsset.type,
                              url: selectedAsset.url,
                              users: selectedAsset.user_count,
                              mrr_potential: selectedAsset.mrr_potential,
                            },
                            analysis: {
                              valuation: analysis.valuation,
                              potential_mrr: analysis.potential_mrr,
                              strategy: analysis.the_play,
                              owner_contact: analysis.verified_email || analysis.owner_contact,
                              negotiation_script: analysis.negotiation_script,
                              cold_email: analysis.cold_email,
                            },
                            generated: new Date().toISOString(),
                          };
                          const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `deal-dossier-${selectedAsset.name.slice(0, 30).replace(/\s+/g, '-')}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast({ title: "Deal Dossier downloaded", description: "Use this for your acquisition due diligence" });
                        }}
                        isUpgrading={checkoutMutation.isPending}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Prompt Dialog for Checkout */}
      <Dialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your email to continue</DialogTitle>
            <DialogDescription>
              We need your email to create your account and send you access details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmitForCheckout} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={checkoutEmail}
              onChange={(e) => setCheckoutEmail(e.target.value)}
              className="h-11"
              required
              data-testid="input-checkout-email"
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEmailPrompt(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={checkoutMutation.isPending || !checkoutEmail.includes("@")}
                data-testid="button-checkout-submit"
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Continue to Checkout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Dialog for returning subscribers */}
      <Dialog open={showProLoginPrompt} onOpenChange={setShowProLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
            <DialogDescription>
              Enter the email you used to subscribe to unlock your features.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your subscription email"
              value={proLoginEmail}
              onChange={(e) => setProLoginEmail(e.target.value)}
              className="h-11"
              required
              data-testid="input-pro-login-email"
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowProLoginPrompt(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!proLoginEmail.includes("@")}
                data-testid="button-pro-login-submit"
              >
                <Zap className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Newsletter - Clean Dark Section */}
      <div className="relative mt-20 py-20 mx-4">
        {/* Dark terminal background */}
        <div className="absolute inset-0 bg-[hsl(var(--panel))]" />
        
        <div className="relative text-center space-y-6 max-w-xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold text-[hsl(var(--panel-foreground))]"
          >
            Off-market deals. Weekly.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[hsl(var(--panel-foreground))]/60"
          >
            Distressed assets before they hit public listings.
          </motion.p>
          
          {newsletterSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground font-medium">You're on the list.</p>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleNewsletterSubmit} 
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 h-12 rounded-xl"
                  required
                  data-testid="input-newsletter-email"
                />
              </div>
              <Button 
                type="submit"
                disabled={newsletterMutation.isPending}
                className="h-12 px-8 rounded-xl bg-primary text-primary-foreground"
                data-testid="button-newsletter-submit"
              >
                {newsletterMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </motion.form>
          )}
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xs text-slate-500"
          >
            2,400+ hunters. Free forever.
          </motion.p>
        </div>
      </div>

      {/* Pricing Section - Stunning Glassmorphism */}
      <div className="relative mt-20 mb-12 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Access Levels</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Unlock the off-market</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Scout Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            whileHover={{ y: -3 }}
            className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
          >
            <div className="relative mb-6">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Scout</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$29</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Perfect for solo hunters</p>
            </div>
            <ul className="relative space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground">10 scans per month</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground">12 marketplaces</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground">Distress scoring</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground">Basic valuation</span>
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="relative w-full h-12 rounded-xl" 
              onClick={() => handleUpgradeClick('scout')}
              disabled={checkoutMutation.isPending}
              data-testid="button-tier-scout"
            >
              {checkoutMutation.isPending && selectedTier === 'scout' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Get Scout
            </Button>
          </motion.div>

          {/* Hunter Tier - Featured */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative p-8 rounded-2xl bg-primary/5 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 md:-mt-4 md:mb-4"
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                Most Popular
              </div>
            </div>
            <div className="relative mb-6">
              <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Hunter</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$99</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">For serious acquirers</p>
            </div>
            <ul className="relative space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground font-medium">Unlimited scans</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground font-medium">All 14 marketplaces</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Owner contact info</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Cold email + deal dossiers</span>
              </li>
            </ul>
            <Button 
              className="relative w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold" 
              onClick={() => handleUpgradeClick('hunter')} 
              disabled={checkoutMutation.isPending}
              data-testid="button-tier-hunter"
            >
              {checkoutMutation.isPending && selectedTier === 'hunter' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Get Hunter
            </Button>
          </motion.div>

          {/* Syndicate Tier - Enterprise */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3 }}
            className="group relative p-8 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300"
          >
            {/* Enterprise badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                Enterprise
              </div>
            </div>
            <div className="relative mb-6">
              <p className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Syndicate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$249</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">For PE firms and serial acquirers</p>
            </div>
            <ul className="relative space-y-2.5 mb-8 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-foreground font-medium">Everything in Hunter</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">3 team seats included</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">AssetHunter.io API</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">Priority deal alerts (SMS)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">White-label deal reports</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">Dedicated account manager</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <span className="text-muted-foreground">Custom marketplace alerts</span>
              </li>
            </ul>
            <Button 
              variant="outline"
              className="relative w-full h-12 rounded-xl font-semibold" 
              onClick={() => handleUpgradeClick('syndicate')}
              disabled={checkoutMutation.isPending}
              data-testid="button-tier-syndicate"
            >
              {checkoutMutation.isPending && selectedTier === 'syndicate' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Get Syndicate
            </Button>
          </motion.div>
        </div>
        
        {/* Bottom tagline */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          One acquisition pays for years of access.
        </motion.p>
      </div>

      {/* Lead Capture Modal - Gate for Save to Watchlist */}
      <Dialog open={showLeadCapture} onOpenChange={setShowLeadCapture}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Save This Opportunity
            </DialogTitle>
            <DialogDescription>
              Create your free account to save assets to your watchlist and track acquisition opportunities.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeadCaptureSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="lead-email">Email Address</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="you@example.com"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="mt-1"
                data-testid="input-lead-capture-email"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              You'll also receive our free weekly deal digest. Unsubscribe anytime.
            </div>
            <DialogFooter className="gap-2">
              <Button 
                type="submit"
                disabled={!leadEmail.includes("@") || newsletterMutation.isPending}
                className="w-full"
                data-testid="button-lead-capture-submit"
              >
                {newsletterMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Create Free Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
