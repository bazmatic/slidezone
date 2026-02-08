import { app, BrowserWindow, ipcMain, dialog, protocol, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { getMediaTypeFromExtension } from '../src/utils/mediaLoader';
import type { MediaFile } from '../src/types/media';

// Config manager stays as CommonJS so it can run in Node without bundling
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ConfigManager } = require('./config');

let mainWindow: BrowserWindow | null = null;
let configManager: {
  setSelectedFolder: (path: string) => void;
  getSelectedFolder: () => string | undefined;
  setWindowState: (state: { width?: number; height?: number; x?: number; y?: number }) => void;
  getWindowState: () => { width?: number; height?: number; x?: number; y?: number } | undefined;
};

function createWindow(): void {
  console.log('Creating window...');

  configManager = new ConfigManager();
  const savedWindowState = configManager.getWindowState();
  const preloadPath = path.join(__dirname, 'preload.js');
  const iconPath = path.join(__dirname, 'assets', 'slidezone.png');

  console.log('__dirname:', __dirname);
  console.log('Preload script absolute path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));

  const windowOptions = {
    width: savedWindowState?.width ?? 1200,
    height: savedWindowState?.height ?? 800,
    x: savedWindowState?.x,
    y: savedWindowState?.y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
    },
    icon: iconPath,
    titleBarStyle: 'default',
    show: false,
  };

  mainWindow = new BrowserWindow(windowOptions);

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  console.log('Is development mode:', isDev);

  if (isDev) {
    console.log('Loading development URL...');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production build...');
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (require('fs').existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.log('Built app not found, falling back to simple HTML');
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    mainWindow?.webContents.executeJavaScript(`
      console.log('=== RENDERER PROCESS DEBUG ===');
      console.log('electronAPI available:', !!window.electronAPI);
      if (window.electronAPI) {
        console.log('Electron API methods:', Object.keys(window.electronAPI));
      }
    `);
  });

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error('Preload script error:', preloadPath, error);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    const bounds = mainWindow!.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    });
  });

  mainWindow.on('move', () => {
    const bounds = mainWindow!.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    });
  });
}

app.whenReady().then(() => {
  console.log('App ready, registering protocols...');

  protocol.registerFileProtocol('media', (request, callback) => {
    const urlPath = request.url.replace('media://', '');
    const decodedPath = decodeURIComponent(urlPath);
    console.log('Media protocol request:', request.url, '->', decodedPath);
    callback(decodedPath);
  });

  protocol.registerFileProtocol('app-assets', (request, callback) => {
    const prefix = 'app-assets://./';
    const urlPath = request.url.replace(prefix, '').split('?')[0];
    const decodedPath = decodeURIComponent(urlPath);
    const assetsDir = path.join(__dirname, 'assets');
    const resolvedPath = path.normalize(path.join(assetsDir, decodedPath));
    if (!resolvedPath.startsWith(assetsDir)) {
      callback({ error: -2 });
      return;
    }
    callback(resolvedPath);
  });

  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-folder', async () => {
  console.log('select-folder IPC called');
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Media Folder',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedFolder = result.filePaths[0];
    configManager.setSelectedFolder(selectedFolder);
    return selectedFolder;
  }
  return null;
});

ipcMain.handle('get-saved-folder', async () => {
  return configManager.getSelectedFolder();
});

ipcMain.handle('clear-saved-folder', async () => {
  configManager.setSelectedFolder('');
  return true;
});

ipcMain.handle('read-media-folder', async (_event, folderPath: string) => {
  console.log('read-media-folder IPC called with:', folderPath);
  try {
    const files = await fs.readdir(folderPath);
    const mediaFiles: MediaFile[] = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) continue;

        const extension = path.extname(file).toLowerCase();
        const mediaType = getMediaTypeFromExtension(extension);
        if (!mediaType) continue;

        mediaFiles.push({
          id: filePath,
          name: path.parse(file).name,
          path: filePath,
          type: mediaType,
          extension,
          mtime: stats.mtime,
        });
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }

    mediaFiles.sort((a, b) => new Date(b.mtime!).getTime() - new Date(a.mtime!).getTime());
    console.log(`Found ${mediaFiles.length} media files`);
    return { success: true, files: mediaFiles, count: mediaFiles.length };
  } catch (error) {
    console.error('Error reading media folder:', error);
    return {
      success: false,
      error: 'Failed to read media folder',
      files: [],
      count: 0,
    };
  }
});

ipcMain.handle('open-in-finder', async (_event, filePath: string) => {
  console.log('open-in-finder IPC called with:', filePath);
  try {
    shell.showItemInFolder(filePath);
    return { success: true, message: 'File opened in Finder' };
  } catch (error) {
    console.error('Error opening file in Finder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});
