SHAKTHI – AI Powered Women Athlete Mentorship Platform
Tech Stack
Frontend: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, React Router v7, TanStack Query
Backend: FastAPI, Python, SQLAlchemy 2.0, AsyncPG, Alembic
Database: PostgreSQL, Supabase, pgvector
Authentication: JWT, RBAC, Supabase Authentication
AI/LLM: Google Gemini, OpenAI, Groq, LangChain
RAG: Semantic Search, Vector Embeddings, Document Chunking, Context Retrieval
Caching & Background Jobs: Redis, Celery
Deployment: Docker, Docker Compose
Project Description

Developed a production-grade AI platform that empowers women athletes by providing mentorship, scholarship recommendations, sports-friendly college discovery, legal guidance, and anonymous safety reporting using Large Language Models and Retrieval-Augmented Generation (RAG).

Key Features
AI Features
AI Mentorship Assistant
Scholarship Recommendation System
Sports College Recommendation
Legal & Safety Question Answering
AI Chat Assistant
Context-Aware Responses
Verified Source Citations
AI Provider Failover
AI Message Risk Detection
RAG Pipeline
PDF Processing
Document Parsing
RecursiveCharacterTextSplitter
Semantic Chunking
Embedding Generation
pgvector Storage
Semantic Search
Similarity Search
Context Retrieval
Prompt Engineering
Hallucination Reduction
Authentication & Security
JWT Authentication
Refresh Tokens
Role-Based Access Control (RBAC)
Protected Routes
Password Hashing
Secure REST APIs
Platform Modules
Athlete Dashboard
Mentor Dashboard
Guardian Dashboard
Coach Dashboard
Sponsor Dashboard
Admin Dashboard
Safety Officer Dashboard
Anonymous Safety Reporting
Backend Engineering

Implemented a fully asynchronous FastAPI backend featuring

REST APIs
Dependency Injection
Pydantic Validation
SQLAlchemy ORM
Async PostgreSQL Operations
Alembic Database Migrations
Background Tasks with Celery
Redis Caching
Modular Service Architecture
AI Architecture

Implemented an enterprise-grade Retrieval-Augmented Generation pipeline:

User Query
      │
      ▼
FastAPI API
      │
      ▼
AI Provider Router
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Gemini OpenAI      Groq
      │
      ▼
Prompt Engineering
      │
      ▼
Context Retrieval
      │
      ▼
Semantic Search
      │
      ▼
pgvector Database
      │
      ▼
Vector Embeddings
      │
      ▼
Document Chunking
      │
      ▼
Knowledge Base
Technologies Used
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
Axios
React Hook Form
Zod
Shadcn/UI
Backend
Python
FastAPI
SQLAlchemy
AsyncPG
Alembic
Uvicorn
Pydantic
Database
PostgreSQL
Supabase
pgvector
Artificial Intelligence
Google Gemini
OpenAI
Groq
LangChain
Retrieval-Augmented Generation (RAG)
Prompt Engineering
Semantic Search
Vector Search
AI Guardrails
AI Moderation
AI Risk Analysis
DevOps
Docker
Docker Compose
Git
GitHub
Software Engineering Concepts Demonstrated
REST API Development
Clean Architecture
Layered Backend Design
Dependency Injection
Authentication & Authorization
RBAC
Vector Databases
Semantic Search
Retrieval-Augmented Generation
LLM Integration
AI Provider Routing
Background Job Processing
Caching
Database Migration
Secure API Design
Asynchronous Programming
ORM Design
Production Deployment
Resume / CRT One-Line Description

SHAKTHI – AI-powered mentorship platform for women athletes built using React, FastAPI, PostgreSQL, Supabase, LangChain, RAG, and LLMs (Gemini/OpenAI/Groq), featuring scholarship recommendations, semantic search, AI chat, anonymous safety reporting, JWT authentication, and role-based dashboards.

This format is much better suited for campus placements (CRT), resume discussions, HR interviews, and technical interviews because it highlights the technologies, architecture, and engineering concepts recruiters typically ask about, while omitting setup instructions and configuration details.
