# Getting Started - Quick Start Guide

## 🎉 What's Been Built

Congratulations! The foundation of the Athlete Pension platform is now complete. Here's what you have:

### ✅ Phase 1: Foundation Complete

#### Infrastructure
- ✅ **Docker Compose** setup with 6 services
- ✅ **PostgreSQL 15** database ready
- ✅ **Redis 7** for caching and sessions
- ✅ **Celery** worker and beat for background tasks

#### Backend (FastAPI + Python)
- ✅ FastAPI application with async support
- ✅ SQLAlchemy 2.0 with async database connections
- ✅ Configuration management with Pydantic
- ✅ Health check endpoints (basic, database, redis, full)
- ✅ API routing structure (v1)
- ✅ Placeholder auth and user endpoints
- ✅ CORS configuration
- ✅ Error handling
- ✅ Development and production setup

#### Frontend (React + TypeScript)
- ✅ React 18 with TypeScript
- ✅ Vite build tool for fast development
- ✅ Tailwind CSS for styling
- ✅ Responsive landing page
- ✅ Backend health check integration
- ✅ Modern UI components

#### Documentation
- ✅ [`ARCHITECTURE.md`](ARCHITECTURE.md:1) - Complete technical architecture (1,119 lines)
- ✅ [`ARCHITECTURE_DIAGRAMS.md`](ARCHITECTURE_DIAGRAMS.md:1) - 10 visual diagrams (571 lines)
- ✅ [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md:1) - 32-week development plan (541 lines)
- ✅ [`SETUP.md`](SETUP.md:1) - Comprehensive setup guide (362 lines)
- ✅ [`README.md`](README.md:1) - Project overview and introduction

---

## 🚀 Launch Your Application

### Step 1: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Change these values!
```

**Required changes in `.env`:**
```env
# Generate a secure key:
SECRET_KEY=$(openssl rand -hex 32)

# Add your AI API keys (get from providers):
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=your-key-here

# Set a secure database password:
POSTGRES_PASSWORD=your_secure_password_here
```

### Step 2: Start the Services

```bash
# Start all services in detached mode
docker-compose up -d

# Watch the logs
docker-compose logs -f
```

**Expected output:**
```
✓ Network athletepension_app-network    Created
✓ Container athletepension_postgres     Started
✓ Container athletepension_redis        Started
✓ Container athletepension_backend      Started
✓ Container athletepension_frontend     Started
✓ Container athletepension_celery       Started
✓ Container athletepension_celery_beat  Started
```

### Step 3: Verify Everything Works

**Check services status:**
```bash
docker-compose ps
```

All services should show "Up" status.

**Test the endpoints:**
```bash
# Backend health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/api/v1/health/db

# Full health check
curl http://localhost:8000/api/v1/health/full
```

**Visit the applications:**
- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend API:** http://localhost:8000
- 📚 **API Docs:** http://localhost:8000/api/docs
- 📖 **ReDoc:** http://localhost:8000/api/redoc

### Step 4: Explore the Application

Open http://localhost:5173 in your browser. You should see:

1. 🏆 **Athlete Pension** logo and title
2. ✅ **Backend Health Check** showing connection status
3. 💰 **Smart Planning** feature card
4. 📊 **Portfolio Management** feature card
5. 🤖 **AI Advisor** feature card
6. 🔘 **Get Started** button (placeholder)

If the health check shows green ✅, your backend is working!

---

## 📁 Project Structure

```
athletepension/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── v1/         # Version 1 API
│   │   │       └── endpoints/
│   │   │           ├── health.py   # ✅ Health checks
│   │   │           ├── auth.py     # 🔜 Authentication
│   │   │           └── users.py    # 🔜 User management
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   └── main.py         # FastAPI app
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── App.tsx         # Main component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Styles
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml      # Service orchestration
├── .env.example            # Environment template
└── [Documentation files]
```

---

## 🛠️ Development Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

### Backend Development
```bash
# Enter backend container
docker-compose exec backend bash

# Run tests (when implemented)
docker-compose exec backend pytest

# Format code
docker-compose exec backend black app/

# Check linting
docker-compose exec backend flake8 app/
```

### Frontend Development
```bash
# Enter frontend container
docker-compose exec frontend sh

# Run tests (when implemented)
docker-compose exec frontend npm test

# Build for production
docker-compose exec frontend npm run build
```

---

## 🎯 Next Steps - Phase 2: Authentication

Now that the foundation is complete, you're ready for Phase 2! Here's what to build next:

### Week 4-6: Authentication & User Management

1. **Database Models** (Week 4)
   - Create User model with SQLAlchemy
   - Create AthleteProfile model
   - Set up Alembic migrations
   - Create initial migration

2. **Authentication Backend** (Week 4-5)
   - JWT token generation/validation
   - Password hashing with bcrypt
   - Registration endpoint with email validation
   - Login endpoint with rate limiting
   - Refresh token mechanism
   - Password reset flow

3. **Authentication Frontend** (Week 5-6)
   - Registration form with validation
   - Login page
   - Token storage in memory/cookie
   - Protected route wrapper
   - Auth state management (Zustand)
   - Logout functionality

### Quick Start Commands for Phase 2

```bash
# Create database models
touch backend/app/models/user.py
touch backend/app/models/athlete_profile.py

# Set up Alembic
docker-compose exec backend alembic init alembic

# Create schemas
touch backend/app/schemas/user.py
touch backend/app/schemas/auth.py

# Create authentication utilities
touch backend/app/utils/security.py
touch backend/app/utils/jwt.py
```

---

## 📚 Key Documentation

| Document | Purpose | Lines |
|----------|---------|-------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md:1) | Complete system design, database schema, API structure | 1,119 |
| [`ARCHITECTURE_DIAGRAMS.md`](ARCHITECTURE_DIAGRAMS.md:1) | Visual diagrams (Mermaid) | 571 |
| [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md:1) | 14 phases, 32 weeks, detailed tasks | 541 |
| [`SETUP.md`](SETUP.md:1) | Setup guide, troubleshooting | 362 |
| [`README.md`](README.md:1) | Project overview, stack summary | 508 |

---

## 🔍 Verify Your Setup

Run this checklist to ensure everything is working:

- [ ] All Docker containers are running (`docker-compose ps`)
- [ ] Backend health check responds at http://localhost:8000/health
- [ ] Database health check passes at http://localhost:8000/api/v1/health/db
- [ ] Redis health check passes at http://localhost:8000/api/v1/health/redis
- [ ] Frontend loads at http://localhost:5173
- [ ] Frontend shows backend as healthy (green ✅)
- [ ] API documentation accessible at http://localhost:8000/api/docs
- [ ] No errors in logs (`docker-compose logs`)

---

## 💡 Pro Tips

### Development Workflow
1. Make code changes in your editor
2. Changes auto-reload in containers (hot reload enabled)
3. Check logs: `docker-compose logs -f backend frontend`
4. Test endpoints with API docs or `curl`

### Debugging
```bash
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend

# Enter a container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check container resource usage
docker stats

# Inspect a container
docker-compose exec backend env  # View environment variables
```

### API Testing
```bash
# Using curl
curl -X GET http://localhost:8000/api/v1/health/full

# Using httpie (if installed)
http http://localhost:8000/health

# Or use the interactive API docs at:
# http://localhost:8000/api/docs
```

---

## ❓ Troubleshooting

### "Port already in use"
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in docker-compose.yml
```

### "Cannot connect to database"
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Reset database (WARNING: Deletes all data)
docker-compose down -v postgres
docker-compose up -d postgres
```

### "Module not found" errors
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend not showing backend status
1. Check backend is running: `curl http://localhost:8000/health`
2. Check browser console for errors (F12)
3. Verify CORS settings in `backend/app/config.py`
4. Check `VITE_API_URL` in frontend `.env`

---

## 🎓 Learning Resources

### FastAPI
- Official docs: https://fastapi.tiangolo.com/
- Async SQLAlchemy: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Pydantic: https://docs.pydantic.dev/

### React + TypeScript
- React docs: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs

### DevOps
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/documentation

---

## 🚀 Ready to Build Phase 2?

The foundation is solid. Now you can:

1. **Start building authentication** - Follow Phase 2 in the roadmap
2. **Customize the UI** - Modify the frontend components
3. **Add new endpoints** - Extend the API structure
4. **Set up CI/CD** - Implement automated testing and deployment

**Your tech stack is production-ready:**
- ✅ FastAPI for high-performance async APIs
- ✅ React + TypeScript for type-safe frontend
- ✅ PostgreSQL for reliable data storage
- ✅ Redis for caching and sessions
- ✅ Docker for consistent environments
- ✅ Celery for background tasks

---

## 📞 Need Help?

- Review [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for detailed technical specs
- Check [`SETUP.md`](SETUP.md:1) for troubleshooting
- Follow [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md:1) for next steps
- Examine the code comments for implementation details

---

**🎉 Congratulations! You're ready to build an AI-powered investment platform for athletes!**

*Built with ❤️ using FastAPI + React + PostgreSQL + Docker*