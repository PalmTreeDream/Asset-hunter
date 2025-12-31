import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Target,
  DollarSign,
  Users,
  AlertTriangle,
  Star,
  Mail,
  Lock,
  Zap,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building2,
  Download,
  Crosshair,
  Database,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MRRGauge } from "@/components/charts/MRRGauge";
import { ScoreDial } from "@/components/charts/ScoreDial";
import { HunterRadarChart } from "@/components/charts/HunterRadarChart";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { DataProvenanceCard } from "@/components/DataProvenanceCard";
import { ScoringRationale } from "@/components/ScoringRationale";

interface Analysis {
  valuation: string;
  potential_mrr: string;
  the_play: string;
  cold_email?: string;
  owner_contact?: string;
  negotiation_script?: string;
  verified_email?: string | null;
}

interface Asset {
  name: string;
  type: string;
  url?: string;
  user_count: number;
  mrr_potential: number;
  marketplace?: string;
  last_update?: string;
}

interface HunterIntelligenceData {
  hunterRadar: {
    distress: number;
    monetizationGap: number;
    technicalRisk: number;
    marketPosition: number;
    flipPotential: number;
  };
  overallScore: number;
  mrrPotential: { low: number; mid: number; high: number };
  valuation: { low: number; high: number; multiple: string };
  marketplaceConfidence: { level: "high" | "medium" | "low"; reason: string };
  risks: string[];
  opportunities: string[];
  isPremiumUser: boolean;
  acquisition?: {
    strategy: string;
    approach: string;
    openingOffer: string;
    walkAway: string;
  };
  coldEmail?: { subject: string; body: string };
}

interface AssetDetailMobileProps {
  asset: Asset;
  analysis: Analysis;
  isPro: boolean;
  hunterIntel?: HunterIntelligenceData | null;
  isLoadingIntel?: boolean;
  onUpgrade: (tier?: "scout" | "hunter" | "syndicate") => void;
  onAddToWatchlist: () => void;
  onDownloadDossier?: () => void;
  onClose?: () => void;
}

function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
        data-testid={`accordion-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">{title}</span>
          {badge}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AssetDetailMobile({
  asset,
  analysis,
  isPro,
  hunterIntel,
  isLoadingIntel = false,
  onUpgrade,
  onAddToWatchlist,
  onDownloadDossier,
  onClose,
}: AssetDetailMobileProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const parseValuation = (val: string) => {
    const matches = val.match(/\$[\d,]+/g);
    if (matches && matches.length >= 2) {
      const low = parseInt(matches[0].replace(/[$,]/g, ""));
      const high = parseInt(matches[1].replace(/[$,]/g, ""));
      return { low, high, avg: Math.round((low + high) / 2) };
    }
    return { low: 10000, high: 50000, avg: 30000 };
  };

  const valuation = hunterIntel?.valuation 
    ? { low: hunterIntel.valuation.low, high: hunterIntel.valuation.high, avg: Math.round((hunterIntel.valuation.low + hunterIntel.valuation.high) / 2) }
    : parseValuation(analysis.valuation);
  const mrrValue = hunterIntel?.mrrPotential.mid || asset.mrr_potential || 0;

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

  const handleWatchlistClick = () => {
    onAddToWatchlist();
    setIsWatchlisted(true);
  };

  return (
    <div className="bg-background min-h-full overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate" data-testid="text-asset-name-mobile">
              {asset.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {marketplaceLabels[asset.type] || asset.type}
              </span>
              {hunterIntel?.marketplaceConfidence && (
                <ConfidenceBadge confidence={hunterIntel.marketplaceConfidence} />
              )}
            </div>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose} className="shrink-0">
              <span className="sr-only">Close</span>
              ×
            </Button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleWatchlistClick}
            disabled={isWatchlisted}
            className={`flex-1 ${isWatchlisted ? "bg-accent/20 text-accent" : "bg-foreground text-background"}`}
            data-testid="button-watchlist-mobile"
          >
            {isWatchlisted ? <CheckCircle className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
            {isWatchlisted ? "Watching" : "Watchlist"}
          </Button>
          {isPro && onDownloadDossier && (
            <Button variant="outline" size="icon" onClick={onDownloadDossier} data-testid="button-download-mobile">
              <Download className="w-4 h-4" />
            </Button>
          )}
          {asset.url && (
            <Button variant="outline" size="icon" asChild>
              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics - Visual Cards */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center border border-border/30">
          <ScoreDial
            score={hunterIntel?.overallScore || 65}
            label="Hunter Score"
            size="sm"
          />
        </div>
        <div className="glass-card rounded-xl p-3 text-center border border-border/30">
          <MRRGauge value={mrrValue} size="sm" label="MRR Est." />
        </div>
        <div className="glass-card rounded-xl p-3 text-center border border-border/30">
          <div className="flex flex-col items-center justify-center h-full">
            <Users className="w-6 h-6 text-primary mb-1" />
            <span className="text-lg font-mono font-bold text-foreground">
              {(asset.user_count / 1000).toFixed(0)}K
            </span>
            <span className="text-[10px] text-muted-foreground">Users</span>
          </div>
        </div>
      </div>

      {/* Valuation Summary */}
      <div className="px-4 pb-4">
        <div className="glass-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Est. Valuation</span>
            <span className="text-xl font-mono font-bold text-foreground">
              ${valuation.avg.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>${valuation.low.toLocaleString()}</span>
            <span>${valuation.high.toLocaleString()}</span>
          </div>
          {hunterIntel?.valuation.multiple && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Multiple: {hunterIntel.valuation.multiple}
            </p>
          )}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-border/30">
        {/* Hunter Radar */}
        <AccordionSection title="Hunter Radar" icon={Crosshair} defaultOpen={true}>
          {isLoadingIntel ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : hunterIntel ? (
            <div className="space-y-4">
              <HunterRadarChart scores={hunterIntel.hunterRadar} size="md" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Distress", value: hunterIntel.hunterRadar.distress },
                  { label: "Monetization Gap", value: hunterIntel.hunterRadar.monetizationGap },
                  { label: "Tech Risk", value: hunterIntel.hunterRadar.technicalRisk },
                  { label: "Market Position", value: hunterIntel.hunterRadar.marketPosition },
                  { label: "Flip Potential", value: hunterIntel.hunterRadar.flipPotential },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between p-2 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono font-medium">{item.value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Analysis unavailable</p>
          )}
        </AccordionSection>

        {/* Data Sources - Strategic Transparency */}
        <AccordionSection title="Data Sources" icon={Database}>
          <DataProvenanceCard
            marketplace={marketplaceLabels[asset.type] || asset.type}
            userCount={asset.user_count}
            rating={4.2}
            reviewCount={hunterIntel ? Math.floor(asset.user_count / 50) : undefined}
            lastUpdated={asset.last_update}
            pricingVisible={asset.type === "shopify_app"}
            manifestVersion={asset.type === "chrome_extension" ? "V2" : undefined}
          />
        </AccordionSection>

        {/* Scoring Rationale */}
        {hunterIntel && (
          <AccordionSection title="Score Breakdown" icon={BarChart3}>
            <ScoringRationale
              scores={hunterIntel.hunterRadar}
              marketplace={marketplaceLabels[asset.type] || asset.type}
              userCount={asset.user_count}
              lastUpdated={asset.last_update}
              manifestVersion={asset.type === "chrome_extension" ? "V2" : undefined}
              rating={4.2}
            />
          </AccordionSection>
        )}

        {/* Opportunities */}
        <AccordionSection
          title="Opportunities"
          icon={Star}
          badge={
            hunterIntel?.opportunities.length ? (
              <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                {hunterIntel.opportunities.length}
              </Badge>
            ) : null
          }
        >
          {hunterIntel?.opportunities.length ? (
            <ul className="space-y-2">
              {hunterIntel.opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground">{opp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No opportunities identified</p>
          )}
        </AccordionSection>

        {/* Risks */}
        <AccordionSection
          title="Risks"
          icon={AlertTriangle}
          badge={
            hunterIntel?.risks.length ? (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 text-xs">
                {hunterIntel.risks.length}
              </Badge>
            ) : null
          }
        >
          {hunterIntel?.risks.length ? (
            <ul className="space-y-2">
              {hunterIntel.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No risks identified</p>
          )}
        </AccordionSection>

        {/* Acquisition Strategy - Premium */}
        <AccordionSection title="Acquisition Strategy" icon={Target}>
          {isPro && hunterIntel?.acquisition && !hunterIntel.acquisition.strategy.includes("[Locked]") ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Strategy</p>
                <p className="text-sm text-foreground">{hunterIntel.acquisition.strategy}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Approach</p>
                <p className="text-sm text-foreground">{hunterIntel.acquisition.approach}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Opening Offer</p>
                  <p className="text-sm font-mono font-bold text-accent">{hunterIntel.acquisition.openingOffer}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Walk Away</p>
                  <p className="text-sm font-mono font-bold text-red-500">{hunterIntel.acquisition.walkAway}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Upgrade to unlock acquisition playbook</p>
              <Button onClick={() => onUpgrade("hunter")} className="bg-foreground text-background">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Hunter
              </Button>
            </div>
          )}
        </AccordionSection>

        {/* Cold Email - Premium */}
        <AccordionSection title="Cold Email Template" icon={Mail}>
          {isPro && hunterIntel?.coldEmail ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Subject</p>
                <p className="text-sm font-medium text-foreground">{hunterIntel.coldEmail.subject}</p>
              </div>
              <div className="bg-secondary/30 p-3 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">{hunterIntel.coldEmail.body}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Upgrade to unlock cold email templates</p>
              <Button onClick={() => onUpgrade("hunter")} className="bg-foreground text-background">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Hunter
              </Button>
            </div>
          )}
        </AccordionSection>

        {/* Owner Contact - Premium */}
        {(analysis.verified_email || analysis.owner_contact) && (
          <AccordionSection title="Owner Contact" icon={Mail}>
            {isPro ? (
              <div className="space-y-3">
                {analysis.verified_email && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Verified Email</p>
                    <p className="text-sm font-medium text-foreground">{analysis.verified_email}</p>
                  </div>
                )}
                {analysis.owner_contact && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Contact Info</p>
                    <p className="text-sm text-foreground">{analysis.owner_contact}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Upgrade to see owner contact details</p>
                <Button onClick={() => onUpgrade("hunter")} className="bg-foreground text-background">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Hunter
                </Button>
              </div>
            )}
          </AccordionSection>
        )}

        {/* The Play / Strategy from Analysis */}
        {analysis.the_play && (
          <AccordionSection title="The Play" icon={DollarSign}>
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {analysis.the_play}
            </div>
          </AccordionSection>
        )}
      </div>
    </div>
  );
}
