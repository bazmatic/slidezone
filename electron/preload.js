const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');
console.log('Preload script __dirname:', __dirname);
console.log('Preload script process.type:', process.type);

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
  }
});

console.log('Preload script completed, APIs exposed'); 