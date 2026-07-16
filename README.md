# 🏃‍♀️ SHAKTHI.AI — Empowering Women Athletes with AI

> **AI-Powered Mentorship Platform for Rural Women Athletes in India**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green?logo=supabase)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [What is SHAKTHI.AI?](#-what-is-shakthiai)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Quick Start](#-quick-start)
- [Test Credentials](#-test-credentials)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [Project Impact](#-project-impact)
- [What I Learned](#-what-i-learned)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 What is SHAKTHI.AI?

**SHAKTHI** (Sanskrit for "Strength") is a full-stack AI-powered platform that bridges the gap between rural women athletes and opportunities. It connects athletes with verified mentors, provides AI-driven scholarship recommendations, offers sports college discovery, and ensures safety through guardian monitoring.

> **🚀 Live Demo:** Coming Soon
> **📂 GitHub:** https://github.com/Shayaritd/SHAKTHI-AI

### The Problem We're Solving

Rural women athletes in India face significant challenges:
- ❌ Limited access to professional mentors and coaches
- ❌ No awareness of scholarships and funding opportunities
- ❌ Lack of guidance for sports college admissions
- ❌ Safety concerns with online mentorship platforms
- ❌ No guardian monitoring for minor athletes

### Our Solution

SHAKTHI.AI provides:
- ✅ AI-powered mentorship matching with verified coaches
- ✅ Scholarship recommendations using semantic search
- ✅ Sports quota college discovery and comparison
- ✅ Guardian approval workflow for athletes under 18
- ✅ Real-time chat with safety monitoring
- ✅ Anonymous safety reporting system

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Mentorship Assistant** | RAG-powered chatbot with Gemini/OpenAI/Groq integration |
| 🏅 **Scholarship Discovery** | AI-driven recommendations with semantic search |
| 🏛️ **College Finder** | Sports quota colleges with comparison tools |
| 👨‍🏫 **Mentor Matching** | Verified mentors with expertise across 8+ sports |
| 🛡️ **Guardian Approval** | Safety-first workflow for athletes under 18 |
| 💬 **Real-time Chat** | Secure messaging with guardian monitoring |
| 📢 **Opportunities** | Tournaments, trials, camps, and schemes |
| 📚 **Training Resources** | Guides, videos, and exercise plans |
| 🔒 **Safety Reporting** | Anonymous reporting with ticket tracking |
| 👑 **Role-based Dashboards** | Athlete, Mentor, Guardian, Admin, Sponsor views |

---

## 🛠️ Tech Stack

### Frontend
React 18 | TypeScript | Vite | Tailwind CSS | React Router | TanStack Query | Axios | Shadcn/UI

text

### Backend
FastAPI | Python 3.11 | SQLAlchemy 2.0 | AsyncPG | Alembic | Uvicorn | Pydantic

text

### Database
PostgreSQL | Supabase | pgvector (Vector Search)

text

### AI & LLM
Google Gemini | OpenAI | Groq | LangChain | RAG (Retrieval-Augmented Generation) | Semantic Search | Prompt Engineering

text

### DevOps
Docker | Docker Compose | Git | GitHub | Vercel (Frontend) | Render (Backend)

text

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATION (React)                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Athlete │ Mentor │ Guardian │ Coach │ Sponsor │ Admin │ Safety Officer       │
│                                                                              │
│ • Dashboard    • AI Chat    • Scholarships    • Colleges                    │
│ • Safety Reporting    • Notifications    • Profile Management               │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                          HTTPS / REST APIs
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI BACKEND (API Layer)                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Authentication (JWT) │ RBAC │ Request Validation │ Rate Limiting            │
│ REST APIs │ Dependency Injection │ Business Logic │ Background Tasks         │
└───────────────┬──────────────────────┬─────────────────────────┬─────────────┘
                │                      │                         │
                ▼                      ▼                         ▼
      PostgreSQL Services        AI/RAG Service          Redis + Celery
                │                      │                  Cache & Background Jobs
                │                      │
                ▼                      ▼
┌──────────────────────────┐   ┌──────────────────────────────────────────────┐
│ PostgreSQL / Supabase    │   │             AI Provider Router               │
├──────────────────────────┤   ├──────────────────────────────────────────────┤
│ Users                    │   │ Google Gemini                               │
│ Athletes                 │   │ OpenAI                                      │
│ Mentors                  │   │ Groq                                        │
│ Scholarships             │   │ Automatic Provider Failover                 │
│ Colleges                 │   └──────────────────────┬───────────────────────┘
│ Chat History             │                          │
│ Safety Reports           │                          ▼
│ Documents                │              Prompt Engineering
│ Vector Embeddings        │                          │
└──────────────────────────┘                          ▼
                                           Retrieval-Augmented Generation
                                                      │
                                                      ▼
                                         Semantic Search (pgvector)
                                                      │
                                                      ▼
                                           Relevant Document Chunks
                                                      │
                                                      ▼
                                              AI Generated Response
                                                      │
                                                      ▼
                                               Returned to Frontend
```
### RAG Pipeline Flow
User Query
│
▼
Convert to Embedding
│
▼
Search Vector Database (pgvector)
│
▼
Retrieve Relevant Documents
│
▼
Prompt Engineering + Context
│
▼
LLM Generation (Gemini/OpenAI/Groq)
│
▼
Grounded Response with Citations

text

---

## 📊 Database Schema
📁 SHAKTHI Database (20+ Tables with RLS Policies)
│
├── 👤 profiles - User profiles with role-based access
├── 🏃 athlete_profiles - Sports, level, guardian details
├── 👨‍🏫 mentor_profiles - Expertise, experience, certifications
├── 💰 scholarships - Scholarship opportunities
├── 🏛️ colleges - Sports quota colleges
├── 📢 opportunities - Tournaments, trials, camps
├── 🤝 mentorship_requests - Mentor-athlete connection requests
├── 💬 chat_threads - Secure conversation threads
├── 📨 chat_messages - Real-time messages
├── 🛡️ safety_reports - Anonymous incident reporting
├── 🔔 notifications - Real-time notifications
├── 📚 training_resources - Educational content
├── ⭐ mentor_reviews - Mentor ratings and feedback
├── 📄 live_scholarship_cache - Live scholarship search
├── 🏫 saved_live_colleges - Saved colleges
├── 💾 saved_live_scholarships - Saved scholarships
├── 🤖 ai_match_recommendations - AI recommendations
└── 📖 success_stories - Athlete success stories

text

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+  |  Python 3.11+  |  Docker (optional)  |  Supabase Account
Installation
bash
# 1. Clone the repository
git clone https://github.com/Shayaritd/SHAKTHI-AI.git
cd SHAKTHI-AI

# 2. Frontend Setup
cd project
npm install
cp .env.example .env  # Add your Supabase credentials
npm run dev

# 3. Backend Setup (New Terminal)
cd ../app
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# 4. Open in Browser
# Frontend: http://localhost:5173
# Backend: http://localhost:8001
Environment Variables
env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Services
GOOGLE_GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key (optional)

# Backend
VITE_API_URL=http://localhost:8001
🔑 Test Credentials
All demo accounts use the following credentials:

Role	Email	Password
Athlete (Minor)	sneha.reddy@shakthi.org	Athlete@123
Athlete (Minor)	anjali.singh@shakthi.org	Athlete@123
Athlete (Adult)	kavita.patel@shakthi.org	Athlete@123
Mentor	meera.iyer@shakthi.org	Mentor@123
Mentor	vikram.patel@shakthi.org	Mentor@123
Guardian	prakash.reddy@shakthi.org	Guardian@123
Guardian	vikram.singh@shakthi.org	Guardian@123
Admin	admin@shakthi.org	Admin@123
Sponsor	ravi.kumar@shakthi.org	Sponsor@123
Quick Login (Password: password123)
Role	Email
Athlete	athlete@shakthi.org
Mentor	mentor@shakthi.org
Guardian	guardian@shakthi.org
🎯 Key Features Deep Dive
🤖 AI-Powered RAG Pipeline
text
User Query → Embedding Generation → Vector Search (pgvector)
→ Context Retrieval → LLM Generation (Gemini/OpenAI/Groq)
→ Grounded Response with Citations
Why RAG? Ensures AI responses are grounded in verified documents, preventing hallucinations and providing source citations. All answers include document references.

🛡️ Guardian Approval Workflow
text
┌─────────────────────────────────────────────────────────────────┐
│                    MINOR ATHLETE FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Athlete (Under 18) Requests Mentor                         │
│     ↓                                                          │
│  2. Guardian Receives Notification                             │
│     ↓                                                          │
│  3. Guardian Approves/Rejects                                  │
│     ↓                                                          │
│  4. Mentor Reviews Request                                     │
│     ↓                                                          │
│  5. Mentor Approves/Rejects                                    │
│     ↓                                                          │
│  6. Chat Thread Auto-Created                                   │
│     ↓                                                          │
│  7. Athlete & Mentor Chat                                      │
│     ↓                                                          │
│  8. Guardian Monitors (Read-Only)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
💬 Real-Time Chat with Safety
Feature	Description
Athlete → Mentor	Secure messaging with read receipts
Guardian	Read-only monitoring for minors
Safety	Auto-flag inappropriate content
Reporting	Anonymous reporting with ticket system
🏅 Scholarship Recommendation System
text
Athlete Profile → Sport, Level, State
       ↓
Semantic Search → Scholarship Database
       ↓
AI Matching → Top 5 Recommended Scholarships
       ↓
Display → Eligibility, Amount, Deadline
📈 Project Impact
Metric	Value
Total Users	20+ (Athletes, Mentors, Guardians, Sponsors, Admin)
Mentors	8 across 6+ sports
Athletes	5 (3 minors, 2 adults)
Sports Covered	Athletics, Badminton, Kabaddi, Cricket, Wrestling, Boxing, Swimming, Football, Yoga
Scholarships	8+ Opportunities
Colleges	10+ with Sports Quotas
Training Resources	15+ Guides & Videos
Database Tables	20+ with RLS Policies
API Endpoints	50+ REST APIs
🏆 What I Learned
text
✅ Building production-grade RAG pipelines with pgvector
✅ Integrating multiple LLM providers with automatic failover
✅ Designing secure role-based access control (RLS)
✅ Implementing real-time chat with guardian monitoring
✅ Managing complex database relationships (20+ tables)
✅ Creating responsive React applications with TypeScript
✅ Deploying full-stack applications with Docker
✅ Implementing JWT authentication and authorization
✅ Building real-time notifications with Supabase Realtime
✅ Designing safe guardian approval workflows for minors
✅ Implementing anonymous safety reporting systems
✅ Optimizing PostgreSQL queries with proper indexing
✅ Creating semantic search with vector embeddings
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📧 Contact
Shayari Gowda
Email: shayarigowda67@gmail.com
GitHub: https://github.com/Shayaritd
LinkedIn: https://linkedin.com/in/shayari-gowda

Project Link: https://github.com/Shayaritd/SHAKTHI-AI

🙏 Acknowledgments
Supabase for the amazing database platform

Google Gemini for AI capabilities

Open-source community for inspiration

All testers and contributors

⭐ Show Your Support
If you found this project helpful, please give it a star ⭐

Made with ❤️ for empowering women athletes in India

🚀 Quick Links
Link	Purpose
GitHub	Source Code
[Live Demo]	Coming Soon
Issues	Report Bugs
Discussions	Community
Built with ❤️ for empowering women athletes in India

text

---

## 📋 What This README Includes

| Section | Purpose |
|---------|---------|
| ✅ Badges | Shows tech stack at a glance |
| ✅ Description | Clear project purpose |
| ✅ Features | Complete feature list |
| ✅ Tech Stack | All technologies used |
| ✅ Architecture | Visual system design |
| ✅ Database Schema | 20+ tables listed |
| ✅ Quick Start | Setup instructions |
| ✅ Test Credentials | Ready-to-use accounts |
| ✅ Deep Dive | Key features explained |
| ✅ Impact | Project metrics |
| ✅ Learnings | Skills demonstrated |
| ✅ Contributing | How to contribute |

---
