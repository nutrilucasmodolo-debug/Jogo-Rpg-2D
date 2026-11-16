const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#17110d',
    title: 'Godfall',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
}

function characterPath(id) {
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  if (!safeId) throw new Error('Identificador de personagem inválido.');
  return path.join(app.getPath('userData'), 'characters', `${safeId}.json`);
}

ipcMain.handle('character:save', async (_event, character) => {
  if (!character || typeof character !== 'object') throw new Error('Personagem inválido.');
  const destination = characterPath(character.id);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, JSON.stringify(character, null, 2), 'utf8');
  return { saved: true };
});

ipcMain.handle('character:load', async (_event, id) => {
  try {
    const contents = await fs.readFile(characterPath(id), 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
});

ipcMain.handle('character:delete', async (_event, id) => {
  try {
    await fs.unlink(characterPath(id));
    return { deleted: true };
  } catch (error) {
    if (error.code === 'ENOENT') return { deleted: false };
    throw error;
  }
});

ipcMain.handle('character:list', async () => {
  const directory = path.join(app.getPath('userData'), 'characters');
  try {
    const files = await fs.readdir(directory);
    const saved = await Promise.all(files.filter((file) => file.endsWith('.json')).map(async (file) => {
      try { return JSON.parse(await fs.readFile(path.join(directory, file), 'utf8')); }
      catch { return null; }
    }));
    return saved.filter(Boolean).map(({ id, name, className, level }) => ({ id, name, className, level }));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
});

ipcMain.handle('window:apply-options', (event, options = {}) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) throw new Error('Janela do jogo indisponível.');
  const fullscreen = options.fullscreen === true;
  if (fullscreen) {
    window.setFullScreen(true);
    return { fullscreen: true };
  }
  window.setFullScreen(false);
  const validSizes = new Set(['1280x800', '1600x900', '1920x1080']);
  const resolution = validSizes.has(options.resolution) ? options.resolution : '1280x800';
  const [width, height] = resolution.split('x').map(Number);
  window.setSize(width, height);
  window.center();
  return { fullscreen: false, resolution };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
