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
        {/* Resend-style geometric monogram 'A' */}
        {/* We use the same aesthetic: thick, purposeful strokes and sharp geometric cuts */}
        
        {/* Background 'container' shape like the Resend screenshot */}
        <rect width="32" height="32" rx="8" className="fill-slate-950" />
        <rect width="32" height="32" rx="8" className="stroke-white/10" strokeWidth="1" />

        {/* The 'A' glyph inspired by the Resend 'R' geometry */}
        <path
          d="M9 23L16 9L23 23"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        
        {/* The horizontal bar - matching the brand style with emerald */}
        <path
          d="M12.5 18H19.5"
          stroke="hsl(var(--accent))"
          strokeWidth="3.5"
          strokeLinecap="butt"
        />
        
        {/* Precise geometric cut - the 'A' crossbar highlight */}
        <path
          d="M15 18H17"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="butt"
        />
      </svg>
    </div>
  );
}
