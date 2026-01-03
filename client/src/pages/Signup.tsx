import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Loader2, ArrowRight, Zap } from "lucide-react";
import { SiGoogle } from "react-icons/si";

const VALUE_PROPS = [
  "Find dormant apps in as little as 24 hours",
  "Scan 14+ app stores automatically",
  "Real revenue data, not guesses",
  "AI-powered acquisition playbooks",
  "Verified distress signals",
  "Contact owners directly",
  "Expert deal support when you need it",
];

const TESTIMONIAL = {
  quote: "I found 3 distressed Chrome extensions with 50K+ users each within my first week. Asset Hunter paid for itself on the first deal.",
  name: "Marcus Chen",
  title: "Solo Acquirer",
  deal: "Acquired for $12,000",
};

export default function Signup() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // If already logged in, redirect to feed
  if (user && !isLoading) {
    setLocation("/feed");
    return null;
  }
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Left side - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Asset Hunter</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2" data-testid="text-signup-title">
            Sign in to access deals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Find and acquire dormant software with real users
          </p>
          
          {/* Login Button */}
          <Button 
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
            onClick={handleLogin}
            data-testid="button-login-google"
          >
            <SiGoogle className="w-4 h-4 mr-3" />
            Continue with Google
            <ArrowRight className="w-4 h-4 ml-3" />
          </Button>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
          
          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              New users get <span className="font-semibold text-emerald-600 dark:text-emerald-400">3 free reveals</span> to explore dormant assets
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Value Props (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[440px] bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-8">
            Why Asset Hunter?
          </h2>
          
          <div className="space-y-4">
            {VALUE_PROPS.map((prop, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 text-sm">{prop}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Testimonial */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardContent className="p-5">
            <p className="text-slate-300 text-sm italic mb-4">
              "{TESTIMONIAL.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                {TESTIMONIAL.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{TESTIMONIAL.name}</div>
                <div className="text-slate-400 text-xs">{TESTIMONIAL.title}</div>
                <div className="text-emerald-400 text-xs font-medium mt-0.5">{TESTIMONIAL.deal}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
