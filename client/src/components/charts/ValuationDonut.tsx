import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ValuationDonutProps {
  currentValue: number;
  fairValue: number;
  label?: string;
}

export function ValuationDonut({ currentValue, fairValue, label = "Valuation" }: ValuationDonutProps) {
  const total = currentValue + fairValue;
  const undervalued = currentValue < fairValue;
  const percentDiff = Math.abs(((currentValue - fairValue) / fairValue) * 100);
  
  const data = [
    { name: "Current", value: currentValue },
    { name: "Remaining", value: Math.max(0, fairValue - currentValue) },
  ];
  
  const COLORS = [
    undervalued ? "hsl(var(--viz-green))" : "hsl(var(--viz-amber))",
    "hsl(var(--border))"
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-mono font-bold text-foreground">
            ${(currentValue / 1000).toFixed(0)}K
          </span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className={`text-sm font-medium ${undervalued ? "text-[hsl(var(--viz-green))]" : "text-[hsl(var(--viz-amber))]"}`}>
          {percentDiff.toFixed(0)}% {undervalued ? "Undervalued" : "Overvalued"}
        </span>
      </div>
    </div>
  );
}
