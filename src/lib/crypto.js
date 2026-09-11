// ========================================
// CIFRADO DEL LADO DEL CLIENTE
// ========================================
// El backend nunca ve las contraseñas reales: acá las ciframos con una
// clave derivada de una frase que solo el usuario conoce (PBKDF2), y
// subimos solo el resultado cifrado (AES-GCM). Sin la frase correcta,
// ni nosotros ni nadie que consiga el código puede leer el contenido.

const PBKDF2_ITERATIONS = 250000;

function deriveKey(passphrase, salt) {
  return window.crypto.subtle
    .importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"],
    )
    .then((keyMaterial) =>
      window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      ),
    );
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function fromBase64(base64) {
  const binary = window.atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// Empaquetamos salt + iv + texto cifrado en un solo string base64, así
// el backend solo tiene que guardar un string plano sin saber nada de
// su estructura interna.

export async function encryptPack(plainText, passphrase) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plainText),
  );

  const combined = new Uint8Array(
    salt.length + iv.length + ciphertext.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return toBase64(combined);
}

export async function decryptPack(base64Blob, passphrase) {
  const combined = fromBase64(base64Blob);
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const key = await deriveKey(passphrase, salt);

  try {
    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plainBuffer);
  } catch {
    // AES-GCM incluye un tag de autenticación: si la frase (y por lo
    // tanto la clave derivada) no es la correcta, la desencriptación
    // falla acá en vez de devolver datos corruptos silenciosamente.
    throw new Error("Frase de seguridad incorrecta.");
  }
}
