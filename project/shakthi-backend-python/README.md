# SHAKTHI Backend

Production-grade FastAPI backend for SHAKTHI - a safety-first mentorship and scholarship platform for female athletes in India.

## Tech Stack

- **Python 3.12**
- **FastAPI 0.110+**
- **SQLAlchemy 2.0 (async)**
- **PostgreSQL 16**
- **Alembic** (migrations)
- **Pydantic v2** (validation)
- **JWT Authentication**
- **Google Gemini API** (AI)
- **Redis** (caching)
- **Docker**

## Features

- 7 user roles: Athlete, Mentor, Guardian, Admin, Safety Officer, Coach, Sponsor
- 15 database tables
- 50+ API endpoints
- AI-powered matching (scholarships, mentors, colleges)
- Safety-first design with comprehensive reporting system
- JWT authentication with refresh tokens
- Role-based access control
- Rate limiting
- Message moderation

## Quick Start

### Prerequisites

- Python 3.12+
- PostgreSQL 16+
- Redis (optional for caching)
- Docker & Docker Compose (recommended)

### Option 1: Docker Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd shakthi-backend-python
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Run with Docker Compose:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
docker-compose exec backend alembic upgrade head
```

5. Seed initial data (optional):
```bash
docker-compose exec backend python -m app.seed_data
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Option 2: Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL:
```bash
# Create database
createdb shakthi_db
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Seed data (optional):
```bash
python -m app.seed_data
```

7. Run the server:
```bash
uvicorn app.main:app --reload
```

### Option 3: Deploy to Render/Railway

#### Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.12

4. Add environment variables in Render dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Redis connection string (optional)
   - `GEMINI_API_KEY` - Google Gemini API key
   - `JWT_SECRET_KEY` - Secret key for JWT (generate a secure random string)
   - `JWT_REFRESH_SECRET_KEY` - Secret key for refresh tokens
   - `CORS_ORIGINS` - Your frontend URL

5. Deploy!

#### Railway.app

1. Create a new project on Railway
2. Add PostgreSQL service
3. Add your GitHub repository
4. Set environment variables (same as Render)
5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | No |
| `JWT_SECRET_KEY` | Secret for access tokens | Yes |
| `JWT_REFRESH_SECRET_KEY` | Secret for refresh tokens | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | No* |
| `OPENAI_API_KEY` | OpenAI API key | No* |
| `GROQ_API_KEY` | Groq API key | No* |
| `CORS_ORIGINS` | Comma-separated frontend URLs | Yes |

*At least one AI provider key recommended

## API Endpoints

### Authentication `/api/v1/auth`
- `POST /signup` - Register user
- `POST /login` - Login
- `POST /refresh` - Refresh token
- `POST /logout` - Logout
- `GET /me` - Get current user

### Athletes `/api/v1/athletes`
- `GET /profile` - Get profile
- `POST /profile` - Create profile
- `PUT /profile` - Update profile
- `GET /dashboard` - Dashboard data
- `GET /mentors/recommended` - AI-recommended mentors

### Mentors `/api/v1/mentors`
- `GET /` - List mentors
- `GET /{id}` - Get mentor
- `POST /request` - Request mentorship
- `GET /requests/incoming` - Get requests

### Scholarships `/api/v1/scholarships`
- `GET /` - List scholarships
- `GET /{id}` - Get details
- `POST /{id}/save` - Save scholarship
- `GET /saved` - Get saved scholarships

### Safety `/api/v1/safety`
- `POST /reports` - Submit report
- `GET /reports` - Get reports
- `GET /reports/{ticket_id}` - Get by ticket

### AI `/api/v1/ai`
- `POST /chat` - AI chat assistant
- `POST /athlete-summary` - Profile summary
- `POST /scholarship-fit` - Scholarship matching
- `POST /mentor-match` - Mentor matching
- `POST /college-fit` - College matching
- `POST /message-risk` - Content moderation

### Admin `/api/v1/admin`
- `GET /dashboard` - Admin stats
- `GET /users` - List users
- `PUT /users/{id}/suspend` - Suspend user
- `GET /mentors/verification` - Pending verifications

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View history
alembic history
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## API Documentation

Once running, access:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Project Structure

```
shakthi-backend-python/
├── app/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── database.py       # SQLAlchemy setup
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── api/v1/           # API routes
│   ├── services/         # Business logic
│   ├── core/             # Security, dependencies
│   ├── utils/            # Helpers
│   └── ai/               # AI integration
├── alembic/              # Migrations
├── tests/                # Test files
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Test Accounts

After running seed data:

| Email | Password | Role |
|-------|----------|------|
| priya@email.com | password123 | Athlete |
| kavita@email.com | password123 | Athlete |
| sunil@email.com | password123 | Mentor |
| anjali@email.com | password123 | Mentor |
| admin@shakthi.app | admin123 | Admin |
| safety@shakthi.app | safety123 | Safety Officer |

## License

MIT License

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request
