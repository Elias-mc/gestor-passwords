from datetime import datetime

from pydantic import BaseModel, Field


class PackCreate(BaseModel):


    data: str = Field(
        ...,
        min_length=1,
        max_length=2_097_152,
        description="Pack cifrado generado por el cliente",
    )


class PackCreateResponse(BaseModel):
    code: str
    expires_at: datetime
    days_valid: int


class PackResponse(BaseModel):
    data: str
    created_at: datetime
    expires_at: datetime


class HealthResponse(BaseModel):
    status: str
