import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  website: text("website"),
  description: text("description"),
  status: text("status").notNull().default("new"), // new, qualified, contacted, disqualified
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  content: text("content").notNull(), // AI Analysis
  score: integer("score").default(0), // 0-100 relevance score
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const leadsRelations = relations(leads, ({ many }) => ({
  insights: many(insights),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  lead: one(leads, {
    fields: [insights.leadId],
    references: [leads.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertInsightSchema = createInsertSchema(insights).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Insight = typeof insights.$inferSelect;

export type CreateLeadRequest = InsertLead;
export type UpdateLeadRequest = Partial<InsertLead>;

// Search Response Type (Non-DB)
export interface SearchResult {
  company: string;
  website: string;
  description: string;
  source: string;
}

export type LeadResponse = Lead & { insights?: Insight[] };

// Note: Users table is now exported from ./models/auth with merged Stripe fields

// === NEWSLETTER SIGNUPS ===
export const newsletterSignups = pgTable("newsletter_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").default("hunt_page"), // where they signed up
  leadMagnetSent: boolean("lead_magnet_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSignupSchema = createInsertSchema(newsletterSignups).omit({ id: true, createdAt: true });
export type NewsletterSignup = typeof newsletterSignups.$inferSelect;
export type InsertNewsletterSignup = z.infer<typeof insertNewsletterSignupSchema>;

// === NEWSLETTER SUBSCRIPTIONS (Tiered newsletter with paid option) ===
// Free tier: weekly/monthly digest of top opportunities
// Insider tier ($9/mo): personalized alerts based on saved filters
// Included free in Hunter ($99) and Syndicate ($249) plans
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  tier: text("tier").notNull().default("free"), // "free" | "insider"
  cadence: text("cadence").notNull().default("weekly"), // "weekly" | "monthly"
  filters: jsonb("filters"), // { marketplaces: [], minUsers: 1000, maxPrice: 50000, niches: [] }
  isComped: boolean("is_comped").default(false), // true if included free with Hunter/Syndicate
  stripeSubscriptionId: text("stripe_subscription_id"), // for paid Insider tier
  activatedAt: timestamp("activated_at").defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ id: true, createdAt: true, activatedAt: true });
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;

// Newsletter filter preferences type
export interface NewsletterFilters {
  marketplaces?: string[];
  minUsers?: number;
  maxPrice?: number;
  niches?: string[];
}

// === REFERRALS ===
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerEmail: text("referrer_email").notNull(), // Who shared the code
  referralCode: text("referral_code").notNull().unique(), // Unique code to share
  referredEmail: text("referred_email"), // Email of person who used the code
  status: text("status").notNull().default("pending"), // pending, redeemed, expired
  trialEndsAt: timestamp("trial_ends_at"), // When the trial expires
  createdAt: timestamp("created_at").defaultNow(),
  redeemedAt: timestamp("redeemed_at"),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// === WEEKLY STATS (for Distress Pulse) ===
export const weeklyStats = pgTable("weekly_stats", {
  id: serial("id").primaryKey(),
  weekStart: timestamp("week_start").notNull(), // Start of the week
  totalScans: integer("total_scans").notNull().default(0),
  totalAssets: integer("total_assets").notNull().default(0),
  totalUsers: integer("total_users").notNull().default(0), // Aggregate user count from scanned assets
  totalMrrPotential: integer("total_mrr_potential").notNull().default(0),
  topMarketplaces: jsonb("top_marketplaces"), // { chrome: 50, shopify: 30, ... }
  topNiches: jsonb("top_niches"), // { productivity: 40, vpn: 25, ... }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeeklyStatsSchema = createInsertSchema(weeklyStats).omit({ id: true, createdAt: true });
export type WeeklyStats = typeof weeklyStats.$inferSelect;
export type InsertWeeklyStats = z.infer<typeof insertWeeklyStatsSchema>;

// === WAITLIST ===
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  tier: text("tier").notNull().default("scout"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({ id: true, createdAt: true });
export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;

// === USER CREDITS ===
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  tier: text("tier").notNull().default("scout"), // scout, hunter, founding_member
  credits: integer("credits").notNull().default(0), // Total remaining credits
  monthlyAllowance: integer("monthly_allowance").notNull().default(0), // 0 for fixed tiers, 300 for founding_member
  dailyLimit: integer("daily_limit").notNull().default(0), // 0 for no limit, 15 for founding_member
  dailyUsed: integer("daily_used").notNull().default(0), // Credits used today
  lastDailyReset: timestamp("last_daily_reset").defaultNow(), // When daily counter was last reset
  lastMonthlyReset: timestamp("last_monthly_reset").defaultNow(), // When monthly credits were last refilled
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserCredits = typeof userCredits.$inferSelect;

// === MAGIC LINK TOKENS (for secure email verification) ===
export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"), // null until used
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMagicLinkTokenSchema = createInsertSchema(magicLinkTokens).omit({ id: true, createdAt: true });
export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type InsertMagicLinkToken = z.infer<typeof insertMagicLinkTokenSchema>;

// === CONTACT SUBMISSIONS ===
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, read, replied
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true, status: true });
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

// === SAVED ASSETS (Watchlist) ===
export const savedAssets = pgTable("saved_assets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Replit user ID or email
  assetId: text("asset_id").notNull(), // Unique asset identifier
  assetName: text("asset_name").notNull(),
  assetUrl: text("asset_url").notNull(),
  marketplace: text("marketplace").notNull(),
  description: text("description"),
  users: integer("users").default(0),
  estimatedMrr: integer("estimated_mrr").default(0),
  distressScore: integer("distress_score").default(0),
  assetData: jsonb("asset_data"), // Full asset JSON for reference
  notes: text("notes"), // User's personal notes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedAssetSchema = createInsertSchema(savedAssets).omit({ id: true, createdAt: true });
export type SavedAsset = typeof savedAssets.$inferSelect;
export type InsertSavedAsset = z.infer<typeof insertSavedAssetSchema>;

// === SCANNED ASSETS (Asset Discovery Tracking) ===
// Stores all assets discovered during marketplace scans for tracking over time
export const scannedAssets = pgTable("scanned_assets", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull(), // Unique ID from marketplace (Chrome extension ID, Shopify app slug, etc.)
  marketplace: text("marketplace").notNull(), // "chrome", "shopify", "wordpress", "firefox", "slack", etc.
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  users: integer("users").default(0), // User/install count
  rating: real("rating"), // Store rating (e.g., 4.5)
  ratingCount: integer("rating_count"), // Number of ratings
  lastUpdatedByOwner: timestamp("last_updated_by_owner"), // When the asset was last updated by owner
  estimatedMrr: integer("estimated_mrr").default(0), // Calculated MRR using formulas
  distressScore: integer("distress_score").default(0), // Calculated distress score (0-100)
  category: text("category"), // App category/niche
  tags: text("tags").array(), // Keywords/tags
  rawData: jsonb("raw_data"), // Full API response for reference
  firstSeenAt: timestamp("first_seen_at").defaultNow(), // When we first discovered this asset
  lastScannedAt: timestamp("last_scanned_at").defaultNow(), // Most recent scan that found it
  createdAt: timestamp("created_at").defaultNow(),
  
  // === ENHANCED FIELDS FOR RICH DETAIL VIEW ===
  // Historical trends (12-month snapshots stored as JSON arrays)
  userHistory: jsonb("user_history"), // [{ month: "2025-01", users: 45000 }, ...]
  mrrHistory: jsonb("mrr_history"), // [{ month: "2025-01", mrr: 2500 }, ...]
  
  // Hunter Intelligence scores (0-10 scale for radar chart)
  distressAxis: real("distress_axis").default(5), // Abandonment signals (higher = more distressed)
  monetizationAxis: real("monetization_axis").default(5), // Revenue gap opportunity (higher = better)
  technicalAxis: real("technical_axis").default(5), // Technical risk (higher = more risk)
  marketAxis: real("market_axis").default(5), // Market position strength (higher = stronger)
  flipAxis: real("flip_axis").default(5), // Flip potential (higher = easier flip)
  
  // Qualitative insights
  distressSignals: text("distress_signals").array(), // ["No updates in 18 months", "Support email bounces"]
  riskFactors: text("risk_factors").array(), // ["Manifest V2 sunset", "Single point of failure"]
  opportunities: text("opportunities").array(), // ["Premium tier could add $1K MRR", "Cross-platform expansion"]
  
  // Owner/contact info (revealed after credit spend)
  ownerEmail: text("owner_email"), // Contact email
  ownerName: text("owner_name"), // Owner name
  linkedinUrl: text("linkedin_url"), // Owner LinkedIn
  githubUrl: text("github_url"), // Related GitHub repo
  
  // Competitive positioning
  competitors: jsonb("competitors"), // [{ name: "Competitor A", users: 100000, rating: 4.2 }]
  marketSharePct: real("market_share_pct"), // Estimated market share in niche (0-100)
  
  // Acquisition details
  askingPrice: integer("asking_price"), // Owner's asking price if known
  estimatedValue: integer("estimated_value"), // Our calculated 3x annual revenue valuation
  negotiationNotes: text("negotiation_notes"), // AI-generated negotiation strategy
});

export const insertScannedAssetSchema = createInsertSchema(scannedAssets).omit({ id: true, createdAt: true, firstSeenAt: true });
export type ScannedAsset = typeof scannedAssets.$inferSelect;
export type InsertScannedAsset = z.infer<typeof insertScannedAssetSchema>;

// Type definitions for JSON fields in ScannedAsset
export interface UserHistoryPoint {
  month: string; // "2025-01" format
  users: number;
}

export interface MrrHistoryPoint {
  month: string; // "2025-01" format
  mrr: number;
}

export interface CompetitorData {
  name: string;
  users: number;
  rating?: number;
  url?: string;
}

// Helper type for fully typed scanned asset with JSON fields
export interface ScannedAssetFull extends Omit<ScannedAsset, 'userHistory' | 'mrrHistory' | 'competitors'> {
  userHistory?: UserHistoryPoint[];
  mrrHistory?: MrrHistoryPoint[];
  competitors?: CompetitorData[];
}

// === REVEALED ASSETS (Track which assets users have unlocked with credits) ===
export const revealedAssets = pgTable("revealed_assets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // User email or Replit ID
  assetId: text("asset_id").notNull(), // Asset identifier (e.g., "AH-123")
  revealedAt: timestamp("revealed_at").defaultNow(),
});

export const insertRevealedAssetSchema = createInsertSchema(revealedAssets).omit({ id: true, revealedAt: true });
export type RevealedAsset = typeof revealedAssets.$inferSelect;
export type InsertRevealedAsset = z.infer<typeof insertRevealedAssetSchema>;

// === OUTREACH LOG (Track contact attempts to asset owners) ===
export const outreachLogs = pgTable("outreach_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // User who sent the outreach
  assetId: text("asset_id").notNull(), // Asset being contacted about
  assetName: text("asset_name").notNull(), // Asset name for display
  marketplace: text("marketplace").notNull(), // Asset marketplace
  channel: text("channel").notNull().default("email"), // "email", "linkedin", "phone", "other"
  status: text("status").notNull().default("sent"), // "sent", "awaiting_reply", "replied", "follow_up", "closed"
  subject: text("subject"), // Email subject or message topic
  notes: text("notes"), // User notes about the conversation
  sentAt: timestamp("sent_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOutreachLogSchema = createInsertSchema(outreachLogs).omit({ id: true, sentAt: true, updatedAt: true });
export type OutreachLog = typeof outreachLogs.$inferSelect;
export type InsertOutreachLog = z.infer<typeof insertOutreachLogSchema>;

// Validation schema for outreach status updates
export const updateOutreachLogSchema = z.object({
  status: z.enum(['sent', 'awaiting_reply', 'replied', 'follow_up', 'closed']).optional(),
  notes: z.string().optional(),
});
export type UpdateOutreachLog = z.infer<typeof updateOutreachLogSchema>;
