import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Target, 
  ArrowRight, 
  Loader2, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiGooglechrome, SiShopify, SiWordpress } from "react-icons/si";
import { AssetDetailPanel } from "@/components/AssetDetailPanel";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { AnalysisInterstitial } from "@/components/AnalysisInterstitial";

const DEMO_ASSETS = [
  {
    id: "demo-1",
    name: "ProductivityPro Tab",
    type: "chrome_extension",
    marketplace: "Chrome Web Store",
    url: "https://chrome.google.com/webstore/detail/productivitypro-tab",
    description: "A new tab extension that helps users stay focused with task management, quick links, and productivity tracking. Features a clean interface with customizable widgets.",
    user_count: 47200,
    last_update: "24 months ago",
    status: "distressed",
    mrr_potential: 4720,
    revenue: "$0",
    details: "No premium tier, pure ad-supported model",
    icon: SiGooglechrome,
    iconColor: "text-blue-500",
  },
  {
    id: "demo-2",
    name: "ShipFast Notify",
    type: "shopify_app",
    marketplace: "Shopify App Store",
    url: "https://apps.shopify.com/shipfast-notify",
    description: "Automated shipping notification app that sends SMS and email updates to customers. Includes tracking page integration and branded communications.",
    user_count: 12800,
    last_update: "18 months ago",
    status: "distressed",
    mrr_potential: 2560,
    revenue: "$9.99/mo",
    details: "Built-in Shopify billing, recurring revenue model",
    icon: SiShopify,
    iconColor: "text-green-500",
  },
  {
    id: "demo-3",
    name: "WP Speed Boost",
    type: "wordpress_plugin",
    marketplace: "WordPress.org",
    url: "https://wordpress.org/plugins/wp-speed-boost",
    description: "Performance optimization plugin with caching, image optimization, and lazy loading. Improves Core Web Vitals and page speed scores significantly.",
    user_count: 89000,
    last_update: "30 months ago",
    status: "distressed",
    mrr_potential: 3630,
    revenue: "$0",
    details: "No premium tier, massive user base",
    icon: SiWordpress,
    iconColor: "text-blue-600",
  }
];

const DEMO_ANALYSES: Record<string, any> = {
  "demo-1": {
    valuation: "$100,000 - $170,000",
    potential_mrr: "$4,720/mo",
    the_play: "**Quick Wins (30 Days)**\n- Add premium tier at $4.99/mo with advanced features\n- Fix critical bugs and update to Manifest V3\n- Improve store listing with better screenshots\n\n**Growth Levers (90 Days)**\n- Launch referral program for power users\n- Add team/enterprise features\n- Build Chrome extension → Firefox cross-platform\n\n**De-risking**\n- Complete MV3 migration immediately\n- Reduce technical debt in codebase\n\n**Exit Horizon**\n- 12-18 months to 4-5x with proper monetization",
    cold_email: "Subject: Question about ProductivityPro Tab\n\nHi,\n\nI came across ProductivityPro Tab and really like what you've built. I run a small portfolio of browser extensions and was wondering if you'd be open to chatting about its future.\n\nWould you be interested in a quick call this week?\n\nBest,\n[Your name]",
    negotiation_script: "Open at 2x ARR potential ($113k), willing to go up to 3.5x ($200k) for clean codebase and smooth transition. Focus on taking maintenance burden off their plate.",
    manifest_v2_risk: "HIGH - Extension uses Manifest V2 which Google is deprecating. Migration required.",
    performance_score: 72,
  },
  "demo-2": {
    valuation: "$55,000 - $90,000",
    potential_mrr: "$2,560/mo",
    the_play: "**Quick Wins (30 Days)**\n- Respond to pending support tickets\n- Update app listing with fresh screenshots\n- Add usage-based pricing tier\n\n**Growth Levers (90 Days)**\n- Expand SMS to international markets\n- Add post-purchase survey features\n- Launch Shopify Plus tier at $49/mo\n\n**De-risking**\n- Address Shopify API deprecations\n- Improve app review response rate\n\n**Exit Horizon**\n- 12 months to 3-4x with improved metrics",
    cold_email: "Subject: Interested in ShipFast Notify\n\nHi,\n\nI'm a Shopify app developer looking to expand in the shipping/notification space. I noticed ShipFast Notify and see great potential.\n\nWould you consider discussing a potential acquisition?\n\nBest,\n[Your name]",
    negotiation_script: "This app has existing MRR, so offer 2.5x current revenue as baseline. With earnout tied to churn reduction, can go to 3x. Owner seems disengaged - emphasize relieving maintenance burden.",
    manifest_v2_risk: "LOW - Shopify apps don't have browser migration risks.",
    performance_score: 65,
  },
  "demo-3": {
    valuation: "$75,000 - $130,000",
    potential_mrr: "$3,630/mo",
    the_play: "**Quick Wins (30 Days)**\n- Launch Pro tier at $49/year with priority support\n- Update for PHP 8.x compatibility\n- Add Core Web Vitals optimization features\n\n**Growth Levers (90 Days)**\n- Partner with hosting companies for bundle deals\n- Add multisite/agency licensing\n- Create comparison landing pages vs competitors\n\n**De-risking**\n- Complete PHP 8 compatibility update\n- Improve documentation and support\n\n**Exit Horizon**\n- 12-18 months to 4x with freemium model",
    cold_email: "Subject: WP Speed Boost - acquisition inquiry\n\nHello,\n\nI run a WordPress optimization company and am very interested in WP Speed Boost. With 89k users, I see significant potential for growth.\n\nWould you be open to discussing a sale?\n\nBest,\n[Your name]",
    negotiation_script: "89k users with zero monetization is incredibly rare. Open at $50k, prepared to go to $100k. The technical debt (PHP 8) is real but fixable. Focus on 'letting go of side project that deserves more attention.'",
    manifest_v2_risk: "LOW - WordPress plugins don't have browser migration risks.",
    performance_score: 58,
  }
};

const DEMO_HUNTER_INTEL: Record<string, any> = {
  "demo-1": {
    hunterRadar: { distress: 8.7, monetizationGap: 9.2, technicalRisk: 7.1, marketPosition: 7.8, flipPotential: 8.5 },
    overallScore: 71,
    mrrPotential: { low: 2360, mid: 4720, high: 9440 },
    valuation: { low: 100000, high: 170000, multiple: "3-5x ARR" },
    marketplaceConfidence: { level: "medium", reason: "User counts accurate, revenue estimated from benchmarks" },
    risks: ["Manifest V2 deprecation requires immediate migration", "Technical debt from lack of updates", "User churn risk post-acquisition"],
    opportunities: ["Massive user base with zero monetization", "Premium tier could convert 2-3% at $5/mo", "Cross-browser expansion to Firefox/Edge"],
    isPremiumUser: true,
    thePlay: {
      quickWins: "Add premium tier at $4.99/mo, fix critical bugs, complete Manifest V3 migration",
      growthLevers: "Launch referral program, add team features, expand to Firefox/Edge",
      derisking: "Complete MV3 migration immediately, reduce technical debt, improve documentation",
      exitHorizon: "12-18 months to 4-5x multiple with proper monetization and growth"
    },
    acquisition: {
      strategy: "Position as saving their side project while you handle the MV3 migration burden. They likely don't have time to do the required technical work.",
      approach: "Direct email highlighting the MV3 deadline pressure and offering to take over maintenance",
      openingOffer: "$85,000 - $115,000",
      walkAway: "$200,000"
    },
    coldEmail: {
      subject: "Question about ProductivityPro Tab",
      body: "Hi,\n\nI came across ProductivityPro Tab and really like what you've built. I noticed it hasn't been updated in a while and with Chrome's Manifest V3 deadline approaching, I imagine the migration work might be daunting.\n\nI run a small portfolio of browser extensions and would love to chat about potentially taking over development. Would you be open to a quick call?\n\nBest,\n[Your name]"
    },
    ownerIntel: {
      likelyMotivation: "Side project fatigue, MV3 migration burden, opportunity cost of maintaining vs building new projects",
      bestTimeToReach: "Weekday mornings, when thinking about technical debt",
      negotiationLeverage: ["MV3 deadline pressure", "No time for maintenance", "Unlocked value they can't capture"]
    }
  },
  "demo-2": {
    hunterRadar: { distress: 7.2, monetizationGap: 6.4, technicalRisk: 4.2, marketPosition: 6.5, flipPotential: 7.8 },
    overallScore: 68,
    mrrPotential: { low: 1280, mid: 2560, high: 5120 },
    valuation: { low: 55000, high: 90000, multiple: "3-5x ARR" },
    marketplaceConfidence: { level: "high", reason: "Pricing publicly visible, install counts accurate" },
    risks: ["Support backlog creating negative reviews", "Shopify API changes may require updates", "Competition in shipping notification space"],
    opportunities: ["Already has recurring revenue model", "Built-in Shopify billing simplifies monetization", "Email list potential for upsells"],
    isPremiumUser: true,
    thePlay: {
      quickWins: "Clear support backlog, respond to negative reviews, update app listing",
      growthLevers: "Add Shopify Plus tier at $49/mo, expand SMS to international, add post-purchase surveys",
      derisking: "Address pending Shopify API deprecations, improve review response rate",
      exitHorizon: "12 months to 3-4x with improved churn and upsells"
    },
    acquisition: {
      strategy: "This app already generates MRR but owner is disengaged. Emphasize relieving the support burden while preserving their creation.",
      approach: "Professional outreach highlighting your experience with Shopify apps",
      openingOffer: "$45,000 - $60,000",
      walkAway: "$100,000"
    },
    coldEmail: {
      subject: "Interested in ShipFast Notify",
      body: "Hi,\n\nI'm a Shopify app developer looking to expand my portfolio in the shipping and notifications space. I came across ShipFast Notify and really like the product.\n\nI noticed there are some support requests pending - I imagine it's tough to balance when you have other priorities. Would you be interested in chatting about a potential acquisition?\n\nBest,\n[Your name]"
    },
    ownerIntel: {
      likelyMotivation: "Support burden, moved on to new projects, opportunity cost",
      bestTimeToReach: "After business hours when they're catching up on side project tasks",
      negotiationLeverage: ["Support backlog stress", "Existing MRR makes valuation clear", "Clean exit for them"]
    }
  },
  "demo-3": {
    hunterRadar: { distress: 9.1, monetizationGap: 9.8, technicalRisk: 5.5, marketPosition: 8.2, flipPotential: 8.9 },
    overallScore: 81,
    mrrPotential: { low: 1815, mid: 3630, high: 7260 },
    valuation: { low: 75000, high: 130000, multiple: "3-5x ARR" },
    marketplaceConfidence: { level: "medium", reason: "Install counts accurate, freemium revenue estimated" },
    risks: ["PHP 8 compatibility work required", "No existing revenue infrastructure", "WordPress ecosystem changes"],
    opportunities: ["89k users with zero monetization - massive gap", "Category leader in performance space", "Enterprise/agency licensing potential"],
    isPremiumUser: true,
    thePlay: {
      quickWins: "Launch Pro tier at $49/year, update PHP 8 compatibility, add Core Web Vitals features",
      growthLevers: "Partner with hosting companies, add agency/multisite licensing, SEO comparison pages",
      derisking: "Complete PHP 8 update, improve documentation, build support knowledge base",
      exitHorizon: "12-18 months to 4x with freemium model execution"
    },
    acquisition: {
      strategy: "89k users with zero monetization is rare. Focus on unlocking value they've built but haven't captured. Offer to 'take their baby to the next level.'",
      approach: "Respectful approach acknowledging their work and community contribution",
      openingOffer: "$50,000 - $75,000",
      walkAway: "$150,000"
    },
    coldEmail: {
      subject: "WP Speed Boost - would you consider selling?",
      body: "Hello,\n\nI run a WordPress optimization company and I've been using WP Speed Boost for a while. It's a fantastic plugin and the 89k user community you've built is impressive.\n\nI noticed it hasn't been updated recently and wanted to reach out to see if you'd be interested in discussing a potential acquisition. I'd love to continue developing it and serve your existing users.\n\nWould you be open to a conversation?\n\nBest,\n[Your name]"
    },
    ownerIntel: {
      likelyMotivation: "Plugin started as learning project, grew beyond expectations, now maintenance burden",
      bestTimeToReach: "Weekend mornings when thinking about side projects",
      negotiationLeverage: ["Zero monetization = untapped potential", "PHP 8 work they don't want to do", "Community they care about being served well"]
    }
  }
};

function DemoHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <AssetHunterLogo size="md" />
              <span className="font-semibold text-lg text-foreground logo-text">AssetHunter</span>
              <Badge className="rounded-full text-xs" variant="secondary">Demo</Badge>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Link href="/app">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Demo() {
  const [searchQuery, setSearchQuery] = useState("productivity chrome extensions");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<typeof DEMO_ASSETS[0] | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setSelectedAsset(null);
    setShowAnalysis(false);
    setIsAnalyzing(false);
    
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  const handleSelectAsset = (asset: typeof DEMO_ASSETS[0]) => {
    setSelectedAsset(asset);
    setShowAnalysis(false);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysis(true);
    }, 7500);
  };

  const handleBackToResults = () => {
    setSelectedAsset(null);
    setShowAnalysis(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <DemoHeader />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {!selectedAsset && (
            <div className="text-center mb-12">
              <Badge className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 mb-4">
                <Target className="w-3 h-3 mr-2" />
                Live Demo
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                See{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Hunter Intelligence
                </span>{" "}
                in action
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Watch how we scan marketplaces, detect distress signals, and generate acquisition playbooks in real-time.
              </p>
            </div>
          )}

          {selectedAsset && showAnalysis ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={handleBackToResults} className="rounded-xl">
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to results
                </Button>
                <Badge className="rounded-full bg-primary/10 text-primary border-primary/20">
                  Demo Mode - Sample Data
                </Badge>
              </div>
              
              <AssetDetailPanel
                asset={{
                  name: selectedAsset.name,
                  type: selectedAsset.type,
                  url: selectedAsset.url,
                  user_count: selectedAsset.user_count,
                  marketplace: selectedAsset.marketplace,
                  mrr_potential: selectedAsset.mrr_potential,
                  last_update: selectedAsset.last_update,
                }}
                analysis={DEMO_ANALYSES[selectedAsset.id]}
                isPro={true}
                onUpgrade={() => {}}
                onAddToWatchlist={() => {}}
                onDownloadDossier={() => {}}
                hunterIntelProp={DEMO_HUNTER_INTEL[selectedAsset.id]}
                isLoadingIntelProp={false}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                <Button asChild className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/app">
                    Start your own scan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleBackToResults} className="flex-1 rounded-xl">
                  Back to results
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                This is sample data. Real scans analyze live marketplace data.
              </p>
            </motion.div>
          ) : selectedAsset && isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8"
            >
              <AnalysisInterstitial 
                assetName={selectedAsset.name}
                marketplace={selectedAsset.marketplace}
              />
            </motion.div>
          ) : (
            <>
              <div className="glass-card p-6 shadow-soft-xl mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm font-mono text-muted-foreground">hunter-terminal v2.1</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search any niche..."
                      className="h-12 pl-11 rounded-xl border-0 bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary"
                      data-testid="input-demo-search"
                    />
                  </div>
                  <Button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="h-12 px-8 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    data-testid="button-demo-scan"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Scan Off-Market
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <div className="text-sm text-muted-foreground font-mono space-y-2">
                        <p className="animate-pulse">Scanning Chrome Web Store...</p>
                        <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Analyzing distress signals...</p>
                        <p className="animate-pulse" style={{ animationDelay: '1s' }}>Running Hunter Intelligence...</p>
                      </div>
                    </motion.div>
                  )}

                  {scanComplete && !selectedAsset && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium text-foreground">Found 3 off-market opportunities</span>
                        </div>
                        <Badge className="rounded-full bg-accent/10 text-accent border-accent/20">
                          <div className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse" />
                          Live
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {DEMO_ASSETS.map((asset, i) => (
                          <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleSelectAsset(asset)}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/30 cursor-pointer transition-all"
                            data-testid={`card-demo-asset-${i}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                <asset.icon className={`w-6 h-6 ${asset.iconColor}`} />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{asset.name}</div>
                                <div className="text-sm text-muted-foreground">{asset.marketplace} - {asset.user_count.toLocaleString()} users</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className="rounded-full bg-orange-500/10 text-orange-600 border-orange-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Off-Market
                              </Badge>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <p className="text-center text-sm text-muted-foreground mt-6">
                        Click any asset to see full Hunter Intelligence analysis
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isScanning && !scanComplete && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Click "Scan Off-Market" to see Hunter Intelligence in action</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  This is sample data. Real scans analyze live marketplace data.
                </p>
                <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/app">
                    Start real scan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
