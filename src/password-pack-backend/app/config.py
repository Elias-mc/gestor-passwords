import os

from dotenv import load_dotenv


load_dotenv()


def get_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


PACK_EXPIRY_DAYS = int(
    os.getenv("PACK_EXPIRY_DAYS", "30")
)

CODE_LENGTH = int(
    os.getenv("CODE_LENGTH", "8")
)

MAX_PACK_SIZE_BYTES = int(
    os.getenv(
        "MAX_PACK_SIZE_BYTES",
        str(2 * 1024 * 1024),
    )
)


CLEANUP_INTERVAL_HOURS = float(
    os.getenv(
        "CLEANUP_INTERVAL_HOURS",
        "6",
    )
)



DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./passpacks.db",
)



APP_ENV = os.getenv(
    "APP_ENV",
    "development",
)



CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173",
)

CORS_ORIGINS = [
    origin.strip()
    for origin in CORS_ORIGINS_RAW.split(",")
    if origin.strip()
]


TRUSTED_HOSTS_RAW = os.getenv(
    "TRUSTED_HOSTS",
    "localhost,127.0.0.1",
)

TRUSTED_HOSTS = [
    host.strip()
    for host in TRUSTED_HOSTS_RAW.split(",")
    if host.strip()
]


if PACK_EXPIRY_DAYS <= 0:
    raise ValueError("PACK_EXPIRY_DAYS debe ser mayor que 0")

if CODE_LENGTH < 6:
    raise ValueError("CODE_LENGTH debe ser al menos 6")

if MAX_PACK_SIZE_BYTES <= 0:
    raise ValueError("MAX_PACK_SIZE_BYTES debe ser mayor que 0")

if CLEANUP_INTERVAL_HOURS <= 0:
    raise ValueError("CLEANUP_INTERVAL_HOURS debe ser mayor que 0")
