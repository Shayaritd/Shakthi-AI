# SHAKTHI - Empowering Women Athletes

SHAKTHI (Empowering Women Athletes) is a comprehensive, web-based platform designed to support, guide, and connect aspiring women athletes with mentorship, scholarships, academic opportunities, specialized training resources, and safe reporting tools.

---

## 🌟 Key Features

### 👤 Role-Based Portals & Onboarding
Tailored dashboards and customized onboarding flows for four primary user groups:
*   **Athletes:** Track goals, apply to mentorships, find colleges/scholarships, access training resources, and chat with mentors.
*   **Mentors:** Manage mentorship requests, guide matched athletes, share resources, and provide feedback.
*   **Guardians:** Track the athlete's progress, review scholarship details, and ensure a safe digital environment.
*   **Admins:** Oversee safety reports, manage users, and moderate the platform.

### 🤝 Mentorship & Support
*   **Mentor Matching:** Advanced search and discovery for female coaches, senior athletes, and domain mentors.
*   **Real-time Chat:** Seamless communication channel between matched athletes and mentors.

### 🎓 Academic & Financial Assistance
*   **Scholarship Directory:** Integrated live scholarship search, saved trackers, and detailed eligibility details.
*   **College Comparison & Profiles:** Search sports-friendly colleges, compare academic vs. sports facilities, and discover college rosters.

### 🏋️ Training & Safety
*   **Training Resource Center:** Curated training guides, workout resources, video guides, and health/wellness tips.
*   **Safety Center:** Anonymous, secure mechanism for reporting harassment, issues, or unsafe conditions, accompanied by a report tracking dashboard for users and admins.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Routing:** [React Router v7](https://reactrouter.com/)
*   **Data Fetching & State:** [TanStack Query v5](https://tanstack.com/query/latest) & React Context API
*   **Backend & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL database, Row-Level Security (RLS), User Auth)

---

## 📂 Project Directory Structure

```text
SHAKTHI-AI/
├── project/
│   ├── .bolt/                  # Bolt configuration
│   ├── .env                    # Environment variables configuration (Supabase URL, Anon Key)
│   ├── components.json         # shadcn/ui component mapping configuration
│   ├── eslint.config.js        # ESLint coding style configuration
│   ├── index.html              # Entry HTML file
│   ├── package.json            # Node project configuration and dependencies
│   ├── postcss.config.js       # PostCSS plugins setup (Tailwind, Autoprefixer)
│   ├── src/                    # React source application files
│   │   ├── App.css             # Base application stylesheet
│   │   ├── App.tsx             # Main routing and router definition
│   │   ├── index.css           # Global stylesheet & Tailwind setup
│   │   ├── main.tsx            # Application mounting & root rendering
│   │   ├── components/         # Common layout & reusable UI components
│   │   │   ├── Layout.tsx      # Sidebar, navbar, and shell structure
│   │   │   ├── ProtectedRoute.tsx # Route authentication guard
│   │   │   └── ui/             # Radix & shadcn primitives (Button, Card, Dialog, etc.)
│   │   ├── constants/          # Application constants & static config variables
│   │   ├── contexts/           # Authentication state context (AuthContext.tsx)
│   │   ├── hooks/              # Reusable React custom hooks
│   │   ├── lib/                # Library utility files (supabaseClient.ts, utils.ts)
│   │   ├── pages/              # Application pages, grouped by domain
│   │   │   ├── auth/           # User Sign-In and Registration pages
│   │   │   ├── onboarding/     # Customized onboarding multi-step forms
│   │   │   ├── athlete/        # Athlete profile & dashboard pages
│   │   │   ├── mentor/         # Mentor profile & dashboard pages
│   │   │   ├── guardian/       # Guardian dashboard pages
│   │   │   ├── admin/          # Admin safety portal & metrics pages
│   │   │   ├── safety/         # Incident reporting forms & report tracking
│   │   │   └── chat/           # Chat interface components
│   │   ├── services/           # Data fetching and API connection layer (api.ts)
│   │   └── types/              # TypeScript global interface definitions
│   ├── supabase/               # Backend Supabase config
│   │   ├── functions/          # Supabase Edge Functions (e.g. scrapers)
│   │   └── migrations/         # PostgreSQL schema files and seed data
│   ├── tailwind.config.js      # Tailwind theme configuration
│   ├── tsconfig.json           # Root TypeScript configuration
│   └── vite.config.ts          # Vite build environment configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (v9.0.0 or higher recommended)
*   A running [Supabase](https://supabase.com/) project

### ⚙️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/SHAKTHI-AI.git
    cd SHAKTHI-AI/project
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables Setup:**
    Create or edit the `.env` file in the root of the `project` directory:
    ```env
    VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
    ```

4.  **Database Migration (Supabase CLI):**
    If setting up a new Supabase backend, apply the migrations in order:
    ```bash
    # Push migrations to your linked Supabase project
    supabase db push
    ```
    *Alternatively, you can copy the contents of `supabase/migrations` and execute them directly in the SQL Editor of your Supabase Console.*

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173/](http://localhost:5173/) in your browser to view the application.

---

## 🛠️ Build and Deploy

To build the project for production, run:
```bash
npm run build
```
This outputs a production-ready build to the `dist/` directory.

To preview the built site locally:
```bash
npm run preview
```
