import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { HunterRadar } from "@/components/HunterRadar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Star,
  ExternalLink,
  Mail,
  Linkedin,
  Lock,
  Loader2,
  Calendar,
  Target,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { 
  SiGooglechrome, 
  SiShopify, 
  SiWordpress, 
  SiFirefox, 
  SiSlack 
} from "react-icons/si";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { MobileNav } from "@/components/MobileNav";

// Platform icons map
const platformIcons: Record<string, typeof SiGooglechrome> = {
  chrome: SiGooglechrome,
  shopify: SiShopify,
  wordpress: SiWordpress,
  firefox: SiFirefox,
  slack: SiSlack,
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
}

// Generate mock historical data if not available
function generateMockHistory(users: number, mrr: number) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const userHistory = months.map((month, i) => ({
    month,
    users: Math.round(users * (0.85 + Math.random() * 0.3) * (1 - (11 - i) * 0.02)),
  }));
  const mrrHistory = months.map((month, i) => ({
    month,
    mrr: Math.round(mrr * (0.85 + Math.random() * 0.3) * (1 - (11 - i) * 0.02)),
  }));
  return { userHistory, mrrHistory };
}

export default function AssetDetail() {
  const [, params] = useRoute("/asset/:id");
  const [, setLocation] = useLocation();
  const assetId = params?.id || "";
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [isRevealing, setIsRevealing] = useState(false);
  
  // Fetch asset details
  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["/api/scanned-assets", assetId],
    queryFn: async () => {
      const res = await fetch(`/api/scanned-assets/${assetId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Asset not found");
      return res.json();
    },
    enabled: !!assetId,
  });
  
  // Check if asset is revealed
  const isRevealed = asset?.isRevealed || isPremium;
  
  // Handle reveal action
  const handleReveal = async () => {
    if (!user) {
      setLocation("/signup");
      return;
    }
    
    setIsRevealing(true);
    try {
      const res = await apiRequest("POST", `/api/assets/${assetId}/reveal`);
      const data = await res.json();
      
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/scanned-assets", assetId] });
        toast({
          title: "Asset Revealed",
          description: `You now have access to full details. ${data.creditsRemaining} credits remaining.`,
        });
      } else {
        toast({
          title: "Reveal Failed",
          description: data.message || "Unable to reveal asset",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reveal asset",
        variant: "destructive",
      });
    } finally {
      setIsRevealing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error || !asset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertTriangle className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Asset Not Found</h1>
        <Link href="/feed">
          <Button variant="outline">Back to Feed</Button>
        </Link>
      </div>
    );
  }
  
  const PlatformIcon = platformIcons[asset.marketplace?.toLowerCase()] || SiGooglechrome;
  const mockData = generateMockHistory(asset.users || 10000, asset.estimatedMrr || 500);
  const userHistory = asset.userHistory || mockData.userHistory;
  const mrrHistory = asset.mrrHistory || mockData.mrrHistory;
  
  // Calculate derived values
  const annualRevenue = (asset.estimatedMrr || 0) * 12;
  const estimatedValue = annualRevenue * 3;
  
  // Radar chart scores (0-10 scale) - must match HunterRadarScores interface
  const radarScores = {
    distress: asset.distressAxis || 7,
    monetizationGap: asset.monetizationAxis || 6,
    technicalRisk: asset.technicalAxis || 5,
    marketPosition: asset.marketAxis || 6,
    flipPotential: asset.flipAxis || 7,
  };
  
  // Calculate overall score (average of radar axes)
  const overallScore = Math.round(
    ((radarScores.distress + radarScores.monetizationGap + radarScores.marketPosition + radarScores.flipPotential - radarScores.technicalRisk + 10) / 5) * 10
  );
  
  // Distress signals with defaults
  const distressSignals = asset.distressSignals || [
    "No updates in 18+ months",
    "Support email unresponsive",
    "Manifest V2 (Chrome) - sunset risk",
  ];
  
  // Risk factors with defaults
  const riskFactors = asset.riskFactors || [
    "Technical debt likely",
    "May require platform migration",
    "Owner responsiveness unknown",
  ];
  
  // Opportunities with defaults
  const opportunities = asset.opportunities || [
    "Add premium tier for power users",
    "Cross-platform expansion (Firefox, Edge)",
    "Monetize with affiliate partnerships",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Feed</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {!isRevealed && (
              <Button 
                onClick={handleReveal} 
                disabled={isRevealing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="button-reveal-asset"
              >
                {isRevealing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Reveal Full Details
              </Button>
            )}
            {isRevealed && asset.url && (
              <Button asChild variant="outline">
                <a href={asset.url} target="_blank" rel="noreferrer" data-testid="link-asset-url">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Listing
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6 space-y-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Asset Icon & Basic Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <PlatformIcon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 truncate" data-testid="text-asset-name">
                  {isRevealed ? asset.name : "Premium Asset"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                  {isRevealed ? asset.description : "Reveal to see full description and contact details."}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <PlatformIcon className="w-3 h-3 mr-1" />
                    {asset.marketplace}
                  </Badge>
                  {asset.category && (
                    <Badge variant="outline">{asset.category}</Badge>
                  )}
                  {asset.rating && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {asset.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-users">
                  {formatNumber(asset.users || 0)}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600" data-testid="text-mrr">
                  {formatCurrency(asset.estimatedMrr || 0)}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3" /> Est. MRR
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600" data-testid="text-value">
                  {formatCurrency(estimatedValue)}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" /> Est. Value
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500" data-testid="text-distress-score">
                  {asset.distressScore || 75}%
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Distress
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="intelligence" data-testid="tab-intelligence">Hunter Intel</TabsTrigger>
            {isRevealed && <TabsTrigger value="contact" data-testid="tab-contact">Contact</TabsTrigger>}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hunter Radar */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    Hunter Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="text-5xl font-bold text-slate-900 dark:text-white">{overallScore}</div>
                      <div className="text-sm text-slate-500 text-center">/ 100</div>
                    </div>
                  </div>
                  <HunterRadar scores={radarScores} size="lg" />
                </CardContent>
              </Card>
              
              {/* Distress Signals */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Distress Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {distressSignals.map((signal: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Opportunities */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {opportunities.map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Risk Factors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                  <Shield className="w-4 h-4" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {riskFactors.map((risk: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Trend Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    User Trend (12 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userHistory}>
                        <defs>
                          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip 
                          formatter={(value: number) => [formatNumber(value), "Users"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#userGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* MRR Trend Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    Revenue Trend (12 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mrrHistory}>
                        <defs>
                          <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), "MRR"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="mrr" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fill="url(#mrrGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Valuation Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Valuation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <div className="text-sm text-slate-500 mb-1">Monthly Revenue</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(asset.estimatedMrr || 0)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <div className="text-sm text-slate-500 mb-1">Annual Revenue</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(annualRevenue)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <div className="text-sm text-slate-500 mb-1">3x Multiple</div>
                    <div className="text-xl font-bold text-emerald-600">{formatCurrency(estimatedValue)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <div className="text-sm text-slate-500 mb-1">Per User Value</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      ${asset.users ? (estimatedValue / asset.users).toFixed(2) : "0.00"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Hunter Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Hunter Intelligence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm text-slate-600 dark:text-slate-400">Distress</span>
                      <Progress value={radarScores.distress * 10} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium">{radarScores.distress}/10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm text-slate-600 dark:text-slate-400">Monetization</span>
                      <Progress value={radarScores.monetizationGap * 10} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium">{radarScores.monetizationGap}/10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm text-slate-600 dark:text-slate-400">Technical Risk</span>
                      <Progress value={radarScores.technicalRisk * 10} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium">{radarScores.technicalRisk}/10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm text-slate-600 dark:text-slate-400">Market</span>
                      <Progress value={radarScores.marketPosition * 10} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium">{radarScores.marketPosition}/10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-28 text-sm text-slate-600 dark:text-slate-400">Flip Potential</span>
                      <Progress value={radarScores.flipPotential * 10} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium">{radarScores.flipPotential}/10</span>
                    </div>
                  </div>
                </div>
                
                {/* Negotiation Strategy (if revealed) */}
                {isRevealed && asset.negotiationNotes && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Negotiation Strategy</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {asset.negotiationNotes}
                    </p>
                  </div>
                )}
                
                {!isRevealed && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Reveal this asset to unlock the full negotiation playbook</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contact Tab (only if revealed) */}
          {isRevealed && (
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    Owner Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {asset.ownerEmail ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="text-sm text-slate-500">Email</div>
                          <a href={`mailto:${asset.ownerEmail}`} className="text-blue-600 hover:underline" data-testid="link-owner-email">
                            {asset.ownerEmail}
                          </a>
                        </div>
                      </div>
                      {asset.ownerName && (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Users className="w-5 h-5 text-slate-500" />
                          <div>
                            <div className="text-sm text-slate-500">Owner</div>
                            <div className="font-medium">{asset.ownerName}</div>
                          </div>
                        </div>
                      )}
                      {asset.linkedinUrl && (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <div>
                            <div className="text-sm text-slate-500">LinkedIn</div>
                            <a href={asset.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              View Profile
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Contact information not yet available for this asset.</p>
                      <p className="text-sm mt-1">Our team is working on enriching this data.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
