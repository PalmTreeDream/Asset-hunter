import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { pythonEngine } from "./python-client";
import { updateOutreachLogSchema, insertOutreachLogSchema } from "@shared/schema";


export function registerRoutes(httpServer: Server, app: Express): Server {

    // Set up Replit Auth
    setupAuth(app);

    // Health check
    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    // === ENGINE SCANNERS ===
    // Trigger a scan via Python Engine
    app.post("/api/engine/scan", async (req, res) => {
        const { query, marketplaces, min_users, max_results } = req.body;

        try {
            console.log(`[Engine Scan] Requesting scan for query: "${query}"`);
            const result = await pythonEngine.scan(
                query || "",
                marketplaces,
                min_users,
                max_results
            );

            if (result && result.assets.length > 0) {
                // Transform assets to match frontend format
                const transformedAssets = result.assets.map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    type: `${asset.marketplace}_asset`,
                    url: asset.url,
                    description: asset.description || "",
                    revenue: `${asset.users.toLocaleString()} users`,
                    details: asset.verification_notes || `Distress Score: ${asset.distress_score}/10`,
                    status: asset.distress_score >= 5 ? "distressed" : "healthy",
                    user_count: asset.users,
                    marketplace: asset.marketplace,
                    mrr_potential: asset.estimated_mrr || 0,
                    valuation: asset.estimated_valuation || 0,
                    distress_score: asset.distress_score,
                    distress_signals: asset.distress_signals,
                    verified: asset.verified,
                }));

                // Save discovered assets to database for tracking (non-blocking)
                const assetsToSave = result.assets.map(asset => ({
                    externalId: asset.id || asset.url,
                    marketplace: asset.marketplace,
                    name: asset.name,
                    url: asset.url,
                    description: asset.description || null,
                    users: asset.users || 0,
                    rating: null,
                    ratingCount: null,
                    lastUpdatedByOwner: null,
                    estimatedMrr: asset.estimated_mrr || 0,
                    distressScore: Math.round((asset.distress_score || 0) * 10),
                    category: null,
                    tags: asset.distress_signals || null,
                    rawData: asset,
                    lastScannedAt: new Date(),
                }));
                storage.upsertScannedAssets(assetsToSave).catch(err =>
                    console.error("[Engine Scan] Failed to save assets:", err.message)
                );

                return res.json({
                    assets: transformedAssets,
                    total_found: result.total_found,
                    marketplaces_scanned: result.marketplaces_scanned,
                    scan_duration_ms: result.scan_duration_ms,
                    source: "python_engine",
                    cached: result.cached,
                });
            }

            // Fallback to error if Python engine has no results
            res.json({
                assets: [],
                total_found: 0,
                marketplaces_scanned: marketplaces?.length || 14,
                scan_duration_ms: 0,
                source: "fallback",
                message: "No live results found"
            });
        } catch (error: any) {
            console.error("[Engine Scan] Error:", error.message);
            res.json({
                assets: [],
                total_found: 0,
                source: "fallback",
                error: error.message
            });
        }
    });

    // Verify asset using Python Engine
    app.post("/api/engine/verify", async (req, res) => {
        const { asset_id, asset_url, marketplace } = req.body;

        if (!asset_url || !marketplace) {
            return res.status(400).json({ error: "asset_url and marketplace required" });
        }

        try {
            const result = await pythonEngine.verify(
                asset_id || "unknown",
                asset_url,
                marketplace
            );

            if (result) {
                res.json({
                    success: true,
                    verification: result
                });
            } else {
                res.status(503).json({
                    success: false,
                    message: "Verification service unavailable"
                });
            }
        } catch (error: any) {
            console.error("[Engine Verify] Error:", error.message);
            res.status(500).json({ error: error.message });
        }
    });

    // List available marketplaces
    app.get("/api/marketplaces", async (req, res) => {
        const marketplaces = await pythonEngine.getMarketplaces();
        res.json({
            marketplaces,
            total: marketplaces.length
        });
    });

    // Asset discovery stats (for landing page dynamic counts)
    app.get("/api/stats/assets", async (req, res) => {
        try {
            const [total, thisWeek, today] = await Promise.all([
                storage.getScannedAssetsCount(),
                storage.getScannedAssetsCountThisWeek(),
                storage.getScannedAssetsCountToday(),
            ]);
            res.json({
                total,
                thisWeek,
                today,
            });
        } catch (error: any) {
            console.error("[Stats] Error:", error.message);
            res.json({ total: 0, thisWeek: 0, today: 0 });
        }
    });

    // === SAVED ASSETS (WATCHLIST) API ===
    // Get user's saved assets - requires authentication
    app.get("/api/saved", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required", authenticated: false });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "Invalid user session" });
        }

        try {
            const savedAssets = await storage.getSavedAssets(userId);
            res.json({
                assets: savedAssets,
                total: savedAssets.length
            });
        } catch (error: any) {
            console.error("[Saved] Get error:", error.message);
            res.status(500).json({ error: "Failed to get saved assets" });
        }
    });

    // Save an asset - requires authentication
    app.post("/api/saved", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required", authenticated: false });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "Invalid user session" });
        }

        const { assetId, assetName, assetUrl, marketplace, description, users, estimatedMrr, distressScore, assetData } = req.body;

        if (!assetId || !assetName || !assetUrl || !marketplace) {
            return res.status(400).json({ error: "assetId, assetName, assetUrl, and marketplace are required" });
        }

        try {
            const saved = await storage.saveAsset({
                userId,
                assetId,
                assetName,
                assetUrl,
                marketplace,
                description: description || null,
                users: users || 0,
                estimatedMrr: estimatedMrr || 0,
                distressScore: distressScore || 0,
                assetData: assetData || null,
            });

            res.json({
                success: true,
                asset: saved
            });
        } catch (error: any) {
            console.error("[Saved] Save error:", error.message);
            res.status(500).json({ error: "Failed to save asset" });
        }
    });

    // Unsave an asset - requires authentication
    app.delete("/api/saved/:assetId", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required", authenticated: false });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        const { assetId } = req.params;

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "Invalid user session" });
        }

        try {
            await storage.unsaveAsset(userId, assetId);
            res.json({ success: true });
        } catch (error: any) {
            console.error("[Saved] Unsave error:", error.message);
            res.status(500).json({ error: "Failed to unsave asset" });
        }
    });

    // Check if asset is saved
    app.get("/api/saved/:assetId/check", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.json({ saved: false, authenticated: false });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        const { assetId } = req.params;

        if (!userId || typeof userId !== 'string') {
            return res.json({ saved: false });
        }

        try {
            const isSaved = await storage.isAssetSaved(userId, assetId);
            res.json({ saved: isSaved });
        } catch (error: any) {
            res.json({ saved: false });
        }
    });

    // Get all scanned assets for the feed
    app.get("/api/scanned-assets", async (req, res) => {
        try {
            const assets = await storage.getScannedAssets();
            res.json(assets);
        } catch (error: any) {
            console.error("[Scanned Assets] Get error:", error.message);
            res.status(500).json({ error: "Failed to get scanned assets" });
        }
    });

    // Get single scanned asset by ID for detail view
    app.get("/api/scanned-assets/:id", async (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid asset ID" });
        }
        
        try {
            const asset = await storage.getScannedAssetById(id);
            if (!asset) {
                return res.status(404).json({ error: "Asset not found" });
            }
            res.json(asset);
        } catch (error: any) {
            console.error("[Scanned Asset] Get by ID error:", error.message);
            res.status(500).json({ error: "Failed to get asset" });
        }
    });

    // === OUTREACH TRACKING ===
    // Get user's outreach logs
    app.get("/api/outreach", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "User ID required" });
        }

        try {
            const logs = await storage.getOutreachLogs(userId);
            res.json({ logs });
        } catch (error: any) {
            console.error("[Outreach] Get logs error:", error.message);
            res.status(500).json({ error: "Failed to get outreach logs" });
        }
    });

    // Create new outreach log
    app.post("/api/outreach", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "User ID required" });
        }

        // Validate request body with Zod schema
        const validation = insertOutreachLogSchema.extend({
            userId: insertOutreachLogSchema.shape.userId.optional(),
        }).safeParse(req.body);
        
        if (!validation.success) {
            return res.status(400).json({ error: "Invalid request", details: validation.error.flatten() });
        }
        
        const { assetId, assetName, marketplace, channel, subject, notes } = validation.data;

        try {
            const log = await storage.createOutreachLog({
                userId,
                assetId: String(assetId),
                assetName,
                marketplace,
                channel: channel || "email",
                status: "sent",
                subject: subject || null,
                notes: notes || null,
            });
            res.json({ log });
        } catch (error: any) {
            console.error("[Outreach] Create error:", error.message);
            res.status(500).json({ error: "Failed to create outreach log" });
        }
    });

    // Update outreach log (status, notes)
    app.patch("/api/outreach/:id", async (req, res) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const userId = req.session?.email || (req.user as any)?.email;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "User ID required" });
        }

        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid outreach log ID" });
        }

        // Validate request body
        const validation = updateOutreachLogSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: "Invalid request", details: validation.error.flatten() });
        }
        
        const { status, notes } = validation.data;

        try {
            const log = await storage.updateOutreachLog(id, userId, { status, notes });
            if (!log) {
                return res.status(404).json({ error: "Outreach log not found" });
            }
            res.json({ log });
        } catch (error: any) {
            console.error("[Outreach] Update error:", error.message);
            res.status(500).json({ error: "Failed to update outreach log" });
        }
    });

    return httpServer;
}

// No seed data - empty watchlist encourages users to run their first scan
