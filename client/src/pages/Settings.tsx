import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Users, CheckCircle, Loader2, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [referralEmail, setReferralEmail] = useState("");
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

  // Check subscription status
  const { data: sessionData } = useQuery({
    queryKey: ['/api/session/status'],
    queryFn: async () => {
      const res = await fetch('/api/session/status', { credentials: 'include' });
      return res.json();
    },
    staleTime: 30000,
  });
  
  const isPremium = (sessionData as any)?.isPremium || false;

  // Get referral stats
  const { data: referralStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/referrals/stats', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const res = await fetch(`/api/referrals/stats?email=${encodeURIComponent(userEmail)}`);
      return res.json();
    },
    enabled: !!userEmail,
  });

  // Generate referral code mutation
  const generateMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/referrals/generate", { email });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Referral link created!", description: data.message });
      refetchStats();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate referral link", variant: "destructive" });
    },
  });

  const handleGenerateReferral = () => {
    const email = userEmail || referralEmail;
    if (!email || !email.includes("@")) {
      toast({ title: "Error", description: "Please enter a valid email", variant: "destructive" });
      return;
    }
    generateMutation.mutate(email);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border/30 pb-6">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your workspace and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Referral Section */}
        <Card className="p-6 glass-card rounded-2xl border border-border/30 shadow-soft-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Refer & Earn</h2>
              <p className="text-sm text-muted-foreground">Give friends 20% off their first month</p>
            </div>
          </div>

          {!userEmail && (
            <div className="mb-4">
              <Label htmlFor="referral-email">Your Email</Label>
              <Input
                id="referral-email"
                type="email"
                placeholder="Enter your email to generate referral link"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                className="rounded-xl mt-1"
                data-testid="input-referral-email"
              />
            </div>
          )}

          <Button 
            onClick={handleGenerateReferral}
            disabled={generateMutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-generate-referral"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Gift className="w-4 h-4 mr-2" />
            )}
            Generate Referral Link
          </Button>

          {/* Show referral stats */}
          {referralStats && referralStats.referrals?.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span><strong>{referralStats.totalReferrals}</strong> links created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span><strong>{referralStats.redeemedReferrals}</strong> redeemed</span>
                </div>
              </div>

              <div className="space-y-2">
                {referralStats.referrals.slice(0, 3).map((ref: any) => (
                  <div key={ref.code} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{ref.code}</code>
                      <Badge variant={ref.status === "redeemed" ? "default" : "secondary"} className="text-xs">
                        {ref.status}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${window.location.origin}?ref=${ref.code}`)}
                      data-testid={`button-copy-referral-${ref.code}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Profile Section */}
        <Card className="p-6 glass-card rounded-2xl border border-border/30 shadow-soft-lg">
          <h2 className="text-xl font-display font-bold mb-4">Profile Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Demo User" className="rounded-xl bg-secondary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue={userEmail || "demo@assethunter.com"} className="rounded-xl bg-secondary/20" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="rounded-xl">Save Changes</Button>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6 glass-card rounded-2xl border border-border/30 shadow-soft-lg">
          <h2 className="text-xl font-display font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">Real-Time Lead Alerts</p>
                    {!isPremium && (
                      <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30 text-accent">
                        <Lock className="w-3 h-3 mr-1" />
                        Hunter+
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPremium 
                      ? "Get notified instantly when AssetHunter finds new prospects"
                      : "Upgrade to Hunter to get instant notifications"
                    }
                  </p>
                </div>
              </div>
              <Switch 
                defaultChecked={isPremium} 
                disabled={!isPremium}
                className={!isPremium ? "opacity-50" : ""}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Summary of watchlist activity (all tiers)</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
