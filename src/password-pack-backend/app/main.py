from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .cleanup import start_cleanup_thread
from .config import (
    APP_ENV,
    CORS_ORIGINS,
    MAX_PACK_SIZE_BYTES,
    PACK_EXPIRY_DAYS,
    TRUSTED_HOSTS,
)
from .database import Base, engine, get_db


Base.metadata.create_all(
    bind=engine
)


_stop_event = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _stop_event

    _stop_event = start_cleanup_thread()

    yield

    if _stop_event:
        _stop_event.set()


app = FastAPI(
    title="Password Pack Sync",
    description="Servicio temporal para sincronizar packs cifrados.",
    version="1.0.0",
    lifespan=lifespan,
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

if APP_ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=TRUSTED_HOSTS,
    )



@app.post(
    "/api/packs",
    response_model=schemas.PackCreateResponse,
)
def upload_pack(
    payload: schemas.PackCreate,
    db: Session = Depends(get_db),
):
    size = len(
        payload.data.encode("utf-8")
    )

    if size > MAX_PACK_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="El pack pesa demasiado.",
        )

    try:
        pack = crud.create_pack(
            db,
            payload.data,
        )

    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo generar el código.",
        )

    return schemas.PackCreateResponse(
        code=pack.code,
        expires_at=pack.expires_at,
        days_valid=PACK_EXPIRY_DAYS,
    )


@app.get(
    "/api/packs/{code}",
    response_model=schemas.PackResponse,
)
def download_pack(
    code: str = Path(
        ...,
        min_length=6,
        max_length=32,
        pattern=r"^[A-Za-z0-9]+$",
    ),
    db: Session = Depends(get_db),
):
    normalized_code = code.strip().upper()

    pack = crud.get_valid_pack(
        db,
        normalized_code,
    )

    if pack is None:
        raise HTTPException(
            status_code=404,
            detail="Código inválido o expirado.",
        )

    return schemas.PackResponse(
        data=pack.data,
        created_at=pack.created_at,
        expires_at=pack.expires_at,
    )


@app.delete(
    "/api/packs/{code}",
)
def delete_pack(
    code: str = Path(
        ...,
        min_length=6,
        max_length=32,
        pattern=r"^[A-Za-z0-9]+$",
    ),
    db: Session = Depends(get_db),
):
    normalized_code = code.strip().upper()

    deleted = crud.delete_pack(
        db,
        normalized_code,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Código inválido.",
        )

    return {
        "ok": True,
    }


@app.get(
    "/api/health",
    response_model=schemas.HealthResponse,
)
def health():
    return {
        "status": "ok",
    }
