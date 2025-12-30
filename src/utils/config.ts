import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  selectedFolder?: string;
  lastOpened?: string;
  windowState?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

const CONFIG_FILE = 'slidezone-config.json';

export class ConfigManager {
  private configPath: string;
  private config: AppConfig = {};

  constructor() {
    // Get the user data directory for the app
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, CONFIG_FILE);
    this.loadConfig();
  }

  private loadConfig(): void {
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

  private saveConfig(): void {
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

  getSelectedFolder(): string | undefined {
    return this.config.selectedFolder;
  }

  setSelectedFolder(folderPath: string): void {
    this.config.selectedFolder = folderPath;
    this.config.lastOpened = new Date().toISOString();
    this.saveConfig();
  }

  getWindowState() {
    return this.config.windowState;
  }

  setWindowState(windowState: AppConfig['windowState']): void {
    this.config.windowState = windowState;
    this.saveConfig();
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  clearConfig(): void {
    this.config = {};
    this.saveConfig();
  }
}

// CommonJS export for Electron main process
module.exports = { ConfigManager }; 