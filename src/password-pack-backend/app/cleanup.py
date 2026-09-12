import logging
import threading

from .config import CLEANUP_INTERVAL_HOURS
from .crud import delete_expired_packs
from .database import SessionLocal


logger = logging.getLogger(__name__)


def run_cleanup_once() -> int:
    db = SessionLocal()

    try:
        return delete_expired_packs(db)
    finally:
        db.close()


def _cleanup_loop(
    stop_event: threading.Event,
):
    interval = CLEANUP_INTERVAL_HOURS * 3600

    while not stop_event.is_set():

        try:
            deleted = run_cleanup_once()

            if deleted:
                logger.info(
                    "Limpieza: %s pack(s) eliminado(s)",
                    deleted,
                )

        except Exception:
            logger.exception(
                "Error durante la limpieza"
            )

        stop_event.wait(interval)


def start_cleanup_thread() -> threading.Event:
    stop_event = threading.Event()

    thread = threading.Thread(
        target=_cleanup_loop,
        args=(stop_event,),
        daemon=True,
        name="password-pack-cleanup",
    )

    thread.start()

    return stop_event
