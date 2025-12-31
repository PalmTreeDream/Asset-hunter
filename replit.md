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
- **Pricing Tiers**: Scout ($29/mo), Hunter ($99/mo), Syndicate ($249/mo) with varying features and access levels.

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