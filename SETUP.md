# Setup Guide - Athlete Pension Platform

This guide will help you get the Athlete Pension platform up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** for version control
- **Python 3.11+** (if running backend locally without Docker)
- **Node.js 18+** and **npm** (if running frontend locally without Docker)

## Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd athletepension
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# Backend
SECRET_KEY=your_secret_key_here_generate_with_openssl_rand_hex_32
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Frontend
VITE_API_URL=http://localhost:8000
```

**Important:** Generate a secure `SECRET_KEY`:
```bash
openssl rand -hex 32
```

### 3. Start the Services

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- FastAPI Backend (port 8000)
- React Frontend (port 5173)
- Celery Worker
- Celery Beat

### 4. Verify Installation

Check if all services are running:

```bash
docker-compose ps
```

You should see all services with status "Up".

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/api/docs
- **Health Check:** http://localhost:8000/health

### 6. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Manual Setup (Without Docker)

### Backend Setup

1. **Create Virtual Environment:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies:**

```bash
pip install -r requirements.txt
```

3. **Set Up PostgreSQL:**

```bash
# Create database
createdb athletepension

# Or using psql
psql -U postgres
CREATE DATABASE athletepension;
\q
```

4. **Set Environment Variables:**

```bash
export DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/athletepension"
export REDIS_URL="redis://localhost:6379"
export SECRET_KEY="your_secret_key_here"
export OPENAI_API_KEY="your_key_here"
```

5. **Run Database Migrations (Future):**

```bash
alembic upgrade head
```

6. **Start the Backend:**

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. **Install Dependencies:**

```bash
cd frontend
npm install
```

2. **Create Environment File:**

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

3. **Start the Development Server:**

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Redis Setup (if not using Docker)

**On macOS:**
```bash
brew install redis
brew services start redis
```

**On Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**On Windows:**
Download from https://redis.io/download or use WSL

## Development Workflow

### Running Tests

**Backend Tests:**
```bash
cd backend
pytest
pytest --cov=app  # With coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
npm run test:coverage
```

### Code Formatting

**Backend:**
```bash
cd backend
black app/
isort app/
flake8 app/
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Database Migrations

**Create a New Migration:**
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

**Apply Migrations:**
```bash
alembic upgrade head
```

**Rollback Migration:**
```bash
alembic downgrade -1
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change the port in docker-compose.yml
```

### Database Connection Issues

```bash
# Reset PostgreSQL container
docker-compose down -v postgres
docker-compose up -d postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check CORS settings in `backend/app/config.py`
3. Ensure `VITE_API_URL` in frontend `.env` is correct

### Docker Build Fails

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Module Not Found Errors

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Stopping the Application

### With Docker:
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

### Manual:
```bash
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
# Stop Redis
brew services stop redis  # macOS
sudo systemctl stop redis  # Linux
```

## Next Steps

1. **Review Architecture:** Read [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for detailed system design
2. **Check Roadmap:** See [`IMPLEMENTATION_ROADMAP.md`](IMPLEMENTATION_ROADMAP.md:1) for development phases
3. **Explore API:** Visit http://localhost:8000/api/docs for interactive API documentation
4. **Start Development:** Begin with Phase 2 - Authentication & User Management

## Environment Variables Reference

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| REDIS_URL | Yes | - | Redis connection string |
| SECRET_KEY | Yes | - | JWT secret key |
| OPENAI_API_KEY | No | - | OpenAI API key for AI features |
| ANTHROPIC_API_KEY | No | - | Anthropic Claude API key |
| ENVIRONMENT | No | development | Environment (development/production) |
| DEBUG | No | True | Enable debug mode |

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | - | Backend API URL |
| VITE_APP_NAME | No | Athlete Pension | Application name |

## Health Checks

Verify system components:

```bash
# Backend health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/api/v1/health/db

# Redis health
curl http://localhost:8000/api/v1/health/redis

# Full health check
curl http://localhost:8000/api/v1/health/full
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the architecture documentation
3. Check Docker logs for error messages
4. Ensure all environment variables are set correctly

## Production Deployment

For production deployment instructions, see the deployment section in [`ARCHITECTURE.md`](ARCHITECTURE.md:1).

**Note:** Never use the development configuration in production!