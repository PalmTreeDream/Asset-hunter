import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  Target,
  DollarSign,
  Users,
  Clock,
  Mail,
  FileText,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lock,
  Zap,
  ExternalLink,
  Download,
  Plus,
  Eye,
  Star,
  Globe,
  Calendar,
  Building2,
  Link2,
  BarChart3,
  Activity,
  Shield,
  Sparkles,
  Info,
  Crosshair
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { HunterRadar, type HunterRadarScores } from "@/components/HunterRadar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { DataProvenanceCard } from "@/components/DataProvenanceCard";
import { ScoringRationale } from "@/components/ScoringRationale";
import { apiRequest } from "@/lib/queryClient";

interface Analysis {
  valuation: string;
  potential_mrr: string;
  the_play: string;
  cold_email?: string;
  owner_contact?: string;
  negotiation_script?: string;
  verified_email?: string | null;
  email_status?: string;
  email_source?: string;
  email_confidence?: number | null;
  contact_form?: string | null;
  developer_website?: string | null;
  performance_score?: number | null;
  performance_metrics?: {
    fcp?: string;
    lcp?: string;
  } | null;
}

interface Asset {
  name: string;
  type: string;
  url?: string;
  user_count: number;
  mrr_potential: number;
  marketplace?: string;
  distress_signals?: string[];
  last_update?: string;
}

interface AssetDetailPanelProps {
  asset: Asset;
  analysis: Analysis;
  isPro: boolean;
  onUpgrade: (tier?: "scout" | "hunter" | "syndicate") => void;
  onAddToWatchlist: () => void;
  onDownloadDossier: () => void;
  isUpgrading?: boolean;
  hunterIntelProp?: HunterIntelligenceData | null;
  isLoadingIntelProp?: boolean;
}

function SnowflakeChart({ dimensions }: { dimensions: { label: string; value: number }[] }) {
  const centerX = 100;
  const centerY = 100;
  const radius = 65;
  const numPoints = dimensions.length;
  
  const getPoint = (index: number, value: number) => {
    const angle = (2 * Math.PI * index) / numPoints - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (2 * Math.PI * index) / numPoints - Math.PI / 2;
    const r = radius + 20;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="w-full max-w-[180px] mx-auto">
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 2" />
        <circle cx={centerX} cy={centerY} r={radius * 0.66} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx={centerX} cy={centerY} r={radius * 0.33} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
        
        {dimensions.map((_, i) => {
          const end = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={end.x}
              y2={end.y}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
            />
          );
        })}

        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          d={dimensions
            .map((d, i) => {
              const p = getPoint(i, d.value);
              return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
            })
            .join(" ") + " Z"}
          fill="url(#snowflakeGradient)"
          stroke="#eab308"
          strokeWidth="2"
        />
        
        <defs>
          <linearGradient id="snowflakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {dimensions.map((d, i) => {
          const point = getPoint(i, d.value);
          return (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#eab308"
            />
          );
        })}

        {dimensions.map((d, i) => {
          const labelPoint = getLabelPoint(i);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-[hsl(var(--panel-foreground))] font-medium uppercase tracking-wide"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function ValuationBar({ 
  currentPrice, 
  fairValue, 
  label 
}: { 
  currentPrice: number; 
  fairValue: number;
  label: string;
}) {
  const overvalued = currentPrice > fairValue;
  const percentDiff = Math.abs(((currentPrice - fairValue) / fairValue) * 100);
  const maxValue = Math.max(currentPrice, fairValue) * 1.1;
  
  const currentWidth = (currentPrice / maxValue) * 100;
  const fairWidth = (fairValue / maxValue) * 100;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[hsl(var(--panel-foreground))]/60">{label}</span>
        <span className={`text-sm font-mono font-medium ${overvalued ? 'viz-value-warning' : 'viz-value-positive'}`}>
          {percentDiff.toFixed(1)}% {overvalued ? 'Overvalued' : 'Undervalued'}
        </span>
      </div>
      <div className="relative h-20 bg-[hsl(var(--panel-foreground))]/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${currentWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`absolute top-2 left-0 h-7 ${overvalued ? 'bg-[hsl(var(--viz-amber))]' : 'bg-[hsl(var(--viz-blue))]'} flex items-center justify-end px-3`}
        >
          <div className="text-right">
            <div className="text-[10px] text-white/80">Current Price</div>
            <div className="text-sm font-mono font-bold text-white">${currentPrice.toLocaleString()}</div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${fairWidth}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-2 left-0 h-7 bg-[hsl(var(--viz-green))] flex items-center justify-end px-3"
        >
          <div className="text-right">
            <div className="text-[10px] text-white/80">Fair Value</div>
            <div className="text-sm font-mono font-bold text-white">${fairValue.toLocaleString()}</div>
          </div>
        </motion.div>
      </div>
      <div className="flex justify-between text-[10px] text-[hsl(var(--panel-foreground))]/40 font-mono">
        <span>$0</span>
        <span className="viz-value-positive">20% Undervalued</span>
        <span>About Right</span>
        <span className="viz-value-warning">20% Overvalued</span>
      </div>
    </div>
  );
}

function DifficultyScale({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--panel-foreground))]/60">{label}</span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gradient-to-r from-[hsl(var(--viz-green))] via-[hsl(var(--viz-amber))] to-[hsl(var(--viz-red))] w-full" />
        <motion.div 
          initial={{ left: 0 }}
          animate={{ left: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${value}%` }}
        >
          <div className="w-4 h-4 bg-[hsl(var(--panel))] border-2 border-[hsl(var(--panel-foreground))]" />
        </motion.div>
      </div>
      <div className="flex justify-between text-[10px] text-[hsl(var(--panel-foreground))]/40">
        <span>Low</span>
        <span>Average</span>
        <span>High</span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))]">
      <span className={`text-sm ${highlight ? 'text-primary' : 'text-[hsl(var(--panel-foreground))]/60'}`}>{label}</span>
      <span className={`text-sm font-mono font-medium ${highlight ? 'text-primary' : 'text-[hsl(var(--panel-foreground))]'}`}>{value}</span>
    </div>
  );
}

function SignalItem({ type, text }: { type: "reward" | "risk"; text: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {type === "reward" ? (
        <Star className="w-4 h-4 viz-value-warning mt-0.5 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 viz-value-negative mt-0.5 shrink-0" />
      )}
      <span className="text-sm text-[hsl(var(--panel-foreground))]">{text}</span>
      <ChevronRight className="w-4 h-4 text-[hsl(var(--panel-foreground))]/40 ml-auto shrink-0" />
    </div>
  );
}

interface ThePlayData {
  quickWins: string;
  growthLevers: string;
  derisking: string;
  exitHorizon: string;
}

interface HunterIntelligenceData {
  hunterRadar: HunterRadarScores;
  overallScore: number;
  mrrPotential: {
    low: number;
    mid: number;
    high: number;
  };
  valuation: {
    low: number;
    high: number;
    multiple: string;
  };
  marketplaceConfidence: {
    level: "high" | "medium" | "low";
    reason: string;
  };
  risks: string[];
  opportunities: string[];
  isPremiumUser: boolean;
  thePlay?: ThePlayData;
  acquisition?: {
    strategy: string;
    approach: string;
    openingOffer: string;
    walkAway: string;
  };
  coldEmail?: {
    subject: string;
    body: string;
  };
  ownerIntel?: {
    likelyMotivation: string;
    bestTimeToReach: string;
    negotiationLeverage: string[];
  };
}

export function AssetDetailPanel({
  asset,
  analysis,
  isPro,
  onUpgrade,
  onAddToWatchlist,
  onDownloadDossier,
  isUpgrading = false,
  hunterIntelProp,
  isLoadingIntelProp,
}: AssetDetailPanelProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [localHunterIntel, setLocalHunterIntel] = useState<HunterIntelligenceData | null>(null);
  const [localIsLoadingIntel, setLocalIsLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);
  
  // Use props if provided (even if null), otherwise use local state
  const propsProvided = hunterIntelProp !== undefined || isLoadingIntelProp !== undefined;
  const hunterIntel = propsProvided ? hunterIntelProp : localHunterIntel;
  const isLoadingIntel = propsProvided ? (isLoadingIntelProp ?? false) : localIsLoadingIntel;

  useEffect(() => {
    // Skip fetching if parent is managing state (props provided)
    if (propsProvided) return;
    
    const fetchHunterIntelligence = async () => {
      setLocalIsLoadingIntel(true);
      setIntelError(null);
      try {
        const response = await apiRequest("POST", "/api/hunter-intelligence", {
          asset_name: asset.name,
          asset_type: asset.type,
          marketplace: asset.marketplace || asset.type,
          users: asset.user_count,
          description: `${asset.name} - ${asset.type} with ${asset.user_count} users`,
          last_updated: asset.last_update,
        });
        const data = await response.json();
        setLocalHunterIntel(data);
      } catch (err: any) {
        console.error("[HunterIntelligence] Fetch error:", err);
        setIntelError("Analysis temporarily unavailable");
      } finally {
        setLocalIsLoadingIntel(false);
      }
    };

    fetchHunterIntelligence();
  }, [asset.name, asset.type, asset.user_count, asset.marketplace, asset.last_update, propsProvided]);

  const parseValuation = (val: string) => {
    const matches = val.match(/\$[\d,]+/g);
    if (matches && matches.length >= 2) {
      const low = parseInt(matches[0].replace(/[$,]/g, ''));
      const high = parseInt(matches[1].replace(/[$,]/g, ''));
      return { low, high, avg: Math.round((low + high) / 2) };
    }
    const single = val.match(/\$[\d,]+/);
    if (single) {
      const v = parseInt(single[0].replace(/[$,]/g, ''));
      return { low: v * 0.8, high: v * 1.2, avg: v };
    }
    return { low: 10000, high: 50000, avg: 30000 };
  };

  const valuation = parseValuation(analysis.valuation);
  
  const distressScore = analysis.performance_score 
    ? Math.max(0, 100 - analysis.performance_score) 
    : 65;
  
  const parseMRR = (mrr: string) => {
    const match = mrr.match(/\$[\d,]+/);
    return match ? parseInt(match[0].replace(/[$,]/g, '')) : 0;
  };
  const mrrValue = parseMRR(analysis.potential_mrr);

  const acquisitionDifficulty = asset.user_count > 50000 ? 75 : asset.user_count > 10000 ? 50 : 25;

  const snowflakeDimensions = [
    { label: "Value", value: Math.min(85, 50 + (valuation.avg / 10000)) },
    { label: "Future", value: Math.min(90, 40 + (mrrValue / 50)) },
    { label: "Past", value: distressScore > 50 ? 40 : 70 },
    { label: "Health", value: 100 - distressScore },
    { label: "Fit", value: 75 },
  ];

  const rewards = [
    mrrValue > 500 && `MRR potential of ${analysis.potential_mrr} identified`,
    asset.user_count > 5000 && `Strong user base with ${asset.user_count.toLocaleString()} users`,
    distressScore > 50 && "Owner shows signs of neglect - motivated seller likely",
    acquisitionDifficulty < 50 && "Low competition for acquisition",
  ].filter(Boolean) as string[];

  const risks = [
    distressScore > 70 && "High distress score indicates significant technical debt",
    asset.distress_signals?.includes("No updates in 12+ months") && "No updates in over a year - may require immediate fixes",
    asset.type === "chrome_extension" && "Manifest V3 migration may be required",
    acquisitionDifficulty > 60 && "Higher user count may complicate acquisition negotiations",
  ].filter(Boolean) as string[];

  const handleWatchlistClick = () => {
    onAddToWatchlist();
    setIsWatchlisted(true);
  };

  const marketplaceLabels: Record<string, string> = {
    chrome_extension: "Chrome Web Store",
    firefox_addon: "Firefox Add-ons",
    shopify_app: "Shopify App Store",
    wordpress_plugin: "WordPress.org",
    slack_app: "Slack App Directory",
    zapier_integration: "Zapier",
    saas_product: "SaaS",
    saas_forsale: "Listed For Sale",
  };

  return (
    <div className="bg-[hsl(var(--panel))] text-[hsl(var(--panel-foreground))] min-h-full">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[hsl(var(--panel-foreground))]/10 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-[hsl(var(--panel-foreground))]/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[hsl(var(--panel-foreground))] truncate" data-testid="text-asset-name">
              {asset.name}
            </h2>
            <p className="text-sm text-[hsl(var(--panel-foreground))]/60">
              {marketplaceLabels[asset.type] || asset.marketplace || asset.type}
            </p>
            <p className="text-xs text-[hsl(var(--panel-foreground))]/40 font-mono mt-1">
              Est. Value: ${valuation.avg.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm"
            onClick={handleWatchlistClick}
            disabled={isWatchlisted}
            className={isWatchlisted 
              ? "bg-primary/20 text-primary border border-primary/30" 
              : "bg-primary text-primary-foreground"
            }
            data-testid="button-add-watchlist"
          >
            {isWatchlisted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Watching
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Watchlist
              </>
            )}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-[hsl(var(--panel-foreground))]/20 text-[hsl(var(--panel-foreground))]"
            data-testid="button-view-asset"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          {isPro && (
            <Button 
              size="icon" 
              variant="outline"
              className="border-[hsl(var(--panel-foreground))]/20 text-[hsl(var(--panel-foreground))]"
              onClick={onDownloadDossier}
              data-testid="button-download-dossier"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-[hsl(var(--border))] p-0 h-auto">
          {["Overview", "Hunter Intel", "Valuation", "Signals", "Strategy", "Contact"].map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab.toLowerCase()}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-[hsl(var(--panel-foreground))] text-[hsl(var(--panel-foreground))]/60 bg-transparent px-4 py-3 text-sm font-medium"
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 p-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Asset Overview</h3>
                {hunterIntel?.marketplaceConfidence && (
                  <ConfidenceBadge 
                    confidence={hunterIntel.marketplaceConfidence}
                  />
                )}
              </div>
              <p className="text-sm text-[hsl(var(--panel-foreground))]/60 leading-relaxed">
                A {marketplaceLabels[asset.type]?.toLowerCase() || asset.type} with {asset.user_count.toLocaleString()} users 
                showing distress signals. Estimated MRR potential of {hunterIntel ? `$${hunterIntel.mrrPotential.mid.toLocaleString()}/mo` : analysis.potential_mrr} with valuation 
                between ${hunterIntel ? hunterIntel.valuation.low.toLocaleString() : valuation.low.toLocaleString()} - ${hunterIntel ? hunterIntel.valuation.high.toLocaleString() : valuation.high.toLocaleString()}.
              </p>
              <button className="text-primary text-sm flex items-center gap-1 mt-2">
                More details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full md:w-auto flex flex-col items-center">
              {isLoadingIntel ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : hunterIntel?.hunterRadar ? (
                <>
                  <HunterRadar 
                    scores={hunterIntel.hunterRadar} 
                    size="md" 
                    showLabels={true}
                    showValues={false}
                    animated={true}
                  />
                  <p className="text-center text-xs text-[hsl(var(--panel-foreground))]/60 mt-2">
                    Hunter Radar
                  </p>
                  <p className="text-center text-[10px] text-[hsl(var(--panel-foreground))]/40">
                    Score: {hunterIntel.overallScore}/100
                  </p>
                </>
              ) : (
                <>
                  <SnowflakeChart dimensions={snowflakeDimensions} />
                  <p className="text-center text-xs text-[hsl(var(--panel-foreground))]/60 mt-2">
                    Snowflake Analysis
                  </p>
                  <p className="text-center text-[10px] text-[hsl(var(--panel-foreground))]/40">
                    {distressScore > 50 ? "Distressed asset with acquisition potential" : "Stable asset with growth opportunity"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-[hsl(var(--border))]">
            <div className="bg-[hsl(var(--panel))] p-4 text-center">
              <p className="text-[10px] text-[hsl(var(--panel-foreground))]/40 uppercase tracking-wider">Founded</p>
              <p className="text-sm font-mono font-medium text-[hsl(var(--panel-foreground))]">Unknown</p>
            </div>
            <div className="bg-[hsl(var(--panel))] p-4 text-center">
              <p className="text-[10px] text-[hsl(var(--panel-foreground))]/40 uppercase tracking-wider">Users</p>
              <p className="text-sm font-mono font-medium text-[hsl(var(--panel-foreground))]">{asset.user_count.toLocaleString()}</p>
            </div>
            <div className="bg-[hsl(var(--panel))] p-4 text-center">
              <p className="text-[10px] text-[hsl(var(--panel-foreground))]/40 uppercase tracking-wider">MRR Est.</p>
              <p className="text-sm font-mono font-medium text-[hsl(var(--panel-foreground))]">{analysis.potential_mrr}</p>
            </div>
          </div>

          {asset.url && (
            <a 
              href={asset.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-primary text-sm"
            >
              <Link2 className="w-4 h-4" />
              View Original Listing
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </TabsContent>

        <TabsContent value="hunter intel" className="mt-0 p-4 space-y-6">
          {isLoadingIntel ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60">Hunter Intelligence analyzing...</p>
              </div>
            </div>
          ) : intelError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-[hsl(var(--viz-amber))] mx-auto" />
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60">{intelError}</p>
              </div>
            </div>
          ) : hunterIntel ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Crosshair className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Hunter Intelligence Report</h3>
                <ConfidenceBadge 
                  confidence={hunterIntel.marketplaceConfidence}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Hunter Radar Scores
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Distress</span>
                        <span className="font-mono">{hunterIntel.hunterRadar.distress}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Monetization</span>
                        <span className="font-mono">{hunterIntel.hunterRadar.monetizationGap}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Tech Risk</span>
                        <span className="font-mono">{hunterIntel.hunterRadar.technicalRisk}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Market Position</span>
                        <span className="font-mono">{hunterIntel.hunterRadar.marketPosition}/10</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Flip Potential</span>
                        <span className="font-mono">{hunterIntel.hunterRadar.flipPotential}/10</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[hsl(var(--border))]">
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-medium">Overall Score</span>
                        <span className="text-xl font-mono font-bold text-primary">{hunterIntel.overallScore}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[hsl(var(--viz-green))]" />
                      MRR Potential
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] text-[hsl(var(--panel-foreground))]/40 uppercase">Low</p>
                        <p className="font-mono text-sm">${hunterIntel.mrrPotential.low.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-primary/10 py-1 -my-1">
                        <p className="text-[10px] text-primary uppercase">Expected</p>
                        <p className="font-mono text-sm font-bold text-primary">${hunterIntel.mrrPotential.mid.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-[hsl(var(--panel-foreground))]/40 uppercase">High</p>
                        <p className="font-mono text-sm">${hunterIntel.mrrPotential.high.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[hsl(var(--border))]">
                      <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Valuation Range</span>
                        <span className="font-mono">${hunterIntel.valuation.low.toLocaleString()} - ${hunterIntel.valuation.high.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-[hsl(var(--panel-foreground))]/60">Multiple</span>
                        <span className="font-mono">{hunterIntel.valuation.multiple}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                      <Star className="w-4 h-4 viz-value-warning" />
                      Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {hunterIntel.opportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--panel-foreground))]/80">
                          <CheckCircle className="w-4 h-4 viz-value-positive mt-0.5 shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 viz-value-negative" />
                      Risks
                    </h4>
                    <ul className="space-y-2">
                      {hunterIntel.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--panel-foreground))]/80">
                          <AlertCircle className="w-4 h-4 viz-value-warning mt-0.5 shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Provenance - Strategic Transparency */}
              <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                <DataProvenanceCard
                  marketplace={marketplaceLabels[asset.type] || asset.type}
                  userCount={asset.user_count}
                  rating={4.2}
                  reviewCount={Math.floor(asset.user_count / 50)}
                  lastUpdated={asset.last_update}
                  pricingVisible={asset.type === "shopify_app"}
                  manifestVersion={asset.type === "chrome_extension" ? "V2" : undefined}
                />
              </div>

              {/* Scoring Rationale */}
              <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
                <ScoringRationale
                  scores={hunterIntel.hunterRadar}
                  marketplace={marketplaceLabels[asset.type] || asset.type}
                  userCount={asset.user_count}
                  lastUpdated={asset.last_update}
                  manifestVersion={asset.type === "chrome_extension" ? "V2" : undefined}
                  rating={4.2}
                />
              </div>

              {hunterIntel.isPremiumUser && hunterIntel.acquisition?.strategy && !hunterIntel.acquisition.strategy.includes("[Locked]") ? (
                <div className="space-y-4 mt-6 border-t border-[hsl(var(--border))] pt-6">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Acquisition Playbook
                  </h4>
                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-4">
                    <div>
                      <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Strategy</p>
                      <p className="text-sm text-[hsl(var(--panel-foreground))]">{hunterIntel.acquisition.strategy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Approach</p>
                      <p className="text-sm text-[hsl(var(--panel-foreground))]">{hunterIntel.acquisition.approach}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Opening Offer</p>
                        <p className="text-sm font-mono text-[hsl(var(--viz-green))]">{hunterIntel.acquisition.openingOffer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Walk Away</p>
                        <p className="text-sm font-mono text-[hsl(var(--viz-red))]">{hunterIntel.acquisition.walkAway}</p>
                      </div>
                    </div>
                  </div>

                  {hunterIntel.coldEmail && (
                    <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
                      <h5 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Outreach Template
                      </h5>
                      <div className="bg-[hsl(var(--panel))] p-3 text-sm space-y-2 border border-[hsl(var(--border))]">
                        <p className="font-medium text-[hsl(var(--panel-foreground))]">Subject: {hunterIntel.coldEmail.subject}</p>
                        <div className="text-[hsl(var(--panel-foreground))]/80 whitespace-pre-wrap">{hunterIntel.coldEmail.body}</div>
                      </div>
                    </div>
                  )}
                  
                  {hunterIntel.thePlay && (
                    <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-4">
                      <h5 className="text-sm font-semibold text-[hsl(var(--panel-foreground))] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 viz-value-warning" />
                        Value Creation Playbook
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Quick Wins (30 Days)</p>
                          <p className="text-sm text-[hsl(var(--panel-foreground))]">{hunterIntel.thePlay.quickWins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Growth Levers (90 Days)</p>
                          <p className="text-sm text-[hsl(var(--panel-foreground))]">{hunterIntel.thePlay.growthLevers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">De-risking Actions</p>
                          <p className="text-sm text-[hsl(var(--panel-foreground))]">{hunterIntel.thePlay.derisking}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[hsl(var(--panel-foreground))]/40 uppercase mb-1">Exit Horizon</p>
                          <p className="text-sm text-[hsl(var(--viz-green))]">{hunterIntel.thePlay.exitHorizon}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 border-t border-[hsl(var(--border))] pt-6">
                  <div className="bg-[hsl(var(--panel-foreground))]/5 p-6 text-center space-y-4">
                    <Lock className="w-8 h-8 text-[hsl(var(--panel-foreground))]/40 mx-auto" />
                    <div>
                      <h4 className="font-semibold text-[hsl(var(--panel-foreground))]">Deal Readiness Kit Locked</h4>
                      <p className="text-sm text-[hsl(var(--panel-foreground))]/60 mt-1">
                        Upgrade to Hunter or Syndicate to unlock outreach templates, value creation playbooks, and negotiation frameworks.
                      </p>
                    </div>
                    <Button onClick={() => onUpgrade("hunter")} className="bg-primary text-primary-foreground">
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to Hunter
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="valuation" className="mt-0 p-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[hsl(var(--panel-foreground))]/40 font-mono text-sm">1.1</span>
              <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Asset Valuation vs Fair Value</h3>
            </div>
            <p className="text-sm text-[hsl(var(--panel-foreground))]/60">
              What is the fair value of this asset based on user base, MRR potential, and acquisition difficulty?
            </p>
            
            <ValuationBar 
              currentPrice={valuation.high} 
              fairValue={valuation.avg} 
              label="Acquisition Cost Analysis"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[hsl(var(--panel-foreground))]/40 font-mono text-sm">1.2</span>
              <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Acquisition Difficulty</h3>
            </div>
            <p className="text-sm text-[hsl(var(--panel-foreground))]/60">
              How difficult is it to acquire this asset compared to similar opportunities?
            </p>
            
            <DifficultyScale value={acquisitionDifficulty} label="Difficulty Score" />
            
            <p className="text-sm text-[hsl(var(--panel-foreground))]/60">
              <span className="text-primary">Acquisition Difficulty:</span> This asset has a {acquisitionDifficulty < 40 ? 'low' : acquisitionDifficulty < 70 ? 'moderate' : 'high'} acquisition 
              difficulty score ({acquisitionDifficulty}%) based on user count and marketplace competition.
            </p>
          </div>

          <div className="bg-[hsl(var(--panel-foreground))]/5 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-[hsl(var(--panel-foreground))]">Key Metrics</h4>
            <MetricRow label="Estimated Value" value={`$${valuation.avg.toLocaleString()}`} highlight />
            <MetricRow label="MRR Potential" value={analysis.potential_mrr} />
            <MetricRow label="User Base" value={asset.user_count.toLocaleString()} />
            <MetricRow label="Distress Score" value={`${distressScore}%`} />
            <MetricRow label="Last Update" value={asset.last_update || "6+ months ago"} />
          </div>
        </TabsContent>

        <TabsContent value="signals" className="mt-0 p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[hsl(var(--panel-foreground))]/40 uppercase tracking-wider">Rewards</h3>
            <div className="divide-y divide-[hsl(var(--border))]">
              {rewards.length > 0 ? (
                rewards.map((reward, i) => (
                  <SignalItem key={i} type="reward" text={reward} />
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60 py-3">No significant rewards identified</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[hsl(var(--panel-foreground))]/40 uppercase tracking-wider">Risk Analysis</h3>
            <div className="divide-y divide-[hsl(var(--border))]">
              {risks.length > 0 ? (
                risks.map((risk, i) => (
                  <SignalItem key={i} type="risk" text={risk} />
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60 py-3">No significant risks identified</p>
              )}
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-[hsl(var(--panel-foreground))]/20 text-[hsl(var(--panel-foreground))]"
            data-testid="button-see-all-checks"
          >
            See All Risk Checks
          </Button>
        </TabsContent>

        <TabsContent value="strategy" className="mt-0 p-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <Sparkles className="w-4 h-4 viz-value-warning" />
              <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">The Play</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-[hsl(var(--panel-foreground))]/80 text-sm leading-relaxed">
              <ReactMarkdown>
                {analysis.the_play}
              </ReactMarkdown>
            </div>
          </div>

          {isPro ? (
            <>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Outreach Template</h3>
                </div>
                <pre className="text-xs text-[hsl(var(--panel-foreground))]/70 whitespace-pre-wrap bg-[hsl(var(--panel-foreground))]/5 p-4 font-mono leading-relaxed">
                  {analysis.cold_email || "Subject: Question about your project\n\nHi [Owner],\n\nI came across your [App Name] and wanted to reach out. Would you be open to a brief conversation about its future?"}
                </pre>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="text-lg font-semibold text-[hsl(var(--panel-foreground))]">Negotiation Framework</h3>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-[hsl(var(--panel-foreground))]/80 text-sm leading-relaxed">
                  <ReactMarkdown>
                    {analysis.negotiation_script || "Start discussions around 2-3x ARR, be prepared to justify value with growth plans. Focus on mutual benefit and clear transition plan."}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[hsl(var(--panel-foreground))]/5 p-6 text-center space-y-4">
              <Lock className="w-10 h-10 text-[hsl(var(--panel-foreground))]/40 mx-auto" />
              <div>
                <h4 className="font-semibold text-[hsl(var(--panel-foreground))]">Unlock Deal Readiness Kit</h4>
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60 mt-1">
                  Outreach templates, negotiation frameworks, and value creation playbooks are Hunter features
                </p>
              </div>
              <Button onClick={() => onUpgrade('hunter')} disabled={isUpgrading}>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Hunter
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="mt-0 p-4 space-y-6">
          {isPro ? (
            <>
              {analysis.verified_email && (
                <div className="flex items-center gap-3 p-4 bg-[hsl(var(--viz-green)/0.1)] border border-[hsl(var(--viz-green)/0.2)]">
                  <CheckCircle className="w-5 h-5 viz-value-positive shrink-0" />
                  <div className="flex-1">
                    <p className="font-mono font-medium text-[hsl(var(--panel-foreground))]">{analysis.verified_email}</p>
                    <p className="text-xs text-[hsl(var(--panel-foreground))]/60 mt-1">
                      {analysis.email_source?.replace(/_/g, " ")} 
                      {analysis.email_confidence && ` - ${analysis.email_confidence}% confidence`}
                    </p>
                  </div>
                  {analysis.email_status === "verified" && (
                    <Badge className="bg-[hsl(var(--viz-green)/0.2)] text-[hsl(var(--viz-green))] border-[hsl(var(--viz-green)/0.3)]">Verified</Badge>
                  )}
                </div>
              )}
              
              {analysis.developer_website && (
                <a 
                  href={analysis.developer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[hsl(var(--panel-foreground))]/5 hover:bg-[hsl(var(--panel-foreground))]/10 transition-colors"
                >
                  <Globe className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-[hsl(var(--panel-foreground))]">Developer Website</p>
                    <p className="text-xs text-[hsl(var(--panel-foreground))]/60 truncate">{analysis.developer_website}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[hsl(var(--panel-foreground))]/40" />
                </a>
              )}

              {analysis.contact_form && (
                <a 
                  href={analysis.contact_form}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[hsl(var(--panel-foreground))]/5 hover:bg-[hsl(var(--panel-foreground))]/10 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-[hsl(var(--panel-foreground))]">Contact Form</p>
                    <p className="text-xs text-[hsl(var(--panel-foreground))]/60">Available on developer site</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[hsl(var(--panel-foreground))]/40" />
                </a>
              )}

              {!analysis.verified_email && !analysis.developer_website && !analysis.contact_form && (
                <div className="flex items-center gap-3 p-4 bg-[hsl(var(--panel-foreground))]/5">
                  <AlertCircle className="w-5 h-5 text-[hsl(var(--panel-foreground))]/40" />
                  <p className="text-sm text-[hsl(var(--panel-foreground))]/60">No contact information found for this asset</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[hsl(var(--panel-foreground))]/5 p-6 text-center space-y-4">
              <Lock className="w-10 h-10 text-[hsl(var(--panel-foreground))]/40 mx-auto" />
              <div>
                <h4 className="font-semibold text-[hsl(var(--panel-foreground))]">Owner Contact Info</h4>
                <p className="text-sm text-[hsl(var(--panel-foreground))]/60 mt-1">
                  Verified emails and developer websites are Hunter features
                </p>
              </div>
              <Button onClick={() => onUpgrade('hunter')} disabled={isUpgrading}>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Hunter
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
