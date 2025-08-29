const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Import the config manager
const { ConfigManager } = require('./config');

let mainWindow;
let configManager;

function createWindow() {
  console.log('Creating window...');
  
  // Initialize config manager
  configManager = new ConfigManager();
  
  // Get saved window state or use defaults
  const savedWindowState = configManager.getWindowState();
  const windowOptions = {
    width: savedWindowState?.width || 1200,
    height: savedWindowState?.height || 800,
    x: savedWindowState?.x,
    y: savedWindowState?.y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow file:// URLs for local media files
      enableRemoteModule: false,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'assets', 'icon.svg'), // SVG icon
    titleBarStyle: 'default',
    show: false
  };

  console.log('Window options:', windowOptions);
  console.log('Preload path:', path.join(__dirname, 'preload.js'));
  console.log('Preload file exists:', require('fs').existsSync(path.join(__dirname, 'preload.js')));

  mainWindow = new BrowserWindow(windowOptions);

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  console.log('Is development mode:', isDev);
  
  if (isDev) {
    console.log('Loading development URL...');
    mainWindow.loadURL('http://localhost:5111');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production file...');
    const filePath = path.join(__dirname, '..', 'out', 'index.html');
    console.log('File path:', filePath);
    mainWindow.loadFile(filePath);
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Debug preload script loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    mainWindow.webContents.executeJavaScript(`
      console.log('Window object keys:', Object.keys(window));
      console.log('electronAPI available:', !!window.electronAPI);
      console.log('testAPI available:', !!window.testAPI);
    `);
  });

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  // Save window state when window is resized or moved
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
  });

  mainWindow.on('move', () => {
    const bounds = mainWindow.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
  });
}

// Register file protocol
app.whenReady().then(() => {
  console.log('App ready, registering protocols...');
  // Register file protocol to handle file:// URLs
  protocol.registerFileProtocol('file', (request, callback) => {
    const filePath = request.url.replace('file://', '');
    callback(filePath);
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
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for folder selection and file reading
ipcMain.handle('select-folder', async () => {
  console.log('select-folder IPC called');
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Media Folder'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const selectedFolder = result.filePaths[0];
    configManager.setSelectedFolder(selectedFolder);
    return selectedFolder;
  }
  return null;
});

ipcMain.handle('get-saved-folder', async () => {
  console.log('get-saved-folder IPC called');
  return configManager.getSelectedFolder();
});

ipcMain.handle('clear-saved-folder', async () => {
  console.log('clear-saved-folder IPC called');
  configManager.setSelectedFolder('');
  return true;
});

ipcMain.handle('read-media-folder', async (event, folderPath) => {
  console.log('read-media-folder IPC called with:', folderPath);
  try {
    const files = await fs.readdir(folderPath);
    const mediaFiles = [];
    
    const supportedPhotoExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const supportedVideoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(folderPath, file);
      
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          const extension = path.extname(file).toLowerCase();
          
          if (supportedPhotoExtensions.includes(extension)) {
            mediaFiles.push({
              id: `file-${i}`,
              name: path.parse(file).name,
              path: filePath,
              type: 'photo',
              extension,
              mtime: stats.mtime
            });
          } else if (supportedVideoExtensions.includes(extension)) {
            mediaFiles.push({
              id: `file-${i}`,
              name: path.parse(file).name,
              path: filePath,
              type: 'video',
              extension,
              mtime: stats.mtime
            });
          }
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }
    
    // Sort by modification date (newest first)
    mediaFiles.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    
    console.log(`Found ${mediaFiles.length} media files`);
    return {
      success: true,
      files: mediaFiles,
      count: mediaFiles.length
    };
  } catch (error) {
    console.error('Error reading media folder:', error);
    return {
      success: false,
      error: 'Failed to read media folder',
      files: [],
      count: 0
    };
  }
}); 