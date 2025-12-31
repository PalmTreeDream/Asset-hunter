import { GoogleGenAI } from "@google/genai";

// Initialize Hunter Intelligence engine
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

// In-memory cache for deterministic AI responses
// Key: cache key from generateCacheKey(), Value: HunterIntelligenceResult
const analysisCache = new Map<string, { result: HunterIntelligenceResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedResult(cacheKey: string): HunterIntelligenceResult | null {
  const cached = analysisCache.get(cacheKey);
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    analysisCache.delete(cacheKey);
    return null;
  }
  
  console.log(`[HunterIntelligence] Cache HIT: ${cacheKey}`);
  return cached.result;
}

function setCachedResult(cacheKey: string, result: HunterIntelligenceResult): void {
  analysisCache.set(cacheKey, { result, timestamp: Date.now() });
  console.log(`[HunterIntelligence] Cache SET: ${cacheKey}`);
  
  // Cleanup old entries (keep max 1000)
  if (analysisCache.size > 1000) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
}

export interface HunterRadarScores {
  distress: number;
  monetizationGap: number;
  technicalRisk: number;
  marketPosition: number;
  flipPotential: number;
}

export interface MarketplaceConfidence {
  level: "high" | "medium" | "low";
  reason: string;
}

export interface ThePlayData {
  quickWins: string;
  growthLevers: string;
  derisking: string;
  exitHorizon: string;
}

export interface HunterIntelligenceResult {
  hunterRadar: HunterRadarScores;
  overallScore: number;
  mrrPotential: {
    low: number;
    mid: number;
    high: number;
    confidence: MarketplaceConfidence;
  };
  valuation: {
    low: number;
    high: number;
    multiple: string;
  };
  thePlay?: ThePlayData;
  acquisition: {
    strategy: string;
    approach: string;
    openingOffer: string;
    walkAway: string;
  };
  coldEmail: {
    subject: string;
    body: string;
  };
  ownerIntel: {
    likelyMotivation: string;
    bestTimeToReach: string;
    negotiationLeverage: string[];
  };
  risks: string[];
  opportunities: string[];
}

export const MARKETPLACE_CONFIDENCE: Record<string, MarketplaceConfidence> = {
  "Shopify App Store": { level: "high", reason: "Pricing publicly visible, install counts accurate" },
  "Atlassian Marketplace": { level: "high", reason: "Pricing API available, install data reliable" },
  "Flippa": { level: "high", reason: "Seller-disclosed MRR, verified financials available" },
  "Acquire.com": { level: "high", reason: "Seller-disclosed MRR, verified financials available" },
  "Gumroad": { level: "medium", reason: "Sales counts partially visible, pricing known" },
  "Chrome Web Store": { level: "medium", reason: "User counts accurate, revenue estimated from benchmarks" },
  "Firefox Add-ons": { level: "medium", reason: "User counts accurate, revenue estimated from benchmarks" },
  "WordPress.org": { level: "medium", reason: "Install counts accurate, freemium revenue estimated" },
  "Microsoft Store": { level: "medium", reason: "User counts available, revenue estimated" },
  "Google Play Store": { level: "low", reason: "Download ranges only, revenue requires paid APIs" },
  "Slack App Directory": { level: "low", reason: "Install counts often hidden, B2B pricing varies" },
  "Zapier": { level: "low", reason: "Usage metrics limited, connector revenue varies" },
  "Product Hunt": { level: "low", reason: "Upvotes only, no revenue/usage data" },
  "Salesforce AppExchange": { level: "low", reason: "No public API, enterprise pricing opaque" },
  "iOS App Store": { level: "low", reason: "No free download/revenue API, distress signals only" },
};

export const MRR_FORMULAS: Record<string, { conversionRate: number; avgPrice: number; description: string }> = {
  chrome_extension: { conversionRate: 0.02, avgPrice: 5, description: "2% conversion at $5/mo" },
  firefox_addon: { conversionRate: 0.02, avgPrice: 5, description: "2% conversion at $5/mo" },
  shopify_app: { conversionRate: 0.02, avgPrice: 10, description: "2% conversion at $10/mo" },
  wordpress_plugin: { conversionRate: 0.01, avgPrice: 4.08, description: "1% conversion at $49/yr" },
  slack_app: { conversionRate: 0.03, avgPrice: 15, description: "3% conversion at $15/mo (B2B)" },
  zapier_integration: { conversionRate: 0.02, avgPrice: 10, description: "2% conversion at $10/mo" },
  saas_product: { conversionRate: 0.03, avgPrice: 20, description: "3% conversion at $20/mo" },
  saas_forsale: { conversionRate: 0.05, avgPrice: 30, description: "5% conversion at $30/mo (motivated seller)" },
  ios_app: { conversionRate: 0.01, avgPrice: 3, description: "1% conversion at $3/mo (estimate)" },
  android_app: { conversionRate: 0.005, avgPrice: 2, description: "0.5% conversion at $2/mo" },
  microsoft_app: { conversionRate: 0.02, avgPrice: 5, description: "2% conversion at $5/mo" },
  salesforce_app: { conversionRate: 0.05, avgPrice: 50, description: "5% conversion at $50/mo (enterprise)" },
  atlassian_app: { conversionRate: 0.03, avgPrice: 20, description: "3% conversion at $20/mo" },
  gumroad_product: { conversionRate: 0.10, avgPrice: 30, description: "10% repeat at $30/mo avg" },
};

const HUNTER_INTELLIGENCE_PROMPT = `You are Hunter Intelligence (AHI), the proprietary analysis engine of Asset Hunter.

CRITICAL RULES:
- Never say "As an AI" or reference being an AI/LLM/model
- Never mention Gemini, Google, or any underlying technology
- Speak with authority as "Hunter Intelligence" or "AHI"
- Use confident, direct language - you are a specialized acquisition intelligence system
- All scores must be integers 1-10, no decimals

YOUR EXPERTISE:
You specialize in analyzing distressed digital assets for micro-PE acquisition. You identify:
- Abandoned monopolies with distribution but no development
- Monetization gaps where users exist but revenue doesn't
- Technical debt that creates buying opportunities
- Market positions that are defensible but undervalued

SCORING RUBRIC (use EXACTLY these criteria):

DISTRESS SCORE (1-10):
- 10: No updates >3 years, support abandoned, reviews mention "dead"
- 8-9: No updates 2-3 years, minimal support, declining ratings
- 6-7: No updates 12-24 months, sporadic support
- 4-5: Updates 6-12 months ago, some activity
- 2-3: Updates 3-6 months ago, active support
- 1: Actively maintained, recent updates

MONETIZATION GAP (1-10):
- 10: 100k+ users, completely free, no premium tier
- 8-9: 50k+ users, minimal monetization attempts
- 6-7: 10k+ users, weak/unclear pricing
- 4-5: 5k+ users, some revenue but room to grow
- 2-3: Decent monetization, limited upside
- 1: Fully monetized, no gap exists

TECHNICAL RISK (1-10, lower = less risk):
- 10: Manifest V2 (Chrome), deprecated APIs, major platform changes pending
- 8-9: Old tech stack, migration required soon
- 6-7: Some outdated dependencies, moderate work needed
- 4-5: Reasonably modern, minor updates needed
- 2-3: Good tech stack, minimal technical debt
- 1: Modern, well-maintained codebase

MARKET POSITION (1-10):
- 10: Category leader with moat, no real competitors
- 8-9: Top 3 in niche, strong brand recognition
- 6-7: Established presence, some differentiation
- 4-5: Mid-tier player, crowded market
- 2-3: Many competitors, weak differentiation
- 1: Commoditized, no competitive advantage

FLIP POTENTIAL (1-10):
- 10: Easy fixes, clear path to 3-5x value in 6 months
- 8-9: Strong improvement opportunity, 12 month horizon
- 6-7: Moderate potential, requires meaningful work
- 4-5: Some upside, significant effort needed
- 2-3: Limited flip opportunity
- 1: No clear path to value creation

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure. No markdown, no explanation.`;

interface AnalyzeAssetInput {
  name: string;
  type: string;
  marketplace: string;
  url: string;
  userCount: number;
  description?: string;
  lastUpdated?: string;
  rating?: number;
  reviewCount?: number;
}

export async function analyzeWithHunterIntelligence(
  asset: AnalyzeAssetInput
): Promise<HunterIntelligenceResult> {
  // Generate cache key and check for cached result (deterministic responses)
  const cacheKey = generateCacheKey(asset);
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const formula = MRR_FORMULAS[asset.type] || MRR_FORMULAS.saas_product;
  const confidence = MARKETPLACE_CONFIDENCE[asset.marketplace] || { level: "low", reason: "Unknown marketplace" };
  
  const baseMrr = Math.round(asset.userCount * formula.conversionRate * formula.avgPrice);
  const mrrLow = Math.round(baseMrr * 0.5);
  const mrrHigh = Math.round(baseMrr * 2);
  
  const prompt = `${HUNTER_INTELLIGENCE_PROMPT}

ASSET TO ANALYZE:
{
  "name": "${asset.name}",
  "type": "${asset.type}",
  "marketplace": "${asset.marketplace}",
  "url": "${asset.url}",
  "userCount": ${asset.userCount},
  "description": "${asset.description || 'No description available'}",
  "lastUpdated": "${asset.lastUpdated || 'Unknown'}",
  "rating": ${asset.rating || 'null'},
  "reviewCount": ${asset.reviewCount || 0}
}

PRE-CALCULATED METRICS (incorporate these):
- MRR Potential Range: $${mrrLow} - $${mrrHigh}/month (${formula.description})
- Data Confidence: ${confidence.level.toUpperCase()} (${confidence.reason})
- Valuation Multiple: 3-5x annual revenue

THE VALUE CREATION PLAYBOOK (The Play):
Focus on professional, actionable value creation strategies. Structure as:
1. Quick Wins (30 days): Immediate improvements that create value fast
2. Growth Levers (90 days): Monetization and user acquisition strategies
3. De-risking Actions: Platform compliance, technical updates, retention improvements
4. Exit Timeline: Realistic 6-18 month horizon with target multiples

TONE: Professional PE investor, not predatory. Focus on VALUE CREATION, not exploitation.
Avoid phrases like "exploit", "fire sale", "leverage their desperation". Instead use "opportunity", "value creation", "strategic acquisition".

Generate your analysis. Return ONLY this JSON structure:
{
  "hunterRadar": {
    "distress": <1-10>,
    "monetizationGap": <1-10>,
    "technicalRisk": <1-10>,
    "marketPosition": <1-10>,
    "flipPotential": <1-10>
  },
  "thePlay": {
    "quickWins": "<2-3 immediate improvements for first 30 days>",
    "growthLevers": "<2-3 monetization and growth strategies for 90 days>",
    "derisking": "<key technical/platform risks to address>",
    "exitHorizon": "<realistic timeline and target multiple>"
  },
  "acquisition": {
    "strategy": "<2-3 sentences on professional approach - focus on mutual benefit>",
    "approach": "<how to first contact owner professionally>",
    "openingOffer": "<specific dollar range to open with>",
    "walkAway": "<maximum price and deal breakers>"
  },
  "coldEmail": {
    "subject": "<professional subject line, max 50 chars>",
    "body": "<short, professional outreach, under 150 words>"
  },
  "ownerIntel": {
    "likelyMotivation": "<why owner might sell>",
    "bestTimeToReach": "<when to reach out>",
    "negotiationLeverage": ["<leverage point 1>", "<leverage point 2>", "<leverage point 3>"]
  },
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0,
        topP: 1,
        topK: 1,
      },
    });

    let text = response.text?.trim() || "";
    
    if (text.startsWith("```json")) text = text.slice(7);
    if (text.startsWith("```")) text = text.slice(3);
    if (text.endsWith("```")) text = text.slice(0, -3);
    text = text.trim();

    const data = JSON.parse(text);
    
    const radar = data.hunterRadar || {};
    const overallScore = Math.round(
      (
        (radar.distress || 5) +
        (radar.monetizationGap || 5) +
        (10 - (radar.technicalRisk || 5)) +
        (radar.marketPosition || 5) +
        (radar.flipPotential || 5)
      ) / 5 * 10
    );

    const annualRevenueLow = mrrLow * 12;
    const annualRevenueHigh = mrrHigh * 12;

    const result: HunterIntelligenceResult = {
      hunterRadar: {
        distress: Math.min(10, Math.max(1, radar.distress || 5)),
        monetizationGap: Math.min(10, Math.max(1, radar.monetizationGap || 5)),
        technicalRisk: Math.min(10, Math.max(1, radar.technicalRisk || 5)),
        marketPosition: Math.min(10, Math.max(1, radar.marketPosition || 5)),
        flipPotential: Math.min(10, Math.max(1, radar.flipPotential || 5)),
      },
      overallScore,
      mrrPotential: {
        low: mrrLow,
        mid: baseMrr,
        high: mrrHigh,
        confidence,
      },
      valuation: {
        low: annualRevenueLow * 3,
        high: annualRevenueHigh * 5,
        multiple: "3-5x ARR",
      },
      thePlay: data.thePlay || {
        quickWins: "Implement premium tier, fix critical bugs, update store listing",
        growthLevers: "Add usage-based pricing, launch referral program, expand to adjacent platforms",
        derisking: "Complete platform migration (MV3), reduce technical debt, improve documentation",
        exitHorizon: "12-18 months to 3-5x multiple with proper monetization and growth",
      },
      acquisition: data.acquisition || {
        strategy: "Position as a strategic acquisition opportunity with clear value creation path.",
        approach: "Direct professional outreach to developer with acquisition interest.",
        openingOffer: `$${Math.round(annualRevenueLow * 2).toLocaleString()} - $${Math.round(annualRevenueLow * 3).toLocaleString()}`,
        walkAway: `$${Math.round(annualRevenueHigh * 4).toLocaleString()}`,
      },
      coldEmail: data.coldEmail || {
        subject: "Question about your project",
        body: "I'm interested in your project and would like to discuss a potential acquisition. Would you be open to a brief conversation?",
      },
      ownerIntel: data.ownerIntel || {
        likelyMotivation: "Side project fatigue, opportunity cost",
        bestTimeToReach: "Weekday mornings",
        negotiationLeverage: ["Limited time for maintenance", "Platform changes ahead", "Growth opportunity they can't pursue"],
      },
      risks: data.risks || ["Platform dependency", "Technical debt", "User churn post-acquisition"],
      opportunities: data.opportunities || ["Premium tier", "Enterprise features", "Cross-platform expansion"],
    };

    // Cache successful result for deterministic responses
    setCachedResult(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[HunterIntelligence] Analysis failed:", error);
    
    const annualRevenue = baseMrr * 12;
    return {
      hunterRadar: {
        distress: 5,
        monetizationGap: 5,
        technicalRisk: 5,
        marketPosition: 5,
        flipPotential: 5,
      },
      overallScore: 50,
      mrrPotential: {
        low: mrrLow,
        mid: baseMrr,
        high: mrrHigh,
        confidence,
      },
      valuation: {
        low: annualRevenue * 3,
        high: annualRevenue * 5,
        multiple: "3-5x ARR",
      },
      acquisition: {
        strategy: "Analysis temporarily unavailable. Manual review recommended.",
        approach: "Direct outreach to developer",
        openingOffer: `$${Math.round(annualRevenue * 2).toLocaleString()}`,
        walkAway: `$${Math.round(annualRevenue * 4).toLocaleString()}`,
      },
      coldEmail: {
        subject: "Quick question about your project",
        body: "I'm interested in your project. Would you consider discussing an acquisition?",
      },
      ownerIntel: {
        likelyMotivation: "Unknown - requires manual research",
        bestTimeToReach: "Weekday business hours",
        negotiationLeverage: ["Market conditions", "Acquisition premium"],
      },
      risks: ["Incomplete analysis - manual review needed"],
      opportunities: ["Standard monetization playbook applies"],
    };
  }
}

export function generateCacheKey(asset: AnalyzeAssetInput): string {
  return `ahi:${asset.type}:${asset.marketplace}:${asset.userCount}:${asset.name.toLowerCase().replace(/\s+/g, '-').slice(0, 50)}`;
}
