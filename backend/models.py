"""
Pydantic models for API responses and internal state
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class EnergyReading(BaseModel):
    timestamp: str
    data: Dict[str, Optional[float]]


class ConnectionStatus(BaseModel):
    connected: bool = False
    last_success: Optional[str] = None
    last_attempt: Optional[str] = None
    error_count: int = 0
