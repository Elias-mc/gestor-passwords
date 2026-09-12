const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    minWidth: 900,
    minHeight: 600,

    show: false,

    backgroundColor: '#0b1220',

    autoHideMenuBar: true,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,

      sandbox: true,

      webSecurity: true,

      allowRunningInsecureContent: false,

      devTools: process.env.NODE_ENV === 'development',

      spellcheck: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return {
        action: 'deny',
      };
    }

    return {
      action: 'deny',
    };
  });

  // Bloquea navegación fuera de nuestra aplicación.
  win.webContents.on('will-navigate', (event, url) => {
    const isDevelopment =
      process.env.NODE_ENV === 'development' && url.startsWith('http://localhost:5173');

    const isProduction = url.startsWith('file://');

    if (!isDevelopment && !isProduction) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
