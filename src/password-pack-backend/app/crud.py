import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models
from .config import CODE_LENGTH, PACK_EXPIRY_DAYS


CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def _utcnow() -> datetime:
    """
    Devuelve UTC sin timezone para mantener compatibilidad
    con DateTime de SQLite.
    """

    return datetime.now(timezone.utc).replace(
        tzinfo=None
    )


def generate_code(length: int = CODE_LENGTH) -> str:
    return "".join(
        secrets.choice(CODE_ALPHABET)
        for _ in range(length)
    )


def get_pack_by_code(
    db: Session,
    code: str,
):
    return (
        db.query(models.PasswordPack)
        .filter(
            models.PasswordPack.code == code
        )
        .first()
    )


def create_pack(
    db: Session,
    data: str,
) -> models.PasswordPack:

    now = _utcnow()

    expires_at = now + timedelta(
        days=PACK_EXPIRY_DAYS
    )


    for _ in range(5):
        code = generate_code()

        pack = models.PasswordPack(
            code=code,
            data=data,
            created_at=now,
            expires_at=expires_at,
        )

        db.add(pack)

        try:
            db.commit()
            db.refresh(pack)
            return pack

        except IntegrityError:
            db.rollback()

    raise RuntimeError(
        "No se pudo generar un código único"
    )


def get_valid_pack(
    db: Session,
    code: str,
):
    pack = get_pack_by_code(db, code)

    if pack is None:
        return None

    if pack.expires_at <= _utcnow():
        db.delete(pack)
        db.commit()
        return None

    return pack


def delete_pack(
    db: Session,
    code: str,
) -> bool:

    pack = get_pack_by_code(db, code)

    if pack is None:
        return False

    db.delete(pack)
    db.commit()

    return True


def delete_expired_packs(
    db: Session,
) -> int:

    now = _utcnow()

    deleted = (
        db.query(models.PasswordPack)
        .filter(
            models.PasswordPack.expires_at <= now
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return deleted
