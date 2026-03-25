# Glow Pass Web Platform

Premium invite-only platform connecting female influencer/creators with nightlife venues worldwide.

**Live:** [myglowpass.com](https://myglowpass.com)

## Tech Stack

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js v5
- **Email:** Resend (branded templates)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Features

### Three Portals

- **Creator** (`/member`) -- Apply for membership, browse events, RSVP, QR check-in, content submission, tier system
- **Venue** (`/venue`) -- Register venue, create events, accept/decline creators, QR scanner, content verification
- **Admin** (`/admin`) -- Review applications, manage venues/members/events, platform stats

### Platform Capabilities

- QR code check-in system
- Branded email templates via Resend
- 60+ countries with nightlife cities
- Event discovery map (Leaflet)
- Waitlist system with auto-promotion
- Image compression
- Gender-based event targeting

## Recent Updates

### v2.5.0 -- UI/UX Redesign (Web)

- Glassmorphism design with glass cards (depth 1-3)
- Gradient accents, ambient glow effects
- Animated stat cards, tier progress rings, capacity gauges
- Segmented controls, stagger animations
- Creator and Venue dashboard visual overhaul

### v2.6.0 -- Mobile App UI/UX Redesign + Gamification

- 15 new components (GlassCard, GradientButton, StatCard, XPBar, etc.)
- Gamification: XP tiers, streaks, 10 achievements, level-up celebrations
- 25 screens redesigned across all portals
- Expo SDK 54, EAS Build for Android APK

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
RESEND_API_KEY
ADMIN_PASSWORD
```

## Mobile App

The mobile app lives in the `mobile/` directory. See the Glow Pass monorepo for full mobile documentation.

## License

Private / Proprietary
