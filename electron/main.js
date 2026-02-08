"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_promises = __toESM(require("fs/promises"));

// src/constants/config.ts
var SUPPORTED_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
var SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".avi"];

// src/utils/mediaLoader.ts
var getMediaTypeFromExtension = (extension) => {
  const ext = extension.toLowerCase();
  if (SUPPORTED_PHOTO_EXTENSIONS.includes(ext)) {
    return "photo" /* PHOTO */;
  }
  if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
    return "video" /* VIDEO */;
  }
  return null;
};

// electron/main.ts
var { ConfigManager } = require("./config");
var mainWindow = null;
var configManager;
function createWindow() {
  console.log("Creating window...");
  configManager = new ConfigManager();
  const savedWindowState = configManager.getWindowState();
  const preloadPath = import_path.default.join(__dirname, "preload.js");
  const iconPath = import_path.default.join(__dirname, "assets", "icon.svg");
  console.log("__dirname:", __dirname);
  console.log("Preload script absolute path:", preloadPath);
  console.log("Preload script exists:", require("fs").existsSync(preloadPath));
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
      allowRunningInsecureContent: false
    },
    icon: iconPath,
    titleBarStyle: "default",
    show: false
  };
  mainWindow = new import_electron.BrowserWindow(windowOptions);
  const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");
  console.log("Is development mode:", isDev);
  if (isDev) {
    console.log("Loading development URL...");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("Loading production build...");
    const indexPath = import_path.default.join(__dirname, "..", "dist", "index.html");
    if (require("fs").existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.log("Built app not found, falling back to simple HTML");
      mainWindow.loadFile(import_path.default.join(__dirname, "index.html"));
    }
  }
  mainWindow.once("ready-to-show", () => {
    console.log("Window ready to show");
    mainWindow?.show();
  });
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Page finished loading");
    mainWindow?.webContents.executeJavaScript(`
      console.log('=== RENDERER PROCESS DEBUG ===');
      console.log('electronAPI available:', !!window.electronAPI);
      if (window.electronAPI) {
        console.log('Electron API methods:', Object.keys(window.electronAPI));
      }
    `);
  });
  mainWindow.webContents.on("preload-error", (_event, preloadPath2, error) => {
    console.error("Preload script error:", preloadPath2, error);
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.on("resize", () => {
    const bounds = mainWindow.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
  });
  mainWindow.on("move", () => {
    const bounds = mainWindow.getBounds();
    configManager.setWindowState({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
  });
}
import_electron.app.whenReady().then(() => {
  console.log("App ready, registering protocols...");
  import_electron.protocol.registerFileProtocol("media", (request, callback) => {
    const urlPath = request.url.replace("media://", "");
    const decodedPath = decodeURIComponent(urlPath);
    console.log("Media protocol request:", request.url, "->", decodedPath);
    callback(decodedPath);
  });
  createWindow();
});
import_electron.app.on("window-all-closed", () => {
  console.log("All windows closed");
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (import_electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
import_electron.ipcMain.handle("select-folder", async () => {
  console.log("select-folder IPC called");
  const result = await import_electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
    title: "Select Media Folder"
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedFolder = result.filePaths[0];
    configManager.setSelectedFolder(selectedFolder);
    return selectedFolder;
  }
  return null;
});
import_electron.ipcMain.handle("get-saved-folder", async () => {
  return configManager.getSelectedFolder();
});
import_electron.ipcMain.handle("clear-saved-folder", async () => {
  configManager.setSelectedFolder("");
  return true;
});
import_electron.ipcMain.handle("read-media-folder", async (_event, folderPath) => {
  console.log("read-media-folder IPC called with:", folderPath);
  try {
    const files = await import_promises.default.readdir(folderPath);
    const mediaFiles = [];
    for (const file of files) {
      const filePath = import_path.default.join(folderPath, file);
      try {
        const stats = await import_promises.default.stat(filePath);
        if (!stats.isFile()) continue;
        const extension = import_path.default.extname(file).toLowerCase();
        const mediaType = getMediaTypeFromExtension(extension);
        if (!mediaType) continue;
        mediaFiles.push({
          id: filePath,
          name: import_path.default.parse(file).name,
          path: filePath,
          type: mediaType,
          extension,
          mtime: stats.mtime
        });
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }
    mediaFiles.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    console.log(`Found ${mediaFiles.length} media files`);
    return { success: true, files: mediaFiles, count: mediaFiles.length };
  } catch (error) {
    console.error("Error reading media folder:", error);
    return {
      success: false,
      error: "Failed to read media folder",
      files: [],
      count: 0
    };
  }
});
import_electron.ipcMain.handle("open-in-finder", async (_event, filePath) => {
  console.log("open-in-finder IPC called with:", filePath);
  try {
    const { shell } = await import("electron");
    shell.showItemInFolder(filePath);
    return { success: true, message: "File opened in Finder" };
  } catch (error) {
    console.error("Error opening file in Finder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
