from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .cleanup import start_cleanup_thread
from .config import MAX_PACK_SIZE_BYTES, PACK_EXPIRY_DAYS
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

_stop_event = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _stop_event
    _stop_event = start_cleanup_thread()
    yield
    if _stop_event:
        _stop_event.set()


app = FastAPI(title="Password Pack Sync", lifespan=lifespan)

# En producción: cambiar "*" por el dominio real del frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/packs", response_model=schemas.PackCreateResponse)
def upload_pack(payload: schemas.PackCreate, db: Session = Depends(get_db)):
    if len(payload.data.encode("utf-8")) > MAX_PACK_SIZE_BYTES:
        raise HTTPException(413, "El pack pesa demasiado")

    pack = crud.create_pack(db, payload.data)
    return schemas.PackCreateResponse(
        code=pack.code, expires_at=pack.expires_at, days_valid=PACK_EXPIRY_DAYS
    )


@app.get("/api/packs/{code}", response_model=schemas.PackResponse)
def download_pack(code: str, db: Session = Depends(get_db)):
    pack = crud.get_valid_pack(db, code.strip().upper())
    if pack is None:
        raise HTTPException(404, "Código inválido o expirado")

    return schemas.PackResponse(
        data=pack.data, created_at=pack.created_at, expires_at=pack.expires_at
    )


@app.delete("/api/packs/{code}")
def delete_pack(code: str, db: Session = Depends(get_db)):
    deleted = crud.delete_pack(db, code.strip().upper())
    if not deleted:
        raise HTTPException(404, "Código inválido")
    return {"ok": True}


@app.get("/api/health")
def health():
    return {"status": "ok"}
