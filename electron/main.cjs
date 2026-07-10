const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const smokeTest = process.env.FORMA3D_SMOKE_TEST === '1';
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#f7f5f0',
    autoHideMenuBar: true,
    show: !smokeTest,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  if (smokeTest) {
    window.webContents.once('did-finish-load', () => {
      console.log('Forma3D desktop loaded');
      app.quit();
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
