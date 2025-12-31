import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle, 
  BookmarkCheck,
  Trash2,
  Users,
  TrendingUp,
  ExternalLink,
  Search,
  Loader2
} from "lucide-react";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox } from "react-icons/si";
import { motion } from "framer-motion";

interface SavedAsset {
  id: number;
  assetId: string;
  assetName: string;
  assetUrl: string;
  marketplace: string;
  description: string | null;
  users: number;
  estimatedMrr: number;
  distressScore: number;
  assetData: any;
  createdAt: string;
}

function getMarketplaceIcon(marketplace: string) {
  const lower = marketplace.toLowerCase();
  if (lower.includes('chrome')) return SiGooglechrome;
  if (lower.includes('firefox')) return SiFirefox;
  if (lower.includes('shopify')) return SiShopify;
  if (lower.includes('wordpress')) return SiWordpress;
  if (lower.includes('slack')) return SiSlack;
  return SiGooglechrome;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num}`;
}

function SavedAssetCard({ 
  asset, 
  onRemove,
  isRemoving
}: { 
  asset: SavedAsset;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const Icon = getMarketplaceIcon(asset.marketplace);
  
  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors" data-testid={`card-saved-${asset.assetId}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap gap-y-1">
            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {asset.marketplace}
            </Badge>
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-500">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Distress: {asset.distressScore}%
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-red-500"
            onClick={onRemove}
            disabled={isRemoving}
            data-testid={`button-remove-${asset.assetId}`}
          >
            {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate" data-testid={`text-name-${asset.assetId}`}>
              {asset.assetName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {asset.description || "Software asset with acquisition potential"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
          <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-500">Est. MRR</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid={`text-mrr-${asset.assetId}`}>
              {formatCurrency(asset.estimatedMrr)}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-500">Users</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white" data-testid={`text-users-${asset.assetId}`}>
              {formatNumber(asset.users)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BookmarkCheck className="w-3 h-3" />
          Saved {new Date(asset.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}

export default function Watchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  useEffect(() => {
    loadSavedAssets();
  }, []);
  
  const loadSavedAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Failed to load saved assets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveAsset = async (assetId: string) => {
    setRemovingId(assetId);
    try {
      await apiRequest('DELETE', `/api/saved/${assetId}`);
      setSavedAssets(prev => prev.filter(a => a.assetId !== assetId));
      toast({
        title: "Removed from watchlist",
        description: "Asset has been removed from your watchlist"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove asset",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <BookmarkCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Please sign in to view and manage your saved assets.
          </p>
          <Link href="/">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" data-testid="button-go-home">
              Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" data-testid="link-back-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="sm" />
                <span className="font-semibold text-slate-900 dark:text-white">AssetHunter</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-sm text-slate-500">Back to Home</span>
              </div>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700" data-testid="link-browse-feed">
                <Search className="w-4 h-4 mr-2" />
                Browse Feed
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <BookmarkCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Watchlist</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Assets you've saved for later review
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : savedAssets.length === 0 ? (
          <Card className="p-12 text-center">
            <BookmarkCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No saved assets yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start browsing the feed and save assets you're interested in to your watchlist.
            </p>
            <Link href="/feed">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" data-testid="button-browse-assets">
                Browse Assets
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="text-saved-count">
                <span className="font-medium text-slate-900 dark:text-white">{savedAssets.length}</span> saved asset{savedAssets.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAssets.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <SavedAssetCard 
                    asset={asset}
                    onRemove={() => handleRemoveAsset(asset.assetId)}
                    isRemoving={removingId === asset.assetId}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
