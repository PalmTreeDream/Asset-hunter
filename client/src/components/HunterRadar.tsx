import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface HunterRadarScores {
  distress: number;
  monetizationGap: number;
  technicalRisk: number;
  marketPosition: number;
  flipPotential: number;
}

interface HunterRadarProps {
  scores: HunterRadarScores;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

const AXIS_LABELS = [
  { key: "distress", label: "Distress", shortLabel: "D" },
  { key: "monetizationGap", label: "Monetization Gap", shortLabel: "M" },
  { key: "marketPosition", label: "Market Position", shortLabel: "P" },
  { key: "flipPotential", label: "Flip Potential", shortLabel: "F" },
  { key: "technicalRisk", label: "Tech Risk", shortLabel: "T" },
] as const;

const SIZE_CONFIG = {
  sm: { width: 80, height: 80, labelOffset: 8, fontSize: 8, strokeWidth: 1, dotSize: 2 },
  md: { width: 220, height: 220, labelOffset: 24, fontSize: 11, strokeWidth: 1.5, dotSize: 4 },
  lg: { width: 320, height: 320, labelOffset: 35, fontSize: 12, strokeWidth: 2, dotSize: 5 },
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function HunterRadar({
  scores,
  size = "md",
  showLabels = true,
  showValues = false,
  animated = true,
  className = "",
}: HunterRadarProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const config = SIZE_CONFIG[size];
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const maxRadius = (Math.min(config.width, config.height) / 2) - (showLabels ? config.labelOffset + 10 : 10);
  
  const numAxes = 5;
  const angleStep = 360 / numAxes;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  const gridLevels = useMemo(() => {
    return [0.25, 0.5, 0.75, 1.0].map((level) => {
      const radius = maxRadius * level;
      const points = Array.from({ length: numAxes }, (_, i) => {
        const angle = i * angleStep;
        return polarToCartesian(centerX, centerY, radius, angle);
      });
      return points.map((p) => `${p.x},${p.y}`).join(" ");
    });
  }, [maxRadius, centerX, centerY, angleStep, numAxes]);

  const axisLines = useMemo(() => {
    return Array.from({ length: numAxes }, (_, i) => {
      const angle = i * angleStep;
      const end = polarToCartesian(centerX, centerY, maxRadius, angle);
      return { x1: centerX, y1: centerY, x2: end.x, y2: end.y };
    });
  }, [maxRadius, centerX, centerY, angleStep, numAxes]);

  const dataPoints = useMemo(() => {
    const scoreValues = [
      scores.distress,
      scores.monetizationGap,
      scores.marketPosition,
      scores.flipPotential,
      10 - scores.technicalRisk,
    ];

    return scoreValues.map((score, i) => {
      const normalizedScore = Math.max(0, Math.min(10, score)) / 10;
      const radius = maxRadius * normalizedScore;
      const angle = i * angleStep;
      return polarToCartesian(centerX, centerY, radius, angle);
    });
  }, [scores, maxRadius, centerX, centerY, angleStep]);

  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPositions = useMemo(() => {
    return AXIS_LABELS.map((axis, i) => {
      const angle = i * angleStep;
      const labelRadius = maxRadius + config.labelOffset;
      const pos = polarToCartesian(centerX, centerY, labelRadius, angle);
      
      let textAnchor = "middle";
      if (pos.x < centerX - 5) textAnchor = "end";
      else if (pos.x > centerX + 5) textAnchor = "start";
      
      return { ...axis, x: pos.x, y: pos.y, textAnchor };
    });
  }, [maxRadius, centerX, centerY, angleStep, config.labelOffset]);

  const overallScore = Math.round(
    ((scores.distress + scores.monetizationGap + (10 - scores.technicalRisk) + scores.marketPosition + scores.flipPotential) / 50) * 100
  );

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#10B77F";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const gradientId = `radar-gradient-${size}`;
  const glowId = `radar-glow-${size}`;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B77F" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10B77F" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B77F" stopOpacity="0.05" />
          </radialGradient>
          
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridLevels.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-muted-foreground/20"
            strokeDasharray={i === gridLevels.length - 1 ? "none" : "2,2"}
          />
        ))}

        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-muted-foreground/30"
          />
        ))}

        <polygon
          points={dataPath}
          fill={`url(#${gradientId})`}
          stroke="#10B77F"
          strokeWidth={config.strokeWidth}
          filter={size !== "sm" ? `url(#${glowId})` : undefined}
          strokeLinejoin="round"
          style={{
            transform: isVisible ? "scale(1)" : "scale(0)",
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: animated ? "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          }}
        />

        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={config.dotSize}
            fill="#10B77F"
            stroke="white"
            strokeWidth={1.5}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1)" : "scale(0)",
              transformOrigin: `${point.x}px ${point.y}px`,
              transition: animated ? `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.4 + i * 0.05}s` : "none",
            }}
          />
        ))}

        {showLabels && labelPositions.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor={label.textAnchor}
            dominantBaseline="middle"
            className="fill-muted-foreground"
            fontSize={config.fontSize}
            fontWeight="500"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: animated ? `opacity 0.3s ease ${0.5 + i * 0.05}s` : "none",
            }}
          >
            {size === "sm" ? label.shortLabel : label.label}
          </text>
        ))}

        {size !== "sm" && (
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r={size === "lg" ? 32 : 24}
              fill="white"
              stroke={getScoreColor(overallScore)}
              strokeWidth="3"
              style={{
                filter: `drop-shadow(0 0 8px ${getScoreColor(overallScore)}40)`,
                opacity: isVisible ? 1 : 0,
                transition: animated ? "opacity 0.4s ease 0.3s" : "none",
              }}
            />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getScoreColor(overallScore)}
              fontSize={size === "lg" ? 24 : 18}
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: animated ? "opacity 0.4s ease 0.3s" : "none",
              }}
            >
              {overallScore}
            </text>
          </g>
        )}
      </svg>

      {showValues && size !== "sm" && (
        <div className="mt-3 grid grid-cols-5 gap-2 text-xs" data-testid="radar-values">
          {AXIS_LABELS.map((axis, i) => {
            const value = axis.key === "technicalRisk" 
              ? scores.technicalRisk 
              : scores[axis.key as keyof HunterRadarScores];
            return (
              <div key={axis.key} className="text-center">
                <div className="text-muted-foreground">{axis.shortLabel}</div>
                <div className="text-foreground font-semibold">{value}/10</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MiniHunterRadar({ 
  scores, 
  className = "" 
}: { 
  scores: HunterRadarScores; 
  className?: string;
}) {
  return (
    <HunterRadar
      scores={scores}
      size="sm"
      showLabels={false}
      showValues={false}
      animated={false}
      className={className}
    />
  );
}

export function HunterRadarWithLegend({
  scores,
  className = "",
}: {
  scores: HunterRadarScores;
  className?: string;
}) {
  const overallScore = Math.round(
    ((scores.distress + scores.monetizationGap + (10 - scores.technicalRisk) + scores.marketPosition + scores.flipPotential) / 50) * 100
  );

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Low";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-accent";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className={`glass-card p-6 ${className}`} data-testid="hunter-radar-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider">
          Hunter Radar
        </h3>
        <div className="text-right">
          <div className="text-muted-foreground text-xs">Score</div>
          <div className={`text-xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
        </div>
      </div>

      <div className="flex justify-center py-2">
        <HunterRadar scores={scores} size="md" showLabels showValues={false} />
      </div>

      <div className="mt-4 space-y-2">
        {AXIS_LABELS.map((axis) => {
          const value = axis.key === "technicalRisk"
            ? scores.technicalRisk
            : scores[axis.key as keyof HunterRadarScores];
          const displayValue = axis.key === "technicalRisk" ? 10 - value : value;
          const percentage = displayValue * 10;
          
          return (
            <div key={axis.key} className="flex items-center gap-3">
              <div className="w-28 text-xs text-muted-foreground truncate">
                {axis.label}
              </div>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs font-medium text-foreground">
                {value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Acquisition Rating</span>
        <span className={`text-sm font-semibold ${getScoreColor(overallScore)}`}>
          {getScoreLabel(overallScore)}
        </span>
      </div>
    </div>
  );
}
