import { useState } from "react";
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
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lock,
  Zap,
  ExternalLink,
  Download,
  Plus,
  Eye,
  Gauge,
  Radar,
  Activity,
  Shield,
  BarChart3,
  Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";

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

interface DealIntelligencePanelProps {
  asset: Asset;
  analysis: Analysis;
  isPro: boolean;
  onUpgrade: (tier?: "scout" | "hunter" | "syndicate") => void;
  onAddToWatchlist: () => void;
  onDownloadDossier: () => void;
  isUpgrading?: boolean;
}

function RadialGauge({ 
  value, 
  max = 100, 
  label, 
  color = "emerald",
  size = "md",
  icon: Icon
}: { 
  value: number; 
  max?: number; 
  label: string; 
  color?: "emerald" | "cyan" | "amber" | "red";
  size?: "sm" | "md";
  icon?: React.ElementType;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colors = {
    emerald: { stroke: "#10b981", bg: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-600" },
    cyan: { stroke: "#06b6d4", bg: "from-cyan-500/20 to-cyan-500/5", text: "text-cyan-600" },
    amber: { stroke: "#f59e0b", bg: "from-amber-500/20 to-amber-500/5", text: "text-amber-600" },
    red: { stroke: "#ef4444", bg: "from-red-500/20 to-red-500/5", text: "text-red-600" },
  };

  const sizeClasses = size === "sm" 
    ? "w-20 h-20" 
    : "w-24 h-24";
  const textSize = size === "sm" ? "text-lg" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke={colors[color].stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {Icon && <Icon className={`w-4 h-4 ${colors[color].text} mb-0.5`} />}
          <span className={`${textSize} font-bold ${colors[color].text}`}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center font-medium">{label}</span>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { label: string; value: number }[] }) {
  const centerX = 100;
  const centerY = 100;
  const radius = 70;
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
    const r = radius + 25;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const pathData = dimensions
    .map((d, i) => {
      const point = getPoint(i, d.value);
      return `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ") + " Z";

  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
        {[20, 40, 60, 80, 100].map((ring) => (
          <polygon
            key={ring}
            points={dimensions
              .map((_, i) => {
                const p = getPoint(i, ring);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted/30"
          />
        ))}
        
        {dimensions.map((_, i) => {
          const end = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/30"
            />
          );
        })}

        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          points={dimensions
            .map((d, i) => {
              const p = getPoint(i, d.value);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="url(#radarGradient)"
          stroke="#10b981"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {dimensions.map((d, i) => {
          const point = getPoint(i, d.value);
          return (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10b981"
              className="drop-shadow"
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
              className="text-[8px] fill-muted-foreground font-medium"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MetricBullet({ 
  icon: Icon, 
  label, 
  value, 
  trend 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  trend?: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-500",
    neutral: "text-muted-foreground"
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold ${trend ? trendColors[trend] : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function DealIntelligencePanel({
  asset,
  analysis,
  isPro,
  onUpgrade,
  onAddToWatchlist,
  onDownloadDossier,
  isUpgrading = false,
}: DealIntelligencePanelProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const parseValuation = (val: string) => {
    const matches = val.match(/\$[\d,]+/g);
    if (matches && matches.length >= 2) {
      return { low: matches[0], high: matches[1] };
    }
    return { low: val, high: "" };
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
  const mrrScore = Math.min(mrrValue / 100, 100);

  const acquisitionDifficulty = asset.user_count > 50000 ? 80 : asset.user_count > 10000 ? 50 : 30;

  const radarDimensions = [
    { label: "Risk", value: distressScore },
    { label: "Growth", value: Math.min(mrrScore * 2, 100) },
    { label: "Value", value: 75 },
    { label: "Ease", value: 100 - acquisitionDifficulty },
    { label: "Fit", value: 70 },
  ];

  const handleWatchlistClick = () => {
    onAddToWatchlist();
    setIsWatchlisted(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <RadialGauge 
            value={distressScore} 
            label="Distress Score" 
            color={distressScore > 70 ? "red" : distressScore > 40 ? "amber" : "emerald"}
            icon={AlertTriangle}
          />
        </Card>
        <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <RadialGauge 
            value={Math.min(mrrScore, 100)} 
            label="MRR Potential" 
            color="cyan"
            icon={TrendingUp}
          />
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <RadialGauge 
            value={acquisitionDifficulty} 
            label="Acquisition Difficulty" 
            color={acquisitionDifficulty > 60 ? "red" : acquisitionDifficulty > 30 ? "amber" : "emerald"}
            icon={Target}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Radar className="w-4 h-4 text-emerald-500" />
            Asset Health
          </h4>
          <RadarChart dimensions={radarDimensions} />
        </Card>

        <Card className="p-4 space-y-1">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            Key Metrics
          </h4>
          <MetricBullet icon={Users} label="User Base" value={asset.user_count.toLocaleString()} trend="neutral" />
          <MetricBullet icon={DollarSign} label="Valuation Range" value={`${valuation.low} - ${valuation.high}`} trend="up" />
          <MetricBullet icon={TrendingUp} label="MRR Potential" value={analysis.potential_mrr} trend="up" />
          <MetricBullet icon={Clock} label="Last Update" value={asset.last_update || "6+ months ago"} trend="down" />
        </Card>
      </div>

      <div className="flex gap-2">
        <motion.div className="flex-1">
          <Button 
            onClick={handleWatchlistClick}
            disabled={isWatchlisted}
            className={`w-full h-11 ${
              isWatchlisted 
                ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" 
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
            }`}
            data-testid="button-add-watchlist"
          >
            {isWatchlisted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added to Watchlist
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </>
            )}
          </Button>
        </motion.div>
        {isPro && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onDownloadDossier}
            className="h-11 w-11"
            data-testid="button-download-dossier"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Accordion type="multiple" className="space-y-2" defaultValue={["strategy"]}>
        <AccordionItem value="strategy" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">The Play</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown>{analysis.the_play}</ReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact" className="border rounded-xl px-4 bg-card relative overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              <span className="font-semibold">Owner Contact</span>
              {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {isPro ? (
              <div className="space-y-3">
                {analysis.verified_email && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-medium text-sm">{analysis.verified_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.email_source?.replace(/_/g, " ")} 
                        {analysis.email_confidence && ` - ${analysis.email_confidence}% confidence`}
                      </p>
                    </div>
                    {analysis.email_status === "verified" && (
                      <Badge className="ml-auto bg-emerald-500/20 text-emerald-600">Verified</Badge>
                    )}
                  </div>
                )}
                {analysis.developer_website && (
                  <a 
                    href={analysis.developer_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Developer Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {!analysis.verified_email && !analysis.developer_website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">No contact information found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Owner contact is a Hunter feature</p>
                <Button size="sm" onClick={() => onUpgrade('hunter')} disabled={isUpgrading}>
                  <Zap className="w-3 h-3 mr-1" />
                  Unlock with Hunter
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="email" className="border rounded-xl px-4 bg-card relative overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span className="font-semibold">Cold Email Template</span>
              {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {isPro ? (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg font-mono">
                {analysis.cold_email || "Subject: Interested in acquiring your app\n\nHi [Owner],\n\nI noticed your [App Name] and I'm interested in potentially acquiring it...\n\nBest regards"}
              </pre>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Cold email templates are a Hunter feature</p>
                <Button size="sm" onClick={() => onUpgrade('hunter')} disabled={isUpgrading}>
                  <Zap className="w-3 h-3 mr-1" />
                  Unlock with Hunter
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="negotiation" className="border rounded-xl px-4 bg-card relative overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">Negotiation Script</span>
              {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {isPro ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {analysis.negotiation_script || "Start at 2x ARR, be prepared to go up to 4x for quality assets with strong user bases and proven monetization..."}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Negotiation scripts are a Hunter feature</p>
                <Button size="sm" onClick={() => onUpgrade('hunter')} disabled={isUpgrading}>
                  <Zap className="w-3 h-3 mr-1" />
                  Unlock with Hunter
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
