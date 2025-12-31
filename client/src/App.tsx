import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Hunt from "@/pages/Hunt";
import Feed from "@/pages/Feed";
import LeadDetail from "@/pages/LeadDetail";
import Settings from "@/pages/Settings";
import Pulse from "@/pages/Pulse";
import Login from "@/pages/Login";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/app" component={Hunt} />
      <Route path="/hunt" component={Hunt} />
      <Route path="/watchlist" component={Dashboard} />
      <Route path="/leads/:id" component={LeadDetail} />
      <Route path="/settings" component={Settings} />
      <Route path="/pulse" component={Pulse} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex dark">
      <Navigation />
      <main className="flex-1 lg:pl-64 pl-0 transition-all duration-300 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Referral code detection and redemption modal
function ReferralHandler() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [redeemed, setRedeemed] = useState(false);

  // Detect referral code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && !localStorage.getItem(`ref_dismissed_${ref}`)) {
      setReferralCode(ref);
      setShowModal(true);
      // Clean URL without refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  const redeemMutation = useMutation({
    mutationFn: async ({ code, email }: { code: string; email: string }) => {
      const res = await apiRequest("POST", "/api/referrals/redeem", { code, email });
      return res.json();
    },
    onSuccess: (data) => {
      setRedeemed(true);
      localStorage.setItem("userEmail", email);
      toast({ 
        title: "Welcome to Asset Hunter!", 
        description: `You now have 7 days of Hunter access until ${new Date(data.trialEndsAt).toLocaleDateString()}` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Couldn't redeem code", 
        description: error.message || "This code may have already been used", 
        variant: "destructive" 
      });
    },
  });

  const handleRedeem = () => {
    if (!email.includes("@") || !referralCode) return;
    redeemMutation.mutate({ code: referralCode, email });
  };

  const handleDismiss = () => {
    if (referralCode) {
      localStorage.setItem(`ref_dismissed_${referralCode}`, "true");
    }
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            {redeemed ? "You're In!" : "You've Been Invited!"}
          </DialogTitle>
          <DialogDescription>
            {redeemed 
              ? "Enjoy your 7-day Hunter trial. Start hunting for distressed assets now."
              : "A friend shared Asset Hunter with you. Enter your email to get 7 days of Hunter access free."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!redeemed ? (
          <>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="ref-email">Your Email</Label>
                <Input
                  id="ref-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  data-testid="input-referral-redeem-email"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Referral Code: <code className="font-mono text-foreground">{referralCode}</code>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={handleDismiss}>
                Maybe Later
              </Button>
              <Button 
                onClick={handleRedeem} 
                disabled={redeemMutation.isPending || !email.includes("@")}
                data-testid="button-redeem-referral"
              >
                {redeemMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                Claim Free Trial
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogFooter>
            <Button onClick={() => setShowModal(false)} className="w-full" data-testid="button-start-hunting">
              <CheckCircle className="w-4 h-4 mr-2" />
              Start Hunting
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [location] = useLocation();
  
  // Marketing pages that bypass the app layout (have their own headers)
  const marketingPages = ["/", "/login", "/pricing", "/contact", "/terms", "/privacy", "/feed"];
  const isMarketingPage = marketingPages.includes(location);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isMarketingPage ? (
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/contact" component={Contact} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/feed" component={Feed} />
          </Switch>
        ) : (
          <Layout>
            <AppRouter />
          </Layout>
        )}
        <ReferralHandler />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
