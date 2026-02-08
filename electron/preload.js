console.log('=== PRELOAD SCRIPT LOADING ===');
console.log('Preload script process.type:', process.type);

const { contextBridge, ipcRenderer } = require('electron');


console.log('=== PRELOAD SCRIPT STARTING ===');
console.log('Electron modules loaded successfully');

// Test function to verify preload is working
contextBridge.exposeInMainWorld('testAPI', {
  test: () => {
    console.log('Test API called from renderer');
    return 'Preload script is working!';
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => {
    console.log('selectFolder called');
    return ipcRenderer.invoke('select-folder');
  },
  readMediaFolder: (folderPath) => {
    console.log('readMediaFolder called with:', folderPath);
    return ipcRenderer.invoke('read-media-folder', folderPath);
  },
  getSavedFolder: () => {
    console.log('getSavedFolder called');
    return ipcRenderer.invoke('get-saved-folder');
  },
  clearSavedFolder: () => {
    console.log('clearSavedFolder called');
    return ipcRenderer.invoke('clear-saved-folder');
  },
  openInFinder: (filePath) => {
    console.log('openInFinder called with:', filePath);
    return ipcRenderer.invoke('open-in-finder', filePath);
  },
  getSplashUrl: () => 'app-assets://./splash.mp4',
  getMediaMetadata: (filePath) => ipcRenderer.invoke('get-media-metadata', filePath),
  getSlideshowSettings: () => ipcRenderer.invoke('get-slideshow-settings'),
  setSlideshowSettings: (settings) => ipcRenderer.invoke('set-slideshow-settings', settings),
});

console.log('Preload script completed, APIs exposed'); 