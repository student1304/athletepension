"""
Financial assumptions model for storing calculation parameters.
"""
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class FinancialAssumption(Base):
    """
    Flexible financial assumptions table that can store various calculation parameters.
    Designed to support multiple profiles and assumption types.
    """
    __tablename__ = "financial_assumptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Profile identification
    profile_name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Core assumptions (stored as separate columns for easy querying)
    withdrawal_rate = Column(Float, nullable=False, default=0.04)  # 4% safe withdrawal rate
    growth_rate_pre_retirement = Column(Float, nullable=False, default=0.05)  # 5% CAGR
    growth_rate_post_retirement = Column(Float, nullable=False, default=0.03)  # Conservative post-retirement
    inflation_rate = Column(Float, nullable=False, default=0.03)  # 3% inflation
    
    # Additional assumptions as JSON for flexibility
    # Can store things like:
    # - Tax assumptions
    # - Healthcare costs
    # - Life expectancy
    # - Risk tolerance factors
    # - Asset allocation percentages
    additional_assumptions = Column(JSON, nullable=True, default={})
    
    # Profile metadata
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    risk_profile = Column(String(20), nullable=True)  # conservative, moderate, aggressive
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(100), nullable=True)
    
    def __repr__(self):
        return f"<FinancialAssumption(profile={self.profile_name}, withdrawal={self.withdrawal_rate}, growth={self.growth_rate_pre_retirement})>"
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "profile_name": self.profile_name,
            "description": self.description,
            "withdrawal_rate": self.withdrawal_rate,
            "growth_rate_pre_retirement": self.growth_rate_pre_retirement,
            "growth_rate_post_retirement": self.growth_rate_post_retirement,
            "inflation_rate": self.inflation_rate,
            "additional_assumptions": self.additional_assumptions,
            "is_default": self.is_default,
            "is_active": self.is_active,
            "risk_profile": self.risk_profile,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }