# Railway Deployment Guide

This guide explains how to deploy the Athlete Pension Platform to Railway with automatic deployment from GitHub.

## 🚀 Quick Start

Railway will automatically detect and deploy your application when you connect your GitHub repository. The configuration files are already set up.

## 📋 Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub repository connected to Railway
3. PostgreSQL and Redis instances (can be added via Railway)

## 🔧 Deployment Options

Railway supports two deployment strategies for this project:

### Option 1: Single Service (All-in-One) - Recommended for Testing

This deploys everything in one container using Supervisor:
- Backend API
- Frontend (Nginx)
- Celery Worker
- Celery Beat

**Steps:**
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the [`Dockerfile`](Dockerfile:1) and [`railway.toml`](railway.toml:1)
3. Add PostgreSQL and Redis plugins
4. Configure environment variables (see below)
5. Deploy!

**Pros:** Simple setup, one service to manage
**Cons:** Cannot scale services independently

### Option 2: Multiple Services - Recommended for Production

Deploy each component as a separate Railway service:
- Backend Service (uses [`backend/railway.Dockerfile`](backend/railway.Dockerfile:1))
- Frontend Service (uses [`frontend/railway.Dockerfile`](frontend/railway.Dockerfile:1))
- Celery Worker Service (uses [`backend/railway.Dockerfile`](backend/railway.Dockerfile:1))
- Celery Beat Service (uses [`backend/railway.Dockerfile`](backend/railway.Dockerfile:1))

**Steps:**
1. Create a new Railway project
2. Add PostgreSQL plugin: New → Database → PostgreSQL
3. Add Redis plugin: New → Database → Redis
4. Create Backend service:
   - New → GitHub Repo → Select your repo
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `railway.Dockerfile`
   - Add environment variables
5. Create Frontend service:
   - New → GitHub Repo → Select your repo
   - Settings → Root Directory: `frontend`
   - Settings → Dockerfile Path: `railway.Dockerfile`
   - Add environment variables
6. Create Celery Worker service:
   - New → GitHub Repo → Select your repo
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `railway.Dockerfile`
   - Settings → Custom Start Command: `celery -A app.celery_app worker --loglevel=info --concurrency=2`
   - Add environment variables
7. Create Celery Beat service:
   - New → GitHub Repo → Select your repo
   - Settings → Root Directory: `backend`
   - Settings → Dockerfile Path: `railway.Dockerfile`
   - Settings → Custom Start Command: `celery -A app.celery_app beat --loglevel=info`
   - Add environment variables

**Pros:** Independent scaling, better resource allocation
**Cons:** More complex setup, higher cost

## 🔐 Environment Variables

### Required for All Services

#### PostgreSQL (Auto-configured by Railway Plugin)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

#### Redis (Auto-configured by Railway Plugin)
```
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}
```

#### Application Configuration
```
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<generate-using-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### AI Service Keys
```
OPENAI_API_KEY=<your-openai-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

#### CORS (Update after deployment)
```
CORS_ORIGINS=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

### Frontend-Specific Variables
```
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
VITE_APP_NAME=Athlete Pension
```

## 📝 Configuration Files

The following files configure Railway deployment:

- [`railway.toml`](railway.toml:1) - Railway build and deployment configuration
- [`Dockerfile`](Dockerfile:1) - Multi-stage Docker build for all-in-one deployment
- [`start.sh`](start.sh:1) - Startup script that handles different service types
- [`supervisord.conf`](supervisord.conf:1) - Process manager for all-in-one deployment
- [`.railwayignore`](.railwayignore:1) - Files to exclude from Railway builds

Service-specific Dockerfiles:
- [`backend/railway.Dockerfile`](backend/railway.Dockerfile:1) - Backend/Celery services
- [`frontend/railway.Dockerfile`](frontend/railway.Dockerfile:1) - Frontend service
- [`frontend/nginx.conf`](frontend/nginx.conf:1) - Nginx configuration

## 🔄 Auto-Deployment

Railway automatically deploys when:
- Code is pushed to the connected GitHub branch (default: `main`)
- Changes are made to watched files (configured in railway.toml)

### Monitoring Deployments

1. **Railway Dashboard**: View deployment status, logs, and metrics
2. **GitHub Webhook**: Check Settings → Webhooks for Railway integration
3. **Deployment Logs**: Click on any deployment to view build and runtime logs
4. **Email Notifications**: Railway sends emails on deployment success/failure

## 🏥 Health Checks

The application includes health check endpoints:

- **Backend**: `GET /health` (returns 200 OK)
- **Frontend**: `GET /health` (returns "healthy")

Railway automatically monitors these endpoints and restarts services if they become unhealthy.

## 🐛 Troubleshooting

### "Dockerfile not detected" Error

**Solution**: Ensure [`Dockerfile`](Dockerfile:1) exists in repository root and is not in [`.railwayignore`](.railwayignore:1)

### Build Fails During npm install

**Solution**: Verify [`frontend/package.json`](frontend/package.json:1) has valid dependencies. Check build logs for specific errors.

### Application Crashes on Startup

**Possible causes:**
1. Missing environment variables - Check Railway dashboard
2. Database connection fails - Ensure DATABASE_URL is set correctly
3. Redis connection fails - Ensure REDIS_URL is set correctly

**Solution**: Review deployment logs in Railway dashboard for specific errors.

### CORS Errors in Browser

**Solution**: Update CORS_ORIGINS environment variable with your frontend URL:
```
CORS_ORIGINS=https://your-frontend.railway.app
```

### Services Can't Communicate

For multi-service setup:
**Solution**: Use Railway's internal networking:
- Backend URL: `http://backend.railway.internal:8000`
- Redis URL: `redis://redis.railway.internal:6379`

## 📊 Database Migrations

### Initial Setup

Railway doesn't automatically run migrations. After first deployment:

```bash
# Using Railway CLI
railway run alembic upgrade head

# Or exec into running service
railway run python -c "from app.database import engine; import asyncio; asyncio.run(engine.dispose())"
```

### Future Migrations

Migrations are automatically run by [`start.sh`](start.sh:1) on each deployment.

## 💰 Cost Estimates

### Single Service (All-in-One)
- **Compute**: $5-10/month (Starter plan)
- **PostgreSQL**: $5/month (Hobby)
- **Redis**: $5/month (Hobby)
- **Total**: ~$15-20/month

### Multiple Services (Production)
- **4 Services**: $20/month (4 × $5)
- **PostgreSQL Pro**: $19/month
- **Redis Pro**: $15/month
- **Total**: ~$55-75/month

## 🚦 Next Steps

1. ✅ Connect GitHub repository to Railway
2. ✅ Add PostgreSQL and Redis plugins
3. ✅ Configure environment variables
4. ✅ Deploy and monitor logs
5. ✅ Run database migrations
6. ✅ Test the application
7. ✅ Set up custom domain (optional)

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Project README](README.md)
- [Architecture Documentation](ARCHITECTURE.md)

## 🆘 Support

If you encounter issues:
1. Check Railway deployment logs
2. Review this troubleshooting guide
3. Check Railway's status page
4. Contact Railway support via Discord or dashboard