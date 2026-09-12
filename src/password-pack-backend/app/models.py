from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base


class PasswordPack(Base):

    __tablename__ = "password_packs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    code = Column(
        String(32),
        unique=True,
        index=True,
        nullable=False,
    )

    data = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    expires_at = Column(
        DateTime,
        nullable=False,
        index=True,
    )
