from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base


class PasswordPack(Base):
    """Un pack subido por un usuario, identificado por un código corto.

    "data" es un blob opaco para el backend: en el mejor escenario ya
    viene cifrado desde el navegador (ver README, sección de cifrado),
    así que este servicio nunca necesita saber qué hay adentro.
    """

    __tablename__ = "password_packs"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), unique=True, index=True, nullable=False)
    data = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
