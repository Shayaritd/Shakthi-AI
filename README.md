# 🌟 SHAKTHI — Empowering Women Athletes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-Powered-1C3C3C)](https://www.langchain.com)

**SHAKTHI** (*Safety-first Mentorship and Scholarship Platform for Female Athletes*) is a production-grade digital ecosystem designed to connect, guide, and protect aspiring women athletes across India. The platform integrates a modern web application with a robust Python backend powered by **LangChain**, **Retrieval-Augmented Generation (RAG)**, and advanced **LLMs (Large Language Models)**, providing access to mentorship, sports-friendly colleges, scholarships, and safe, anonymous safety-reporting tools.

---

## 🏗️ System Architecture & Stack

SHAKTHI uses a split-architecture system: a responsive React Single Page Application (SPA) frontend that connects to both Supabase (for authentication and direct database synchronization) and a custom FastAPI Python service (for AI orchestration, LangChain processing, RAG lookup, and safety checks).

```mermaid
graph TD
    Client[React Frontend / Vite] -->|Auth & Realtime Data| Supabase[Supabase DB / Auth]
    Client -->|AI & Heavy Orchestration| FastAPI[FastAPI Backend]
    FastAPI -->|Async DB Connections| Supabase
    FastAPI -->|LangChain & RAG Pipeline| LangChainEngine[LangChain & RAG Engine]
    LangChainEngine -->|Grounded AI Prompting| LLMProviders[LLM Providers: Gemini / OpenAI / Groq]
    FastAPI -->|Caching / Task Queue| Redis[Redis Cache]

Advanced AI, RAG & LLM Tech Stack
RAG Engine (Retrieval-Augmented Generation): Custom pipeline that ingests official athletic documents, guidelines, safety materials, and scholarships. It parses PDFs, splits them into semantic chunks, generates embeddings, stores them in PostgreSQL (via vector search), and retrieves grounded context to eliminate hallucinations.

LangChain Integration: Utilizes LangChain's specialized text splitters (e.g., RecursiveCharacterTextSplitter) to chunk documents with dynamic constraints (800-character chunk sizes with 100-character overlap) for optimal context preservation during retrieval.

LLM Orchestration: Powered by a dynamic provider router (AIProviderRouter) that interfaces with:

Google Gemini API (using gemini-2.5-flash as primary)

OpenAI API (as high-performance fallback)

Groq API (for low-latency open-source model inference)

💻 Frontend Tech Stack
Framework: React 18 + Vite + TypeScript (structured with React Router v7)

Styling & UI: Tailwind CSS + shadcn/ui (Radix UI primitives) + Lucide Icons

Data Flow: TanStack Query (React Query v5) & React Context API

Client Database Integration: Supabase Client (@supabase/supabase-js)

🐍 Backend Service Stack
Framework: Python 3.11+ / FastAPI (fully asynchronous)

ORM & Database: SQLAlchemy 2.0 (asyncpg driver) + Alembic migrations

Data Validation: Pydantic v2

Caching & Jobs: Redis + Celery

Testing: Pytest (utilizing schema-isolated test setups)

Containerization: Docker & Docker Compose

🌟 Core AI & RAG Features
🔍 Grounded RAG Assistant (RAGOrchestrator)
The application implements an advanced RAG orchestration pipeline that intercepts user queries, retrieves corresponding context from indexed documents, and passes it to the active LLM:

Scholarship Discovery: Cross-references athlete profiles with scholarship rules, and calculates compatibility scores grounded in the source scholarship criteria.

College Profiling: Analyzes college rosters, admission rules, and facilities to evaluate how well a college matches an athlete's background.

Legal & Safety QA: Grounded answers explaining athlete rights under the POCSO Act and child protection policies using official documentation.

Verified Citations: Every AI response generated via the RAG orchestrator provides precise references and sources (e.g., page numbers, document titles) to ensure transparency and accountability.

🛡️ Guardrails & Content Moderation
AI Message Risk Analysis: LLM-powered safety moderation evaluations (message-risk) check direct chat logs to detect harassment, grooming, and protocol violations before storing messages.

Dynamic Provider Routing: Automatic failover between LLM providers (Gemini, OpenAI, Groq) ensures 100% uptime for AI chats and matching engines.

🌟 Other Key Features
👤 Role-Based Portals & Onboarding
Custom workspaces and multi-step onboarding flows for major stakeholder groups:

Athletes: Track performance goals, apply to mentors, explore sports-friendly universities, save scholarships, and communicate securely.

Mentors: Review and manage incoming mentorship requests, monitor trainee progress, and host communications.

Guardians: Monitor minor athlete activity, check scholarship applications, and ensure online safety.

Admins & Safety Officers: Monitor system health, manage user suspensions, verify mentors, and act on safety incident tickets.

Coaches & Sponsors: Provide athletic training structures and funding opportunities.

🛡️ Safety-First Center
Anonymous Incident Reporting: Secure mechanism to report harassment, toxic coaching, or safety breaches.

Encrypted Tracking: Users receive safety ticket numbers (SAF-XXXX) to track status privately.

Administrative Escalation: Automated routing of high-priority flags to designated Safety Officers.
Configuration & Environment Variables
Create a .env file in the root directory (for the Python backend) and a .env file in the project/ directory (for the React frontend).

Backend .env File Parameters
# Application Settings
APP_NAME=SHAKTHI
ENVIRONMENT=development
DEBUG=true
PORT=8000

# Database (Supabase pooler or local PostgreSQL)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>

# Caching & Background Jobs
REDIS_URL=redis://localhost:6379/0

# Security (JWT validation)
JWT_SECRET_KEY=your-secure-32-char-access-token-key
JWT_REFRESH_SECRET_KEY=your-secure-32-char-refresh-token-key

# AI, RAG & LLM Configurations
GEMINI_API_KEY=your-google-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
PRIMARY_AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
PGVECTOR_ENABLED=true
ENABLE_RAG=true
ENABLE_SEMANTIC_SEARCH=true

Frontend project/.env File Parameters
VITE_SUPABASE_URL=[https://your-supabase-project-id.supabase.co](https://your-supabase-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-public-key
VITE_API_URL=http://localhost:8000/api/v1

nstallation & Local Development
🐳 Option 1: Quick Start with Docker (Recommended)
This spins up PostgreSQL 16, Redis 7, and the FastAPI Python service automatically:

Start Services:

Bash
docker-compose up -d
Apply Database Migrations:

Bash
docker-compose exec backend alembic upgrade head
Seed Initial Database Content:

Bash
docker-compose exec backend python -m app.seed_data
The backend API will run at http://localhost:8000. Explore the interactive Swagger API documentation at http://localhost:8000/docs.

🐍 Option 2: Local Python Backend Setup
To run the FastAPI service directly on your host machine:

Initialize Virtual Environment:

Bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
Install Dependencies:

Bash
pip install -r requirements.txt
Execute Alembic Migrations:
Ensure your database is reachable via DATABASE_URL in your .env file, then run:

Bash
alembic upgrade head
Seed Development Users & Achievements:

Bash
python -m app.seed_data
Run the Uvicorn Server:

Bash
uvicorn app.main:app --reload --port 8000
💻 Option 3: Local React Frontend Setup
To run the user interface:

Navigate to the Frontend Directory:

Bash
cd project
Install Packages:

Bash
npm install
Launch the Development Server:

Bash
npm run dev
The frontend will be available at http://localhost:5173.

🛠️ Database Migrations (alembic)
We use Alembic to manage schemas and update the PostgreSQL database.

Generate a new migration script:

Bash
alembic revision --autogenerate -m "Add safety report fields"
Apply all pending migrations:

Bash
alembic upgrade head
Roll back the last migration:

Bash
alembic downgrade -1
View schema migration history:

Bash
alembic history
🧪 Testing Suite (pytest)
Testing is executed in an isolated schema database context (shakthi_test) to prevent pollution of production data.

Run all tests:

Bash
pytest
Execute with Code Coverage:

Bash
pytest --cov=app
Run a specific test file:

Bash
pytest tests/test_auth.py
