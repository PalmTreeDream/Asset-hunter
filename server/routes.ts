import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import { MARKETPLACE_CONFIDENCE, MRR_FORMULAS } from "./hunter-intelligence";
import { scrapeAllMarketplaces, getFallbackAssets, type ScrapedAsset } from "./direct-scrapers";

// Extend express-session with our custom session data
declare module 'express-session' {
  interface SessionData {
    email?: string;
    isPremium?: boolean;
    claimedAt?: number;
    verifiedAt?: number;
    tier?: 'scout' | 'hunter' | 'syndicate' | null;
    lastFreeScan?: number;
    freeScanCount?: number;
    dailyScanCount?: number;
    lastScanDate?: string;
    cachedAssets?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      description: string;
      revenue: string;
      details: string;
      status: string;
      user_count: number;
      marketplace: string;
      mrr_potential: number;
    }>;
  }
}

// SerpAPI Result Cache - 6 hour TTL to reduce API costs
interface SerpCacheEntry {
  results: any[];
  timestamp: number;
}
const serpApiCache = new Map<string, SerpCacheEntry>();
const SERP_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getSerpCacheKey(query: string, scanType: string): string {
  return `serp:${scanType}:${query.toLowerCase().trim().replace(/\s+/g, '-')}`;
}

function getCachedSerpResults(key: string): any[] | null {
  const cached = serpApiCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > SERP_CACHE_TTL_MS) {
    serpApiCache.delete(key);
    return null;
  }
  console.log(`[SerpAPI] Cache HIT: ${key}`);
  return cached.results;
}

function setCachedSerpResults(key: string, results: any[]): void {
  serpApiCache.set(key, { results, timestamp: Date.now() });
  console.log(`[SerpAPI] Cache SET: ${key} (${results.length} results)`);
  // Cleanup old entries (keep max 500)
  if (serpApiCache.size > 500) {
    const oldestKey = serpApiCache.keys().next().value;
    if (oldestKey) serpApiCache.delete(oldestKey);
  }
}

// Daily scan rate limits by tier
const SCAN_LIMITS = {
  free: 3,
  scout: 10,
  hunter: 50,
  syndicate: 100
};

// Seeded demo assets for Starter Scan (no API cost)
// Rotates based on niche query to give varied experience
const SEEDED_ASSETS = [
  { id: "demo-1", name: "Tab Manager Pro", type: "chrome_extension", url: "https://chromewebstore.google.com/detail/demo", description: "Organize and manage browser tabs efficiently. Last updated 2022.", revenue: "45,000 users", details: "DISTRESS: No updates in 18+ months. Manifest V2 risk.", status: "distressed", user_count: 45000, marketplace: "Chrome Web Store", mrr_potential: 4500 },
  { id: "demo-2", name: "Quick Screenshot", type: "chrome_extension", url: "https://chromewebstore.google.com/detail/demo2", description: "Capture screenshots with one click. Basic but functional.", revenue: "78,000 users", details: "DISTRESS: Abandoned since 2021. High user base.", status: "distressed", user_count: 78000, marketplace: "Chrome Web Store", mrr_potential: 7800 },
  { id: "demo-3", name: "Inventory Sync Plus", type: "shopify_app", url: "https://apps.shopify.com/demo", description: "Sync inventory across multiple sales channels. 4.2 star rating.", revenue: "~12,500 installs", details: "DISTRESS: No changelog in 8 months. Merchants complaining.", status: "distressed", user_count: 12500, marketplace: "Shopify App Store", mrr_potential: 2500 },
  { id: "demo-4", name: "Email Popup Builder", type: "shopify_app", url: "https://apps.shopify.com/demo2", description: "Create email capture popups for your store. Simple setup.", revenue: "~8,000 installs", details: "DISTRESS: Owner unresponsive. Support tickets piling up.", status: "distressed", user_count: 8000, marketplace: "Shopify App Store", mrr_potential: 1600 },
  { id: "demo-5", name: "SEO Image Optimizer", type: "wordpress_plugin", url: "https://wordpress.org/plugins/demo", description: "Automatically optimize images for better SEO rankings.", revenue: "25,000+ active installs", details: "DISTRESS: Last update 2022. Plugin still works but dated.", status: "distressed", user_count: 25000, marketplace: "WordPress.org", mrr_potential: 1250 },
  { id: "demo-6", name: "Contact Form Pro", type: "wordpress_plugin", url: "https://wordpress.org/plugins/demo2", description: "Advanced contact forms with conditional logic.", revenue: "18,000+ active installs", details: "DISTRESS: Developer abandoned project. Community requests ignored.", status: "distressed", user_count: 18000, marketplace: "WordPress.org", mrr_potential: 900 },
  { id: "demo-7", name: "Dark Mode Reader", type: "firefox_addon", url: "https://addons.mozilla.org/addon/demo", description: "Apply dark mode to any website. Customizable themes.", revenue: "32,000 users", details: "DISTRESS: No Firefox compatibility updates. Cross-browser opportunity.", status: "distressed", user_count: 32000, marketplace: "Firefox Add-ons", mrr_potential: 3200 },
  { id: "demo-8", name: "Note Taking Sidebar", type: "chrome_extension", url: "https://chromewebstore.google.com/detail/demo3", description: "Take notes while browsing. Syncs with cloud storage.", revenue: "22,000 users", details: "DISTRESS: Manifest V2 only. Needs migration urgently.", status: "distressed", user_count: 22000, marketplace: "Chrome Web Store", mrr_potential: 2200 },
  { id: "demo-9", name: "Product Reviews Widget", type: "shopify_app", url: "https://apps.shopify.com/demo3", description: "Display customer reviews beautifully. Boosts conversions.", revenue: "~15,000 installs", details: "DISTRESS: Competing with free alternatives. Price restructure needed.", status: "distressed", user_count: 15000, marketplace: "Shopify App Store", mrr_potential: 3000 },
  { id: "demo-10", name: "Slack Standup Bot", type: "slack_app", url: "https://slack.com/apps/demo", description: "Automate daily standups for remote teams. Simple setup.", revenue: "~5,000 installs", details: "DISTRESS: Free tier only. B2B premium pricing opportunity.", status: "distressed", user_count: 5000, marketplace: "Slack App Directory", mrr_potential: 2250 },
  { id: "demo-11", name: "Password Manager Lite", type: "chrome_extension", url: "https://chromewebstore.google.com/detail/demo4", description: "Simple password storage for personal use. Local only.", revenue: "56,000 users", details: "DISTRESS: Security concerns. Needs cloud sync feature.", status: "distressed", user_count: 56000, marketplace: "Chrome Web Store", mrr_potential: 5600 },
  { id: "demo-12", name: "Shipping Calculator", type: "shopify_app", url: "https://apps.shopify.com/demo4", description: "Calculate shipping rates for international orders.", revenue: "~6,500 installs", details: "DISTRESS: Outdated carrier APIs. Quick fix opportunity.", status: "distressed", user_count: 6500, marketplace: "Shopify App Store", mrr_potential: 1300 },
];

// Get seeded assets based on query (deterministic rotation)
function getSeededAssets(query: string): typeof SEEDED_ASSETS {
  const queryLower = (query || "").toLowerCase();
  const hash = queryLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  // Shuffle based on query hash for variety
  const shuffled = [...SEEDED_ASSETS].sort((a, b) => {
    const aHash = (hash + a.id.charCodeAt(5)) % 100;
    const bHash = (hash + b.id.charCodeAt(5)) % 100;
    return aHash - bHash;
  });
  
  // Filter by relevance if query matches keywords
  const keywords = ["tab", "screenshot", "inventory", "email", "seo", "image", "contact", "dark", "note", "review", "slack", "password", "shipping"];
  const matchingKeyword = keywords.find(k => queryLower.includes(k));
  
  if (matchingKeyword) {
    return shuffled.filter(a => 
      a.name.toLowerCase().includes(matchingKeyword) || 
      a.description.toLowerCase().includes(matchingKeyword)
    ).concat(shuffled.filter(a => 
      !a.name.toLowerCase().includes(matchingKeyword) && 
      !a.description.toLowerCase().includes(matchingKeyword)
    ));
  }
  
  return shuffled;
}

// Initialize Resend for transactional emails
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize AI engine for Hunter Intelligence analysis
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Leads API ===
  
  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.get(api.leads.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const lead = await storage.getLead(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const insights = await storage.getInsights(id);
    res.json({ ...lead, insights });
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.leads.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.leads.update.input.parse(req.body);
      const lead = await storage.updateLead(id, input);
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error" });
      }
      res.status(404).json({ message: "Lead not found" });
    }
  });

  app.delete(api.leads.delete.path, async (req, res) => {
    await storage.deleteLead(Number(req.params.id));
    res.status(204).send();
  });

  // === SEARCH API (SerpApi) ===
  app.post(api.leads.search.path, async (req, res) => {
    const { query, limit } = req.body;
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      return res.status(400).json({ 
        message: "Missing SERPAPI_KEY environment variable. Please add it in Secrets." 
      });
    }

    try {
      // Use axios to call SerpApi
      const response = await axios.get("https://serpapi.com/search.json", {
        params: {
          q: query,
          api_key: apiKey,
          engine: "google",
          num: limit,
        },
      });

      const results = response.data.organic_results || [];
      const mappedResults = results.map((r: any) => ({
        company: r.title,
        website: r.link,
        description: r.snippet,
        source: "Google Search (Real-Time)",
      }));

      res.json(mappedResults);
    } catch (error: any) {
      console.error("Search API Error:", error.message);
      res.status(500).json({ message: "Failed to fetch search results." });
    }
  });

  // === ANALYZE API (Hunter Intelligence Engine) ===
  app.post(api.leads.analyze.path, async (req, res) => {
    const id = Number(req.params.id);
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    try {
      const prompt = `
        Analyze this company as a potential B2B sales lead:
        Company: ${lead.company}
        Website: ${lead.website}
        Description: ${lead.description}
        
        Provide a concise report covering:
        1. Likely Industry/Sector
        2. Potential Pain Points
        3. Relevance Score (0-100)
        4. Recommended Outreach Angle
        
        Format as clear Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const content = response.text || "";
      // Extract score loosely
      const scoreMatch = content.match(/Score:?\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

      const insight = await storage.createInsight(id, content, score);
      res.json(insight);
    } catch (error: any) {
      console.error("[HunterIntelligence] Engine Error:", error);
      res.status(500).json({ message: "AI Analysis failed." });
    }
  });

  // === STARTER SCAN API (Ungated, Cached Results) ===
  // Serves pre-computed demo assets for free users - NO API cost
  // Rate limited: 1 fresh scan per 24 hours, then returns cached results
  app.post("/api/starter-scan", async (req, res) => {
    const { target_url } = req.body;
    
    // Check if user is premium (premium users should use /api/scan instead)
    const isPremium = req.session?.isPremium || req.session?.tier;
    
    // Rate limiting for free users: 1 scan per 24 hours
    const now = Date.now();
    const lastScan = req.session?.lastFreeScan || 0;
    const hoursSinceLastScan = lastScan ? (now - lastScan) / (1000 * 60 * 60) : 24;
    
    // Determine if this is a fresh scan or within cooldown
    let scanCount: number;
    let assets: ReturnType<typeof getSeededAssets>;
    let hoursRemaining: number;
    
    if (hoursSinceLastScan >= 24 || lastScan === 0) {
      // First scan or cooldown has passed - allow fresh scan
      scanCount = 1;
      req.session!.freeScanCount = 1;
      req.session!.lastFreeScan = now;
      req.session!.cachedAssets = getSeededAssets(target_url); // Cache results
      assets = req.session!.cachedAssets;
      hoursRemaining = 24; // Just started 24h window
    } else {
      // Still within 24h window - return cached results from first scan
      scanCount = (req.session?.freeScanCount || 0) + 1;
      req.session!.freeScanCount = scanCount;
      hoursRemaining = Math.max(0, Math.round(24 - hoursSinceLastScan));
      
      // Return cached results from their first scan (or generate if missing)
      if (req.session!.cachedAssets && req.session!.cachedAssets.length > 0) {
        assets = req.session!.cachedAssets;
      } else {
        // Fallback: generate and cache if somehow missing
        req.session!.cachedAssets = getSeededAssets(target_url);
        assets = req.session!.cachedAssets;
      }
    }
    
    // Return results with metadata
    res.json({
      assets,
      isDemo: true,
      scanCount,
      hoursRemaining,
      rateLimited: scanCount > 1,
      message: isPremium 
        ? "Use live scan for real-time results" 
        : scanCount > 1 
          ? `Showing cached results. ${hoursRemaining}h until free scan resets.`
          : "Demo results - upgrade to scan 14 live marketplaces",
      stats: {
        total: assets.length,
        avgMrr: Math.round(assets.reduce((sum, a) => sum + a.mrr_potential, 0) / assets.length),
        topMarketplace: "Chrome Web Store"
      }
    });
  });

  // === ASSET HUNTER BETA API ===
  // Multi-marketplace scanner for distressed digital assets
  // Strategy: Direct Scraping -> SerpAPI Backup -> Fallback Demo Assets
  app.post("/api/scan", async (req, res) => {
    const { target_url, scan_type = "all" } = req.body;
    const apiKey = process.env.SERPAPI_KEY;

    // Rate limiting: Check daily scan count
    const today = new Date().toISOString().split('T')[0];
    const tier = req.session?.tier || 'free';
    const scanLimit = SCAN_LIMITS[tier as keyof typeof SCAN_LIMITS] || SCAN_LIMITS.free;
    
    // Reset daily count if new day
    if (req.session?.lastScanDate !== today) {
      req.session!.lastScanDate = today;
      req.session!.dailyScanCount = 0;
    }
    
    const dailyScans = req.session?.dailyScanCount || 0;
    
    // Check if we have cached results first (saves scraping)
    const cacheKey = getSerpCacheKey(target_url, scan_type);
    const cachedResults = getCachedSerpResults(cacheKey);
    
    if (cachedResults && cachedResults.length > 0) {
      console.log(`[Scan] Returning ${cachedResults.length} cached results for "${target_url}"`);
      return res.json({
        assets: cachedResults,
        isDemo: false,
        isCached: true,
        dailyScans,
        scanLimit,
        message: "Cached results (refreshes every 6 hours)"
      });
    }
    
    // Rate limit check for fresh scans
    if (dailyScans >= scanLimit) {
      return res.status(429).json({
        message: `Daily scan limit reached (${scanLimit} scans). Upgrade for more scans or wait until tomorrow.`,
        rateLimited: true,
        dailyScans,
        scanLimit,
        tier
      });
    }

    try {
      // Increment scan count for fresh scans
      req.session!.dailyScanCount = dailyScans + 1;
      
      console.log(`[Scan] Starting scan for: "${target_url}" (method: direct scraping + fallback)`);
      
      // STRATEGY 1: Try direct scraping first (FREE, no API costs)
      let assets: ScrapedAsset[] = [];
      try {
        console.log(`[Scan] Attempting direct scraping across 14 marketplaces...`);
        assets = await scrapeAllMarketplaces(target_url);
        console.log(`[Scan] Direct scraping returned ${assets.length} results`);
      } catch (scrapeError: any) {
        console.error(`[Scan] Direct scraping failed:`, scrapeError.message);
      }
      
      // STRATEGY 2: If direct scraping returned few results and SerpAPI is available, supplement
      if (assets.length < 5 && apiKey) {
        console.log(`[Scan] Supplementing with SerpAPI (found only ${assets.length} via scraping)...`);
        try {
          const serpAssets = await searchSerpApiForAssets(target_url, apiKey);
          const existingIds = new Set(assets.map(a => a.url));
          const newAssets = serpAssets.filter(a => !existingIds.has(a.url));
          assets = [...assets, ...newAssets];
          console.log(`[Scan] SerpAPI added ${newAssets.length} additional results`);
        } catch (serpError: any) {
          console.error(`[Scan] SerpAPI supplement failed:`, serpError.message);
        }
      }
      
      // STRATEGY 3: If still no results, use high-quality fallback demo data
      if (assets.length === 0) {
        console.log(`[Scan] No results from scraping/API, using curated fallback assets`);
        assets = getFallbackAssets(target_url);
        
        // Cache fallback results too (so subsequent calls are fast)
        setCachedSerpResults(cacheKey, assets);
        
        return res.json({
          assets,
          isDemo: true,
          dailyScans: dailyScans + 1,
          scanLimit,
          message: "Showing curated distressed assets matching your search. Direct marketplace data temporarily unavailable."
        });
      }
      
      // Sort by user count (highest first)
      assets.sort((a, b) => b.user_count - a.user_count);
      
      // Cache successful results
      setCachedSerpResults(cacheKey, assets);
      
      return res.json({
        assets,
        isDemo: false,
        dailyScans: dailyScans + 1,
        scanLimit,
        message: `Found ${assets.length} potential assets across marketplaces`
      });

    } catch (error: any) {
      console.error("[Scan] Unexpected error:", error.message);
      
      // Final fallback on any error
      const fallbackAssets = getFallbackAssets(target_url);
      return res.json({
        assets: fallbackAssets,
        isDemo: true,
        error: "Scan encountered an issue. Showing curated results.",
        dailyScans: dailyScans + 1,
        scanLimit
      });
    }
  });
  
  // Helper: Search via SerpAPI and parse results
  async function searchSerpApiForAssets(query: string, apiKey: string): Promise<ScrapedAsset[]> {
    const assets: ScrapedAsset[] = [];
    
    const searchQueries = [
      `site:chromewebstore.google.com/detail "${query}" users`,
      `site:apps.shopify.com "${query}" reviews`,
      `site:wordpress.org/plugins "${query}" active installations`,
    ];
    
    for (const searchQuery of searchQueries) {
      try {
        const result = await axios.get("https://serpapi.com/search.json", {
          params: { engine: "google", q: searchQuery, api_key: apiKey, num: 10 },
          timeout: 10000,
        });
        
        const organicResults = result.data.organic_results || [];
        for (const item of organicResults) {
          const url = item.link || "";
          const title = item.title || "Unknown";
          const snippet = item.snippet || "";
          
          // Parse user counts from snippets
          const userMatch = snippet.match(/[\d,]+\s*(users?|install|download|review)/i);
          const userCount = userMatch ? parseInt(userMatch[0].replace(/\D/g, "")) : 5000;
          
          let marketplace = "Unknown";
          let type = "digital_asset";
          
          if (url.includes("chromewebstore")) {
            marketplace = "Chrome Web Store";
            type = "chrome_extension";
          } else if (url.includes("apps.shopify")) {
            marketplace = "Shopify App Store";
            type = "shopify_app";
          } else if (url.includes("wordpress.org/plugins")) {
            marketplace = "WordPress.org";
            type = "wordpress_plugin";
          }
          
          if (userCount >= 1000) {
            assets.push({
              id: `serp-${Buffer.from(url).toString('base64').substring(0, 16)}`,
              name: title.replace(/( - Chrome Web Store| \| Shopify| – WordPress.*)/gi, ""),
              type,
              url,
              description: snippet.substring(0, 150),
              revenue: `${userCount.toLocaleString()} users`,
              details: "Found via search. Verify distress signals manually.",
              status: "potential",
              user_count: userCount,
              marketplace,
              mrr_potential: Math.round(userCount * 0.1),
            });
          }
        }
      } catch (e: any) {
        console.error(`[SerpAPI] Query failed:`, e.message);
      }
    }
    
    return assets;
  }


  // Helper: Get PageSpeed Insights score (free API - no key required, rate limited)
  async function getPageSpeedScore(url: string): Promise<{ score: number; metrics: any } | null> {
    if (!url) return null;
    try {
      // PageSpeed Insights works without API key (rate limited to ~25 req/100sec)
      const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) return null;
      const data = await response.json();
      
      const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
      const metrics = {
        fcp: data.lighthouseResult?.audits?.["first-contentful-paint"]?.displayValue || "N/A",
        lcp: data.lighthouseResult?.audits?.["largest-contentful-paint"]?.displayValue || "N/A",
        cls: data.lighthouseResult?.audits?.["cumulative-layout-shift"]?.displayValue || "N/A",
        tbt: data.lighthouseResult?.audits?.["total-blocking-time"]?.displayValue || "N/A",
      };
      return { score, metrics };
    } catch (e) {
      console.log("PageSpeed fetch failed:", (e as Error).message);
      return null;
    }
  }

  // Helper: Extract domain from URL
  function extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }

  // ====== CUSTOM OWNER FINDER (Multi-Step Scraper) ======
  // Better than Hunter.io: Free, targeted, higher hit rate for app store developers
  
  // Junk email patterns to filter out
  const JUNK_EMAIL_PATTERNS = [
    /^noreply@/i, /^no-reply@/i, /^donotreply@/i,
    /^support@google\.com$/i, /^support@apple\.com$/i, /^support@microsoft\.com$/i,
    /^placeholder@/i, /^test@/i, /^example@/i, /^admin@/i,
    /^webmaster@/i, /^hostmaster@/i, /^postmaster@/i,
    /@example\.com$/i, /@test\.com$/i, /@localhost$/i,
    /^privacy@/i, // Often automated
  ];
  
  // Preferred email patterns (founders, owners, real contacts)
  const PREFERRED_EMAIL_PATTERNS = [
    /^(ceo|founder|owner|hello|hi|contact|info|team|business)@/i,
    /@gmail\.com$/i, /@outlook\.com$/i, /@hotmail\.com$/i, // Personal emails = real person
  ];
  
  // Email regex for deep scanning (global for matching all)
  const EMAIL_REGEX_GLOBAL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Non-global version for validation (avoids lastIndex issues)
  const EMAIL_REGEX_TEST = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Obfuscated email patterns
  const OBFUSCATED_PATTERNS = [
    /([a-zA-Z0-9._%+-]+)\s*[\[\(]at[\]\)]\s*([a-zA-Z0-9.-]+)\s*[\[\(]dot[\]\)]\s*([a-zA-Z]{2,})/gi,
    /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+)\s*\.\s*([a-zA-Z]{2,})/g,
  ];
  
  interface OwnerContact {
    email: string | null;
    status: "verified" | "hidden" | "dark";
    source: string;
    confidence: number;
    contact_form?: string;
    developer_website?: string;
  }
  
  // Validate email quality
  function isValidEmail(email: string, assetDomain?: string): { valid: boolean; score: number } {
    // Check junk patterns
    for (const pattern of JUNK_EMAIL_PATTERNS) {
      if (pattern.test(email)) return { valid: false, score: 0 };
    }
    
    // Basic format check (use non-global regex to avoid lastIndex issues)
    if (!EMAIL_REGEX_TEST.test(email)) return { valid: false, score: 0 };
    
    let score = 50; // Base score
    
    // Bonus for preferred patterns (real humans)
    for (const pattern of PREFERRED_EMAIL_PATTERNS) {
      if (pattern.test(email)) {
        score += 30;
        break;
      }
    }
    
    // Bonus if email domain matches asset domain
    if (assetDomain) {
      const emailDomain = email.split("@")[1]?.toLowerCase();
      if (emailDomain && assetDomain.toLowerCase().includes(emailDomain.replace(/^www\./, ""))) {
        score += 20;
      }
    }
    
    return { valid: true, score: Math.min(score, 100) };
  }
  
  // Fetch page HTML with timeout
  async function fetchPageHtml(url: string, timeout = 10000): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AssetHunter/1.0; +https://assethunter.app)",
          "Accept": "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
  
  // Extract emails from HTML (mailto: links)
  function extractMailtoEmails(html: string): string[] {
    const mailtoRegex = /href=["']mailto:([^"'?]+)/gi;
    const emails: string[] = [];
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      emails.push(match[1].toLowerCase().trim());
    }
    return Array.from(new Set(emails));
  }
  
  // Extract all emails from text (regex deep scan)
  function extractAllEmails(text: string): string[] {
    const foundEmails: string[] = text.match(EMAIL_REGEX_GLOBAL) || [];
    
    // Also find obfuscated emails
    for (const pattern of OBFUSCATED_PATTERNS) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        foundEmails.push(`${match[1]}@${match[2]}.${match[3]}`.toLowerCase());
      }
    }
    
    return Array.from(new Set(foundEmails.map(e => e.toLowerCase())));
  }
  
  // Find privacy policy URL
  function findPrivacyPolicyUrl(html: string, baseUrl: string): string | null {
    const patterns = [
      /href=["']([^"']*privacy[^"']*policy[^"']*)["']/i,
      /href=["']([^"']*privacy[^"']*)["']/i,
      /href=["']([^"']*\/legal[^"']*)["']/i,
      /href=["']([^"']*gdpr[^"']*)["']/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        // Handle relative URLs
        if (url.startsWith("/")) {
          try {
            const base = new URL(baseUrl);
            url = `${base.protocol}//${base.host}${url}`;
          } catch {
            continue;
          }
        } else if (!url.startsWith("http")) {
          continue;
        }
        return url;
      }
    }
    return null;
  }
  
  // Find developer website URL from store page
  function findDeveloperWebsite(html: string): string | null {
    // Chrome Web Store patterns
    const patterns = [
      /href=["']([^"']+)["'][^>]*>\s*(?:Developer\s*Website|Website|Homepage)/i,
      /"developerWebsite":\s*"([^"]+)"/i,
      /href=["']([^"']+)["'][^>]*class="[^"]*developer[^"]*"/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1].startsWith("http")) {
        return match[1];
      }
    }
    return null;
  }
  
  // Find contact form URL
  function findContactForm(html: string, baseUrl: string): string | null {
    const patterns = [
      /href=["']([^"']*contact[^"']*)["']/i,
      /href=["']([^"']*support[^"']*)["']/i,
      /href=["']([^"']*help[^"']*)["']/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        if (url.startsWith("/")) {
          try {
            const base = new URL(baseUrl);
            url = `${base.protocol}//${base.host}${url}`;
          } catch {
            continue;
          }
        }
        if (url.startsWith("http") && !url.includes("mailto:")) {
          return url;
        }
      }
    }
    return null;
  }
  
  // Main owner finder: Multi-step scraper
  async function findOwnerContact(assetUrl: string, assetDomain?: string): Promise<OwnerContact> {
    const result: OwnerContact = {
      email: null,
      status: "dark",
      source: "none",
      confidence: 0,
    };
    
    if (!assetUrl) return result;
    
    const foundEmails: { email: string; source: string; score: number }[] = [];
    
    try {
      // Step 1: Scrape the asset store page
      console.log("[OwnerFinder] Step 1: Scraping store page:", assetUrl);
      const storeHtml = await fetchPageHtml(assetUrl);
      
      if (storeHtml) {
        // Extract mailto: links first (highest quality)
        const mailtoEmails = extractMailtoEmails(storeHtml);
        for (const email of mailtoEmails) {
          const validation = isValidEmail(email, assetDomain);
          if (validation.valid) {
            foundEmails.push({ email, source: "store_mailto", score: validation.score + 10 });
          }
        }
        
        // Find developer website
        const devWebsite = findDeveloperWebsite(storeHtml);
        if (devWebsite) {
          result.developer_website = devWebsite;
          
          // Step 2: Scrape developer website
          console.log("[OwnerFinder] Step 2: Scraping developer website:", devWebsite);
          const devHtml = await fetchPageHtml(devWebsite);
          
          if (devHtml) {
            // Extract mailto: links from dev website
            const devMailtoEmails = extractMailtoEmails(devHtml);
            for (const email of devMailtoEmails) {
              const validation = isValidEmail(email, assetDomain);
              if (validation.valid) {
                foundEmails.push({ email, source: "dev_website_mailto", score: validation.score + 15 });
              }
            }
            
            // Step 3: Find and scrape privacy policy (GDPR trick)
            const privacyUrl = findPrivacyPolicyUrl(devHtml, devWebsite);
            if (privacyUrl) {
              console.log("[OwnerFinder] Step 3: Scraping privacy policy:", privacyUrl);
              const privacyHtml = await fetchPageHtml(privacyUrl);
              
              if (privacyHtml) {
                // Privacy policy MUST have contact email (GDPR/CCPA)
                const privacyEmails = extractAllEmails(privacyHtml);
                for (const email of privacyEmails) {
                  const validation = isValidEmail(email, assetDomain);
                  if (validation.valid) {
                    foundEmails.push({ email, source: "privacy_policy", score: validation.score + 5 });
                  }
                }
              }
            }
            
            // Step 4: Regex deep scan of developer website
            const allDevEmails = extractAllEmails(devHtml);
            for (const email of allDevEmails) {
              const validation = isValidEmail(email, assetDomain);
              if (validation.valid && !foundEmails.some(e => e.email === email)) {
                foundEmails.push({ email, source: "dev_website_regex", score: validation.score });
              }
            }
            
            // Find contact form as fallback
            const contactForm = findContactForm(devHtml, devWebsite);
            if (contactForm) {
              result.contact_form = contactForm;
            }
          }
        }
        
        // Also check privacy policy directly from store page
        const storePrivacyUrl = findPrivacyPolicyUrl(storeHtml, assetUrl);
        if (storePrivacyUrl && storePrivacyUrl !== result.developer_website) {
          console.log("[OwnerFinder] Scraping store privacy policy:", storePrivacyUrl);
          const storePrivacyHtml = await fetchPageHtml(storePrivacyUrl);
          
          if (storePrivacyHtml) {
            const privacyEmails = extractAllEmails(storePrivacyHtml);
            for (const email of privacyEmails) {
              const validation = isValidEmail(email, assetDomain);
              if (validation.valid && !foundEmails.some(e => e.email === email)) {
                foundEmails.push({ email, source: "store_privacy_policy", score: validation.score + 5 });
              }
            }
          }
        }
        
        // Find contact form on store page as fallback
        if (!result.contact_form) {
          const storeContactForm = findContactForm(storeHtml, assetUrl);
          if (storeContactForm) {
            result.contact_form = storeContactForm;
          }
        }
      }
      
      // Sort by score and pick best email
      if (foundEmails.length > 0) {
        foundEmails.sort((a, b) => b.score - a.score);
        const best = foundEmails[0];
        result.email = best.email;
        result.source = best.source;
        result.confidence = best.score;
        result.status = "verified";
        console.log(`[OwnerFinder] Found: ${best.email} (${best.source}, score: ${best.score})`);
      } else if (result.contact_form) {
        result.status = "hidden";
        console.log("[OwnerFinder] No email, but found contact form:", result.contact_form);
      } else {
        console.log("[OwnerFinder] No contact found");
      }
      
    } catch (error) {
      console.error("[OwnerFinder] Error:", (error as Error).message);
    }
    
    return result;
  }

  // Hardcoded test emails that always get premium access (for development/testing)
  const TEST_PREMIUM_EMAILS = [
    "esteadam@gmail.com",
    "palmtreedreamsinc@gmail.com"
  ];

  // Helper function to check if user is premium (has active subscription)
  async function isUserPremium(email?: string): Promise<boolean> {
    if (!email) return false;
    
    // Grant premium to test emails
    if (TEST_PREMIUM_EMAILS.includes(email.toLowerCase())) {
      return true;
    }
    
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.stripeSubscriptionId) return false;
      const subscription = await storage.getSubscription(user.stripeSubscriptionId);
      return subscription?.status === "active" || subscription?.status === "trialing";
    } catch {
      return false;
    }
  }

  // Analyze asset with Hunter Intelligence + enrichment APIs
  app.post("/api/analyze", async (req, res) => {
    const { asset_name, users, url, asset_type = "chrome_extension", marketplace = "Unknown", mrr_potential = 0 } = req.body;

    if (!asset_name || !users) {
      return res.status(400).json({ error: "Missing asset_name or users" });
    }

    // Use session-based premium check (secure - not trusting client-provided email)
    // Fall back to checking session email if available
    let isPremium = req.session?.isPremium || false;
    
    // If session has email but no premium flag cached, recheck
    if (req.session?.email && !isPremium) {
      isPremium = await isUserPremium(req.session.email);
      req.session.isPremium = isPremium;
    }

    try {
      // Calculate MRR based on asset type
      const conversionRates: Record<string, number> = {
        chrome_extension: 0.02,
        firefox_addon: 0.02,
        shopify_app: 0.02,
        wordpress_plugin: 0.01,
        slack_app: 0.03,
        zapier_integration: 0.02,
        saas_product: 0.03,
        saas_forsale: 0.05,
        ios_app: 0.01,
        android_app: 0.005,
        edge_addon: 0.02,
        microsoft_app: 0.02,
        salesforce_app: 0.05,
        atlassian_app: 0.03,
        gumroad_product: 0.1,
      };
      const pricePoints: Record<string, number> = {
        chrome_extension: 5,
        firefox_addon: 5,
        shopify_app: 10,
        wordpress_plugin: 5,
        slack_app: 15,
        zapier_integration: 10,
        saas_product: 20,
        saas_forsale: 30,
        ios_app: 3,
        android_app: 2,
        edge_addon: 5,
        microsoft_app: 5,
        salesforce_app: 50,
        atlassian_app: 20,
        gumroad_product: 30,
      };

      const conversionRate = conversionRates[asset_type] || 0.02;
      const pricePerMonth = pricePoints[asset_type] || 5;
      const calculatedMrr = mrr_potential > 0 ? mrr_potential : users * conversionRate * pricePerMonth;
      const annualRevenue = calculatedMrr * 12;
      const valuationLow = annualRevenue * 3;
      const valuationHigh = annualRevenue * 5;

      const assetContexts: Record<string, string> = {
        chrome_extension: "Chrome Extension. Google deprecating Manifest V2 in 2025 - migration or death. Leverage urgency.",
        firefox_addon: "Firefox Add-on. Cross-browser opportunity with Chrome. Lower competition than Chrome Web Store.",
        shopify_app: "Shopify App. Recurring revenue from merchants. High LTV, sticky customers.",
        wordpress_plugin: "WordPress Plugin. Massive 40%+ market share. Freemium model works well.",
        slack_app: "Slack Integration. Enterprise B2B potential. Higher pricing, longer sales cycles.",
        zapier_integration: "Zapier Connector. Automation market booming. API-first businesses.",
        saas_product: "SaaS Product. Direct subscription model. Focus on churn reduction.",
        saas_forsale: "Listed For Sale. Owner motivated. Use asking price as anchor, negotiate down 30-50%.",
      };
      const assetContext = assetContexts[asset_type] || "Digital asset with monetization potential.";

      const prompt = `You are a ruthless Distressed Asset Fund Manager. Analyze this acquisition target:

Asset: ${asset_name}
Type: ${asset_type}
Users: ${users.toLocaleString()}
${assetContext}

Pre-calculated metrics:
- Potential MRR: $${calculatedMrr.toLocaleString("en-US", { maximumFractionDigits: 0 })}/month
- Annual Revenue: $${annualRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
- Valuation: $${valuationLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${valuationHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}

Respond in JSON with: { "valuation": "...", "potential_mrr": "...", "the_play": "...", "cold_email": "...", "manifest_v2_risk": "...", "owner_contact": "...", "negotiation_script": "..." }`;

      // Run AI analysis + enrichment APIs in parallel for speed
      const domain = extractDomain(url);
      const [aiResponse, pageSpeedResult, ownerContactResult] = await Promise.all([
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        url ? getPageSpeedScore(url) : Promise.resolve(null),
        url ? findOwnerContact(url, domain || undefined) : Promise.resolve({ email: null, status: "dark" as const, source: "none", confidence: 0, contact_form: undefined, developer_website: undefined }),
      ]);

      let analysisText = aiResponse.text || "";
      
      // Clean JSON from markdown blocks
      if (analysisText.includes("```json")) {
        analysisText = analysisText.split("```json")[1]?.split("```")[0] || analysisText;
      } else if (analysisText.includes("```")) {
        analysisText = analysisText.split("```")[1]?.split("```")[0] || analysisText;
      }

      const analysis = JSON.parse(analysisText.trim());

      // Helper to ensure all fields are strings (AI sometimes returns objects)
      const toStr = (val: any): string => {
        if (typeof val === "string") return val;
        if (val && typeof val === "object") {
          // Handle cold_email: {subject, body} format
          if (val.subject && val.body) return `Subject: ${val.subject}\n\n${val.body}`;
          return JSON.stringify(val, null, 2);
        }
        return String(val || "");
      };

      // Build response with premium gating for sensitive fields
      const baseResponse = {
        valuation: toStr(analysis.valuation) || `$${valuationLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${valuationHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        potential_mrr: toStr(analysis.potential_mrr) || `$${calculatedMrr.toLocaleString("en-US", { maximumFractionDigits: 0 })}/month`,
        the_play: toStr(analysis.the_play) || "Analysis pending",
        manifest_v2_risk: toStr(analysis.manifest_v2_risk) || "Unknown",
        // Enrichment data (always visible)
        performance_score: pageSpeedResult?.score ?? null,
        performance_metrics: pageSpeedResult?.metrics ?? null,
        // Premium gating indicator
        is_premium_user: isPremium,
      };

      // Premium-only fields - gated on server side
      const premiumFields = isPremium ? {
        cold_email: toStr(analysis.cold_email) || "",
        owner_contact: ownerContactResult?.email || toStr(analysis.owner_contact) || "Contact locked",
        negotiation_script: toStr(analysis.negotiation_script) || "Script locked",
        verified_email: ownerContactResult?.email ?? null,
        email_confidence: ownerContactResult?.confidence ?? null,
        email_status: ownerContactResult?.status ?? "dark",
        email_source: ownerContactResult?.source ?? "none",
        contact_form: ownerContactResult?.contact_form ?? null,
        developer_website: ownerContactResult?.developer_website ?? null,
      } : {
        // Redacted values for free users
        cold_email: "[Upgrade to unlock cold email templates]",
        owner_contact: "[Upgrade to unlock]",
        negotiation_script: "[Upgrade to unlock negotiation scripts]",
        verified_email: null,
        email_confidence: null,
        email_status: "locked" as const,
        email_source: "locked",
        contact_form: null,
        developer_website: null,
      };

      res.json({ ...baseResponse, ...premiumFields });
    } catch (error: any) {
      console.error("Analyze Error:", error.message);
      // Return calculated values even if AI fails - 200 status so UI can display fallbacks
      const conversionRatesFallback: Record<string, number> = {
        chrome_extension: 0.02, firefox_addon: 0.02, shopify_app: 0.02,
        wordpress_plugin: 0.01, slack_app: 0.03, zapier_integration: 0.02,
        saas_product: 0.03, saas_forsale: 0.05,
        ios_app: 0.01, android_app: 0.005, edge_addon: 0.02, microsoft_app: 0.02,
        salesforce_app: 0.05, atlassian_app: 0.03, gumroad_product: 0.1,
      };
      const pricePointsFallback: Record<string, number> = {
        chrome_extension: 5, firefox_addon: 5, shopify_app: 10,
        wordpress_plugin: 5, slack_app: 15, zapier_integration: 10,
        saas_product: 20, saas_forsale: 30,
        ios_app: 3, android_app: 2, edge_addon: 5, microsoft_app: 5,
        salesforce_app: 50, atlassian_app: 20, gumroad_product: 30,
      };
      const conversionRate = conversionRatesFallback[asset_type] || 0.02;
      const pricePerMonth = pricePointsFallback[asset_type] || 5;
      const calculatedMrr = users * conversionRate * pricePerMonth;
      const annualRevenue = calculatedMrr * 12;
      const valuationLow = annualRevenue * 3;
      const valuationHigh = annualRevenue * 5;

      // Fallback response with premium gating
      const fallbackBase = {
        valuation: `$${valuationLow.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${valuationHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        potential_mrr: `$${calculatedMrr.toLocaleString("en-US", { maximumFractionDigits: 0 })}/month`,
        the_play: "AI analysis unavailable. Based on user count and market data, this asset shows acquisition potential. Contact owner to discuss terms.",
        manifest_v2_risk: asset_type === "chrome_extension" ? "High - Manifest V2 deprecation in 2025" : "N/A",
        performance_score: null,
        performance_metrics: null,
        is_premium_user: isPremium,
      };

      const fallbackPremiumFields = isPremium ? {
        cold_email: `Hi,\n\nI noticed your ${asset_type.replace("_", " ")} "${asset_name}" and I'm interested in potentially acquiring it.\n\nWould you be open to a brief conversation about your plans for the product?\n\nBest regards`,
        owner_contact: "Research via app listing",
        negotiation_script: "Start at 2x ARR, be prepared to go up to 4x for quality assets with sticky users.",
        verified_email: null,
        email_confidence: null,
        email_status: "dark" as const,
        email_source: "none",
        contact_form: null,
        developer_website: null,
      } : {
        cold_email: "[Upgrade to unlock cold email templates]",
        owner_contact: "[Upgrade to unlock]",
        negotiation_script: "[Upgrade to unlock negotiation scripts]",
        verified_email: null,
        email_confidence: null,
        email_status: "locked" as const,
        email_source: "locked",
        contact_form: null,
        developer_website: null,
      };

      res.json({ ...fallbackBase, ...fallbackPremiumFields });
    }
  });

  // === HUNTER INTELLIGENCE API (Branded AI Analysis) ===
  // New endpoint that returns Hunter Radar scores + branded intelligence
  app.post("/api/hunter-intelligence", async (req, res) => {
    const { 
      asset_name, 
      users, 
      url, 
      asset_type = "chrome_extension", 
      marketplace = "Unknown",
      description,
      last_updated,
      rating,
      review_count
    } = req.body;

    if (!asset_name || !users) {
      return res.status(400).json({ error: "Missing asset_name or users" });
    }

    // Use session-based premium check
    let isPremium = req.session?.isPremium || false;
    if (req.session?.email && !isPremium) {
      isPremium = await isUserPremium(req.session.email);
      req.session.isPremium = isPremium;
    }

    try {
      const { analyzeWithHunterIntelligence, MARKETPLACE_CONFIDENCE, generateCacheKey } = await import("./hunter-intelligence");
      
      const assetInput = {
        name: asset_name,
        type: asset_type,
        marketplace,
        url: url || "",
        userCount: users,
        description,
        lastUpdated: last_updated,
        rating,
        reviewCount: review_count,
      };

      // Generate cache key for deterministic results
      const cacheKey = generateCacheKey(assetInput);
      
      // Run Hunter Intelligence analysis
      const intelligence = await analyzeWithHunterIntelligence(assetInput);
      
      // Get marketplace confidence
      const marketplaceConfidence = MARKETPLACE_CONFIDENCE[marketplace] || { level: "low", reason: "Unknown marketplace" };

      // PREMIUM GATING: Build response with explicit field control
      // Free users see: hunterRadar, overallScore, mrrPotential, valuation, risks, opportunities
      // Premium users also see: acquisition, coldEmail, ownerIntel (real data from AI)
      
      // Locked placeholder templates (returned to non-premium users)
      const LOCKED_ACQUISITION = {
        strategy: "[Upgrade to Hunter or Syndicate to unlock acquisition playbook]",
        approach: "[Locked]",
        openingOffer: "[Locked]",
        walkAway: "[Locked]",
      };
      const LOCKED_COLD_EMAIL = {
        subject: "[Upgrade to unlock cold email templates]",
        body: "[Premium feature - unlock with Hunter tier or above]",
      };
      const LOCKED_OWNER_INTEL = {
        likelyMotivation: "[Locked]",
        bestTimeToReach: "[Locked]",
        negotiationLeverage: ["[Upgrade to unlock]"],
      };

      // Build complete response with gating applied
      const response = {
        // Always visible fields
        cacheKey,
        hunterRadar: intelligence.hunterRadar,
        overallScore: intelligence.overallScore,
        mrrPotential: intelligence.mrrPotential,
        valuation: intelligence.valuation,
        marketplaceConfidence,
        risks: intelligence.risks,
        opportunities: intelligence.opportunities,
        isPremiumUser: isPremium,
        // Premium-gated fields (real data OR locked placeholders)
        acquisition: isPremium ? intelligence.acquisition : LOCKED_ACQUISITION,
        coldEmail: isPremium ? intelligence.coldEmail : LOCKED_COLD_EMAIL,
        ownerIntel: isPremium ? intelligence.ownerIntel : LOCKED_OWNER_INTEL,
      };

      res.json(response);
    } catch (error: any) {
      console.error("[HunterIntelligence] Error:", error.message);
      
      // Fallback with basic calculations
      const { MARKETPLACE_CONFIDENCE, MRR_FORMULAS } = await import("./hunter-intelligence");
      const formula = MRR_FORMULAS[asset_type] || MRR_FORMULAS.saas_product;
      const baseMrr = Math.round(users * formula.conversionRate * formula.avgPrice);
      const marketplaceConfidence = MARKETPLACE_CONFIDENCE[marketplace] || { level: "low", reason: "Unknown" };

      res.json({
        cacheKey: `ahi:fallback:${asset_type}:${users}`,
        hunterRadar: {
          distress: 5,
          monetizationGap: 5,
          technicalRisk: 5,
          marketPosition: 5,
          flipPotential: 5,
        },
        overallScore: 50,
        mrrPotential: {
          low: Math.round(baseMrr * 0.5),
          mid: baseMrr,
          high: Math.round(baseMrr * 2),
          confidence: marketplaceConfidence,
        },
        valuation: {
          low: baseMrr * 12 * 3,
          high: baseMrr * 12 * 5,
          multiple: "3-5x ARR",
        },
        marketplaceConfidence,
        risks: ["Analysis temporarily unavailable"],
        opportunities: ["Manual review recommended"],
        isPremiumUser: isPremium,
        acquisition: {
          strategy: isPremium ? "Analysis unavailable - try again" : "[Locked]",
          approach: "[Unavailable]",
          openingOffer: "[Unavailable]",
          walkAway: "[Unavailable]",
        },
        coldEmail: {
          subject: isPremium ? "Analysis unavailable" : "[Locked]",
          body: isPremium ? "Please try again" : "[Locked]",
        },
        ownerIntel: {
          likelyMotivation: "[Unavailable]",
          bestTimeToReach: "[Unavailable]",
          negotiationLeverage: ["[Unavailable]"],
        },
      });
    }
  });

  // === DATA ENRICHMENT API ===
  // Enriches assets with GitHub activity and Hunter.io owner data
  app.post("/api/enrich", async (req, res) => {
    const { asset_url, github_url } = req.body;

    if (!asset_url) {
      return res.status(400).json({ error: "asset_url is required" });
    }

    // SECURE authentication check - require verified session with database verification
    const userEmail = req.session?.email;
    const isVerifiedSession = req.session?.verifiedAt && (Date.now() - req.session.verifiedAt < 7 * 24 * 60 * 60 * 1000); // 7 day max
    
    if (!userEmail || !isVerifiedSession) {
      return res.status(401).json({ 
        error: "Authentication required",
        message: "Please log in to access enrichment data"
      });
    }
    
    // ADDITIONAL SECURITY: Verify user exists in database (prevents edge cases)
    const userRecord = await storage.getUserByEmail(userEmail);
    if (!userRecord) {
      // Session email doesn't match any user in database - reject
      return res.status(401).json({ 
        error: "Invalid session",
        message: "User not found. Please log in again."
      });
    }
    
    // SECURE premium check - verify from database, not session
    const isPremium = await isUserPremium(userEmail);
    // Update session cache for performance on subsequent requests
    req.session.isPremium = isPremium;

    if (!isPremium) {
      return res.json({
        github: null,
        owner: {
          email: "[Upgrade to Hunter tier to unlock]",
          firstName: "[Locked]",
          lastName: "[Locked]",
          position: "[Locked]",
          confidence: 0,
          sources: [],
          linkedIn: "[Locked]",
          twitter: "[Locked]",
        },
        domain: null,
        enrichedAt: new Date().toISOString(),
        isPremiumUser: false,
      });
    }

    try {
      const { enrichAsset, detectGitHubFromMarketplacePage } = await import("./data-enrichment");

      let githubUrlToUse = github_url;
      if (!githubUrlToUse) {
        githubUrlToUse = await detectGitHubFromMarketplacePage(asset_url);
      }

      const enrichment = await enrichAsset(asset_url, githubUrlToUse);

      res.json({
        ...enrichment,
        isPremiumUser: true,
      });
    } catch (error: any) {
      console.error("[DataEnrichment] Error:", error.message);
      res.status(500).json({ error: "Enrichment failed", details: error.message });
    }
  });

  // === STRIPE BILLING ROUTES ===
  // Get publishable key
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("Stripe config error:", error.message);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  // List products with prices
  app.get("/api/stripe/products", async (req, res) => {
    try {
      const rows = await storage.listProductsWithPrices();
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
          });
        }
      }
      res.json({ data: Array.from(productsMap.values()) });
    } catch (error: any) {
      console.error("Products error:", error.message);
      res.json({ data: [] });
    }
  });

  // Create checkout session for Pro tier
  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      const { priceId, userId, email } = req.body;
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();
      
      // Get or create user
      let user = userId ? await storage.getUser(userId) : null;
      if (!user && email) {
        user = await storage.getUserByEmail(email);
      }
      
      // Create or get customer
      let customerId = user?.stripeCustomerId;
      if (!customerId && email) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId: userId || email },
        });
        customerId = customer.id;
        
        // Create/update user with Stripe customer ID
        if (user) {
          await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
        } else {
          await storage.createUser({
            id: userId || email,
            email,
            stripeCustomerId: customerId,
            plan: "free",
          });
        }
      }

      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain ? `https://${replitDomain}` : `http://localhost:5000`;
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: !customerId ? email : undefined,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/?checkout=success`,
        cancel_url: `${baseUrl}/?checkout=cancel`,
        metadata: { userId: userId || email },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Get user subscription status (session-based only for security)
  app.get("/api/user/subscription", async (req, res) => {
    // SECURITY: Only use session-based email - no query params allowed (prevents spoofing)
    const email = req.session?.email;
    
    // If no session, return free tier status (not an error - just means not logged in)
    if (!email) {
      return res.json({ plan: "free", isPro: false, authenticated: false });
    }

    try {
      const user = await storage.getUserByEmail(email);

      if (!user || !user.stripeSubscriptionId) {
        return res.json({ plan: user?.plan || "free", isPro: false });
      }

      const subscription = await storage.getSubscription(user.stripeSubscriptionId);
      const isPro = subscription?.status === "active" || subscription?.status === "trialing";
      
      res.json({ 
        plan: isPro ? "pro" : "free", 
        isPro,
        subscriptionStatus: subscription?.status 
      });
    } catch (error: any) {
      console.error("Subscription check error:", error.message);
      res.json({ plan: "free", isPro: false });
    }
  });

  // Customer portal for managing subscription
  app.post("/api/stripe/portal", async (req, res) => {
    const { userId, email } = req.body;
    
    try {
      let user = userId ? await storage.getUser(userId) : null;
      if (!user && email) {
        user = await storage.getUserByEmail(email);
      }

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain ? `https://${replitDomain}` : `http://localhost:5000`;
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: baseUrl,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Portal error:", error.message);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // === CONTACT FORM ===
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    try {
      await storage.createContactSubmission({ name, email, subject, message });
      
      // Send notification email to admin
      if (resend) {
        try {
          await resend.emails.send({
            from: "Asset Hunter <noreply@assethunter.io>",
            to: "adam@assethunter.io",
            subject: `[Contact Form] ${subject}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0f172a;">New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send contact notification:", emailError);
        }
      }

      res.json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Contact form error:", error.message);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // === NEWSLETTER ROUTES ===
  app.post("/api/newsletter/signup", async (req, res) => {
    const { email, source } = req.body;
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    try {
      // Check if already signed up
      const existing = await storage.getNewsletterSignup(email);
      if (existing) {
        return res.json({ success: true, message: "Already subscribed", alreadySubscribed: true });
      }

      await storage.createNewsletterSignup({
        email: email.toLowerCase().trim(),
        source: source || "hunt_page",
      });

      // Send welcome email via Resend
      if (resend) {
        try {
          await resend.emails.send({
            from: "Adam from Asset Hunter <adam@assethunter.io>",
            to: email.toLowerCase().trim(),
            subject: "Welcome to Asset Hunter - Your Deal Dossier Awaits",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #0f172a; font-size: 28px; margin-bottom: 24px;">Welcome to Asset Hunter</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  You're now on the inside track to discovering <strong>distressed digital assets</strong> with established user bases across 14 marketplaces.
                </p>
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); padding: 24px; border-radius: 12px; margin: 24px 0;">
                  <h2 style="color: white; font-size: 20px; margin: 0 0 12px 0;">Your 30-Second Deal Dossier</h2>
                  <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
                    We scan for: Chrome Extensions, Shopify Apps, WordPress Plugins, Slack Apps, Zapier integrations, and more.
                  </p>
                </div>
                <h3 style="color: #0f172a; font-size: 18px; margin: 24px 0 12px;">What to Look For:</h3>
                <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                  <li><strong>High user counts</strong> (1,000+ users = established distribution)</li>
                  <li><strong>No recent updates</strong> (6+ months = distressed owner)</li>
                  <li><strong>Manifest V2 extensions</strong> (deadline pressure = motivated seller)</li>
                  <li><strong>Broken support channels</strong> (abandoned = negotiating leverage)</li>
                </ul>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                  Remember: <strong>You're not buying code. You're buying distribution.</strong> It takes years to build 50,000 users organically. You can buy it in a week.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://assethunter.io" style="background: #0f172a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Start Hunting</a>
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 32px; text-align: center;">
                  Asset Hunter Beta - Find abandoned monopolies before anyone else.
                </p>
              </div>
            `,
          });
          console.log("Welcome email sent to:", email);
        } catch (emailError: any) {
          console.error("Failed to send welcome email:", emailError.message);
          // Don't fail the signup if email fails
        }
      }

      res.json({ 
        success: true, 
        message: "Welcome aboard! Check your inbox for your Deal Dossier.",
        downloadUrl: "/api/newsletter/playbook"
      });
    } catch (error: any) {
      console.error("Newsletter signup error:", error.message);
      // Handle unique constraint violation
      if (error.message?.includes("unique") || error.code === "23505") {
        return res.json({ success: true, message: "Already subscribed", alreadySubscribed: true });
      }
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Lead magnet download (redirect to PDF or markdown)
  app.get("/api/newsletter/playbook", async (req, res) => {
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="distressed-asset-playbook.md"');
    
    const playbook = `# The Distressed Asset Acquisition Playbook

## How to Find & Acquire Abandoned Software with Existing Users

### The Core Thesis
Distribution is hard. Code is easy to fix.

Finding 50,000 users is incredibly difficult. Fixing broken code is a weekend project.
We hunt for "abandoned monopolies" - software with significant user bases but showing signs of distress.

### Distress Signals to Look For

1. **No updates in 6+ months** - Developer has moved on
2. **1-2 star reviews piling up** - Users frustrated, but still using it
3. **Manifest V2 for Chrome extensions** - Migration deadline creates urgency
4. **Support emails going unanswered** - Owner has mentally checked out
5. **Listed for sale below 3x ARR** - Motivated seller

### Valuation Framework

| Asset Type | Conversion Rate | Price Point | Multiple |
|------------|-----------------|-------------|----------|
| Chrome Extension | 2% | $5/mo | 3-5x ARR |
| Shopify App | 2% | $10/mo | 3-5x ARR |
| WordPress Plugin | 1% | $5/mo | 3-5x ARR |
| Slack/B2B App | 3% | $15/mo | 4-6x ARR |
| SaaS | 3% | $20/mo | 3-5x ARR |

### The Acquisition Playbook

**Step 1: Identify** - Use Asset Hunter to scan 14 marketplaces
**Step 2: Analyze** - Calculate MRR potential and valuation range
**Step 3: Contact** - Cold email the owner with genuine interest
**Step 4: Negotiate** - Start at 2x ARR, settle around 3-4x
**Step 5: Acquire** - Use escrow (Escrow.com) for safety
**Step 6: Revive** - Fix bugs, answer support, ship updates

### Cold Email Template

Subject: Interested in acquiring [App Name]

Hi [Owner],

I've been using [App Name] and noticed it hasn't been updated recently. I'm acquiring apps in this space and would be interested in discussing a potential acquisition.

I'd handle all the technical work - you'd get a clean exit and know your users are taken care of.

Would you be open to a quick call to discuss?

Best,
[Your Name]

---

**Ready to start hunting?** Upgrade to Asset Hunter Pro to unlock owner contact info and AI-generated negotiation scripts.
`;
    
    res.send(playbook);
  });

  // === NEWSLETTER SUBSCRIPTION ROUTES (Tiered Newsletter) ===
  // Free tier: weekly/monthly digest of top opportunities
  // Insider tier ($9/mo): personalized alerts based on saved filters
  // Included free in Hunter ($99) and Syndicate ($249) plans
  
  app.post("/api/newsletter/subscribe", async (req, res) => {
    const { email, tier = "free", cadence = "weekly", filters } = req.body;
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if already subscribed
      const existing = await storage.getNewsletterSubscription(normalizedEmail);
      if (existing) {
        // Preserve comped Insider tier - don't let re-subscription downgrade
        // Also check if user has a Hunter/Syndicate plan (auto-comp)
        const user = await storage.getUserByEmail(normalizedEmail);
        const shouldBeComped = user?.plan === "hunter" || user?.plan === "syndicate";
        const preserveTier = existing.isComped || shouldBeComped ? "insider" : (req.body.tier ?? existing.tier);
        
        const updated = await storage.updateNewsletterSubscription(normalizedEmail, {
          tier: preserveTier,
          cadence: req.body.cadence ?? existing.cadence,
          filters: filters ?? existing.filters,
          isComped: existing.isComped || shouldBeComped,
          cancelledAt: null, // Reactivate if previously cancelled
        });
        return res.json({ 
          success: true, 
          message: "Subscription updated", 
          subscription: updated,
          isNew: false 
        });
      }

      // Check if this email has a Hunter/Syndicate subscription (auto-comp Insider tier)
      const user = await storage.getUserByEmail(normalizedEmail);
      const isComped = user?.plan === "hunter" || user?.plan === "syndicate";
      
      const subscription = await storage.createNewsletterSubscription({
        email: normalizedEmail,
        tier: isComped ? "insider" : tier,
        cadence,
        filters,
        isComped,
      });

      // Send confirmation email
      if (resend) {
        try {
          const tierName = subscription.tier === "insider" ? "Insider" : "Free";
          await resend.emails.send({
            from: "Asset Hunter <alerts@assethunter.io>",
            to: normalizedEmail,
            subject: `Welcome to Asset Hunter ${tierName} Newsletter`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #0f172a; font-size: 28px; margin-bottom: 24px;">Welcome to Asset Hunter ${tierName}</h1>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  You're now subscribed to our <strong>${subscription.cadence}</strong> newsletter.
                  ${subscription.tier === "insider" ? "You'll receive personalized alerts based on your saved filters." : "You'll receive a curated digest of top acquisition opportunities."}
                </p>
                ${subscription.isComped ? `
                  <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 16px; border-radius: 8px; margin: 24px 0;">
                    <p style="color: white; font-size: 14px; margin: 0;">
                      <strong>Insider tier included free</strong> with your ${user?.plan === "syndicate" ? "Syndicate" : "Hunter"} subscription!
                    </p>
                  </div>
                ` : ""}
                <p style="color: #94a3b8; font-size: 13px; margin-top: 32px; text-align: center;">
                  Manage your subscription at any time from your dashboard.
                </p>
              </div>
            `,
          });
        } catch (emailError: any) {
          console.error("Failed to send newsletter welcome:", emailError.message);
        }
      }

      res.json({ 
        success: true, 
        message: `Subscribed to ${subscription.tier} tier (${subscription.cadence})`,
        subscription,
        isNew: true
      });
    } catch (error: any) {
      console.error("Newsletter subscribe error:", error.message);
      if (error.message?.includes("unique") || error.code === "23505") {
        return res.json({ success: true, message: "Already subscribed" });
      }
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.get("/api/newsletter/subscription", async (req, res) => {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    try {
      const subscription = await storage.getNewsletterSubscription(email.toLowerCase().trim());
      if (!subscription) {
        return res.json({ subscribed: false });
      }
      res.json({ 
        subscribed: true, 
        subscription,
        isActive: !subscription.cancelledAt
      });
    } catch (error: any) {
      console.error("Newsletter status error:", error.message);
      res.status(500).json({ error: "Failed to check subscription" });
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    try {
      await storage.cancelNewsletterSubscription(email.toLowerCase().trim());
      res.json({ success: true, message: "Unsubscribed successfully" });
    } catch (error: any) {
      console.error("Newsletter unsubscribe error:", error.message);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // === SESSION ROUTES (Secure Premium Gating) ===
  
  // Request magic link - sends email with verification link
  app.post("/api/session/claim", async (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Generate secure token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store token in database
      await storage.createMagicLinkToken(normalizedEmail, token, expiresAt);
      
      // Build verification URL
      const baseUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : 'http://localhost:5000';
      const verifyUrl = `${baseUrl}/api/session/verify?token=${token}`;
      
      // Send magic link email
      if (resend) {
        await resend.emails.send({
          from: "Asset Hunter <alerts@assethunter.io>",
          to: normalizedEmail,
          subject: "Sign in to Asset Hunter",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Sign in to Asset Hunter</h2>
              <p>Click the button below to sign in to your account. This link expires in 15 minutes.</p>
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(to right, #10b981, #06b6d4); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
                Sign In
              </a>
              <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
              <p style="color: #666; font-size: 12px;">Or copy this link: ${verifyUrl}</p>
            </div>
          `,
        });
        console.log(`[MagicLink] Sent verification email to ${normalizedEmail}`);
      } else {
        // Dev mode - log the link
        console.log(`[MagicLink] DEV MODE - Verify link: ${verifyUrl}`);
      }
      
      res.json({
        success: true,
        email: normalizedEmail,
        message: resend ? "Check your email for a sign-in link" : "Magic link logged to console (dev mode)"
      });
    } catch (error: any) {
      console.error("Session claim error:", error.message);
      res.status(500).json({ error: "Failed to send verification email" });
    }
  });
  
  // Verify magic link token and establish session
  app.get("/api/session/verify", async (req, res) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.redirect("/?error=invalid_token");
    }
    
    try {
      // Look up and validate token
      const magicToken = await storage.getMagicLinkToken(token);
      
      if (!magicToken) {
        console.log("[MagicLink] Invalid or expired token");
        return res.redirect("/?error=expired_token");
      }
      
      // Mark token as used
      await storage.markMagicLinkTokenUsed(token);
      
      const normalizedEmail = magicToken.email;
      
      // Check if user has premium access (subscription or trial)
      const isPremium = await isUserPremium(normalizedEmail);
      
      // Also check for active referral trial
      const referrals = await storage.getReferralsByReferredEmail(normalizedEmail);
      const hasActiveTrial = referrals.some(r => 
        r.status === "redeemed" && r.trialEndsAt && new Date(r.trialEndsAt) > new Date()
      );
      
      // Set verified session data
      req.session.email = normalizedEmail;
      req.session.isPremium = isPremium || hasActiveTrial;
      req.session.verifiedAt = Date.now();
      
      console.log(`[MagicLink] Verified session for ${normalizedEmail}, isPremium: ${req.session.isPremium}`);
      
      // Redirect to hunt page with success
      res.redirect("/hunt?verified=true");
    } catch (error: any) {
      console.error("Session verify error:", error.message);
      res.redirect("/?error=verification_failed");
    }
  });
  
  // Get current session status - supports both Replit OIDC and magic link auth
  app.get("/api/session/status", async (req, res) => {
    // Check for Replit OIDC auth (req.user from passport)
    const user = req.user as any;
    const oidcEmail = user?.claims?.email;
    
    // Check for magic link auth (req.session.email)
    const sessionEmail = req.session.email;
    
    // Use whichever auth method is available
    const email = oidcEmail || sessionEmail;
    
    if (!email) {
      return res.json({ 
        authenticated: false,
        isPremium: false 
      });
    }
    
    // Re-check premium status (in case subscription changed)
    const isPremium = await isUserPremium(email);
    const referrals = await storage.getReferralsByReferredEmail(email);
    const hasActiveTrial = referrals.some(r => 
      r.status === "redeemed" && r.trialEndsAt && new Date(r.trialEndsAt) > new Date()
    );
    
    const premiumStatus = isPremium || hasActiveTrial;
    
    // Sync session for consistency
    if (oidcEmail && !sessionEmail) {
      req.session.email = oidcEmail;
    }
    req.session.isPremium = premiumStatus;
    
    res.json({
      authenticated: true,
      email: email,
      isPremium: premiumStatus,
      authMethod: oidcEmail ? 'oidc' : 'magic_link',
      claimedAt: req.session.claimedAt
    });
  });
  
  // Logout - destroy session
  app.post("/api/session/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Logged out" });
    });
  });

  // === REFERRAL ROUTES ===
  
  // Generate a referral code for Pro users
  app.post("/api/referrals/generate", async (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    try {
      // Generate a unique referral code
      const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const referral = await storage.createReferral({
        referrerEmail: email.toLowerCase().trim(),
        referralCode: code,
        status: "pending",
      });

      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain ? `https://${replitDomain}` : `http://localhost:5000`;
      
      res.json({
        success: true,
        referralCode: code,
        referralLink: `${baseUrl}?ref=${code}`,
        message: "Share this link to give friends 7 days of Pro access!",
      });
    } catch (error: any) {
      console.error("Referral generation error:", error.message);
      res.status(500).json({ error: "Failed to generate referral code" });
    }
  });

  // Redeem a referral code (get 7-day trial)
  app.post("/api/referrals/redeem", async (req, res) => {
    const { code, email } = req.body;
    
    if (!code || !email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid code and email required" });
    }

    try {
      const referral = await storage.getReferralByCode(code);
      
      if (!referral) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      if (referral.status === "redeemed") {
        return res.status(400).json({ error: "This referral code has already been used" });
      }
      
      if (referral.referrerEmail === email.toLowerCase().trim()) {
        return res.status(400).json({ error: "You cannot use your own referral code" });
      }

      // Calculate trial end date (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      await storage.updateReferral(referral.id, {
        status: "redeemed",
        referredEmail: email.toLowerCase().trim(),
        trialEndsAt,
        redeemedAt: new Date(),
      });

      // Create or update user with trial status
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          id: `trial-${Date.now()}`,
          email: email.toLowerCase().trim(),
          plan: "trial",
        });
      }

      res.json({
        success: true,
        message: "7-day Pro trial activated!",
        trialEndsAt: trialEndsAt.toISOString(),
      });
    } catch (error: any) {
      console.error("Referral redemption error:", error.message);
      res.status(500).json({ error: "Failed to redeem referral code" });
    }
  });

  // Get referral stats for a user
  app.get("/api/referrals/stats", async (req, res) => {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    try {
      const referrals = await storage.getReferralsByEmail(email.toLowerCase().trim());
      const redeemed = referrals.filter(r => r.status === "redeemed").length;
      
      res.json({
        totalReferrals: referrals.length,
        redeemedReferrals: redeemed,
        pendingReferrals: referrals.length - redeemed,
        referrals: referrals.map(r => ({
          code: r.referralCode,
          status: r.status,
          redeemedBy: r.referredEmail ? r.referredEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
          redeemedAt: r.redeemedAt,
        })),
      });
    } catch (error: any) {
      console.error("Referral stats error:", error.message);
      res.status(500).json({ error: "Failed to get referral stats" });
    }
  });

  // Check if user has active trial (session-based only for security)
  app.get("/api/referrals/trial-status", async (req, res) => {
    // SECURITY: Only use session-based email - no query params allowed (prevents spoofing)
    const email = req.session?.email;
    
    if (!email) {
      // No session - return no trial (not an error)
      return res.json({ hasTrial: false, authenticated: false });
    }

    try {
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      
      if (!user || user.plan !== "trial") {
        return res.json({ hasTrial: false });
      }

      // Check if trial is still active by looking at referral records
      const referrals = await storage.getReferralsByEmail(email);
      const referralAsReferee = referrals.find(r => r.referredEmail === email.toLowerCase().trim());
      
      if (referralAsReferee?.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(referralAsReferee.trialEndsAt);
        if (now < trialEnd) {
          return res.json({
            hasTrial: true,
            trialEndsAt: trialEnd.toISOString(),
            daysRemaining: Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          });
        }
      }

      res.json({ hasTrial: false, expired: true });
    } catch (error: any) {
      console.error("Trial status error:", error.message);
      res.status(500).json({ error: "Failed to check trial status" });
    }
  });

  // === WEEKLY STATS / DISTRESS PULSE ROUTES ===
  
  // Get latest weekly stats (public)
  app.get("/api/pulse", async (req, res) => {
    try {
      const stats = await storage.getLatestWeeklyStats();
      
      if (!stats) {
        // Return demo stats if no real data yet
        return res.json({
          weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalScans: 0,
          totalAssets: 0,
          totalUsers: 0,
          totalMrrPotential: 0,
          topMarketplaces: {},
          topNiches: {},
          message: "No scan data yet this week. Start hunting to contribute!",
        });
      }

      res.json({
        ...stats,
        message: "Weekly Distress Pulse - Real-time insights from the Asset Hunter community",
      });
    } catch (error: any) {
      console.error("Pulse error:", error.message);
      res.status(500).json({ error: "Failed to get weekly stats" });
    }
  });

  // Record scan stats (called internally after each scan)
  app.post("/api/pulse/record", async (req, res) => {
    const { assetsFound, totalUsers, mrrPotential, marketplace, niche } = req.body;

    try {
      // Get start of current week (Sunday)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      await storage.createOrUpdateWeeklyStats({
        weekStart,
        totalScans: 1,
        totalAssets: assetsFound || 0,
        totalUsers: totalUsers || 0,
        totalMrrPotential: mrrPotential || 0,
        topMarketplaces: marketplace ? { [marketplace]: 1 } : null,
        topNiches: niche ? { [niche]: 1 } : null,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Pulse record error:", error.message);
      res.status(500).json({ error: "Failed to record stats" });
    }
  });

  // === ANALYTICS TRACKING ===
  app.post("/api/analytics/track", async (req, res) => {
    const { event, properties } = req.body;
    
    if (!event) {
      return res.status(400).json({ error: "Event name required" });
    }

    const sessionEmail = req.session?.email;
    
    console.log('[Analytics Event]', {
      event,
      email: sessionEmail || 'anonymous',
      timestamp: new Date().toISOString(),
      properties
    });
    
    res.json({ success: true });
  });

  return httpServer;
}

// No seed data - empty watchlist encourages users to run their first scan
