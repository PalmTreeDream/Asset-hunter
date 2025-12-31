import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Target, Users, DollarSign, Store, Share2, Chrome, Globe, ShoppingCart, Puzzle, MessageSquare, Zap, Rocket, Tag, Smartphone, Monitor, Briefcase, Layers, Package, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// Platform stats - represents market opportunity across 14 marketplaces (consistent with Hunt page)
const PLATFORM_STATS = {
  marketplaces: 14,
  estimatedAssets: "12,400+",
  estimatedMrr: "$18.7M",
  minUserThreshold: "1K-50,000+",
};

const MARKETPLACES = [
  { name: "Chrome Web Store", icon: Chrome, count: "12K+" },
  { name: "Firefox Add-ons", icon: Globe, count: "8K+" },
  { name: "Shopify Apps", icon: ShoppingCart, count: "6K+" },
  { name: "WordPress Plugins", icon: Puzzle, count: "10K+" },
  { name: "Slack Apps", icon: MessageSquare, count: "2K+" },
  { name: "Zapier", icon: Zap, count: "5K+" },
  { name: "Product Hunt", icon: Rocket, count: "Active" },
  { name: "Flippa", icon: Tag, count: "For Sale" },
  { name: "iOS Apps", icon: Smartphone, count: "Premium" },
  { name: "Android", icon: Smartphone, count: "Premium" },
  { name: "Microsoft", icon: Monitor, count: "Edge" },
  { name: "Salesforce", icon: Briefcase, count: "B2B" },
  { name: "Atlassian", icon: Layers, count: "Enterprise" },
  { name: "Gumroad", icon: Package, count: "Digital" },
];

const DISTRESS_SIGNALS = [
  { icon: Clock, label: "No updates in 6+ months", color: "text-amber-500" },
  { icon: AlertTriangle, label: "Manifest V2 deadline risk", color: "text-red-500" },
  { icon: TrendingUp, label: "Declining review velocity", color: "text-orange-500" },
  { icon: Users, label: "1000+ users still active", color: "text-emerald-500" },
];

export default function Pulse() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share this page with your network" });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="relative min-h-screen animate-in fade-in duration-500">
      {/* Clean Background */}
      <div className="fixed inset-0 -z-10 bg-background" />

      <div className="relative max-w-5xl mx-auto space-y-10 px-4 pb-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 pt-12"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 glass-strong rounded-full border border-border/30 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-accent rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-foreground">Live</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">Distress Pulse</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent font-mono">$18.7M</span>
            <span> in Hidden MRR</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AssetHunter scans 14 marketplaces for distressed software with established user bases. Here's what's waiting to be acquired.
          </p>
          
          <Button variant="outline" onClick={handleShare} data-testid="button-share-pulse">
            <Share2 className="w-4 h-4 mr-2" />
            Share This Page
          </Button>
        </motion.div>

        {/* Stats Row - Glass Card Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl border border-border/30 shadow-soft-lg overflow-hidden"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/30">
            {[
              { icon: Store, label: "Marketplaces", value: PLATFORM_STATS.marketplaces.toString() },
              { icon: Target, label: "Off-Market Assets", value: PLATFORM_STATS.estimatedAssets },
              { icon: DollarSign, label: "MRR Identified", value: PLATFORM_STATS.estimatedMrr },
              { icon: Users, label: "User Range", value: PLATFORM_STATS.minUserThreshold },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                className="p-6 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground font-mono" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Distress Signals Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-center text-muted-foreground">
            What the AssetHunter Algorithm Detects
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {DISTRESS_SIGNALS.map((signal) => (
              <div
                key={signal.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/30"
              >
                <signal.icon className={`w-4 h-4 ${signal.color}`} />
                <span className="text-sm text-foreground">{signal.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Marketplaces Grid - Compact Glass Panels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">14</span> Marketplaces Scanned
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {MARKETPLACES.map((marketplace, i) => (
              <motion.div
                key={marketplace.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.03 }}
              >
                <Card className="p-3 text-center glass border-border/30 hover:border-accent/30 transition-colors group">
                  <marketplace.icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground group-hover:text-accent transition-colors" />
                  <p className="text-xs font-medium truncate">{marketplace.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-muted-foreground">{marketplace.count}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="relative overflow-hidden p-8 md:p-10 text-center glass-strong rounded-3xl border border-border/30 shadow-soft-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Find Your First Deal?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start scanning for distressed apps with 1000+ users. Hunter Intelligence surfaces opportunities before they hit public marketplaces.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button 
                  size="lg" 
                  className="rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-soft-lg px-8"
                  onClick={() => navigate("/hunt")} 
                  data-testid="button-start-hunting"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Start Hunting Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/settings")} className="rounded-xl" data-testid="button-refer-friend">
                  <Share2 className="w-5 h-5 mr-2" />
                  Refer a Friend
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center text-sm text-muted-foreground pb-8"
        >
          <p>
            The AssetHunter Algorithm identifies apps with 1,000+ users showing distress signals: no updates in 6+ months, declining reviews, compliance deadlines, or motivated sellers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
