import os

# ========================================
# CONFIGURACIÓN
# ========================================
# Todo se puede pisar con variables de entorno sin tocar código,
# para poder ajustar esto en producción sin redeployar.

# Cuántos días vive un pack antes de borrarse solo.
PACK_EXPIRY_DAYS = int(os.getenv("PACK_EXPIRY_DAYS", "30"))

# Dónde vive la base. Por default un archivo SQLite al lado del proyecto;
# en producción real conviene Postgres (alcanza con cambiar esta URL).
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./passpacks.db")

# Longitud del código que se le muestra al usuario para bajar el pack.
CODE_LENGTH = int(os.getenv("CODE_LENGTH", "8"))

# Cada cuántas horas corre el job que borra packs vencidos en background.
# Además de esto, también se borra "al toque" si alguien pide un pack
# vencido (borrado perezoso), así que esto es solo una limpieza de fondo.
CLEANUP_INTERVAL_HOURS = float(os.getenv("CLEANUP_INTERVAL_HOURS", "6"))

# Tamaño máximo del pack que se acepta subir (en bytes). Evita que alguien
# mande archivos gigantes y llene el disco. 2 MB de sobra para un pack de
# contraseñas, incluso con muchos íconos en base64.
MAX_PACK_SIZE_BYTES = int(os.getenv("MAX_PACK_SIZE_BYTES", str(2 * 1024 * 1024)))
