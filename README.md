<div align="center">

# 🏆 SHAKTHI AI

### Empowering Women Athletes with AI, Mentorship & Safety

An enterprise-grade AI-powered platform that connects female athletes with mentors, scholarships, sports-friendly colleges, and AI-driven safety assistance.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript">
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase">
  <img src="https://img.shields.io/badge/Google-Gemini-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker">
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge">
</p>

</div>

---

## 🌟 Overview

SHAKTHI is an AI-powered digital ecosystem designed to support women athletes throughout their sporting journey. The platform provides personalized mentorship, scholarship discovery, sports-friendly college recommendations, and a secure AI-assisted safety center.

Built with **React**, **FastAPI**, **Supabase**, **PostgreSQL**, and **Google Gemini**, SHAKTHI combines modern web technologies with **Retrieval-Augmented Generation (RAG)** to deliver intelligent, context-aware assistance.

---

## ✨ Key Features

- 🤖 AI-powered scholarship recommendations
- 🎓 Sports college recommendation engine
- 👩‍🏫 Mentor–Athlete matching platform
- 🛡️ Anonymous safety & incident reporting
- 📚 RAG-powered knowledge assistant
- 🔐 Secure JWT authentication
- 👥 Multi-role dashboards (Athlete, Mentor, Guardian, Admin)
- 📈 Real-time analytics & progress tracking
- 🚀 Scalable microservice-ready architecture

---

## 🏗️ Architecture

```
                    React + TypeScript
                           │
                           ▼
                    FastAPI Backend
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   Google Gemini       OpenAI            Groq AI
        │
        ▼
   RAG Orchestrator
        │
        ▼
 PostgreSQL + Supabase + Redis
```

---

## 💻 Tech Stack

| Frontend | Backend | AI | Database | DevOps |
|----------|----------|----|-----------|---------|
| React 18 | FastAPI | Gemini | PostgreSQL | Docker |
| TypeScript | SQLAlchemy | OpenAI | Supabase | Docker Compose |
| Tailwind CSS | Pydantic | Groq | Redis | Celery |

---

## 📂 Project Structure

```text
SHAKTHI/
├── app/                 # FastAPI Backend
├── project/             # React Frontend
├── alembic/             # Database Migrations
├── tests/               # Backend Tests
├── docs/                # Screenshots & Architecture
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/shakthi.git

cd shakthi

docker-compose up --build
```

Visit

```
Frontend
http://localhost:5173

Backend
http://localhost:8000

Swagger Docs
http://localhost:8000/docs
```

---

## 🎯 Future Roadmap

- Voice Assistant
- Mobile Application
- Regional Language Support
- AI Career Guidance
- Sports Analytics Dashboard
- Event Registration
- Wearable Device Integration

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are always welcome.

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## 📜 License

This project is licensed under the MIT License.
