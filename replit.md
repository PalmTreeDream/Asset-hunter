# Asset Hunter Beta - Micro-Private Equity Engine

## Overview
Asset Hunter Beta is a Micro-Private Equity Engine designed to automate finding, vetting, and acquiring distressed software businesses. The platform focuses on discovering "abandoned monopolies" - Chrome Extensions and Shopify Apps with significant user bases but showing signs of distress (no recent updates, broken support, Manifest V2 risk). The core purpose is to hunt for "Distribution" (Chrome Extensions & Shopify Apps) rather than "Code," as large user bases are valuable and easier to fix than to acquire.

Key capabilities include:
- **Distress Scanner**: Scours app stores for abandoned apps with large user bases.
- **Hunter Intelligence (AHI)**: Proprietary AI for calculating MRR potential and generating acquisition playbooks.
- **Lead Management**: Tools to track, analyze, and manage acquisition targets.
- **Bloomberg-style Terminal**: Real-time streaming of opportunities with valuations at /feed route.

## Recent Changes (December 31, 2025)
- **Acquire.com-Inspired Redesign (Indigo Accent)** - Clean, professional marketplace design pattern
  - Landing page: Hero with value proposition, trust metrics bar (4.8 rating, $2.4M+ discovered, 1,200+ hunters), How It Works section, Features grid, Testimonials, Pricing preview
  - Feed/Browse page: Light theme marketplace preview with asset cards, search, and filters
  - Design pattern: White backgrounds for marketing pages, indigo-600 (#4F46E5) accents, professional typography
  - Card hover states: hover:shadow-xl hover:border-indigo-200 (clean flat design, no glassmorphism)
  - Category badges: bg-indigo-50 text-indigo-700
  - Dual-theme approach: Light theme for marketing (/, /feed), dark terminal for app (/hunt, /pricing)
  - Updated design_guidelines.md with exact Acquire.com patterns

- **Hunt Page Terminal** - Maintains dark terminal aesthetics for app interior
  - Auto-load on page entry: triggers "productivity" scan automatically
  - Terminal glassmorphism: glass-terminal and glass-card utility classes
  - JetBrains Mono (font-mono) for metrics and data displays
  - Blur overlay on asset cards 4+ for non-premium users

## Previous Changes (December 28, 2025)
- **Direct Web Scraping System** - Eliminated dependency on SerpAPI credits
  - Created `server/direct-scrapers.ts` with dedicated scrapers for all 14 marketplaces
  - Three-tier scanning strategy: Direct Scraping (free) → SerpAPI backup → Curated fallback
  - 6-hour caching prevents repeated scraping of same queries
- Restored full site architecture with dedicated pages: /hunt (distress scanner), /login (magic link auth), /pulse (analytics)
- Feed page now shows curated preview assets with search bar linking to Hunt page
- Restored 3-tier Pricing: Scout ($29/mo sold out), Hunter ($99/mo sold out), Founding Member ($149 lifetime active)
- Hunt.tsx reads ?q= query parameter to pre-populate search from Feed page
- Fixed authentication: session status now recognizes both Replit OIDC (Google/GitHub login) AND magic link auth
- Authenticated users now get REAL live scans (not demo); contact info remains Pro-only
- Added "Signed In" badge and "Upgrade to Pro" link for authenticated non-Pro users
- Fixed Stripe checkout to use proper POST mutation with loading states
- Updated Terms/Privacy dates to December 28, 2025

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
- **Design System**: Dual-theme approach inspired by Acquire.com
  - Marketing pages (/, /feed): Clean white backgrounds, professional typography (Inter), indigo-600 (#4F46E5) accents
  - App pages (/hunt, /pricing): Dark terminal theme with slate-950 backgrounds
  - Consistent indigo-600 (#4F46E5) as primary accent color throughout
  - 10px border radius, border-slate-200 borders, hover:shadow-xl patterns

### Backend
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints with Zod for shared schema validation.
- **AI Integration**: Google Gemini via Replit AI Integrations.
- **Core Feature Implementations**: Includes chat functionality, image generation, and batch processing.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Core Tables**: `sessions`, `users`, `leads`, `insights`, `conversations`, `messages`, `newsletter_signups`, `newsletter_subscriptions`.

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
- **Pricing**: Three-tier structure:
  - Scout ($29/mo): 30 scans/month, 5 owner reveals - SOLD OUT
  - Hunter ($99/mo): Unlimited scans + reveals, acquisition playbooks - SOLD OUT
  - Founding Member ($149 lifetime): All features, perpetual access - ACTIVE
- **Checkout Flow**: POST to `/api/stripe/checkout` with `tier` to generate Stripe checkout session URL.

### Build & Development
- **Dev**: `npm run dev` (Express server with Vite middleware).
- **Build**: `npm run build` (Client and server bundling).
- **Production**: `npm start` (Serves from `dist/` directory).

## External Dependencies

### AI Services
- **Replit AI Integrations**: Powers the Hunter Intelligence Engine using `gemini-2.5-flash` model.

### Data Sources
- **Direct Web Scraping**: Primary method - scrapes 14 marketplaces (iOS, Android, Chrome, Firefox, Shopify, WordPress, Slack, Zapier, Product Hunt, Flippa/Acquire, Microsoft Store, Salesforce, Atlassian, Gumroad) directly via HTTP requests. No API costs.
- **SerpAPI (optional backup)**: Used as fallback when direct scraping returns <5 results. Not required for operation.

### Database
- **PostgreSQL**: Primary database for all persistent data.

### Revenue Engine (Python/FastAPI)
- **Distress Scanner**: Scans 8 marketplaces (Chrome Web Store, Shopify App Store, etc.) via SerpAPI for assets with >1,000 users and no updates in 6+ months.
- **Hunter Intelligence**: Performs PE-style analysis with asset-specific pricing models and valuations (3-5x annual revenue). Generates valuations, MRR, strategies, cold emails, owner contacts, and negotiation scripts.