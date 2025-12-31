import { motion } from "framer-motion";

interface ScoreDialProps {
  score: number;
  maxScore?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  colorScheme?: "default" | "inverse";
}

export function ScoreDial({ 
  score, 
  maxScore = 100, 
  label, 
  sublabel,
  size = "md",
  colorScheme = "default"
}: ScoreDialProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeMap = {
    sm: { outer: 80, inner: 28, fontSize: "text-lg", labelSize: "text-[9px]", stroke: 6 },
    md: { outer: 100, inner: 35, fontSize: "text-2xl", labelSize: "text-[10px]", stroke: 8 },
    lg: { outer: 140, inner: 45, fontSize: "text-3xl", labelSize: "text-xs", stroke: 10 },
  };
  
  const { outer, inner, fontSize, labelSize, stroke } = sizeMap[size];
  
  const getColor = () => {
    const effectivePercentage = colorScheme === "inverse" ? 100 - percentage : percentage;
    if (effectivePercentage >= 70) return "hsl(var(--viz-green))";
    if (effectivePercentage >= 40) return "hsl(var(--viz-amber))";
    return "hsl(var(--viz-red))";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg width={outer} height={outer} viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={getColor()}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-mono font-bold text-foreground`}>
            {score}
          </span>
          <span className={`${labelSize} text-muted-foreground`}>
            /{maxScore}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
