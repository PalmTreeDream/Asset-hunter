import { db } from "./db";
import {
  leads,
  insights,
  users,
  newsletterSignups,
  newsletterSubscriptions,
  referrals,
  weeklyStats,
  magicLinkTokens,
  contactSubmissions,
  savedAssets,
  type Lead,
  type InsertLead,
  type UpdateLeadRequest,
  type Insight,
  type User,
  type InsertUser,
  type NewsletterSignup,
  type InsertNewsletterSignup,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type Referral,
  type InsertReferral,
  type WeeklyStats,
  type InsertWeeklyStats,
  type MagicLinkToken,
  type InsertMagicLinkToken,
  type ContactSubmission,
  type InsertContactSubmission,
  type SavedAsset,
  type InsertSavedAsset,
} from "@shared/schema";
import { eq, desc, sql, and, isNull, gt } from "drizzle-orm";

export interface IStorage {
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  
  createInsight(leadId: number, content: string, score: number): Promise<Insight>;
  getInsights(leadId: number): Promise<Insight[]>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string; plan?: string }): Promise<User>;
  
  // Newsletter operations
  createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup>;
  getNewsletterSignup(email: string): Promise<NewsletterSignup | undefined>;
  
  // Newsletter subscription operations (tiered newsletter)
  createNewsletterSubscription(sub: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined>;
  updateNewsletterSubscription(email: string, updates: Partial<InsertNewsletterSubscription>): Promise<NewsletterSubscription | undefined>;
  cancelNewsletterSubscription(email: string): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  getReferralsByEmail(email: string): Promise<Referral[]>;
  getReferralsByReferredEmail(email: string): Promise<Referral[]>;
  updateReferral(id: number, updates: Partial<Referral>): Promise<Referral>;
  
  // Weekly stats operations
  getWeeklyStats(weekStart: Date): Promise<WeeklyStats | undefined>;
  getLatestWeeklyStats(): Promise<WeeklyStats | undefined>;
  createOrUpdateWeeklyStats(stats: InsertWeeklyStats): Promise<WeeklyStats>;
  
  // Stripe data queries
  getProduct(productId: string): Promise<any>;
  listProducts(active?: boolean): Promise<any[]>;
  listProductsWithPrices(active?: boolean): Promise<any[]>;
  getPrice(priceId: string): Promise<any>;
  getSubscription(subscriptionId: string): Promise<any>;
  
  // Magic link token operations (for secure email verification)
  createMagicLinkToken(email: string, token: string, expiresAt: Date): Promise<MagicLinkToken>;
  getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined>;
  markMagicLinkTokenUsed(token: string): Promise<void>;
  
  // Contact form operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Saved assets (watchlist) operations
  saveAsset(asset: InsertSavedAsset): Promise<SavedAsset>;
  unsaveAsset(userId: string, assetId: string): Promise<void>;
  getSavedAssets(userId: string): Promise<SavedAsset[]>;
  isAssetSaved(userId: string, assetId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead> {
    const [updated] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async createInsight(leadId: number, content: string, score: number): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values({ leadId, content, score })
      .returning();
    return insight;
  }

  async getInsights(leadId: number): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.leadId, leadId))
      .orderBy(desc(insights.createdAt));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string; plan?: string }): Promise<User> {
    const [updated] = await db
      .update(users)
      .set(info)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Newsletter operations
  async createNewsletterSignup(signup: InsertNewsletterSignup): Promise<NewsletterSignup> {
    const [created] = await db.insert(newsletterSignups).values(signup).returning();
    return created;
  }

  async getNewsletterSignup(email: string): Promise<NewsletterSignup | undefined> {
    const [signup] = await db.select().from(newsletterSignups).where(eq(newsletterSignups.email, email));
    return signup;
  }

  // Newsletter subscription operations (tiered newsletter)
  async createNewsletterSubscription(sub: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [created] = await db.insert(newsletterSubscriptions).values(sub).returning();
    return created;
  }

  async getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined> {
    const [sub] = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email));
    return sub;
  }

  async updateNewsletterSubscription(email: string, updates: Partial<InsertNewsletterSubscription>): Promise<NewsletterSubscription | undefined> {
    const [updated] = await db
      .update(newsletterSubscriptions)
      .set(updates)
      .where(eq(newsletterSubscriptions.email, email))
      .returning();
    return updated;
  }

  async cancelNewsletterSubscription(email: string): Promise<void> {
    await db
      .update(newsletterSubscriptions)
      .set({ cancelledAt: new Date() })
      .where(eq(newsletterSubscriptions.email, email));
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values(referral).returning();
    return created;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return referral;
  }

  async getReferralsByEmail(email: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerEmail, email)).orderBy(desc(referrals.createdAt));
  }

  async getReferralsByReferredEmail(email: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referredEmail, email)).orderBy(desc(referrals.createdAt));
  }

  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral> {
    const [updated] = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return updated;
  }

  // Weekly stats operations
  async getWeeklyStats(weekStart: Date): Promise<WeeklyStats | undefined> {
    const [stats] = await db.select().from(weeklyStats).where(eq(weeklyStats.weekStart, weekStart));
    return stats;
  }

  async getLatestWeeklyStats(): Promise<WeeklyStats | undefined> {
    const [stats] = await db.select().from(weeklyStats).orderBy(desc(weeklyStats.weekStart)).limit(1);
    return stats;
  }

  async createOrUpdateWeeklyStats(stats: InsertWeeklyStats): Promise<WeeklyStats> {
    const existing = await this.getWeeklyStats(stats.weekStart);
    if (existing) {
      const [updated] = await db.update(weeklyStats)
        .set({
          totalScans: (existing.totalScans || 0) + (stats.totalScans || 0),
          totalAssets: (existing.totalAssets || 0) + (stats.totalAssets || 0),
          totalUsers: (existing.totalUsers || 0) + (stats.totalUsers || 0),
          totalMrrPotential: (existing.totalMrrPotential || 0) + (stats.totalMrrPotential || 0),
          topMarketplaces: stats.topMarketplaces || existing.topMarketplaces,
          topNiches: stats.topNiches || existing.topNiches,
        })
        .where(eq(weeklyStats.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(weeklyStats).values(stats).returning();
    return created;
  }

  // Stripe data queries (from stripe schema managed by stripe-replit-sync)
  async getProduct(productId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProducts(active = true): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active} LIMIT 20`
    );
    return result.rows;
  }

  async listProductsWithPrices(active = true): Promise<any[]> {
    const result = await db.execute(
      sql`
        WITH paginated_products AS (
          SELECT id, name, description, metadata, active
          FROM stripe.products
          WHERE active = ${active}
          ORDER BY id
          LIMIT 20
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM paginated_products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getPrice(priceId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  // Magic link token operations
  async createMagicLinkToken(email: string, token: string, expiresAt: Date): Promise<MagicLinkToken> {
    const [created] = await db.insert(magicLinkTokens).values({
      email: email.toLowerCase().trim(),
      token,
      expiresAt,
    }).returning();
    return created;
  }

  async getMagicLinkToken(token: string): Promise<MagicLinkToken | undefined> {
    const [found] = await db.select().from(magicLinkTokens).where(
      and(
        eq(magicLinkTokens.token, token),
        isNull(magicLinkTokens.usedAt),
        gt(magicLinkTokens.expiresAt, new Date())
      )
    );
    return found;
  }

  async markMagicLinkTokenUsed(token: string): Promise<void> {
    await db.update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.token, token));
  }

  // Contact form operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }
  
  // Saved assets (watchlist) operations
  async saveAsset(asset: InsertSavedAsset): Promise<SavedAsset> {
    // Check if already saved
    const existing = await this.isAssetSaved(asset.userId, asset.assetId);
    if (existing) {
      // Return existing record
      const [found] = await db.select().from(savedAssets).where(
        and(
          eq(savedAssets.userId, asset.userId),
          eq(savedAssets.assetId, asset.assetId)
        )
      );
      return found;
    }
    const [created] = await db.insert(savedAssets).values(asset).returning();
    return created;
  }
  
  async unsaveAsset(userId: string, assetId: string): Promise<void> {
    await db.delete(savedAssets).where(
      and(
        eq(savedAssets.userId, userId),
        eq(savedAssets.assetId, assetId)
      )
    );
  }
  
  async getSavedAssets(userId: string): Promise<SavedAsset[]> {
    return await db.select().from(savedAssets)
      .where(eq(savedAssets.userId, userId))
      .orderBy(desc(savedAssets.createdAt));
  }
  
  async isAssetSaved(userId: string, assetId: string): Promise<boolean> {
    const [found] = await db.select().from(savedAssets).where(
      and(
        eq(savedAssets.userId, userId),
        eq(savedAssets.assetId, assetId)
      )
    );
    return !!found;
  }
}

export const storage = new DatabaseStorage();
