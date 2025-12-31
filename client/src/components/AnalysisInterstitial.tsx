import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle,
  Crosshair
} from "lucide-react";

const ANALYSIS_STEPS = [
  { id: 1, label: "Connecting to Hunter Intelligence", duration: 1200 },
  { id: 2, label: "Analyzing distress signals", duration: 1800 },
  { id: 3, label: "Calculating MRR potential", duration: 1400 },
  { id: 4, label: "Building acquisition brief", duration: 1600 },
  { id: 5, label: "Generating deal playbook", duration: 1500 },
];

interface AnalysisInterstitialProps {
  assetName?: string;
  marketplace?: string;
}

export function AnalysisInterstitial({ assetName, marketplace }: AnalysisInterstitialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    timerRefs.current = [];
    const totalDuration = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);
    
    let elapsedTime = 0;
    ANALYSIS_STEPS.forEach((step, index) => {
      const stepStart = elapsedTime;
      const stepMidpoint = stepStart + step.duration / 2;
      
      const timer = setTimeout(() => {
        setCurrentStep(index);
        if (index > 0) {
          setCompletedSteps(prev => [...prev, index - 1]);
        }
        setProgress(Math.round((stepMidpoint / totalDuration) * 100));
      }, stepStart);
      
      timerRefs.current.push(timer);
      elapsedTime += step.duration;
    });

    const lastStep = ANALYSIS_STEPS.length - 1;
    const finalTimer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, lastStep]);
      setProgress(100);
    }, elapsedTime);
    timerRefs.current.push(finalTimer);

    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
      timerRefs.current = [];
    };
  }, []);

  return (
    <div className="py-6 px-4">
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent))]/5 via-transparent to-cyan-500/5 rounded-2xl" />
        
        <div className="relative z-10 space-y-6 p-6">
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <motion.div
                className="absolute w-24 h-24 rounded-full border border-[hsl(var(--accent))]/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-20 h-20 rounded-full border border-[hsl(var(--accent))]/30"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-cyan-500 flex items-center justify-center shadow-lg shadow-[hsl(var(--accent))]/30">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <motion.circle
                    cx="12" cy="12" r="10"
                    strokeDasharray="63"
                    animate={{ strokeDashoffset: [63, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="opacity-30"
                  />
                  <motion.path
                    d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}
                  />
                  <Crosshair className="w-5 h-5 absolute" />
                </svg>
                <Crosshair className="w-6 h-6 text-white absolute" />
              </div>
              
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-[hsl(var(--accent))]"
                  animate={{
                    rotate: [0, 360],
                    x: [0, Math.cos(i * 120 * Math.PI / 180) * 40],
                    y: [0, Math.sin(i * 120 * Math.PI / 180) * 40],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  style={{ opacity: 0.6 }}
                />
              ))}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hunter Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing {marketplace || "asset"}
              </p>
            </div>
            
            <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden max-w-xs mx-auto">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--accent))] to-cyan-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {ANALYSIS_STEPS.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? "bg-[hsl(var(--accent))]/10" 
                      : ""
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? "bg-[hsl(var(--accent))] text-white"
                      : isActive
                        ? "border-2 border-[hsl(var(--accent))] text-[hsl(var(--accent))]"
                        : "border border-muted-foreground/30 text-muted-foreground/50"
                  }`}>
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <span className="text-[10px] font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    isActive 
                      ? "text-[hsl(var(--accent))] font-medium" 
                      : isCompleted 
                        ? "text-foreground" 
                        : "text-muted-foreground/60"
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-1 h-1 rounded-full bg-[hsl(var(--accent))]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: dot * 0.15,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-center pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-[hsl(var(--accent))]">Hunter Intelligence</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
