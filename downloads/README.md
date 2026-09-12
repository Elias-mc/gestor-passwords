# Descargas

Esta carpeta contiene las guías y, cuando se generan localmente, los paquetes
ZIP de descarga. En GitHub, descargá los ZIP desde la sección **Releases**.
El usuario final no necesita Node.js, npm, Python ni terminal: solo debe
descargar, extraer y abrir la aplicación correspondiente.

## Linux

Archivo: `Gestor de Contraseñas-1.0.0-Linux.zip`

1. Descomprimí el ZIP.
2. Abrí `Gestor de Contraseñas-1.0.0.AppImage` con doble clic.
3. Si Linux pregunta cómo abrirla, elegí **Ejecutar**.

Si tu explorador no permite abrirla directamente, habilitá **Permitir
ejecutar el archivo como programa** en las propiedades del archivo.

## Windows

Archivo: `Gestor de Contraseñas-1.0.0-Windows.zip`

1. Descomprimí el ZIP.
2. Ejecutá el archivo `.exe`.
3. Seguí los pasos del instalador.

## macOS

Archivo: `Gestor de Contraseñas-1.0.0-macOS.zip`

1. Descomprimí el ZIP.
2. Abrí el archivo `.dmg`.
3. Arrastrá la aplicación a `Applications`.

Los ZIP se generan automáticamente en GitHub Actions y se publican en cada
Release. Para desarrolladores, también se pueden generar desde la raíz del
proyecto:

```bash
npm run electron:download:linux
npm run electron:download:windows
npm run electron:download:macos
```

Windows y macOS deben generarse preferentemente en sus respectivos sistemas
operativos para garantizar compatibilidad y firma.

## Publicación en GitHub

Para crear los paquetes automáticamente, ejecutá el workflow
`Build downloads` desde la pestaña **Actions** o creá una etiqueta de versión,
por ejemplo `v1.0.0`. El workflow compila Linux, Windows y macOS y conserva los
ZIP como artefactos descargables.
