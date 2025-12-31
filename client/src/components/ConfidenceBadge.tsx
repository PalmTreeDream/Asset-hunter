import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MarketplaceConfidence {
  level: "high" | "medium" | "low";
  reason: string;
}

interface ConfidenceBadgeProps {
  confidence: MarketplaceConfidence;
  showTooltip?: boolean;
  className?: string;
}

const CONFIDENCE_STYLES = {
  high: {
    variant: "default" as const,
    className: "bg-viz-green text-white border-viz-green",
    label: "High",
  },
  medium: {
    variant: "secondary" as const,
    className: "bg-viz-amber text-black border-viz-amber",
    label: "Medium",
  },
  low: {
    variant: "outline" as const,
    className: "bg-viz-gray/20 text-viz-gray border-viz-gray",
    label: "Low",
  },
};

export function ConfidenceBadge({ 
  confidence, 
  showTooltip = true,
  className = "" 
}: ConfidenceBadgeProps) {
  const style = CONFIDENCE_STYLES[confidence.level];

  const badge = (
    <Badge 
      variant={style.variant}
      className={`text-xs font-mono uppercase tracking-wider ${style.className} ${className}`}
      data-testid={`badge-confidence-${confidence.level}`}
    >
      {style.label}
      {showTooltip && <Info className="w-3 h-3 ml-1 opacity-60" />}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs bg-panel text-panel-foreground border-viz-grid"
      >
        <p className="text-xs font-mono">{confidence.reason}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function MrrPotentialDisplay({
  low,
  mid,
  high,
  confidence,
  className = "",
}: {
  low: number;
  mid: number;
  high: number;
  confidence: MarketplaceConfidence;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`} data-testid="mrr-potential-display">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-panel-foreground/60 uppercase">
          MRR Potential
        </span>
        <ConfidenceBadge confidence={confidence} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono font-bold text-panel-foreground">
          ${mid.toLocaleString()}
        </span>
        <span className="text-sm font-mono text-panel-foreground/60">/mo</span>
      </div>
      <div className="text-xs font-mono text-panel-foreground/50">
        Range: ${low.toLocaleString()} - ${high.toLocaleString()}
      </div>
    </div>
  );
}

export function ValuationDisplay({
  low,
  high,
  multiple,
  className = "",
}: {
  low: number;
  high: number;
  multiple: string;
  className?: string;
}) {
  const midpoint = Math.round((low + high) / 2);
  
  return (
    <div className={`space-y-1 ${className}`} data-testid="valuation-display">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-panel-foreground/60 uppercase">
          Valuation
        </span>
        <span className="text-xs font-mono text-panel-foreground/40">
          {multiple}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono font-bold text-panel-foreground">
          ${midpoint.toLocaleString()}
        </span>
      </div>
      <div className="text-xs font-mono text-panel-foreground/50">
        Range: ${low.toLocaleString()} - ${high.toLocaleString()}
      </div>
    </div>
  );
}

export function MarketplaceBadge({
  marketplace,
  className = "",
}: {
  marketplace: string;
  className?: string;
}) {
  const marketplaceIcons: Record<string, string> = {
    "Chrome Web Store": "chrome",
    "Firefox Add-ons": "firefox",
    "Shopify App Store": "shopify",
    "WordPress.org": "wordpress",
    "Slack App Directory": "slack",
    "Zapier": "zapier",
    "Product Hunt": "producthunt",
    "Flippa": "flippa",
    "Acquire.com": "acquire",
    "iOS App Store": "ios",
    "Google Play Store": "android",
    "Microsoft Store": "microsoft",
    "Salesforce AppExchange": "salesforce",
    "Atlassian Marketplace": "atlassian",
    "Gumroad": "gumroad",
  };

  const iconKey = marketplaceIcons[marketplace] || "default";
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-mono ${className}`}
      data-testid={`badge-marketplace-${iconKey}`}
    >
      {marketplace}
    </Badge>
  );
}
