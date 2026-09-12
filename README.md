# Gestor de Contraseñas

Una app de escritorio para guardar tus contraseñas sin depender de la memoria
(la tuya, no la de la compu — esa la usamos igual). Corre en Windows, Mac y
Linux, no manda nada a ningún servidor propio por defecto, y viene con un
generador de claves, categorías, favoritos y cambio de tema.

> Porque "123456" no es una contraseña, es un grito de auxilio.

<p align="center">
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-ISC-8a2be2?style=flat-square">
  <img alt="Hecho con" src="https://img.shields.io/badge/hecho%20con-React%20%2B%20Electron-61dafb?style=flat-square">
  <img alt="Plataformas" src="https://img.shields.io/badge/plataformas-Windows%20%7C%20macOS%20%7C%20Linux-informational?style=flat-square">
</p>

---

## ¿Y esto para qué sirve?

Para dejar de anotar contraseñas en un post-it, en las Notas del celular o en
un Word que se llama "no borrar.docx". Guardás tus cuentas, las organizás,
generás claves más seguras y listo.

No hay cuentas ni login. Es una app local: lo que guardás se queda en tu
computadora, salvo que actives voluntariamente la sincronización.

## Características

- **Generador de contraseñas** con largo ajustable y control de mayúsculas,
  minúsculas, números y símbolos.
- **Favoritos y categorías** para organizar tus cuentas.
- **Búsqueda y edición** de tus registros guardados.
- **Temas de color** claro y oscuro.
- **Sincronización entre dispositivos** cifrada, con código y frase de
  seguridad.
- **Multiplataforma** para Windows, macOS y Linux.

## Descargar y abrir

Las versiones listas para usar se publican en
[Releases](https://github.com/Elias-mc/gestor-passwords/releases).
También podés consultar la carpeta [`downloads/`](./downloads/), que contiene
las guías breves para abrir cada sistema. Los ZIP publicados se encuentran en
la sección **Releases**.

No necesitás instalar Node.js, npm, Python ni ejecutar comandos para usar una
versión publicada: descargá el ZIP de tu sistema, extraelo y abrí la
aplicación.

### Linux

Descargá el ZIP de Linux, descomprimilo y abrí la AppImage con doble clic.
Si el sistema pregunta si querés ejecutarla, elegí **Ejecutar**.

```bash
# Alternativa para terminal:
chmod +x "Gestor de Contraseñas-1.0.0.AppImage"
./"Gestor de Contraseñas-1.0.0.AppImage"
```

También podés descargar directamente la `.AppImage`; no requiere instalación.

### Windows

Descargá el ZIP de Windows, descomprimilo y abrí el archivo `.exe` con doble
clic. Seguí el asistente de instalación.

### macOS

Descargá el ZIP de macOS, descomprimilo y abrí el `.dmg` con doble clic.
Arrastrá la aplicación a `Applications` y luego abrila desde allí.

> Descargá archivos únicamente desde las Releases oficiales del repositorio.

## Con qué está hecho

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Electron](https://www.electronjs.org/)

## Poner el proyecto a andar

Necesitás tener [Node.js](https://nodejs.org/) instalado. Después:

```bash
git clone https://github.com/Elias-mc/gestor-passwords.git
cd gestor-passwords
npm install
npm run electron:dev
```

Otros comandos útiles:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta solo el frontend con Vite |
| `npm run electron:preview` | Compila y abre la app de escritorio |
| `npm run build` | Compila el frontend |
| `npm run electron:build` | Genera el paquete de la plataforma actual |

## Generar descargas

Los siguientes comandos generan el instalador y un ZIP fácil de compartir en
las carpetas `release/` y `downloads/`. Ejecutalos preferentemente en el
sistema operativo de destino:

```bash
# Linux: AppImage + ZIP
npm run electron:download:linux

# Windows: instalador EXE + ZIP
npm run electron:download:windows

# macOS: DMG + ZIP
npm run electron:download:macos
```

Windows y macOS pueden requerir herramientas y firma propias de cada sistema.

Para generar los tres paquetes automáticamente en GitHub, usá el workflow
**Build downloads** desde **Actions** o creá una etiqueta como `v1.0.0`. Los
ZIP aparecerán como artefactos de la ejecución y pueden adjuntarse a una
Release.

## Sincronización opcional

La aplicación funciona sin servidor. La sincronización usa el backend ubicado
en [`src/password-pack-backend/`](./src/password-pack-backend/).

### Iniciar el backend

En una terminal:

```bash
cd src/password-pack-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

La API queda disponible en `http://localhost:8000` y la documentación en
`http://localhost:8000/docs`.

En otra terminal, desde la raíz del proyecto:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

### Probar en otra computadora de la red local

Iniciá el backend y ejecutá Vite escuchando en la red:

```bash
VITE_API_URL=http://IP_DE_LA_PC_PRINCIPAL:8000 npx vite --host 0.0.0.0
```

Desde la otra computadora abrí:

```text
http://IP_DE_LA_PC_PRINCIPAL:5173
```

Configurá `CORS_ORIGINS` en
`src/password-pack-backend/.env` y permití los puertos `8000` y `5173` en el
firewall si fuera necesario.

### Flujo de sincronización

1. Entrá en **Configuración** → **Exportar / Sincronizar**.
2. Elegí una frase de seguridad de al menos 8 caracteres.
3. Guardá el código de 8 caracteres y su fecha de vencimiento.
4. En el otro dispositivo, elegí **Importar desde otro dispositivo**.
5. Ingresá el código y la misma frase de seguridad.

El pack se cifra en el cliente antes de enviarse. Si olvidás la frase, el
contenido no puede recuperarse.

## Seguridad

La aplicación no tiene backend propio ni base de datos en la nube por defecto:
las contraseñas viven en tu dispositivo. Los packs de sincronización se
cifran con AES-GCM antes de subirse, por lo que el servidor recibe únicamente
el contenido cifrado.

Para un despliegue público se recomienda HTTPS, CORS restringido,
autenticación, rate limiting y PostgreSQL en lugar de SQLite. No publiques
HTTP sin protección directamente en Internet.

## Licencia

ISC.

---

## ¿Encontraste un bug o tenés una idea?

Los issues y pull requests son bienvenidos. Si el bug es "me olvidé mi
contraseña maestra", lamentablemente ese no lo arreglamos ni nosotros.

##  ¿Te sirvió? Invitame un cafecito

Esto lo hice a pulmón, con café, música y algún que otro `console.log` que se me olvidó borrar (si encontraste uno, hacé de cuenta que no). Si esta app te salvó de perder una contraseña o simplemente te cayó simpática, podés invitarme un café acá:

No es obligatorio, eh. Pero si lo hacés, prometo tomármelo pensando en vos. 🫶

<p align="center">
  <a href="https://cafecito.app/elias_mk">
  <img width="572"  alt="image" src="https://github.com/user-attachments/assets/8e0f827e-d147-41bf-9dc3-358d9113342f"alt=" Invitame un cafecito "/>
  </a>
</p>
