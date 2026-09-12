const DEFAULT_API_URL = 'http://localhost:8000';

const API_URL = import.meta.env?.VITE_API_URL || DEFAULT_API_URL;

async function extractErrorMessage(response) {
  try {
    const body = await response.json();
    return body.detail || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}

export async function uploadPack(data) {
  const response = await fetch(`${API_URL}/api/packs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json(); // { code, expires_at, days_valid }
}

export async function downloadPack(code) {
  const response = await fetch(`${API_URL}/api/packs/${encodeURIComponent(code)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Código inválido o expirado.');
    }
    throw new Error(await extractErrorMessage(response));
  }

  return response.json(); // { data, created_at, expires_at }
}
