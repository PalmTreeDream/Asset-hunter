# Asset Hunter Beta - Micro-Private Equity Engine

## Overview
Asset Hunter Beta is a Micro-Private Equity Engine designed to automate finding, vetting, and acquiring distressed software businesses. The platform focuses on discovering "abandoned monopolies" - Chrome Extensions and Shopify Apps with significant user bases but showing signs of distress (no recent updates, broken support, Manifest V2 risk). The core purpose is to hunt for "Distribution" (Chrome Extensions & Shopify Apps) rather than "Code," as large user bases are valuable and easier to fix than to acquire.

Key capabilities include:
- **Distress Scanner**: Scours app stores for abandoned apps with large user bases.
- **Hunter Intelligence (AHI)**: Proprietary AI for calculating MRR potential and generating acquisition playbooks.
- **Lead Management**: Tools to track, analyze, and manage acquisition targets.
- **Bloomberg-style Dashboard**: Real-time streaming of opportunities with valuations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui (New York style)
- **State Management**: TanStack React Query
- **Animations**: Framer Motion, with Apple-quality easing (cubic-bezier 0.22, 1, 0.36, 1) and scroll reveal effects.
- **Build Tool**: Vite
- **Design System**: Jony Ive-inspired with DM Sans/Outfit/SF Mono typography, 16-24px border radius, and a color palette of Primary Navy (#0F1729) and Accent Emerald (#10B77F). Layout features a clean light canvas with floating dark panels and pill-shaped buttons.

### Backend
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints with Zod for shared schema validation.
- **AI Integration**: Google Gemini via Replit AI Integrations.
- **Core Feature Implementations**: Includes chat functionality, image generation, and batch processing.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Core Tables**: `sessions`, `users`, `leads`, `insights`, `conversations`, `messages`, `newsletter_signups`, `newsletter_subscriptions`, `outreach_logs`.

### Outreach Tracking System
- **Purpose**: CRM-style tracking of acquisition outreach to asset owners.
- **Database Table**: `outreach_logs` with fields for assetId, assetName, marketplace, channel, status, subject, notes, sentAt, updatedAt.
- **Status Workflow**: sent → awaiting_reply → replied → follow_up → closed
- **API Endpoints**:
  - `GET /api/outreach` - List all outreach logs for authenticated user
  - `POST /api/outreach` - Create new outreach log (validated with Zod schema)
  - `PATCH /api/outreach/:id` - Update status/notes (validated with Zod schema)
- **Frontend**: Inbox page with status filter tabs, editable notes dialog, react-query integration with cache invalidation
- **Integration**: Email button in Feed/AssetDetailSheet automatically logs outreach attempts

### Authentication
- **Provider**: Replit OIDC via `openid-client` and `passport`.
- **Session Management**: PostgreSQL via `connect-pg-simple`.
- **Frontend Integration**: `useAuth()` hook for managing user authentication state.

### Newsletter Subscription System
- **Tiers**: Two-tier system (Free and Insider) with Stripe integration.
- **Features**: Personalized alerts based on user filters.

### Hunter Intelligence (AHI) System
- **Purpose**: Provides deterministic scoring for asset acquisition analysis.
- **Scoring**: 5-axis radar chart (Distress, Monetization Gap, Technical Risk, Market Position, Flip Potential) on a 1-10 scale.
- **Marketplace Confidence**: Tiers (High, Medium, Low Accuracy) based on data availability.
- **MRR Formulas**: Asset-specific calculations for various platforms (Chrome/Firefox, Shopify, WordPress, Slack, etc.).
- **Caching**: In-memory cache with 24-hour TTL for consistent responses.
- **Branding**: Always uses "Hunter Intelligence" or "AHI"; never exposes underlying AI technology.

### Data Enrichment Service
- **Purpose**: Provides additional intelligence on assets.
- **Features**: GitHub Repo Analysis (activity score, tech stack), Hunter.io Integration (owner email lookup).
- **Security**: `/api/enrich` endpoint secured with verified session checks and database user/premium status verification.

### Payments
- **Provider**: Stripe via `stripe-replit-sync`.
- **Pricing Tiers**: 
  - Scout ($29/mo): 10 reveals/month, waitlist-only (Beta Full), ideal for "Casual Browsers"
  - Hunter ($49/mo): 50 reveals/month, NOW AVAILABLE (7 spots left), no daily limit, ideal for "Side Hustlers"
  - Founding Member ($149 lifetime): 300 reveals/month (max 50/day fair use), lifetime access, "Closing Soon" badge, ideal for "Serious Investors"

### Build & Development
- **Dev**: `npm run dev` (Express server with Vite middleware).
- **Build**: `npm run build` (Client and server bundling).
- **Production**: `npm start` (Serves from `dist/` directory).

## External Dependencies

### AI Services
- **Replit AI Integrations**: Powers the Hunter Intelligence Engine using `gemini-2.5-flash` model.

### Data Sources
- **SerpAPI**: Used for scraping Chrome Web Store and Shopify App Store to find distressed extensions and apps.

### Database
- **PostgreSQL**: Primary database for all persistent data.

### Revenue Engine (Python/FastAPI)
- **Distress Scanner**: Scans 8 marketplaces (Chrome Web Store, Shopify App Store, etc.) via SerpAPI for assets with >1,000 users and no updates in 6+ months.
- **Hunter Intelligence**: Performs PE-style analysis with asset-specific pricing models and valuations (3-5x annual revenue). Generates valuations, MRR, strategies, cold emails, owner contacts, and negotiation scripts.

## Recent Changes (December 2024)

### Search Functionality
- **Live Search**: Feed page now connects to `/api/scan` endpoint for real marketplace searches
- **Debounced Search**: 500ms debounce before triggering API calls
- **Search UI**: Added "Scan" button with loading spinner, search input shows scanning status
- **Empty State**: When search returns 0 results, shows proper empty state with "Browse All Assets" button
- **Fallback**: Shows curated mock assets when not actively searching

### Pricing Model Update
- **Removed**: "Asking Price" field (inappropriate for distressed private assets)
- **Added**: "Est. Acquisition" calculated as 3x annual MRR (industry standard for distressed assets)
- **Sort Options**: Changed "Lowest Price" to "Best Value" (sorts by lowest MRR for quick acquisitions)

### Watchlist System
- **Secure Endpoints**: All `/api/saved` endpoints require authentication
- **Optimistic UI**: Save/unsave buttons show immediate feedback with loading spinners
- **Toast Notifications**: Success/error feedback for watchlist operations

### Feed Page Features
- **Pagination**: 12 items per page with page navigation controls
- **Filtering**: Category filter pills (Browser Extension, E-commerce, SaaS, etc.)
- **Sorting**: Distress Score, Highest MRR, Most Users, Best Value options
- **Asset Masking**: Non-premium users see masked asset names and descriptions

### Landing Page Updates (December 2024)
- **Removed**: "Deal Intelligence Terminal" section (LiveDemoSection) for cleaner landing page
- **ROI Breakdown Section**: Added soft white-to-green gradient background with dark mode support
- **Card Animations**: ROI cards now have hover pop animation (scale: 1.03, y: -4px) using framer-motion

### Feed Page Asset Card Redesign (December 2024)
- **Simplified Layout**: Removed empty fields (Revenue, Profit, Growth, Churn)
- **Fixed Duplicate Badges**: Replaced category badge with platform badge showing icon
- **New Metrics**: Shows Est. MRR, Users, calculated Distress score (avg of 3 metrics)
- **Calculated Fields**: Est. Acquisition (3x annual MRR), Annual Revenue (MRR × 12)
- **Fixed React Keys**: Tags now use unique keys (`${tag}-${idx}`) to prevent warnings

### Asset Tracking System (January 2025)
- **New Table**: `scanned_assets` tracks discovered assets over time
- **Fields**: externalId, marketplace, name, url, users, rating, estimatedMrr, distressScore, firstSeenAt, lastScannedAt
- **De-duplication**: Unique index on (external_id, marketplace) prevents duplicate entries
- **Auto-save**: `/api/engine/scan` now saves discovered assets to database (non-blocking)
- **Stats API**: New `/api/stats/assets` endpoint for aggregate discovery statistics

### Landing Page Copy Overhaul (January 2025)
- **Copy Style**: Thiel x Jobs style (5th grade reading level, punchy, poetic)
- **Hero Headline**: "Skip the build. Buy the users."
- **Hero Subheadline**: "Real apps. Real revenue. Found first."
- **Status Ticker**: "New assets added daily" (static, always true)
- **Removed**: Badge clutter ("Private equity for solo operators")
- **Stats Pills**: Descriptive ("We search 14 app stores", "Find dormant apps", "Before anyone else")
- **Value Props**: Simplified language, removed jargon ("distress signals" → "dormant apps")
- **Terminology**: "dormant" replaces "distressed" or "forgotten" throughout copy

### Waitlist & Credit System (January 2025)
- **Waitlist API**: New `/api/waitlist` endpoint with email validation, tier tracking, and duplicate handling (409 for existing emails)
- **Database Tables**: Added `waitlist` and `user_credits` tables to store waitlist signups and user credit balances
- **Credit Amounts (Updated January 2025)**: 
  - Scout: 10 reveals (fixed, no daily limit)
  - Hunter: 50 reveals (fixed, no daily limit) - NOW AVAILABLE at $49/mo with 7 spots
  - Founding Member: 300 reveals/month, max 50/day fair use (updated from 15/day)
- **Credit Schema Fields**: tier, credits, monthlyAllowance, dailyLimit, dailyUsed, lastDailyReset, lastMonthlyReset
- **Lazy Reset Logic**: On each reveal, checks if daily/monthly counters need reset based on timestamps
- **Credit APIs**: 
  - `POST /api/credits/initialize` - Initialize credits when user subscribes (sets tier-specific limits)
  - `GET /api/credits` - Get current credit balance (includes dailyUsed, dailyLimit for progressive disclosure)
  - `POST /api/assets/:id/reveal` - Reveal asset, enforces daily (50) and monthly (300) limits for Founding Member
- **Server-side Masking**: `/api/scanned-assets` masks asset names, descriptions, and URLs for non-premium users
- **Pricing Page**: "Join Waitlist" buttons open modal for email collection on sold-out tiers (Scout only now)
- **Session Extension**: Added `userId` field to express-session interface for credit tracking
- **Progressive Disclosure**: Daily limit banner only shows after 10 reveals with positive messaging ("You're on fire today!")
- **Ideal For Sections**: Added user persona descriptions to each pricing tier (Casual Browsers, Side Hustlers, Serious Investors)
- **Feed Header Navigation**: Added Watchlist link accessible from Feed page header

### Mobile Navigation (January 2025)
- **MobileNav Component**: New component (`client/src/components/MobileNav.tsx`) with 4 nav items (Listings, Watchlist, Inbox, Profile)
- **Visibility**: Shows only on mobile viewports (< 1024px) via `lg:hidden` class
- **Fixed Position**: Bottom of viewport with safe-area padding for modern devices
- **Active State**: Current route highlighted in indigo color
- **Integration**: Added to Feed and AssetDetail pages with responsive bottom padding (pb-24 lg:pb-8)

### Asset Detail Page (January 2025)
- **Dedicated Route**: `/asset/:id` for viewing asset details
- **Rich Visualizations**: Hunter Radar chart, MRR/User trend charts (Recharts)
- **Tabbed Interface**: Overview, Hunter Intelligence, Competitors (premium), Owner Contact (revealed)
- **Reveal Integration**: Server-side gating of sensitive fields until asset is revealed
- **Mobile-First**: Responsive design with bottom padding for mobile nav

### Authentication Gate (January 2025)
- **Protected Routes**: Feed and AssetDetail require authentication
- **Signup Page**: `/signup` with email/password form, social login options, value proposition sidebar
- **ProtectedRoute Component**: Redirects unauthenticated users to /signup

### Enhanced Schema (January 2025)
- **scanned_assets Extended Fields**:
  - Historical metrics: `usersHistory`, `mrrHistory` (JSON arrays)
  - Hunter Intelligence axes: `hunterDistress`, `hunterMonetization`, `hunterTechnical`, `hunterMarket`, `hunterFlip`
  - Qualitative insights: `distressSignals`, `riskFactors`, `opportunities` (text arrays)
  - Owner contact: `ownerName`, `ownerEmail`, `linkedinUrl`, `githubUrl`
  - Competitive: `competitorsData` (JSON), `marketPositionNote`
- **TypeScript Interfaces**: `UserHistoryPoint`, `MrrHistoryPoint`, `CompetitorData`, `ScannedAssetFull`