import { useState } from "react";
import { MiniHunterRadar, type HunterRadarScores } from "./HunterRadar";
import { ConfidenceBadge, MarketplaceBadge, type MarketplaceConfidence } from "./ConfidenceBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Users, AlertTriangle, Eye, DollarSign, Calendar, Target, CheckCircle, Mail, Github, Linkedin } from "lucide-react";

// Enrichment data - premium features that justify payment
export interface EnrichmentData {
  verified?: boolean; // Owner contact confirmed
  trend?: {
    direction: "up" | "down" | "stable";
    percentage: number; // e.g., 120 for +120%
  };
  githubActivity?: {
    score: number; // 0-100
  };
  contactAvailable?: {
    email?: boolean;
    linkedin?: boolean;
  };
}

export interface DealAsset {
  id: string;
  name: string;
  type: string;
  marketplace: string;
  url: string;
  description?: string;
  userCount: number;
  mrrPotential: number;
  status: "distressed" | "for_sale" | "opportunity";
  hunterRadar?: HunterRadarScores;
  confidence?: MarketplaceConfidence;
  valuation?: {
    low: number;
    high: number;
    multiple: string;
  };
  mrrRange?: {
    low: number;
    mid: number;
    high: number;
  };
  lastUpdated?: string;
  distressSignals?: string[];
  // Enrichment data (premium)
  enrichment?: EnrichmentData;
}

interface AssetCardProps {
  asset: DealAsset;
  onAnalyze?: (asset: DealAsset) => void;
  onView?: (asset: DealAsset) => void;
  isLoading?: boolean;
  isPremium?: boolean; // Gate enrichment data for non-premium users
}

function AssetCard({ asset, onAnalyze, onView, isLoading, isPremium = false }: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const defaultRadar: HunterRadarScores = {
    distress: 5,
    monetizationGap: 5,
    technicalRisk: 5,
    marketPosition: 5,
    flipPotential: 5,
  };

  const radar = asset.hunterRadar || defaultRadar;
  const confidence = asset.confidence || { level: "medium" as const, reason: "Estimated from benchmarks" };

  const statusColors = {
    distressed: "bg-viz-red/20 text-viz-red border-viz-red/30",
    for_sale: "bg-viz-green/20 text-viz-green border-viz-green/30",
    opportunity: "bg-viz-amber/20 text-viz-amber border-viz-amber/30",
  };

  const statusLabels = {
    distressed: "Distressed",
    for_sale: "For Sale",
    opportunity: "Opportunity",
  };

  return (
    <div
      className="bg-panel p-4 transition-all duration-200 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-asset-${asset.id}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <MiniHunterRadar scores={radar} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-mono font-bold text-panel-foreground truncate text-sm">
                {asset.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <MarketplaceBadge marketplace={asset.marketplace} />
                <Badge 
                  variant="outline" 
                  className={`text-xs font-mono ${statusColors[asset.status]}`}
                >
                  {statusLabels[asset.status]}
                </Badge>
                {/* Enrichment badges - premium data only */}
                {isPremium && asset.enrichment?.verified && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-mono bg-viz-green/10 text-viz-green border-viz-green/30"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {isPremium && asset.enrichment?.trend && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-mono ${
                      asset.enrichment.trend.direction === "up" 
                        ? "bg-viz-green/10 text-viz-green border-viz-green/30"
                        : asset.enrichment.trend.direction === "down"
                          ? "bg-viz-red/10 text-viz-red border-viz-red/30"
                          : "bg-panel-foreground/10 text-panel-foreground/70 border-panel-foreground/20"
                    }`}
                  >
                    {asset.enrichment.trend.direction === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : asset.enrichment.trend.direction === "down" ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {asset.enrichment.trend.direction === "up" ? "+" : asset.enrichment.trend.direction === "down" ? "-" : ""}
                    {asset.enrichment.trend.percentage}%
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-panel-foreground/50" />
              <span className="text-sm font-mono text-panel-foreground">
                {asset.userCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-viz-green" />
              <span className="text-sm font-mono text-viz-green font-bold">
                ${asset.mrrPotential.toLocaleString()}/mo
              </span>
            </div>
          </div>

          {asset.description && (
            <p className="text-xs text-panel-foreground/60 mt-2 line-clamp-2 font-mono">
              {asset.description}
            </p>
          )}
        </div>
      </div>

      <div 
        className={`absolute inset-x-0 bottom-0 bg-panel border-t border-viz-grid/30 transition-all duration-200 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-panel-foreground/5 p-2">
              <p className="text-[9px] text-panel-foreground/40 uppercase tracking-wider font-mono">Valuation</p>
              <p className="text-xs font-mono font-bold text-panel-foreground">
                {asset.valuation 
                  ? `$${Math.round((asset.valuation.low + asset.valuation.high) / 2 / 1000)}k`
                  : `$${Math.round(asset.mrrPotential * 36 / 1000)}k`
                }
              </p>
              <p className="text-[8px] text-panel-foreground/40 font-mono">
                {asset.valuation?.multiple || "3x ARR"}
              </p>
            </div>
            <div className="bg-panel-foreground/5 p-2">
              <p className="text-[9px] text-panel-foreground/40 uppercase tracking-wider font-mono">MRR Range</p>
              <p className="text-xs font-mono font-bold text-viz-green">
                ${asset.mrrRange?.mid?.toLocaleString() || asset.mrrPotential.toLocaleString()}
              </p>
              <p className="text-[8px] text-panel-foreground/40 font-mono">
                {asset.mrrRange 
                  ? `$${asset.mrrRange.low.toLocaleString()} - $${asset.mrrRange.high.toLocaleString()}`
                  : "per month"
                }
              </p>
            </div>
            <div className="bg-panel-foreground/5 p-2">
              <p className="text-[9px] text-panel-foreground/40 uppercase tracking-wider font-mono">Score</p>
              <p className={`text-xs font-mono font-bold ${
                (radar.distress + radar.flipPotential) / 2 >= 7 
                  ? "text-viz-green" 
                  : (radar.distress + radar.flipPotential) / 2 >= 5 
                    ? "text-viz-amber" 
                    : "text-viz-red"
              }`}>
                {Math.round(((radar.distress + radar.monetizationGap + (10 - radar.technicalRisk) + radar.marketPosition + radar.flipPotential) / 50) * 100)}/100
              </p>
              <p className="text-[8px] text-panel-foreground/40 font-mono">Hunter Score</p>
            </div>
          </div>

          {asset.distressSignals && asset.distressSignals.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-viz-amber font-mono">
              <AlertTriangle className="w-3 h-3" />
              <span className="truncate">{asset.distressSignals[0]}</span>
            </div>
          )}

          {/* Enrichment row - premium data only */}
          {isPremium && asset.enrichment && (asset.enrichment.contactAvailable || asset.enrichment.githubActivity) && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-viz-grid/20">
              {/* Contact availability */}
              {asset.enrichment.contactAvailable && (
                <div className="flex items-center gap-2">
                  {asset.enrichment.contactAvailable.email && (
                    <div className="flex items-center gap-1 text-[10px] text-viz-green font-mono">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </div>
                  )}
                  {asset.enrichment.contactAvailable.linkedin && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                      <Linkedin className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </div>
                  )}
                </div>
              )}
              {/* GitHub activity */}
              {asset.enrichment.githubActivity && (
                <div className="flex items-center gap-1 text-[10px] text-panel-foreground/70 font-mono">
                  <Github className="w-3 h-3" />
                  <span>Activity: {asset.enrichment.githubActivity.score}/100</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <ConfidenceBadge confidence={confidence} showTooltip={false} />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs font-mono"
              onClick={() => onView?.(asset)}
              data-testid={`button-view-${asset.id}`}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="default"
              className="text-xs font-mono"
              onClick={() => onAnalyze?.(asset)}
              disabled={isLoading}
              data-testid={`button-analyze-${asset.id}`}
            >
              {isLoading ? (
                "Analyzing..."
              ) : (
                <>
                  <Target className="w-3.5 h-3.5 mr-1" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DealFeedProps {
  assets: DealAsset[];
  onAnalyze?: (asset: DealAsset) => void;
  onView?: (asset: DealAsset) => void;
  loadingAssetId?: string | null;
  emptyMessage?: string;
  className?: string;
  isPremium?: boolean; // Gate enrichment data for non-premium users
}

export function DealFeed({
  assets,
  onAnalyze,
  onView,
  loadingAssetId,
  emptyMessage = "No assets found. Run a scan to discover opportunities.",
  className = "",
  isPremium = false,
}: DealFeedProps) {
  if (assets.length === 0) {
    return (
      <div className={`bg-panel p-8 text-center ${className}`} data-testid="deal-feed-empty">
        <AlertTriangle className="w-12 h-12 mx-auto text-panel-foreground/30 mb-4" />
        <p className="text-panel-foreground/60 font-mono text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${className}`}
      data-testid="deal-feed-grid"
    >
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onAnalyze={onAnalyze}
          onView={onView}
          isLoading={loadingAssetId === asset.id}
          isPremium={isPremium}
        />
      ))}
    </div>
  );
}

interface DealFeedStatsProps {
  totalAssets: number;
  totalMrrPotential: number;
  marketplacesScanned: number;
  className?: string;
}

export function DealFeedStats({
  totalAssets,
  totalMrrPotential,
  marketplacesScanned,
  className = "",
}: DealFeedStatsProps) {
  return (
    <div 
      className={`grid grid-cols-3 gap-4 ${className}`}
      data-testid="deal-feed-stats"
    >
      <div className="bg-panel p-4">
        <div className="text-xs font-mono text-panel-foreground/60 uppercase mb-1">
          Assets Found
        </div>
        <div className="text-2xl font-mono font-bold text-panel-foreground">
          {totalAssets}
        </div>
      </div>
      <div className="bg-panel p-4">
        <div className="text-xs font-mono text-panel-foreground/60 uppercase mb-1">
          Total MRR Potential
        </div>
        <div className="text-2xl font-mono font-bold text-viz-green">
          ${totalMrrPotential.toLocaleString()}
        </div>
      </div>
      <div className="bg-panel p-4">
        <div className="text-xs font-mono text-panel-foreground/60 uppercase mb-1">
          Marketplaces
        </div>
        <div className="text-2xl font-mono font-bold text-panel-foreground">
          {marketplacesScanned}
        </div>
      </div>
    </div>
  );
}
