import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  TrendingUp, 
  Wrench, 
  Target, 
  Zap,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HunterRadarScores } from "./HunterRadar";

interface ScoreRationaleItem {
  axis: string;
  icon: typeof AlertTriangle;
  score: number;
  maxScore: number;
  rationale: string;
  evidence: string;
  color: string;
  bgClass: string;
  barColor?: string;
}

interface ScoringRationaleProps {
  scores: HunterRadarScores;
  marketplace?: string;
  userCount?: number;
  lastUpdated?: string;
  manifestVersion?: string;
  rating?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-[hsl(var(--viz-green))]";
  if (score >= 4) return "text-[hsl(var(--viz-amber))]";
  return "text-[hsl(var(--viz-red))]";
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-[hsl(var(--viz-green))]/10 border-[hsl(var(--viz-green))]/20";
  if (score >= 4) return "bg-[hsl(var(--viz-amber))]/10 border-[hsl(var(--viz-amber))]/20";
  return "bg-[hsl(var(--viz-red))]/10 border-[hsl(var(--viz-red))]/20";
}

function getTechRiskColor(score: number): string {
  if (score <= 3) return "text-[hsl(var(--viz-green))]";
  if (score <= 6) return "text-[hsl(var(--viz-amber))]";
  return "text-[hsl(var(--viz-red))]";
}

function getTechRiskBg(score: number): string {
  if (score <= 3) return "bg-[hsl(var(--viz-green))]/10 border-[hsl(var(--viz-green))]/20";
  if (score <= 6) return "bg-[hsl(var(--viz-amber))]/10 border-[hsl(var(--viz-amber))]/20";
  return "bg-[hsl(var(--viz-red))]/10 border-[hsl(var(--viz-red))]/20";
}

function generateRationale(
  scores: HunterRadarScores,
  marketplace?: string,
  userCount?: number,
  lastUpdated?: string,
  manifestVersion?: string,
  rating?: number
): ScoreRationaleItem[] {
  const getMonthsSinceUpdate = () => {
    if (!lastUpdated) return null;
    const update = new Date(lastUpdated);
    const now = new Date();
    return Math.floor((now.getTime() - update.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };
  
  const monthsSinceUpdate = getMonthsSinceUpdate();
  
  const rationales: ScoreRationaleItem[] = [
    {
      axis: "Distress",
      icon: AlertTriangle,
      score: scores.distress,
      maxScore: 10,
      rationale: scores.distress >= 7 
        ? "High distress signals detected" 
        : scores.distress >= 4 
        ? "Moderate distress indicators" 
        : "Low distress - actively maintained",
      evidence: monthsSinceUpdate 
        ? monthsSinceUpdate >= 24 
          ? `No updates in ${Math.floor(monthsSinceUpdate / 12)}+ years`
          : monthsSinceUpdate >= 12
          ? `Last updated ${Math.floor(monthsSinceUpdate / 12)} year ago`
          : monthsSinceUpdate >= 6
          ? `Last updated ${monthsSinceUpdate} months ago`
          : "Recently updated"
        : "Update history unavailable",
      color: getScoreColor(scores.distress),
      bgClass: getScoreBg(scores.distress),
    },
    {
      axis: "Monetization Gap",
      icon: TrendingUp,
      score: scores.monetizationGap,
      maxScore: 10,
      rationale: scores.monetizationGap >= 7 
        ? "Significant untapped revenue potential" 
        : scores.monetizationGap >= 4 
        ? "Moderate monetization opportunity" 
        : "Already well-monetized",
      evidence: userCount 
        ? userCount >= 50000 
          ? `${userCount.toLocaleString()} users with minimal monetization`
          : userCount >= 10000
          ? `${userCount.toLocaleString()} users - room to grow`
          : `${userCount.toLocaleString()} users`
        : "User count unavailable",
      color: getScoreColor(scores.monetizationGap),
      bgClass: getScoreBg(scores.monetizationGap),
    },
    {
      axis: "Technical Risk",
      icon: Wrench,
      score: scores.technicalRisk,
      maxScore: 10,
      rationale: scores.technicalRisk <= 3 
        ? "Low technical risk - minimal work needed" 
        : scores.technicalRisk <= 6 
        ? "Moderate technical updates needed" 
        : "High technical migration required",
      evidence: manifestVersion === "V2"
        ? "Manifest V2 - migration to V3 required"
        : manifestVersion === "V3"
        ? "Manifest V3 - no migration needed"
        : marketplace?.includes("Chrome") || marketplace?.includes("Firefox")
        ? "Browser extension - check manifest version"
        : "Standard platform requirements",
      color: getTechRiskColor(scores.technicalRisk),
      bgClass: getTechRiskBg(scores.technicalRisk),
      barColor: scores.technicalRisk <= 3 
        ? "bg-[hsl(var(--viz-green))]" 
        : scores.technicalRisk <= 6 
        ? "bg-[hsl(var(--viz-amber))]" 
        : "bg-[hsl(var(--viz-red))]",
    },
    {
      axis: "Market Position",
      icon: Target,
      score: scores.marketPosition,
      maxScore: 10,
      rationale: scores.marketPosition >= 7 
        ? "Strong category position with moat" 
        : scores.marketPosition >= 4 
        ? "Established but competitive" 
        : "Weak market position",
      evidence: rating 
        ? rating >= 4.5 
          ? `${rating.toFixed(1)} rating - excellent reputation`
          : rating >= 4.0
          ? `${rating.toFixed(1)} rating - good reputation`
          : rating >= 3.5
          ? `${rating.toFixed(1)} rating - mixed reviews`
          : `${rating.toFixed(1)} rating - needs improvement`
        : "Rating unavailable",
      color: getScoreColor(scores.marketPosition),
      bgClass: getScoreBg(scores.marketPosition),
    },
    {
      axis: "Flip Potential",
      icon: Zap,
      score: scores.flipPotential,
      maxScore: 10,
      rationale: scores.flipPotential >= 7 
        ? "Quick value creation opportunity" 
        : scores.flipPotential >= 4 
        ? "Moderate flip potential" 
        : "Long-term hold required",
      evidence: scores.distress >= 7 && scores.monetizationGap >= 7
        ? "High distress + monetization gap = quick wins available"
        : scores.distress >= 5 && scores.monetizationGap >= 5
        ? "Moderate opportunity with effort"
        : "Requires significant development",
      color: getScoreColor(scores.flipPotential),
      bgClass: getScoreBg(scores.flipPotential),
    },
  ];

  return rationales;
}

function ScoreBar({ score, maxScore, color, barColor }: { score: number; maxScore: number; color: string; barColor?: string }) {
  const percentage = (score / maxScore) * 100;
  
  const defaultBarColor = score >= 7 
    ? "bg-[hsl(var(--viz-green))]" 
    : score >= 4 
    ? "bg-[hsl(var(--viz-amber))]" 
    : "bg-[hsl(var(--viz-red))]";
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor || defaultBarColor}`}
        />
      </div>
      <span className={`text-sm font-mono font-bold ${color}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function ScoringRationale({
  scores,
  marketplace,
  userCount,
  lastUpdated,
  manifestVersion,
  rating,
  className = "",
}: ScoringRationaleProps) {
  const rationales = generateRationale(scores, marketplace, userCount, lastUpdated, manifestVersion, rating);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-3 ${className}`}
      data-testid="scoring-rationale"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Hunter Radar Breakdown</span>
      </div>
      
      {rationales.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.axis}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`p-3 rounded-xl border ${item.bgClass}`}
            data-testid={`rationale-${item.axis.toLowerCase().replace(/\s/g, '-')}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${item.bgClass}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{item.axis}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-mono ${item.color} border-current/30`}
                  >
                    {item.score.toFixed(1)}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{item.rationale}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.evidence}</span>
                </div>
                <div className="mt-2">
                  <ScoreBar score={item.score} maxScore={item.maxScore} color={item.color} barColor={item.barColor} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
