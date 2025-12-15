# Multi-stage build for monorepo deployment
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Main application image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    nginx \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Copy nginx config template
COPY frontend/nginx.conf /app/nginx.conf.template

# Copy startup script and supervisor config
COPY start.sh ./
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Make start script executable
RUN chmod +x start.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/log/supervisor /var/run && \
    chown -R www-data:www-data /var/log/nginx /var/lib/nginx /var/log/supervisor && \
    chmod -R 755 /var/log/nginx /var/lib/nginx /var/log/supervisor

# Expose port (Railway will map to this)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run as root (required for nginx and supervisor)
# Start all services
CMD ["./start.sh"]