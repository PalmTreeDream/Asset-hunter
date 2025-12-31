"use client";

import { useState } from "react";

interface Asset {
  id: string;
  title: string;
  description: string;
  price: string;
  revenue: string;
  type: string;
  details: string;
  userCount: number;
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

interface ValuationDrawerProps {
  asset: Asset;
  onClose: () => void;
}

export default function ValuationDrawer({ asset, onClose }: ValuationDrawerProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    // In production, this would trigger Stripe checkout
    setIsUnlocked(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 h-full overflow-y-auto border-l border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/90 border-b border-white/10 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Deal Analysis</p>
              <h2 className="text-xl font-bold text-white">{asset.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics - Glass Cards */}
          {asset.analysis && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Valuation</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {asset.analysis.valuation}
                  </p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Potential MRR</p>
                  <p className="text-2xl font-bold text-white">{asset.analysis.potential_mrr}</p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                  {asset.type === "chrome_extension" ? "Manifest V2 Risk" : "Platform Risk"}
                </p>
                <p className="text-yellow-400">{asset.analysis.manifest_v2_risk}</p>
              </div>

              {/* The Play - Visible */}
              <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">The Play (Acquisition Strategy)</p>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{asset.analysis.the_play}</p>
              </div>

              {/* BLURRED SECTION: Cold Email */}
              <div className="relative">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Cold Email Template</p>
                    {!isUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className={`text-slate-300 text-sm whitespace-pre-wrap leading-relaxed ${!isUnlocked ? "blur-md select-none pointer-events-none" : ""}`}>
                    {asset.analysis.cold_email || "Email template not available."}
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-t from-slate-900/90 to-transparent">
                    <button
                      onClick={handleUnlock}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-bold text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:scale-105"
                    >
                      Unlock Pro ($199/mo)
                    </button>
                  </div>
                )}
              </div>

              {/* BLURRED SECTION: Owner Contact */}
              <div className="relative">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Owner Contact Info</p>
                    {!isUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className={`text-slate-300 text-sm space-y-2 ${!isUnlocked ? "blur-md select-none pointer-events-none" : ""}`}>
                    <p>{asset.analysis.owner_contact || "Contact information unavailable"}</p>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-t from-slate-900/90 to-transparent">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-slate-400 text-sm">Premium Feature</p>
                    </div>
                  </div>
                )}
              </div>

              {/* BLURRED SECTION: Negotiation Script */}
              <div className="relative">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Negotiation Script</p>
                    {!isUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className={`text-slate-300 text-sm whitespace-pre-wrap leading-relaxed ${!isUnlocked ? "blur-md select-none pointer-events-none" : ""}`}>
                    {asset.analysis.negotiation_script || "Negotiation script unavailable"}
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-t from-slate-900/90 to-transparent">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-slate-400 text-sm">Unlock the Alpha</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              {!isUnlocked && (
                <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6 text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Unlock the Full Deal</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Get owner contact info, cold email templates, and negotiation scripts for every deal.
                  </p>
                  <button
                    onClick={handleUnlock}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 transition-all"
                  >
                    Upgrade to Pro - $199/mo
                  </button>
                  <p className="text-slate-500 text-xs mt-3">
                    100 subscribers = $20k MRR
                  </p>
                </div>
              )}
            </>
          )}

          {!asset.analysis && (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-slate-400">Click "Analyze" to generate insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
