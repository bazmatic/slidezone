import { app, BrowserWindow, ipcMain, dialog, protocol, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import zlib from 'zlib';
import { getMediaTypeFromExtension } from '../src/utils/mediaLoader';
import type { MediaFile } from '../src/types/media';

// Config manager stays as CommonJS so it can run in Node without bundling
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ConfigManager } = require('./config');

let mainWindow: BrowserWindow | null = null;
interface SlideshowSettings {
  photoDisplaySeconds: number;
  videoDisplaySeconds: number;
  playVideoToEnd: boolean;
  transitionDuration: number;
  enableKenBurns: boolean;
  kenBurnsDuration: number;
}

let configManager: {
  setSelectedFolder: (path: string) => void;
  getSelectedFolder: () => string | undefined;
  setWindowState: (state: { width?: number; height?: number; x?: number; y?: number }) => void;
  getWindowState: () => { width?: number; height?: number; x?: number; y?: number } | undefined;
  getSlideshowSettings: () => SlideshowSettings | null;
  setSlideshowSettings: (settings: SlideshowSettings) => void;
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

  const MEDIA_MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
  };

  protocol.registerFileProtocol('media', (request, callback) => {
    const urlPath = request.url.replace(/^media:\/\//, '');
    const decodedPath = decodeURIComponent(urlPath);
    const ext = path.extname(decodedPath).toLowerCase();
    const mimeType = MEDIA_MIME_TYPES[ext];
    console.log('Media protocol request:', request.url, '->', decodedPath, mimeType ?? '');
    if (mimeType) {
      callback({ path: decodedPath, mimeType });
    } else {
      callback(decodedPath);
    }
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

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TEXt_TYPE = 0x74455874;   // 'tEXt'
const ZTXt_TYPE = 0x7a545874;   // 'zTXt'
const ITXt_TYPE = 0x69545874;   // 'iTXt'
const PROMPT_KEYWORDS = ['parameters', 'prompt'] as const;

function parseTextChunk(data: Buffer, keyword: string, decompress: boolean, encoding: 'latin1' | 'utf8' = 'latin1'): string | null {
  if (!PROMPT_KEYWORDS.includes(keyword as typeof PROMPT_KEYWORDS[number])) return null;
  let raw: Buffer;
  if (decompress) {
    try {
      raw = zlib.inflateSync(data);
    } catch {
      return null;
    }
  } else {
    raw = data;
  }
  const value = (encoding === 'utf8' ? raw.toString('utf8') : raw.toString('latin1')).trim();
  return value.length > 0 ? value : null;
}

function extractPngParameters(buffer: Buffer): string | null {
  if (buffer.length < 8 + 12) return null;
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  let parametersValue: string | null = null;
  let promptValue: string | null = null;
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.readUInt32BE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buffer.length) break;
    offset = dataEnd + 4; // skip CRC

    const data = buffer.subarray(dataStart, dataEnd);
    if (type === TEXt_TYPE && length >= 2) {
      const nul = data.indexOf(0);
      if (nul <= 0) continue;
      const keyword = data.subarray(0, nul).toString('latin1');
      const value = parseTextChunk(data.subarray(nul + 1), keyword, false);
      if (value !== null) {
        if (keyword === 'parameters') parametersValue = value;
        else if (keyword === 'prompt') promptValue = promptValue ?? value;
      }
    } else if (type === ZTXt_TYPE && length >= 3) {
      const nul = data.indexOf(0);
      if (nul <= 0 || nul + 2 > data.length) continue;
      const keyword = data.subarray(0, nul).toString('latin1');
      const compMethod = data[nul + 1];
      if (compMethod !== 0) continue;
      const value = parseTextChunk(data.subarray(nul + 2), keyword, true, 'utf8');
      if (value !== null) {
        if (keyword === 'parameters') parametersValue = value;
        else if (keyword === 'prompt') promptValue = promptValue ?? value;
      }
    } else if (type === ITXt_TYPE && length >= 5) {
      const nul = data.indexOf(0);
      if (nul <= 0 || nul + 5 > data.length) continue;
      const keyword = data.subarray(0, nul).toString('latin1');
      if (!PROMPT_KEYWORDS.includes(keyword as typeof PROMPT_KEYWORDS[number])) continue;
      const compFlag = data[nul + 1];
      const compMethod = data[nul + 2];
      const rest = data.subarray(nul + 3);
      const langEnd = rest.indexOf(0);
      if (langEnd < 0) continue;
      const afterLang = rest.subarray(langEnd + 1);
      const tkeyEnd = afterLang.indexOf(0);
      if (tkeyEnd < 0) continue;
      const valueBytes = afterLang.subarray(tkeyEnd + 1);
      let value: string;
      if (compFlag === 1 && compMethod === 0) {
        try {
          value = zlib.inflateSync(valueBytes).toString('utf8').trim();
        } catch {
          continue;
        }
      } else {
        value = valueBytes.toString('utf8').trim();
      }
      if (value.length > 0) {
        if (keyword === 'parameters') parametersValue = value;
        else if (keyword === 'prompt') promptValue = promptValue ?? value;
      }
    }
  }
  return parametersValue ?? promptValue;
}

ipcMain.handle('get-media-metadata', async (_event, filePath: string): Promise<{ hasPrompt: boolean; promptText?: string }> => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.png') return { hasPrompt: false };
    const buffer = await fs.readFile(filePath);
    const promptText = extractPngParameters(buffer);
    if (promptText === null) return { hasPrompt: false };
    return { hasPrompt: true, promptText };
  } catch {
    return { hasPrompt: false };
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

ipcMain.handle('get-slideshow-settings', async () => {
  return configManager.getSlideshowSettings();
});

ipcMain.handle('set-slideshow-settings', async (_event, settings: SlideshowSettings) => {
  configManager.setSlideshowSettings(settings);
});
