# Gestor de Contraseñas

Aplicación de escritorio multiplataforma para guardar, organizar y generar
contraseñas. Los datos se almacenan localmente en el dispositivo. La
sincronización entre equipos es opcional y cifra el contenido antes de
enviarlo al servidor.

## Descargar y abrir

Las versiones listas para usar se publican en
[Releases](https://github.com/Elias-mc/gestor-passwords/releases).

### Linux

1. Descargá el archivo `.AppImage` desde la última versión.
2. Dale permiso de ejecución:

   ```bash
   chmod +x Gestor-*.AppImage
   ```

3. Abrilo con doble clic o ejecutalo:

   ```bash
   ./Gestor-*.AppImage
   ```

No requiere instalación. Si preferís descargar un `.zip`, descomprimilo y
ejecutá el archivo `.AppImage` que contiene.

### Windows

Descargá el instalador `.exe`, ejecutalo y seguí el asistente de instalación.

### macOS

Descargá el archivo `.dmg`, abrilo y arrastrá la aplicación a `Applications`.

> Descargá archivos únicamente desde las Releases oficiales del repositorio.

## Funciones

- Generador de contraseñas con longitud y tipos de caracteres configurables.
- Organización por categorías y favoritos.
- Temas de interfaz.
- Persistencia local mediante IndexedDB.
- Sincronización opcional entre dispositivos mediante packs cifrados,
  código temporal y frase de seguridad.

## Desarrollo

Requisitos:

- Node.js 20 o superior.
- Python 3.11 o superior, únicamente si se utiliza la sincronización.

### Aplicación de escritorio

```bash
git clone https://github.com/Elias-mc/gestor-passwords.git
cd gestor-passwords
npm install
npm run electron:dev
```

Para abrir una vista previa compilada:

```bash
npm run electron:preview
```

### Generar descargas

Linux:

```bash
npm run electron:build:linux
```

Los archivos se generan en `release/`:

- `.AppImage`: archivo único, portable y recomendado para Linux.
- `.zip`: versión comprimida para distribuir o guardar.
- `.deb`: paquete para distribuciones basadas en Debian/Ubuntu.

Para generar los instaladores de la plataforma actual:

```bash
npm run electron:build
```

El empaquetado para Windows y macOS debe ejecutarse preferentemente en su
respectivo sistema operativo.

## Sincronización opcional

El servidor de sincronización está en
[`src/password-pack-backend/`](./src/password-pack-backend/). Para iniciarlo:

```bash
cd src/password-pack-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

La API queda disponible en `http://localhost:8000` y su documentación en
`http://localhost:8000/docs`.

Para conectarla desde el frontend:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

La sincronización es opcional: la aplicación funciona sin levantar este
servidor.

## Seguridad y privacidad

La aplicación local no necesita una cuenta ni envía contraseñas por defecto.
Los packs de sincronización se cifran en el cliente con AES-GCM antes de
subirse. El servidor recibe únicamente el contenido cifrado, pero la frase de
seguridad no se puede recuperar si se pierde.

Para un despliegue público se recomienda utilizar HTTPS, restringir CORS,
añadir autenticación y usar PostgreSQL en lugar de SQLite.

## Licencia

ISC.
