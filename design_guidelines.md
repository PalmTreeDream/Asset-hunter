# AssetHunter Design Guidelines

## Design Approach
Reference-based design inspired by Stripe and Linear, emphasizing data clarity through glassmorphism and sophisticated typography. Clean, professional aesthetic that balances visual polish with information density.

## Typography System
**Font Family:** Inter (Google Fonts)
- Hero/Display: 48-72px, weight 700, tight leading (1.1)
- Section Headers: 32-40px, weight 600
- Card Titles: 20-24px, weight 600
- Body Text: 16px, weight 400, line-height 1.6
- Data Labels: 14px, weight 500, uppercase tracking
- Caption/Meta: 12px, weight 400, muted

## Layout & Spacing
**Tailwind Units:** Consistently use 4, 8, 12, 16, 24, 32 for spacing (p-4, gap-8, mb-12, etc.)
- Container: max-w-7xl with px-4 md:px-8
- Section Padding: py-16 md:py-24 lg:py-32
- Card Padding: p-6 md:p-8
- Grid Gaps: gap-6 md:gap-8

## Component Library

### Navigation
Top navigation bar with frosted glass effect, sticky positioning. Logo left, navigation center, CTA button right. Mobile: Hamburger menu with slide-in panel.

### Hero Section (Full-width)
Split layout: Left 60% - headline, subheadline, dual CTAs (emerald primary + outline secondary). Right 40% - large hero image showing dashboard preview or data visualization mockup. Buttons on image have backdrop-blur-md backgrounds.

### Data Panels (Glassmorphism Cards)
Dark panels (deep indigo background at 95% opacity) with backdrop-blur-lg, rounded-3xl (24px), subtle border (white 10% opacity), shadow-2xl. Float above white background. Include header with icon, title, and metadata row.

### Marketplace Listings
Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) showing business cards. Each card: Company name, MRR gauge (circular progress), confidence badge (pill-shaped with viz colors), key metrics row, provenance indicator, and view details button.

### Confidence Badges
Pill-shaped indicators using visualization palette. High confidence: viz-green background with white text. Medium: viz-amber. Low: viz-red. Info: viz-blue. Include icon + text.

### Data Visualizations
**Radar Charts:** Multi-axis evaluation (financials, tech stack, team, market). Canvas-based with viz palette.
**MRR Gauges:** Semi-circular progress indicators with percentage center label and trend arrow.
**Provenance Cards:** Timeline-style cards showing data source verification, timestamps, and confidence scores.

### Accordion Patterns (Mobile)
Collapsible sections for filtering, advanced metrics, and deal details. Icon rotation on expand, smooth height transitions. Stacked on mobile, side-by-side panels on desktop.

### Forms & Inputs
Floating labels, rounded-2xl (16px) borders, focus states with emerald ring. Search bars prominently placed with glass morphism effect.

### CTAs
Primary: Emerald background, white text, rounded-2xl, px-8 py-4, medium weight. Secondary: Outline with emerald border. Tertiary: Text-only emerald color.

## Visualization Color Palette
- viz-green: #10B981 (success metrics, high confidence)
- viz-amber: #F59E0B (warnings, medium confidence)
- viz-red: #EF4444 (risks, low confidence)
- viz-blue: #3B82F6 (informational data)

## Images
**Hero Image:** Large, high-quality screenshot of platform dashboard showing data panels, charts, and marketplace UI. Position right side of hero section, slightly elevated with subtle shadow. Full-bleed on mobile.

**Section Images:** Dashboard previews, chart examples, data visualization samples throughout feature sections. Use glassmorphic frames around screenshots.

**Background Treatments:** Subtle gradient meshes (indigo to white) in hero, pure white elsewhere to emphasize floating dark panels.