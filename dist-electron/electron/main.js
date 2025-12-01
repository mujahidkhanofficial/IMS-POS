"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const license_1 = require("./license");
const db_products_1 = require("./ipc/db.products");
const db_reports_1 = require("./ipc/db.reports");
const settings_1 = require("./ipc/settings");
const db_suppliers_1 = require("./ipc/db.suppliers");
const db_purchases_1 = require("./ipc/db.purchases");
const backup_1 = require("./backup");
// Disable hardware acceleration to prevent potential rendering issues
electron_1.app.disableHardwareAcceleration();
let mainWindow = null;
let licenseWindow = null;
const DIST = path_1.default.join(__dirname, '../../dist');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] || (!electron_1.app.isPackaged ? 'http://localhost:5173' : undefined);
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.join(process.env.VITE_PUBLIC || DIST, 'electron-vite.svg'),
        frame: false, // Custom titlebar
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(path_1.default.join(DIST, 'index.html'));
    }
    // Window Controls IPC
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
}
function createLicenseWindow() {
    licenseWindow = new electron_1.BrowserWindow({
        width: 600,
        height: 500,
        resizable: false,
        frame: true, // Standard frame for license window
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (VITE_DEV_SERVER_URL) {
        licenseWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/activate`);
    }
    else {
        licenseWindow.loadURL(`file://${path_1.default.join(DIST, 'index.html')}#/activate`);
    }
    // Handle close
    licenseWindow.on('closed', () => {
        licenseWindow = null;
        // If main window isn't open, quit app
        if (!mainWindow) {
            electron_1.app.quit();
        }
    });
}
electron_1.app.whenReady().then(() => {
    // Register DB Handlers
    (0, db_products_1.registerProductHandlers)();
    (0, db_reports_1.registerReportHandlers)();
    (0, settings_1.registerSettingsHandlers)();
    (0, db_suppliers_1.registerSupplierHandlers)();
    (0, db_purchases_1.registerPurchaseHandlers)();
    // Check License
    const stored = license_1.licenseManager.loadLicense();
    let isValid = false;
    if (stored?.key) {
        isValid = license_1.licenseManager.validateKey(stored.key);
    }
    if (isValid) {
        createMainWindow();
    }
    else {
        createLicenseWindow();
    }
});
// License IPC
electron_1.ipcMain.handle('license:get-machine-id', () => {
    return license_1.licenseManager.getMachineId();
});
electron_1.ipcMain.handle('license:submit', (_, key) => {
    const isValid = license_1.licenseManager.validateKey(key);
    if (isValid) {
        license_1.licenseManager.saveLicense(key);
        createMainWindow();
        if (licenseWindow) {
            licenseWindow.close();
        }
        return true;
    }
    return false;
});
electron_1.ipcMain.handle('license:check', () => {
    const stored = license_1.licenseManager.loadLicense();
    if (stored?.key) {
        return license_1.licenseManager.validateKey(stored.key);
    }
    return false;
});
electron_1.ipcMain.handle('license:getStatus', () => {
    try {
        const stored = license_1.licenseManager.loadLicense();
        const isValid = stored?.key ? license_1.licenseManager.validateKey(stored.key) : false;
        return {
            licensed: isValid,
            machineId: license_1.licenseManager.getMachineId() || 'UNKNOWN-ID'
        };
    }
    catch (error) {
        console.error('[Main] Error in license:getStatus:', error);
        return {
            licensed: false,
            machineId: 'ERROR-FETCHING-ID'
        };
    }
});
// App Lifecycle
electron_1.app.on('window-all-closed', () => {
    (0, backup_1.performBackup)();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        const stored = license_1.licenseManager.loadLicense();
        if (stored?.key && license_1.licenseManager.validateKey(stored.key)) {
            createMainWindow();
        }
        else {
            createLicenseWindow();
        }
    }
});
// Misc IPC
electron_1.ipcMain.handle('get-app-version', () => electron_1.app.getVersion());
electron_1.ipcMain.handle('backup:create', () => (0, backup_1.performBackup)());
//# sourceMappingURL=main.js.map