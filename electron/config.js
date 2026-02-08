const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'slidezone-config.json';

class ConfigManager {
  constructor() {
    // Get the user data directory for the app
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, CONFIG_FILE);
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = {};
    }
  }

  saveConfig() {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  getSelectedFolder() {
    return this.config.selectedFolder;
  }

  setSelectedFolder(folderPath) {
    this.config.selectedFolder = folderPath;
    this.config.lastOpened = new Date().toISOString();
    this.saveConfig();
  }

  getWindowState() {
    return this.config.windowState;
  }

  setWindowState(windowState) {
    this.config.windowState = windowState;
    this.saveConfig();
  }

  getSlideshowSettings() {
    return this.config.slideshowSettings ?? null;
  }

  setSlideshowSettings(settings) {
    this.config.slideshowSettings = settings;
    this.saveConfig();
  }

  getConfig() {
    return { ...this.config };
  }

  clearConfig() {
    this.config = {};
    this.saveConfig();
  }
}

module.exports = { ConfigManager }; 