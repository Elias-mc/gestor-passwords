// ========================================
// BASE DE DATOS LOCAL (IndexedDB)
// ========================================
// Guarda las contraseñas en el propio navegador del usuario, así
// sobreviven a cerrar la pestaña o reiniciar la app. Usamos IndexedDB
// en vez de localStorage porque los íconos subidos como archivo se
// guardan en base64 (hasta 1.5 MB cada uno, ver PasswordModal.jsx) y
// localStorage se queda sin espacio mucho antes con eso.

const DB_NAME = 'gestor-contrasenas';
const DB_VERSION = 1;
const STORE_NAME = 'passwords';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('Este navegador no soporta IndexedDB.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    // Solo se dispara la primera vez que se abre esta base (o cuando
    // subimos DB_VERSION en el futuro): acá es donde se define la
    // estructura de la tabla, no en cada apertura normal.
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Devuelve todas las contraseñas guardadas (array vacío si todavía no
// se guardó nada, por ejemplo la primera vez que se abre la app).
export async function getAllPasswords() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Reemplaza todo el contenido guardado por el array que se le pasa.
// Se llama con la lista completa cada vez que cambia algo (agregar,
// editar, borrar, marcar favorito, importar un pack...), así el
// componente que la usa (App.jsx) no tiene que pensar en sincronizar
// registro por registro.
export async function saveAllPasswords(passwords) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.clear();
    passwords.forEach((password) => store.put(password));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
