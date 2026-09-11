from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

# "check_same_thread" solo aplica a SQLite: por default no deja usar la
# misma conexión desde threads distintos, y acá sí lo necesitamos (el
# servidor web y el thread de limpieza en background).
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependencia de FastAPI: abre una sesión por request y la cierra
    siempre al final, incluso si algo explota en el medio."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
