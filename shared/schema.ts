import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
