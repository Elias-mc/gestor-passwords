const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// En "npm run electron:dev" seteamos esta variable para apuntar al
// servidor de Vite (con hot reload). Si no está seteada (build de
// producción, o "npm run electron:preview"), cargamos los archivos ya
// compilados en dist/.
const devServerUrl = process.env.ELECTRON_RENDERER_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    // Evita un flash blanco antes de que cargue tu CSS. Coincide con el
    // fondo del tema "Cálido" por defecto — si cambiás el tema inicial,
    // podés actualizar este color para que combine.
    backgroundColor: '#252422',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // En macOS es normal volver a crear una ventana al hacer click en el
  // ícono del dock si no queda ninguna abierta.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// En Windows/Linux, cerrar todas las ventanas cierra la app. En macOS
// las apps quedan "vivas" en el dock hasta Cmd+Q — es la convención del
// sistema, no un descuido.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
