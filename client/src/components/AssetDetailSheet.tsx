import { ScannedAsset } from "@shared/schema";
import { 
  Lock,
  AlertTriangle,
  ExternalLink,
  Mail,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  Loader2,
  Calendar,
  Globe
} from "lucide-react";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HunterRadar } from "@/components/HunterRadar";
import { useToast } from "@/hooks/use-toast";

// Get the appropriate icon for a marketplace
function getPlatformIcon(marketplace: string): typeof SiGooglechrome {
  const iconMap: Record<string, typeof SiGooglechrome> = {
    "Chrome Extension": SiGooglechrome,
    "Firefox Extension": SiFirefox,
    "Shopify App": SiShopify,
    "WordPress Plugin": SiWordpress,
    "Slack App": SiSlack,
    "chrome": SiGooglechrome,
    "firefox": SiFirefox,
    "shopify": SiShopify,
    "wordpress": SiWordpress,
    "slack": SiSlack,
    "vscode": SiGooglechrome,
  };
  return iconMap[marketplace] || iconMap[marketplace.toLowerCase()] || (Globe as unknown as typeof SiGooglechrome);
}

// Generate masked name for non-premium users
function getMaskedName(asset: { marketplace: string; id: number; category: string | null }): string {
  const platformPrefixes: Record<string, string> = {
    "Chrome Extension": "Browser Extension",
    "Firefox Extension": "Browser Extension",
    "Shopify App": "E-commerce App",
    "WordPress Plugin": "CMS Plugin",
    "Slack App": "Team Integration",
    "Marketplace": "Marketplace Platform",
    "SaaS": "SaaS Platform",
    "chrome": "Browser Extension",
    "firefox": "Browser Extension",
    "shopify": "E-commerce App",
    "wordpress": "CMS Plugin",
    "slack": "Team Integration",
    "vscode": "Code Extension",
  };

  const prefix = platformPrefixes[asset.marketplace] || platformPrefixes[asset.marketplace.toLowerCase()] || asset.category || "Software Asset";
  const numericId = String(asset.id).slice(-4);
  return `${prefix} #${numericId}`;
}

// Generate masked description for non-premium users
function getMaskedDescription(category: string | null): string {
  const descriptions: Record<string, string> = {
    "Browser Extension": "Productivity tool with established user base showing signs of reduced maintenance",
    "E-commerce": "Commerce solution with active merchant installs and recurring revenue potential",
    "SaaS": "Software platform with verified revenue and growth metrics",
    "Mobile App": "Mobile application with engaged user community",
    "Marketplace": "Marketplace platform connecting buyers and sellers",
  };
  return descriptions[category || ""] || "Software asset with established distribution and monetization opportunity";
}

function calculateAcquisitionCost(mrrValue: number): string {
  const annualRevenue = mrrValue * 12;
  const acquisitionCost = annualRevenue * 3;
  if (acquisitionCost >= 1000000) {
    return `$${(acquisitionCost / 1000000).toFixed(1)}M`;
  } else if (acquisitionCost >= 1000) {
    return `$${Math.round(acquisitionCost / 1000)}K`;
  }
  return `$${Math.round(acquisitionCost)}`;
}

export function AssetDetailSheet({
  asset,
  open,
  onClose,
  onUnlock,
  onReveal,
  isSaved = false,
  isSaving = false,
  onSave,
  isPremium = false,
  isRevealed = false,
  isRevealing = false,
  creditsRemaining = 0
}: {
  asset: ScannedAsset | null;
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onReveal: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onSave: () => void;
  isPremium?: boolean;
  isRevealed?: boolean;
  isRevealing?: boolean;
  creditsRemaining?: number;
}) {
  if (!asset) return null;

  const { toast } = useToast();

  const Icon = getPlatformIcon(asset.marketplace);
  const hasAccess = isPremium || isRevealed;
  const displayName = hasAccess ? asset.name : getMaskedName(asset);
  const displayDescription = hasAccess ? (asset.description || "") : getMaskedDescription(asset.category);

  const uniqueTags = Array.from(new Set(asset.tags || []));

  // Calculate scores (0-10 scale)
  const distressVal = (asset.distressScore || 0) / 10;
  const monetizationVal = asset.monetizationAxis || 7;
  const technicalVal = asset.technicalAxis || 4;
  const marketVal = asset.marketAxis || 6.5;
  const flipVal = asset.flipAxis || 7.5;
  const overallScore = Math.round((distressVal + monetizationVal + technicalVal + marketVal + flipVal) / 5 * 10);

  const distressSignals = [
    { text: distressVal >= 7 ? "No updates in 12+ months" : distressVal >= 5 ? "Sporadic updates" : "Active development", critical: distressVal >= 7 },
    { text: distressVal >= 6 ? "Support tickets ignored" : "Support responsive", critical: distressVal >= 6 },
    { text: distressVal >= 7 ? "Manifest V2 at risk" : "Platform compliant", critical: distressVal >= 7 }
  ];

  const lastUpdated = asset.lastUpdatedByOwner ? new Date(asset.lastUpdatedByOwner).toLocaleDateString() : 'Unknown';
  const isTrendingUp = (asset.distressScore || 0) < 40; 

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-950 border-slate-800 text-white overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <SheetTitle className="text-white text-xl truncate" data-testid="text-detail-name">{displayName}</SheetTitle>
                <SheetDescription className="text-slate-400">{asset.marketplace}</SheetDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueTags.slice(0, 3).map((tag, idx) => (
                    <Badge key={`${tag}-${idx}`} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full hover:bg-slate-800 shrink-0 ${isSaved ? 'text-red-500' : 'text-slate-400'}`}
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full bg-slate-900">
            <TabsTrigger value="overview" className="flex-1" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence" className="flex-1" data-testid="tab-intelligence">Hunter Intelligence</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1" data-testid="tab-contact">Owner Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-sm flex-1 mr-4" data-testid="text-detail-description">{displayDescription}</p>
              {hasAccess && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full border-slate-700 bg-slate-900 text-slate-300 shrink-0"
                  onClick={() => asset.url && window.open(asset.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Store
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 py-2 border-y border-slate-900">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated: <span className="text-slate-300">{lastUpdated}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Niche: <span className="text-slate-300 capitalize">{asset.category || 'General'}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                {isTrendingUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
                <span className={isTrendingUp ? 'text-emerald-400' : 'text-amber-400'}>{isTrendingUp ? 'Growing' : 'Dormant'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Est. Acquisition</div>
                <div className="text-xl font-bold text-white" data-testid="text-detail-price">{calculateAcquisitionCost(asset.estimatedMrr || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">3x annual revenue</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Est. MRR</div>
                <div className="text-xl font-bold text-emerald-400" data-testid="text-detail-mrr">{"$" + (asset.estimatedMrr?.toLocaleString() || "0")}</div>
                <div className="text-xs text-slate-500 mt-1">${((asset.estimatedMrr || 0) * 12).toLocaleString()}/yr</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <div className="text-sm font-semibold text-white" data-testid="text-detail-users">{asset.users?.toLocaleString() || 0}</div>
                <div className="text-xs text-slate-500">Users</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <div className="text-sm font-semibold text-white" data-testid="text-detail-rating">{asset.rating?.toFixed(1) || 'N/A'}</div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${distressVal >= 7 ? 'text-red-400' : distressVal >= 5 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div className={`text-sm font-semibold ${distressVal >= 7 ? 'text-red-400' : distressVal >= 5 ? 'text-amber-400' : 'text-emerald-400'}`} data-testid="text-detail-distress">
                  {distressVal.toFixed(1)}/10
                </div>
                <div className="text-xs text-slate-500">Distress</div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">Quick Score</h4>
                <Badge variant="outline" className={`text-xs ${overallScore >= 70 ? 'border-emerald-500 text-emerald-400' : overallScore >= 50 ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-400'}`}>
                  {overallScore}/100
                </Badge>
              </div>
              <div className="flex justify-center">
                <HunterRadar
                  scores={{ distress: distressVal, monetizationGap: monetizationVal, technicalRisk: technicalVal, marketPosition: marketVal, flipPotential: flipVal }}
                  size="sm"
                  showLabels={true}
                  showValues={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="mt-6 space-y-6">
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">Hunter Radar Analysis</h4>
                <Badge variant="outline" className={`text-xs ${overallScore >= 70 ? 'border-emerald-500 text-emerald-400' : overallScore >= 50 ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-400'}`}>
                  Overall: {overallScore}/100
                </Badge>
              </div>
              <div className="flex justify-center">
                <HunterRadar
                  scores={{ distress: distressVal, monetizationGap: monetizationVal, technicalRisk: technicalVal, marketPosition: marketVal, flipPotential: flipVal }}
                  size="md"
                  showLabels={true}
                  showValues={true}
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-white mb-3">Score Breakdown</h4>
              {[
                { label: "Distress Level", value: distressVal, desc: "How abandoned is this asset?" },
                { label: "Monetization Gap", value: monetizationVal, desc: "Untapped revenue potential" },
                { label: "Technical Risk", value: technicalVal, desc: "Platform compliance issues" },
                { label: "Market Position", value: marketVal, desc: "Competitive strength" },
                { label: "Flip Potential", value: flipVal, desc: "Resale opportunity" }
              ].map((score) => (
                <div key={score.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{score.label}</span>
                      <span className={score.value >= 7 ? 'text-emerald-400' : score.value >= 5 ? 'text-amber-400' : 'text-slate-400'}>
                        {score.value.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score.value >= 7 ? 'bg-emerald-500' : score.value >= 5 ? 'bg-amber-500' : 'bg-slate-600'}`}
                        style={{ width: `${score.value * 10}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{score.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            {!hasAccess ? (
              <div className="bg-slate-900 rounded-xl p-8 text-center space-y-4">
                <Lock className="w-12 h-12 text-slate-700 mx-auto" />
                <div>
                  <h4 className="text-white font-semibold">Contact Info Locked</h4>
                  <p className="text-slate-400 text-sm mt-1">Unlock this asset to reveal owner contact details and negotiation scripts.</p>
                </div>
                <div className="pt-2">
                  <Button 
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={onReveal}
                    disabled={isRevealing}
                  >
                    {isRevealing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Reveal Owner Info ({creditsRemaining} left)
                  </Button>
                  <p className="text-[10px] text-slate-500 mt-2">Requires 1 Reveal Credit</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white">Owner Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Name</span>
                      <span className="text-sm text-white font-medium">{asset.ownerName || 'Available on Reveal'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Email</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{asset.ownerEmail || 'Revealing...'}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                          if (asset.ownerEmail) {
                            navigator.clipboard.writeText(asset.ownerEmail);
                            toast({ title: "Copied!", description: "Email copied to clipboard" });
                          }
                        }}>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Cold Outreach
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
