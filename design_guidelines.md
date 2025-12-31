# AssetHunter Design Guidelines

## Design Philosophy
Inspired by Acquire.com's clean, professional marketplace design. Trust-focused aesthetic with indigo (#4F46E5) as the primary accent color. Clean white backgrounds, subtle slate-200 borders, minimal shadows, and 10px border radius throughout. No glassmorphism - flat, clean design only.

## Brand Colors

### Primary Palette
- **Primary Accent (Indigo):** #4F46E5 (indigo-600) - CTAs, active states, links
- **Primary Dark:** #4338CA (indigo-700) - Hover states
- **Primary Light:** #EEF2FF (indigo-50) - Subtle backgrounds, badges
- **Background:** #FFFFFF (white)
- **Surface:** #FFFFFF with border-slate-200
- **Text Primary:** #0F172A (slate-900)
- **Text Secondary:** #64748B (slate-500)
- **Text Muted:** #94A3B8 (slate-400)

### Accent Colors
- **Category Badge:** bg-indigo-50 text-indigo-700
- **Success:** #10B981 (green-500)
- **Warning:** #F59E0B (amber-500)
- **Error:** #EF4444 (red-500)
- **Info:** #3B82F6 (blue-500)

## Typography System
**Font Family:** Inter (system-ui fallback)
- **Hero Headlines:** 48-64px, weight 700, tight tracking, slate-900
- **Section Headers:** 36-48px, weight 700, line-height 1.2
- **Subheadings:** 24-32px, weight 600
- **Card Titles:** 18-20px, weight 600
- **Body Text:** 16px, weight 400, line-height 1.6
- **Small/Labels:** 14px, weight 500
- **Caption:** 12px, weight 400, muted

## Layout & Spacing
- **Container:** max-w-7xl centered with px-4 sm:px-6 lg:px-8
- **Section Padding:** py-20 lg:py-32
- **Card Padding:** p-6 lg:p-8
- **Grid Gaps:** gap-6 lg:gap-8
- **Border Radius:** rounded-xl (0.625rem / 10px)

## Core Components

### Navigation
Sticky top bar with white background, subtle shadow-sm on scroll. Logo left, nav links center, CTA right. Clean minimal design.

### Hero Section
- Large headline with clear value proposition
- Accent color on key phrase: text-indigo-600
- Subheadline with key benefit
- Dual CTAs: Primary (bg-indigo-600) + Secondary (variant="outline")
- Trust metrics bar below CTAs

### Trust Metrics Bar
Clean horizontal bar with key stats:
- Pattern: border-y border-slate-200 bg-white py-6
- Icon + bold number + label for each metric
- Icons use text-indigo-600
- Flex wrap with centered gap-8 lg:gap-16

### How It Works Section
3-4 step process:
- Step indicator: bg-indigo-50 text-indigo-600 rounded-xl icon container
- Step number label: text-sm text-indigo-600
- Title + description per step

### Feature Cards
- bg-white rounded-xl p-6
- border border-slate-100
- Subtle hover: hover:shadow-md transition-shadow
- Icon container: bg-indigo-50 text-indigo-600 rounded-xl

### Asset/Listing Cards (Marketplace)
- bg-white rounded-xl border border-slate-200 p-6
- Hover state: hover:shadow-xl hover:border-indigo-200
- MRR indicator: text-indigo-600 font-medium
- Type badge: Badge variant="secondary"

### Pricing Cards
- bg-white rounded-xl border border-slate-200 p-8
- Featured tier: border-indigo-200 shadow-xl
- Badge for featured: bg-indigo-600 text-white
- Checkmarks: text-indigo-600
- CTA: bg-indigo-600 hover:bg-indigo-700

### CTA Section
- Full-width: bg-indigo-600
- White text headlines
- Subtext: text-indigo-100
- Button: bg-white text-indigo-600 hover:bg-indigo-50

### Footer
- bg-slate-900 text-slate-400
- Logo in white
- Link hover: hover:text-white

## Button Styles
- **Primary:** bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
- **Secondary/Outline:** border border-slate-300 text-slate-700
- **Ghost:** text-slate-600 hover:text-slate-900
- NO custom hover state implementations - use built-in component hover

## Card Hover Patterns (Acquire.com Style)
- Default: border-slate-200
- Hover: hover:shadow-xl hover:border-indigo-200 transition-all
- No heavy glow effects or glassmorphism
- Subtle translateY(-4px) on hover is acceptable

## Logo
- Indigo "A" with crossbar in #4F46E5 on navy #0F1729 background
- 10px border radius (rounded-xl for larger)
- White strokes for the A letter

## Dark Mode (App Interior Only)
For authenticated app pages (Hunt, Dashboard):
- Background: slate-950 (#020617)
- Keep indigo-600 accent
- High contrast text
- Marketing pages (/, /feed) stay light theme

## Animations
- Subtle hover transitions (200ms)
- Smooth scroll for anchor links
- Fade-in-up for section reveals (framer-motion)
- No excessive movement or glassmorphism effects
