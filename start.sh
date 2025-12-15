#!/bin/bash
set -e

echo "🚀 Starting Athlete Pension Platform..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until python3 -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('${DATABASE_URL}'))" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "✓ Database is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis connection..."
until python3 -c "import redis; redis.from_url('${REDIS_URL}').ping()" 2>/dev/null; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "✓ Redis is ready"

# Configure nginx to use Railway's PORT
if [ -f /app/nginx.conf.template ]; then
  echo "📝 Configuring Nginx for port ${PORT:-8000}..."
  sed "s/listen 80;/listen ${PORT:-8000};/" /app/nginx.conf.template > /etc/nginx/sites-available/default
  # Remove default nginx config
  rm -f /etc/nginx/sites-enabled/default
  ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
nginx -t

# Run database migrations
echo "📊 Running database migrations..."
cd backend
alembic upgrade head || echo "⚠ Migrations skipped (alembic not configured yet)"
cd ..

# Determine which service to run based on RAILWAY_SERVICE_NAME
# This allows Railway to run different services from the same image
case "${RAILWAY_SERVICE_NAME}" in
  "backend")
    echo "🔥 Starting FastAPI Backend..."
    cd backend
    exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
    ;;
  
  "celery-worker")
    echo "⚙️ Starting Celery Worker..."
    cd backend
    exec celery -A app.celery_app worker --loglevel=info --concurrency=2
    ;;
  
  "celery-beat")
    echo "⏰ Starting Celery Beat..."
    cd backend
    exec celery -A app.celery_app beat --loglevel=info
    ;;
  
  "frontend")
    echo "🌐 Starting Frontend (Nginx)..."
    exec nginx -g 'daemon off;'
    ;;
  
  *)
    # Default: Run all services using supervisor (for single service deployment)
    echo "🎭 Starting all services with Supervisor..."
    
    # Update backend port for supervisor
    export BACKEND_PORT=${PORT:-8000}
    
    # Start supervisor
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
    ;;
esac