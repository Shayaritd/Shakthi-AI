# SHAKTHI — Empowering India's Rural Girl Athletes

SHAKTHI is a mobile-first web platform designed to break systemic barriers for rural girl athletes across India. It digitises safety, visibility, mentorship, and scholarship access — creating a trusted ecosystem that connects athletes with the national scouting network.

---

## Overview

| Area | Detail |
|---|---|
| **Frontend** | React 18 + TypeScript, Vite |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **AI** | Google Gemini API (via `src/services/gemini.ts`) |
| **Backend** | Supabase (database, auth, edge functions) |

---

## Features

### For Athletes
- **Athlete Profile** — Verified, discoverable profiles presented to the global scouting network
- **Dashboard** — Personalised feed of opportunities, notifications, and progress tracking
- **Scholarship Portal** — AI-matched grants and scholarships from central and state governments
- **Mentorship** — Connect with retired international athletes who understand your journey
- **Safety Shield** — 24/7 anonymous reporting with background-checked support contacts
- **AI Assistant** — Gemini-powered chat to answer questions about scholarships, eligibility, and more

### Platform Safety
- **E-KYC Verification** — Every coach, mentor, and parent undergoes Aadhaar + background checks
- **Secure Communication** — End-to-end monitored messaging prevents unauthorized external contact
- **Direct Grant Transfer** — Scholarship funds disbursed directly to athlete bank accounts — no middlemen

---

## Screens

| Screen | Description |
|---|---|
| `LandingScreen` | Public homepage with hero, stats, features, and CTA |
| `LoginScreen` | Email + password login with role selection |
| `RegisterScreen` | Multi-step athlete onboarding |
| `DashboardScreen` | Personalised home feed after login |
| `MentorsScreen` | Browse and connect with verified mentors |
| `GrantsScreen` | AI-matched scholarships and grant listings |
| `SafetyScreen` | Anonymous safety reporting and emergency contacts |
| `ProfileScreen` | Athlete profile management and settings |
| `AiChat` | Full-screen Gemini AI assistant overlay |

---

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── AiChat.tsx
│   ├── BottomNav.tsx
│   ├── MentorCard.tsx
│   ├── ScholarshipCard.tsx
│   ├── ShakthiLogo.tsx
│   └── TopBar.tsx
├── data/
│   └── mockData.ts    # Static mock data for mentors, scholarships, etc.
├── screens/           # One file per app screen
├── services/
│   └── gemini.ts      # Gemini AI API integration
├── types/
│   └── index.ts       # Shared TypeScript types
├── App.tsx            # Root component with navigation state
├── index.css          # Global styles and Tailwind directives
└── main.tsx           # App entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

The dev server starts automatically in this environment. To run locally:

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

---

## Environment Variables

Create a `.env` file at the project root with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Key Data Types

```typescript
type Role = 'ATHLETE' | 'MENTOR' | 'GUARDIAN' | 'COACH' | 'SPONSOR' | 'ADMIN';

interface User {
  id: string;
  name: string;
  role: Role;
  sport: string;
  state: string;
  level: string;
  profileComplete: number;
  avatar?: string;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  matchScore: number;
  status: 'open' | 'closing_soon' | 'closed';
}

interface Mentor {
  id: string;
  name: string;
  specialty: string;
  sport: string;
  rating: number;
  verified: boolean;
  matchScore?: number;
}
```

---

## Design System

- **Primary color:** `#1a7a6e` (teal-green)
- **Accent / gold:** `#c9a227` (used for primary CTAs)
- **Font:** Poppins (headings), system sans-serif (body)
- **Spacing:** 8px grid via Tailwind
- **Mobile-first:** Optimised for 375–430px viewport; responsive up to desktop

---

## Stats

| Metric | Value |
|---|---|
| Verified Athletes | 5,000+ |
| State Coverage | 12 States |
| National Scholarships | 100+ |
| Verified Mentors | 300+ |

---

## License

© 2024 SHAKTHI Sports Initiative. All Rights Reserved.
