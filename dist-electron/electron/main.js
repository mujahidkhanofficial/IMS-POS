"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
let mainWindow = null;
const createWindow = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        frame: false, // Custom title bar
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // Initialize Database
    try {
        (0, db_1.initializeDatabase)();
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
    }
    // Load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Window controls IPC
    electron_1.ipcMain.on('window-minimize', () => mainWindow?.minimize());
    electron_1.ipcMain.on('window-maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow.maximize();
        }
    });
    electron_1.ipcMain.on('window-close', () => mainWindow?.close());
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Backup IPC
const backup_1 = require("./backup");
electron_1.ipcMain.handle('backup:create', () => {
    return (0, backup_1.performBackup)();
});
electron_1.app.on('window-all-closed', () => {
    // Perform Auto-Backup
    (0, backup_1.performBackup)();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Database IPC
// IPC Handlers
electron_1.ipcMain.handle('get-app-version', () => electron_1.app.getVersion());
// Licensing IPC
const license_1 = require("./license");
electron_1.ipcMain.handle('license:get-machine-id', () => {
    return license_1.licenseManager.getMachineId();
});
electron_1.ipcMain.handle('license:validate-key', (_, key) => {
    return license_1.licenseManager.validateKey(key);
});
electron_1.ipcMain.handle('license:save-key', (_, key) => {
    return license_1.licenseManager.saveKey(key);
});
electron_1.ipcMain.handle('license:check', () => {
    return license_1.licenseManager.checkLicense();
});
// Print IPC
electron_1.ipcMain.handle('print:receipt', async (_, data) => {
    console.log('Printing Receipt:', data);
    // In a real app, this would send ESC/POS commands to a thermal printer
    // For now, we just log it.
    return { success: true };
});
// Database IPC
const db_products_1 = require("./ipc/db.products");
const db_reports_1 = require("./ipc/db.reports");
(0, db_products_1.registerProductHandlers)();
(0, db_reports_1.registerReportHandlers)();
//# sourceMappingURL=main.js.map