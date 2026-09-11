import logging
import threading

from .config import CLEANUP_INTERVAL_HOURS
from .crud import delete_expired_packs
from .database import SessionLocal

logger = logging.getLogger("cleanup")


def run_cleanup_once() -> int:
    """Corre una pasada de limpieza y devuelve cuántos packs borró.
    Separado en su propia función para poder llamarlo también desde
    tests o desde un endpoint de administración si hiciera falta."""
    db = SessionLocal()
    try:
        return delete_expired_packs(db)
    finally:
        db.close()


def _cleanup_loop(stop_event: threading.Event):
    while not stop_event.is_set():
        try:
            deleted = run_cleanup_once()
            if deleted:
                logger.info("Limpieza: %s pack(s) vencido(s) eliminado(s)", deleted)
        except Exception:
            logger.exception("Error corriendo la limpieza de packs vencidos")

        # wait() corta antes si alguien llama stop_event.set(), así el
        # apagado del server no queda esperando hasta la próxima vuelta.
        stop_event.wait(CLEANUP_INTERVAL_HOURS * 3600)


def start_cleanup_thread() -> threading.Event:
    """Lanza el loop de limpieza en un thread de background (daemon,
    así no traba el apagado del proceso) y devuelve el Event que lo
    controla para poder frenarlo prolijamente."""
    stop_event = threading.Event()
    thread = threading.Thread(target=_cleanup_loop, args=(stop_event,), daemon=True)
    thread.start()
    return stop_event
