# Versión de escritorio con Electron — cómo aplicarlo

## 1. Copiá el archivo nuevo

- `electron/main.cjs` → a la raíz de tu proyecto (creá la carpeta `electron/`).

No toca nada de tu `src/`, tu app React sigue exactamente igual.

## 2. Instalá las dependencias nuevas

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

## 3. Agregá esto a tu `package.json`

**a) El campo `"main"`** (a la raíz del objeto, junto a `"name"`, `"version"`, etc.):

```json
"main": "electron/main.cjs",
```

**b) Estos scripts** (sumalos a tu bloque `"scripts"` existente — no borres los que ya tenías, como `"dev"` o `"build"` de Vite):

```json
"electron:dev": "concurrently -k \"npm:dev\" \"wait-on tcp:5173 && cross-env ELECTRON_RENDERER_URL=http://localhost:5173 electron electron/main.cjs\"",
"electron:preview": "npm run build && electron electron/main.cjs",
"electron:build": "npm run build && electron-builder"
```

Ojo: `electron:dev` usa `cross-env`, que no instalamos arriba. Sumalo también:

```bash
npm install --save-dev cross-env
```

(Es solo para que el `ELECTRON_RENDERER_URL=...` funcione igual en Windows que en Mac/Linux. Si vas a compilar solo desde Mac/Linux, podés omitirlo y sacar el `cross-env` del comando.)

**c) La configuración de electron-builder** (un campo `"build"` nuevo, al mismo nivel que `"scripts"`):

```json
"build": {
  "appId": "com.tuusuario.gestorcontrasenas",
  "productName": "Gestor de Contraseñas",
  "files": ["dist/**/*", "electron/**/*"],
  "directories": { "output": "release" },
  "mac": { "target": "dmg", "category": "public.app-category.utilities" },
  "win": { "target": "nsis" },
  "linux": { "target": ["AppImage", "deb"], "category": "Utility" }
}
```

Cambiá `com.tuusuario.gestorcontrasenas` por algo tuyo (formato inverso de dominio, no hace falta que exista de verdad). También te conviene agregar `"description"` y `"author"` al `package.json` si no los tenías — electron-builder tira un warning si faltan, aunque no bloquea el build.

## 4. Un cambio en `vite.config.js`

Esto es importante y es la causa más común de "pantalla en blanco" al abrir la app empaquetada: agregá `base: './'` a la config:

```js
export default defineConfig({
  base: './',
  // ...el resto de tu config, sin tocar
});
```

Por qué: Vite por defecto genera rutas absolutas (`/assets/index.js`) pensadas para servirse desde un dominio web. Dentro de Electron, la app se abre desde el disco (`file://`), y una ruta que empieza con `/` ahí intenta resolverse desde la raíz del sistema de archivos, no desde la carpeta de tu app — con `base: './'` las rutas quedan relativas y sí funcionan.

## 5. Probarlo en desarrollo

```bash
npm run electron:dev
```

Levanta Vite con hot reload y abre la ventana de Electron apuntando a él — cambios en tu código se ven al instante, igual que en el navegador.

## 6. Generar el instalador

```bash
npm run electron:build
```

Esto compila tu app (`vite build`) y arma el instalador con `electron-builder`. El resultado queda en `release/`:

- **Windows**: un `.exe` (instalador NSIS)
- **Mac**: un `.dmg`
- **Linux**: un `.AppImage` y un `.deb`

Por defecto, `electron-builder` solo genera el instalador para el sistema operativo en el que corrés el comando (no podés generar el `.exe` de Windows compilando desde Linux sin configuración extra de cross-compilation). Si necesitás los tres, lo más simple es compilar cada uno desde su propio sistema, o usar un runner de CI (GitHub Actions tiene ejecutores de Windows/Mac/Linux gratis para repos públicos).

## Antes de repartirlo: la sincronización

Tu `passPackApi.js` apunta a `http://localhost:8000` por defecto. Si vas a repartir esta app a otras personas, necesitás:

1. Desplegar el backend de Python en un servidor real (Render, Railway, un VPS, etc.), no en tu máquina.
2. Antes de correr `electron:build`, crear un archivo `.env.production` en la raíz del frontend con:
   ```
   VITE_API_URL=https://tu-backend-real.com
   ```

Sin esto, la sincronización entre computadoras no va a andar para nadie que no tenga tu backend corriendo en `localhost`.

## Sin son necesarios ahora, pero para más adelante

- **Ícono propio**: poné `build/icon.icns` (Mac), `build/icon.ico` (Windows) y `build/icon.png` (Linux, 512x512) — electron-builder los toma automáticamente de esas rutas sin config adicional. Sin esto, usa el ícono genérico de Electron.
- **Firma de código**: sin firmar, Windows va a mostrar "Editor desconocido" y Mac va a bloquear la app la primera vez ("no se puede verificar el desarrollador") — no impide instalarla (el usuario puede autorizarlo manualmente), pero es menos prolijo. Firmar cuesta dinero (certificado) y es un paso aparte, no bloqueante para repartirlo a amigos o probarlo vos mismo.
