import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from . import models
from .config import CODE_LENGTH, PACK_EXPIRY_DAYS


def _utcnow() -> datetime:
    # Naive on purpose: la columna DateTime de SQLite no guarda zona
    # horaria, así que mantenemos todo en UTC "naive" de punta a punta
    # para que las comparaciones (pack.expires_at < _utcnow()) sean
    # consistentes.
    return datetime.now(timezone.utc).replace(tzinfo=None)

# Alfabeto sin caracteres ambiguos (sin 0/O, sin 1/I/L) para que el
# código se pueda transcribir a mano entre dos computadoras sin
# confundirse. Todo en mayúsculas por la misma razón.
CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def generate_code(length: int = CODE_LENGTH) -> str:
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(length))


def get_pack_by_code(db: Session, code: str) -> Optional[models.PasswordPack]:
    return (
        db.query(models.PasswordPack)
        .filter(models.PasswordPack.code == code)
        .first()
    )


def create_pack(db: Session, data: str) -> models.PasswordPack:
    now = _utcnow()
    expires_at = now + timedelta(days=PACK_EXPIRY_DAYS)

    # Choca contra un código repetido, en la práctica, nunca (32^8
    # combinaciones), pero reintentar sale gratis y evita un caso raro.
    code = generate_code()
    for _ in range(5):
        if get_pack_by_code(db, code) is None:
            break
        code = generate_code()
    else:
        raise RuntimeError("No se pudo generar un código único, probá de nuevo")

    pack = models.PasswordPack(code=code, data=data, created_at=now, expires_at=expires_at)
    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack


def get_valid_pack(db: Session, code: str) -> Optional[models.PasswordPack]:
    """Devuelve el pack solo si existe y todavía no expiró.

    Si ya expiró, lo borra en el momento (borrado perezoso) en vez de
    esperar al job de limpieza en background — así nunca se le devuelve
    a nadie un pack vencido, sin importar cuándo corrió la limpieza
    programada por última vez.
    """
    pack = get_pack_by_code(db, code)
    if pack is None:
        return None
    if pack.expires_at < _utcnow():
        db.delete(pack)
        db.commit()
        return None
    return pack


def delete_pack(db: Session, code: str) -> bool:
    pack = get_pack_by_code(db, code)
    if pack is None:
        return False
    db.delete(pack)
    db.commit()
    return True


def delete_expired_packs(db: Session) -> int:
    """Borra todos los packs vencidos. Pensado para correr periódicamente
    en background, para que la tabla no crezca sin límite aunque nadie
    vuelva a pedir los packs viejos."""
    now = _utcnow()
    expired = (
        db.query(models.PasswordPack)
        .filter(models.PasswordPack.expires_at < now)
        .all()
    )
    count = len(expired)
    for pack in expired:
        db.delete(pack)
    db.commit()
    return count
