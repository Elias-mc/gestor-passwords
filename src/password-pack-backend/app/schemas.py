from datetime import datetime

from pydantic import BaseModel, Field


class PackCreate(BaseModel):
    # String porque acá entra tanto un JSON.stringify plano como (mejor)
    # un blob cifrado en base64 generado en el navegador.
    data: str = Field(..., min_length=1, description="Contenido del pack (idealmente ya cifrado del lado del cliente)")


class PackCreateResponse(BaseModel):
    code: str
    expires_at: datetime
    days_valid: int


class PackResponse(BaseModel):
    data: str
    created_at: datetime
    expires_at: datetime
