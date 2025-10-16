console.log('=== PRELOAD SCRIPT LOADING ===');
console.log('Preload script process.type:', process.type);

const { contextBridge, ipcRenderer } = require('electron');

// Chromecast functionality disabled for now
console.log('Chromecast functionality disabled');

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
  // Chromecast functionality
  getChromecastDevices: () => {
    console.log('getChromecastDevices called');
    return ipcRenderer.invoke('get-chromecast-devices');
  },
  startChromecastSession: (deviceId) => {
    console.log('startChromecastSession called with:', deviceId);
    return ipcRenderer.invoke('start-chromecast-session', deviceId);
  },
  stopChromecastSession: () => {
    console.log('stopChromecastSession called');
    return ipcRenderer.invoke('stop-chromecast-session');
  },
  castMedia: (mediaUrl, mediaType) => {
    console.log('castMedia called with:', mediaUrl, mediaType);
    return ipcRenderer.invoke('cast-media', mediaUrl, mediaType);
  },
  getChromecastStatus: () => {
    console.log('getChromecastStatus called');
    return ipcRenderer.invoke('get-chromecast-status');
  }
});

console.log('Preload script completed, APIs exposed'); 