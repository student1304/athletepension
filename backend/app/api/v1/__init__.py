"""
API v1 router initialization.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, health, financial_analysis

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(financial_analysis.router, prefix="/financial", tags=["Financial Analysis"])