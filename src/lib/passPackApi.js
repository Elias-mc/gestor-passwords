const DEFAULT_API_URL = "http://localhost:8000";

// Se puede pisar en producción con una variable de entorno de Vite
// (VITE_API_URL en tu archivo .env) sin tocar este archivo.
const API_URL = import.meta.env?.VITE_API_URL || DEFAULT_API_URL;

async function extractErrorMessage(response) {
  try {
    const body = await response.json();
    return body.detail || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}

// ========================================
// SUBIR PACK
// ========================================
// "data" tiene que ser un string. Lo ideal es que ya venga cifrado
// (ver src/lib/crypto.js) para que el backend nunca vea las
// contraseñas en texto plano.

export async function uploadPack(data) {
  const response = await fetch(`${API_URL}/api/packs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json(); // { code, expires_at, days_valid }
}

// ========================================
// BAJAR PACK
// ========================================

export async function downloadPack(code) {
  const response = await fetch(
    `${API_URL}/api/packs/${encodeURIComponent(code)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Código inválido o expirado.");
    }
    throw new Error(await extractErrorMessage(response));
  }

  return response.json(); // { data, created_at, expires_at }
}
