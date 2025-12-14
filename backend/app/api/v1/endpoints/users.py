"""
User management endpoints (placeholder - to be implemented in Phase 2).
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """Get current user profile (to be implemented)."""
    return {"message": "Get current user endpoint - coming soon"}


@router.put("/me")
async def update_current_user():
    """Update current user profile (to be implemented)."""
    return {"message": "Update user endpoint - coming soon"}


@router.get("/me/profile")
async def get_athlete_profile():
    """Get athlete profile (to be implemented)."""
    return {"message": "Get athlete profile endpoint - coming soon"}