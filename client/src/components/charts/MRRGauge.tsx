import { motion } from "framer-motion";

interface MRRGaugeProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function MRRGauge({ value, maxValue = 10000, label = "MRR Potential", size = "md" }: MRRGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;
  
  const sizeMap = {
    sm: { width: 120, height: 80, fontSize: "text-lg", labelSize: "text-[10px]" },
    md: { width: 160, height: 100, fontSize: "text-2xl", labelSize: "text-xs" },
    lg: { width: 200, height: 120, fontSize: "text-3xl", labelSize: "text-sm" },
  };
  
  const { width, height, fontSize, labelSize } = sizeMap[size];
  
  const getColor = () => {
    if (percentage >= 70) return "hsl(var(--viz-green))";
    if (percentage >= 40) return "hsl(var(--viz-amber))";
    return "hsl(var(--viz-blue))";
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox="0 0 100 60" className="overflow-visible">
        <path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <text
          x="50"
          y="45"
          textAnchor="middle"
          className={`${fontSize} font-mono font-bold fill-foreground`}
        >
          ${value.toLocaleString()}
        </text>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          className={`${labelSize} fill-muted-foreground`}
        >
          /month
        </text>
      </svg>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
