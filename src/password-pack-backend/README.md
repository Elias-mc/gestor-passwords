# Password Pack Sync — backend

Backend chico en Python (FastAPI + SQLite) para poder subir un "pack" de
contraseñas desde una computadora, y bajarlo desde otra usando un código,
durante 30 días. Pasado ese tiempo se borra solo.

## Cómo funciona

1. El frontend sube el pack (`POST /api/packs`) → el backend guarda el
   contenido y devuelve un **código** de 8 caracteres + la fecha de
   expiración.
2. En la otra computadora, el frontend pide ese pack con el código
   (`GET /api/packs/{code}`).
3. Pasados 30 días (configurable), el pack deja de estar disponible:
   - Si alguien intenta bajarlo después de vencido, se borra en el momento
     (borrado perezoso) y devuelve 404.
   - Además, un proceso en background revisa cada 6 horas y borra todo lo
     vencido, así la tabla no crece infinitamente aunque nadie vuelva a
     pedir esos packs.

El backend nunca interpreta el contenido de `data`: para él es un string
opaco. Esto es a propósito — ver la sección de **seguridad** más abajo,
es importante para no dejar contraseñas en texto plano en el servidor.

## Instalación

Desde la raíz del repositorio:

```bash
cd src/password-pack-backend
python3 -m venv venv
source venv/bin/activate        # en Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # opcional: ajustar la configuración
```

## Correrlo en la PC principal

```bash
cd src/password-pack-backend
source venv/bin/activate
python run.py
```

El servidor escucha en todas las interfaces de red (`0.0.0.0:8000`).
En la PC principal se puede abrir `http://localhost:8000/docs`.

Para probarlo desde otra computadora conectada a la misma red, usar la IP
local de la PC principal, por ejemplo:

```text
http://192.168.0.12:8000/docs
```

Si el acceso remoto falla, hay que permitir el puerto `8000` en el firewall.

## Endpoints

| Método | Ruta                | Qué hace                                   |
|--------|---------------------|---------------------------------------------|
| POST   | `/api/packs`         | Sube un pack, devuelve `{code, expires_at}` |
| GET    | `/api/packs/{code}`  | Baja un pack (404 si no existe o venció)    |
| DELETE | `/api/packs/{code}`  | Borra un pack manualmente                   |
| GET    | `/api/health`        | Chequeo de salud                            |

### Ejemplos con curl

```bash
# Subir
curl -X POST http://localhost:8000/api/packs \
  -H "Content-Type: application/json" \
  -d '{"data": "el-contenido-de-tu-pack"}'
# → {"code":"VSM7A8Z2","expires_at":"2026-10-11T11:22:50","days_valid":30}

# Bajar (desde la otra computadora)
curl http://localhost:8000/api/packs/VSM7A8Z2

# Borrar
curl -X DELETE http://localhost:8000/api/packs/VSM7A8Z2
```

## Configuración

Todo se ajusta con variables de entorno (ver `.env.example`). Para cargar
la configuración local:

```bash
cp .env.example .env
```

- `PACK_EXPIRY_DAYS` (default `30`)
- `DATABASE_URL` (default `sqlite:///./passpacks.db` — para producción con
  más de un usuario concurrente conviene Postgres, alcanza con cambiar
  esta URL, el resto del código no cambia)
- `CODE_LENGTH` (default `8`)
- `CLEANUP_INTERVAL_HOURS` (default `6`)
- `MAX_PACK_SIZE_BYTES` (default `2 MB`)

## Integración con el frontend (React)

Un cliente mínimo para llamar al backend desde tu app:

```js
// src/lib/passPackApi.js
const API_URL = "http://localhost:8000";

export async function uploadPack(data) {
  const res = await fetch(`${API_URL}/api/packs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error("No se pudo subir el pack");
  return res.json(); // { code, expires_at, days_valid }
}

export async function downloadPack(code) {
  const res = await fetch(`${API_URL}/api/packs/${code}`);
  if (res.status === 404) throw new Error("Código inválido o expirado");
  if (!res.ok) throw new Error("No se pudo bajar el pack");
  return res.json(); // { data, created_at, expires_at }
}
```

Y en tu `App.jsx`, para exportar/importar el array `passwords`:

```js
// Exportar (subir)
const { code } = await uploadPack(JSON.stringify(passwords));
// mostrale "code" al usuario para que lo anote

// Importar (bajar en la otra compu)
const { data } = await downloadPack(codeQueEscribioElUsuario);
setPasswords(JSON.parse(data));
```

## ⚠️ Seguridad — importante

Este backend, tal como está, guarda lo que le mandes tal cual. Si le
mandás el JSON de las contraseñas en texto plano, quedan en texto plano
en el servidor durante esos 30 días. Para un gestor de contraseñas de
verdad, lo recomendable es que el **navegador cifre el pack antes de
subirlo**, con una clave derivada de una passphrase que solo el usuario
conoce — así el servidor solo ve un blob cifrado, nunca las contraseñas
reales (el mismo enfoque "zero-knowledge" que usan Bitwarden o 1Password
para sincronizar).

Un ejemplo simple usando la Web Crypto API del navegador (AES-GCM +
PBKDF2), sin librerías externas:

```js
// src/lib/crypto.js
async function deriveKey(passphrase, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPack(plainText, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plainText),
  );
  // Empaquetamos salt + iv + ciphertext en un solo string base64 para
  // mandarlo como "data" al backend.
  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)]);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptPack(base64Blob, passphrase) {
  const combined = Uint8Array.from(atob(base64Blob), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(passphrase, salt);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plainBuffer);
}
```

Con esto, el flujo de exportar/importar queda:

```js
const blob = await encryptPack(JSON.stringify(passwords), passphrase);
const { code } = await uploadPack(blob);

// en la otra compu, con el mismo "code" y la misma "passphrase":
const { data } = await downloadPack(code);
setPasswords(JSON.parse(await decryptPack(data, passphrase)));
```

Si el usuario se olvida la passphrase, el pack queda irrecuperable — es
la contra natural de que el servidor no pueda leerlo tampoco. Vale la
pena avisarle eso en la UI.

### Otras cosas a tener en cuenta para producción

- Servir esto detrás de HTTPS siempre (nunca mandar contraseñas, cifradas
  o no, por HTTP plano).
- Restringir `allow_origins` en el CORS al dominio real del frontend, en
  vez de `"*"`.
- Agregar rate limiting a `POST/GET /api/packs*` (por ejemplo con
  `slowapi`) para dificultar que alguien intente adivinar códigos a lo
  bruto.
- Si esperás mucho tráfico concurrente, pasar de SQLite a Postgres
  (solo cambia `DATABASE_URL`, el resto del código queda igual).
