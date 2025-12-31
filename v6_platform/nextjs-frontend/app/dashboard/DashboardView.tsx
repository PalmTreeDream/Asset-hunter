"use client";

import { useState } from "react";
import ValuationDrawer from "../../components/ValuationDrawer";

interface Asset {
  id: string;
  title: string;
  description: string;
  price: string;
  revenue: string;
  type: string;
  details: string;
  userCount: number;
  marketplace: string;
  mrrPotential: number;
  analysis?: {
    valuation: string;
    potential_mrr: string;
    the_play: string;
    cold_email: string;
    manifest_v2_risk: string;
    owner_contact?: string;
    negotiation_script?: string;
  };
}

const MARKETPLACE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  chrome_extension: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  firefox_addon: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  shopify_app: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  wordpress_plugin: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/30" },
  slack_app: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  zapier_integration: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  saas_product: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  saas_forsale: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
};

const TYPE_LABELS: Record<string, string> = {
  chrome_extension: "Chrome",
  firefox_addon: "Firefox",
  shopify_app: "Shopify",
  wordpress_plugin: "WordPress",
  slack_app: "Slack",
  zapier_integration: "Zapier",
  saas_product: "SaaS",
  saas_forsale: "For Sale",
};

export default function DashboardView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("productivity");
  const [scanType, setScanType] = useState("all");

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: searchQuery, scan_type: scanType })
      });
      const data = await res.json();

      setAssets(data.assets.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        price: "Pending Analysis",
        revenue: item.revenue,
        type: item.type,
        details: item.details,
        userCount: item.user_count || 0,
        marketplace: item.marketplace || "Unknown",
        mrrPotential: item.mrr_potential || 0,
      })));
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAnalyze = async (asset: Asset) => {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_name: asset.title,
          users: asset.userCount,
          url: asset.id,
          asset_type: asset.type,
          marketplace: asset.marketplace,
          mrr_potential: asset.mrrPotential,
        })
      });
      const analysis = await res.json();

      const updatedAsset = { ...asset, price: analysis.valuation, analysis };
      setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
      setSelectedAsset(updatedAsset);
    } catch (e) {
      console.error("Analysis failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center font-bold text-slate-900">
                AH
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Asset Hunter
                </h1>
                <p className="text-xs text-slate-400">Micro-PE Engine v8.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                LIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Panel - Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter niche (e.g., productivity, vpn, inventory)"
              className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Platforms (8)</option>
              <option value="chrome">Chrome Extensions</option>
              <option value="firefox">Firefox Add-ons</option>
              <option value="shopify">Shopify Apps</option>
              <option value="wordpress">WordPress Plugins</option>
              <option value="slack">Slack Apps</option>
              <option value="zapier">Zapier Integrations</option>
              <option value="producthunt">Product Hunt SaaS</option>
              <option value="forsale">For Sale (Flippa/Acquire)</option>
            </select>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Scanning...
                </span>
              ) : (
                "Hunt Assets"
              )}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {assets.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
              <p className="text-slate-400 text-sm">Assets Found</p>
              <p className="text-2xl font-bold text-white">{assets.length}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-emerald-400">
                {assets.reduce((sum, a) => sum + a.userCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
              <p className="text-slate-400 text-sm">Est. MRR Potential</p>
              <p className="text-2xl font-bold text-cyan-400">
                ${assets.reduce((sum, a) => sum + a.mrrPotential, 0).toLocaleString()}/mo
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {assets.length === 0 && !isScanning && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl text-slate-400 mb-2">No assets found yet</p>
            <p className="text-sm text-slate-500">Enter a niche and click "Hunt Assets" to find distressed software</p>
          </div>
        )}

        {/* Asset Grid - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300"
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                  MARKETPLACE_COLORS[asset.type]?.bg || "bg-slate-500/20"
                } ${
                  MARKETPLACE_COLORS[asset.type]?.text || "text-slate-400"
                } ${
                  MARKETPLACE_COLORS[asset.type]?.border || "border-slate-500/30"
                }`}>
                  {TYPE_LABELS[asset.type] || asset.type}
                </span>
                <span className="text-emerald-400 font-bold text-sm">{asset.price}</span>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                {asset.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{asset.description}</p>
              
              {/* Metrics */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Users</span>
                  <span className="text-white font-medium">{asset.userCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">MRR Potential</span>
                  <span className="text-emerald-400 font-medium">${asset.mrrPotential.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={asset.type === "saas_forsale" ? "text-emerald-400 font-medium" : "text-orange-400 font-medium"}>
                    {asset.type === "saas_forsale" ? "For Sale" : "Distressed"}
                  </span>
                </div>
              </div>

              {/* Distress Signal */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-orange-400 text-xs">{asset.details}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnalyze(asset)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Analyze
                </button>
                {asset.analysis && (
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-white/10 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    View Deal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Valuation Drawer */}
      {selectedAsset && (
        <ValuationDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
