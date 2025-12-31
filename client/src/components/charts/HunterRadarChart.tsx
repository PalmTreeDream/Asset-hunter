import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { motion } from "framer-motion";

interface HunterRadarChartProps {
  scores: {
    distress: number;
    monetizationGap: number;
    technicalRisk: number;
    marketPosition: number;
    flipPotential: number;
  };
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function HunterRadarChart({ scores, size = "md", showLabels = true }: HunterRadarChartProps) {
  const data = [
    { axis: "Distress", value: scores.distress, fullMark: 10 },
    { axis: "Monetization", value: scores.monetizationGap, fullMark: 10 },
    { axis: "Tech Risk", value: scores.technicalRisk, fullMark: 10 },
    { axis: "Market", value: scores.marketPosition, fullMark: 10 },
    { axis: "Flip", value: scores.flipPotential, fullMark: 10 },
  ];

  const sizeMap = {
    sm: { width: 150, height: 150 },
    md: { width: 200, height: 200 },
    lg: { width: 280, height: 280 },
  };

  const { width, height } = sizeMap[size];
  const overallScore = Math.round(
    (scores.distress + scores.monetizationGap + scores.technicalRisk + scores.marketPosition + scores.flipPotential) / 5 * 10
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.5}
            />
            {showLabels && (
              <PolarAngleAxis 
                dataKey="axis" 
                tick={{ 
                  fill: "hsl(var(--muted-foreground))", 
                  fontSize: size === "sm" ? 9 : 11,
                  fontWeight: 500
                }}
              />
            )}
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Scores"
              dataKey="value"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-2xl font-mono font-bold text-accent">{overallScore}</span>
        <span className="text-sm text-muted-foreground">/100</span>
        <p className="text-xs text-muted-foreground mt-1">Hunter Score</p>
      </div>
    </motion.div>
  );
}
