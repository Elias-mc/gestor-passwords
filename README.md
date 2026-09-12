# 🔐 Gestor de Contraseñas

> Porque "123456" no es una contraseña, es un grito de auxilio.

Una app de escritorio para guardar tus contraseñas sin depender de la memoria (la tuya, no la de la compu — esa la usamos igual). Corre en Windows, Mac y Linux, no manda absolutamente nada a ningún servidor propio, y viene con un generador de claves, categorías, favoritos y un cambio de tema que, sinceramente, se luce más de lo que un gestor de contraseñas necesita lucirse.

<p align="center">
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-ISC-8a2be2?style=flat-square">
  <img alt="Hecho con" src="https://img.shields.io/badge/hecho%20con-React%20%2B%20Electron-61dafb?style=flat-square">
  <img alt="Plataformas" src="https://img.shields.io/badge/plataformas-Windows%20%7C%20macOS%20%7C%20Linux-informational?style=flat-square">
  <img alt="Café requerido" src="https://img.shields.io/badge/café%20requerido-sí-6f4e37?style=flat-square">
</p>

---

## 🤔 ¿Y esto para qué sirve?

Para dejar de anotar contraseñas en un post-it, en las Notas del celular, o en un Word que se llama "no borrar.docx". Guardás tus cuentas, las organizás, generás claves que no son tu fecha de cumpleaños, y listo.

No hay cuentas, no hay login, no hay "aceptás nuestros términos y condiciones de 40 páginas". Es una app local: lo que guardás, se queda en tu compu.

## ✨ Características

- 🔑 **Generador de contraseñas** con largo ajustable y control fino de mayúsculas, minúsculas, números y símbolos — para cuando "Pass123!" ya no te alcanza.
- ⭐ **Favoritos y categorías** para no scrollear cinco años buscando la del banco.
- 🎨 **Temas de color** (oscuro, claro, y un par de paletas más) con una transición de cambio de tema animada que nadie te pidió pero que igual quedó espectacular.
- 🔄 **Sincronización entre dispositivos** cifrada, con un código + una frase de seguridad — sin cuentas, sin login, sin que nadie salvo vos tenga la llave.
- 🖥️ **Multiplataforma real**: un mismo proyecto, instaladores para Windows, macOS y Linux.

## 🛠️ Con qué está hecho

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Electron](https://www.electronjs.org/) (lo que la convierte en app de escritorio de verdad, no una web con delirios de grandeza)

## 🚀 Poner el proyecto a andar

Necesitás tener [Node.js](https://nodejs.org/) instalado. Después:

```bash
# Clonar el repo
git clone https://github.com/tu-usuario/gestor-passwords.git
cd gestor-passwords

# Instalar dependencias
npm install

# Modo desarrollo (con recarga en caliente)
npm run electron:dev
```

Otros comandos útiles:

| Comando                    | Qué hace                                            |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Levanta solo el front (Vite), sin Electron          |
| `npm run electron:preview` | Compila y abre la app de escritorio, sin instalarla |
| `npm run electron:build`   | Genera los instaladores finales (ver abajo)         |

## 📦 Compilar tu propio instalador

```bash
npm run electron:build
```

Esto te deja los instaladores listos en la carpeta `release/`:

- **Windows** → `.exe` (NSIS)
- **macOS** → `.dmg`
- **Linux** → `.AppImage` y `.deb`

## 🔒 Sobre la seguridad

Esta app no tiene backend propio ni base de datos en la nube: tus contraseñas viven en tu dispositivo. La sincronización entre computadoras es opcional y va cifrada de punta a punta con una frase que solo vos elegís — ni siquiera nosotros podríamos leerla aunque quisiéramos (y no queremos, tenemos suficiente con recordar las nuestras).

## 🤝 ¿Encontraste un bug? ¿Tenés una idea?

Los issues y los pull requests son bienvenidos. Si el bug es "se me olvidó mi contraseña maestra", lamentablemente ese no lo arreglamos ni nosotros.

## 📄 Licencia

ISC — hacé lo que quieras, básicamente.

---

## 📥 Descargar

¿No querés compilarlo vos mismo? Buscá la última versión ya compilada en la sección de **[Releases](https://github.com/tu-usuario/gestor-passwords/releases)** del repositorio y descargá el instalador para tu sistema operativo.

Mientras no haya una release publicada, seguí los pasos de **["Poner el proyecto a andar"](#-poner-el-proyecto-a-andar)** de más arriba — total, dos minutos de terminal nunca mataron a nadie.

## ☕ ¿Te sirvió? Invitame un cafecito

Esto lo hice a pulmón, con café, música y algún que otro `console.log` que se me olvidó borrar (si encontraste uno, hacé de cuenta que no). Si esta app te salvó de perder una contraseña o simplemente te cayó simpática, podés invitarme un café acá:

<p align="center">
  <a href="https://www.buymeacoffee.com/tu-usuario">
    <img src="https://img.shields.io/badge/☕%20Invitame%20un%20cafecito-donar-ffdd00?style=for-the-badge" alt="Invitame un cafecito">
  </a>
</p>

No es obligatorio, eh. Pero si lo hacés, prometo tomármelo pensando en vos. 🫶
