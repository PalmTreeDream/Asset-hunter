import { motion } from "framer-motion";
import { 
  Users, 
  Star, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  Database,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfidenceBadge, type MarketplaceConfidence } from "./ConfidenceBadge";

interface MarketplaceDataConfig {
  name: string;
  confidenceLevel: "high" | "medium" | "low";
  availableSignals: string[];
  mrrFormula: {
    conversionRate: number;
    avgPrice: number;
    description: string;
  };
  confidenceReason: string;
}

const DEFAULT_MARKETPLACE: MarketplaceDataConfig = {
  name: "Marketplace",
  confidenceLevel: "low",
  availableSignals: ["User count", "Basic listing data"],
  mrrFormula: { conversionRate: 2, avgPrice: 10, description: "Standard SaaS benchmark" },
  confidenceReason: "Limited public data available. Verify metrics directly with owner.",
};

const MARKETPLACE_DATA: Record<string, MarketplaceDataConfig> = {
  "Chrome Web Store": {
    name: "Chrome Web Store",
    confidenceLevel: "medium",
    availableSignals: ["Exact user count", "Rating", "Review count", "Last updated", "Manifest version"],
    mrrFormula: { conversionRate: 2, avgPrice: 5, description: "Browser extension benchmark" },
    confidenceReason: "User counts verified. MRR estimated from 2% conversion benchmark.",
  },
  "Firefox Add-ons": {
    name: "Firefox Add-ons",
    confidenceLevel: "medium",
    availableSignals: ["User count", "Rating", "Last updated"],
    mrrFormula: { conversionRate: 2, avgPrice: 5, description: "Browser extension benchmark" },
    confidenceReason: "User counts accurate. Revenue estimated from industry averages.",
  },
  "Shopify App Store": {
    name: "Shopify App Store",
    confidenceLevel: "high",
    availableSignals: ["Install count", "Pricing visible", "Reviews", "Rating", "Last updated"],
    mrrFormula: { conversionRate: 2, avgPrice: 10, description: "Visible pricing data" },
    confidenceReason: "High confidence: Pricing publicly visible, install counts verified.",
  },
  "WordPress.org": {
    name: "WordPress.org",
    confidenceLevel: "medium",
    availableSignals: ["Active installs", "Rating", "Last updated", "Tested version"],
    mrrFormula: { conversionRate: 1, avgPrice: 4.08, description: "~$49/yr plugin average" },
    confidenceReason: "Active installs accurate. Revenue estimated from plugin benchmarks.",
  },
  "Slack App Directory": {
    name: "Slack App Directory",
    confidenceLevel: "low",
    availableSignals: ["App listing", "Install count (limited)"],
    mrrFormula: { conversionRate: 3, avgPrice: 15, description: "B2B premium estimate" },
    confidenceReason: "Limited public data. Recommend direct outreach for verification.",
  },
  "Zapier": {
    name: "Zapier",
    confidenceLevel: "low",
    availableSignals: ["Integration listing", "Connected apps"],
    mrrFormula: { conversionRate: 2, avgPrice: 10, description: "Automation connector" },
    confidenceReason: "Usage metrics limited. Verify revenue directly with owner.",
  },
  "Product Hunt": {
    name: "Product Hunt",
    confidenceLevel: "low",
    availableSignals: ["Upvotes", "Launch date", "Comments"],
    mrrFormula: { conversionRate: 1, avgPrice: 10, description: "Launch traction only" },
    confidenceReason: "Upvotes only, no revenue/usage data. Recommend direct outreach.",
  },
  "Flippa": {
    name: "Flippa",
    confidenceLevel: "high",
    availableSignals: ["Seller-disclosed MRR", "Revenue screenshots", "Traffic data", "Age"],
    mrrFormula: { conversionRate: 5, avgPrice: 30, description: "Seller-verified financials" },
    confidenceReason: "High confidence: Platform-verified financials from seller.",
  },
  "Acquire.com": {
    name: "Acquire.com",
    confidenceLevel: "high",
    availableSignals: ["Verified MRR", "TTM revenue", "Asking price", "Team size"],
    mrrFormula: { conversionRate: 5, avgPrice: 30, description: "Verified financials" },
    confidenceReason: "High confidence: MRR and revenue verified by platform.",
  },
  "Atlassian Marketplace": {
    name: "Atlassian Marketplace",
    confidenceLevel: "high",
    availableSignals: ["Install count", "Pricing API", "Reviews", "Compatibility"],
    mrrFormula: { conversionRate: 3, avgPrice: 20, description: "B2B dev tools pricing" },
    confidenceReason: "High confidence: Pricing API available, install counts verified.",
  },
  "Gumroad": {
    name: "Gumroad",
    confidenceLevel: "medium",
    availableSignals: ["Sales count (partial)", "Pricing visible"],
    mrrFormula: { conversionRate: 10, avgPrice: 30, description: "Digital product benchmark" },
    confidenceReason: "Sales partially visible. Verify total revenue with seller.",
  },
  "Microsoft Store": {
    name: "Microsoft Store",
    confidenceLevel: "medium",
    availableSignals: ["User count", "Rating", "Last updated"],
    mrrFormula: { conversionRate: 2, avgPrice: 5, description: "Desktop app benchmark" },
    confidenceReason: "User counts available. Revenue estimated from desktop app averages.",
  },
  "iOS App Store": {
    name: "iOS App Store",
    confidenceLevel: "low",
    availableSignals: ["Download range", "Rating", "Reviews"],
    mrrFormula: { conversionRate: 2, avgPrice: 5, description: "Mobile app estimate" },
    confidenceReason: "Download ranges only. No free revenue API available.",
  },
  "Google Play Store": {
    name: "Google Play Store",
    confidenceLevel: "low",
    availableSignals: ["Download range", "Rating"],
    mrrFormula: { conversionRate: 2, avgPrice: 5, description: "Mobile app estimate" },
    confidenceReason: "Download ranges only. Limited data visibility.",
  },
  "Salesforce AppExchange": {
    name: "Salesforce AppExchange",
    confidenceLevel: "low",
    availableSignals: ["Listing", "Reviews"],
    mrrFormula: { conversionRate: 5, avgPrice: 50, description: "Enterprise SaaS estimate" },
    confidenceReason: "No public API. Enterprise pricing opaque.",
  },
};

interface DataSignalProps {
  icon: typeof Users;
  label: string;
  value: string | number;
  verified?: boolean;
  sublabel?: string;
}

function DataSignal({ icon: Icon, label, value, verified = false, sublabel }: DataSignalProps) {
  return (
    <div className="flex flex-col p-3 bg-muted/30 rounded-xl border border-border/50 min-w-[120px]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {verified && (
          <CheckCircle className="w-3 h-3 text-[hsl(var(--viz-green))]" />
        )}
      </div>
      <span className="text-base font-mono font-semibold text-foreground">{value}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground">{sublabel}</span>
      )}
    </div>
  );
}

interface MrrFormulaDisplayProps {
  userCount: number;
  conversionRate: number;
  avgPrice: number;
  description: string;
}

function MrrFormulaDisplay({ userCount, conversionRate, avgPrice, description }: MrrFormulaDisplayProps) {
  const estimatedMrr = Math.round(userCount * (conversionRate / 100) * avgPrice);
  
  return (
    <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-foreground">MRR Calculation</span>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3 h-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
        <span className="px-2 py-1 bg-background rounded-md text-foreground font-semibold">
          {userCount.toLocaleString()}
        </span>
        <span className="text-muted-foreground">users</span>
        <span className="text-muted-foreground">x</span>
        <span className="px-2 py-1 bg-background rounded-md text-foreground font-semibold">
          {conversionRate}%
        </span>
        <span className="text-muted-foreground">conversion</span>
        <span className="text-muted-foreground">x</span>
        <span className="px-2 py-1 bg-background rounded-md text-foreground font-semibold">
          ${avgPrice}
        </span>
        <span className="text-muted-foreground">/mo</span>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Estimated MRR</span>
        <span className="text-xl font-mono font-bold text-accent">
          ${estimatedMrr.toLocaleString()}/mo
        </span>
      </div>
    </div>
  );
}

interface DataProvenanceCardProps {
  marketplace: string;
  userCount: number;
  rating?: number;
  reviewCount?: number;
  lastUpdated?: string;
  pricingVisible?: boolean;
  manifestVersion?: string;
  className?: string;
}

export function DataProvenanceCard({
  marketplace,
  userCount,
  rating,
  reviewCount,
  lastUpdated,
  pricingVisible,
  manifestVersion,
  className = "",
}: DataProvenanceCardProps) {
  const config = MARKETPLACE_DATA[marketplace] || { ...DEFAULT_MARKETPLACE, name: marketplace || "Unknown" };
  
  const confidence: MarketplaceConfidence = {
    level: config.confidenceLevel,
    reason: config.confidenceReason,
  };

  const getLastUpdateLabel = (date: string | undefined) => {
    if (!date) return "Unknown";
    const updateDate = new Date(date);
    const now = new Date();
    const monthsAgo = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsAgo < 1) return "This month";
    if (monthsAgo < 12) return `${monthsAgo} months ago`;
    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Data Sources</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" data-testid="data-signals-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DataSignal 
          icon={Users} 
          label="Users" 
          value={userCount?.toLocaleString() ?? "N/A"} 
          verified={config.confidenceLevel !== "low"}
          sublabel={config.confidenceLevel === "low" ? "Estimated" : "Verified"}
        />
        {rating !== undefined && rating !== null && (
          <DataSignal 
            icon={Star} 
            label="Rating" 
            value={rating.toFixed(1)}
            sublabel={reviewCount && reviewCount > 0 ? `${reviewCount.toLocaleString()} reviews` : undefined}
          />
        )}
        {lastUpdated && (
          <DataSignal 
            icon={Calendar} 
            label="Last Update" 
            value={getLastUpdateLabel(lastUpdated)}
            sublabel={lastUpdated}
          />
        )}
        {pricingVisible !== undefined && pricingVisible !== null && (
          <DataSignal 
            icon={DollarSign} 
            label="Pricing" 
            value={pricingVisible ? "Visible" : "Hidden"}
            verified={pricingVisible}
          />
        )}
        {manifestVersion && (
          <DataSignal 
            icon={AlertTriangle} 
            label="Manifest" 
            value={manifestVersion}
            sublabel={manifestVersion === "V2" ? "Migration needed" : "Current"}
          />
        )}
      </div>

      <MrrFormulaDisplay
        userCount={userCount}
        conversionRate={config.mrrFormula.conversionRate}
        avgPrice={config.mrrFormula.avgPrice}
        description={config.mrrFormula.description}
      />

      <div className="flex items-start gap-2 p-3 bg-muted/10 rounded-lg border border-border/30">
        <Eye className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <span className="text-xs font-medium text-foreground">Available from {config.name}:</span>
          <p className="text-xs text-muted-foreground mt-1">
            {config.availableSignals.join(" • ")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export { MARKETPLACE_DATA };
export type { MarketplaceDataConfig };
