# Sincronización — cómo aplicar estos cambios

Este paquete tiene la misma estructura de carpetas que tu proyecto
(`src/...`). Copiá cada archivo a la misma ruta dentro de tu proyecto,
pisando los que ya existen.

## Archivos nuevos

- `src/lib/passPackApi.js` — llama al backend (subir / bajar pack).
- `src/lib/crypto.js` — cifra y descifra el pack en el navegador
  (AES-GCM + PBKDF2) antes de que salga a la red.
- `src/components/SyncExportModal.jsx` — modal para generar el código.
- `src/components/SyncImportModal.jsx` — modal para importar con un
  código.

## Archivos que se modifican (pisar los tuyos)

- `src/windors/winSettings.jsx` — le agregué una sección
  "Sincronización" con los dos botones y engancha los modales nuevos.
  Ahora recibe `passwords` (el array completo, ya no solo el conteo) y
  `onImportPasswords`.
- `src/App.jsx` — agrega `handleImportPasswords` (reemplaza el estado
  `passwords` con lo que venga del pack importado) y se lo pasa a
  `WinSettings` junto con `passwords`.

El resto de tus archivos (`Sidebar.jsx`, `PasswordModal.jsx`,
`PasswordList.jsx`, `PasswordCard.jsx`, `winPassword.jsx`,
`winFavorites.jsx`, `winCategories.jsx`, `winGenerator.jsx`,
`winModulePassword.jsx`, `ThemeContext.jsx`) **no cambian**.

## Antes de probar

1. Tené el backend corriendo (`python run.py` en el proyecto del
   backend, en `http://localhost:8000`).
2. Si tu backend corre en otra URL, creá un `.env` en la raíz del
   frontend con:
   ```
   VITE_API_URL=https://tu-backend.com
   ```
3. `npm run dev` como siempre.

## Flujo para probarlo

1. Entrá a **Configuración** → **Exportar / Sincronizar**.
2. Elegí una frase de seguridad (mínimo 8 caracteres) y confirmala.
3. Anotá el código de 8 caracteres que te muestra, y la fecha de
   vencimiento.
4. En la otra computadora (o en otra pestaña/perfil del navegador, para
   probarlo rápido): **Configuración** → **Importar desde otro
   dispositivo**.
5. Pegá el código y la misma frase de seguridad.
6. Confirmá el reemplazo cuando te muestre cuántas contraseñas
   encontró.

Si el código o la frase están mal, vas a ver un error genérico ("código
inválido o expirado" / "frase de seguridad incorrecta") — a propósito no
se distingue demasiado cuál de los dos falló, para no facilitar que
alguien pruebe combinaciones al tanteo.

## Algo a tener en cuenta

Ahora mismo tu app no guarda `passwords` en `localStorage`: si recargás
la página, vuelve a `initialPasswords`. Esto significa que si importás
un pack y después recargás sin querer, lo perdés. Si te sirve, puedo
sumar en otra vuelta que `passwords` se guarde en `localStorage`
automáticamente, igual que ya hace el tema (dark/light) en
`ThemeContext.jsx` — avisame si querés que lo agregue.
