import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AssetHunterLogo({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Brand Navy Background with subtle border */}
        <rect 
          width="32" 
          height="32" 
          rx="7" 
          fill="#0F1729"
        />
        <rect 
          x="0.5" 
          y="0.5" 
          width="31" 
          height="31" 
          rx="6.5" 
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
          fill="none"
        />

        {/* Clean geometric 'A' - bold white strokes */}
        <path
          d="M16 8L24 24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M16 8L8 24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Solid indigo crossbar - the brand accent */}
        <path
          d="M11 19H21"
          stroke="#4F46E5"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
