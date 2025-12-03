import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { licenseManager } from './license';
import { registerProductHandlers } from './ipc/db.products';
import { registerReportHandlers } from './ipc/db.reports';
import { registerSettingsHandlers } from './ipc/settings';
import { registerSupplierHandlers } from './ipc/db.suppliers';
import { registerPurchaseHandlers } from './ipc/db.purchases';
import { registerPrinterHandlers } from './ipc/printer';
import { performBackup } from './backup';

// Disable hardware acceleration to prevent potential rendering issues
app.disableHardwareAcceleration();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

let mainWindow: BrowserWindow | null = null;
let licenseWindow: BrowserWindow | null = null;

const DIST = path.join(__dirname, '../../dist');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] || (!app.isPackaged ? 'http://localhost:5173' : undefined);

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(process.env.VITE_PUBLIC || DIST, 'electron-vite.svg'),
        frame: false, // Custom titlebar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(DIST, 'index.html'));
    }

    // Window Controls IPC
    ipcMain.on('window-minimize', () => mainWindow?.minimize());
    ipcMain.on('window-maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('window-close', () => mainWindow?.close());
}

function createLicenseWindow() {
    licenseWindow = new BrowserWindow({
        width: 600,
        height: 500,
        resizable: false,
        frame: true, // Standard frame for license window
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        licenseWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/activate`);
    } else {
        licenseWindow.loadURL(`file://${path.join(DIST, 'index.html')}#/activate`);
    }

    // Handle close
    licenseWindow.on('closed', () => {
        licenseWindow = null;
        // If main window isn't open, quit app
        if (!mainWindow) {
            app.quit();
        }
    });
}

app.whenReady().then(() => {
    console.log('App Ready. Registering handlers...');
    try {
        // Register DB Handlers
        registerProductHandlers();
        console.log('Product handlers registered.');
        registerReportHandlers();
        console.log('Report handlers registered.');
        registerSettingsHandlers();
        console.log('Settings handlers registered.');
        registerSupplierHandlers();
        console.log('Supplier handlers registered.');
        registerPurchaseHandlers();
        console.log('Purchase handlers registered.');
        registerPrinterHandlers();
        console.log('Printer handlers registered.');

        // Check License
        console.log('Checking license...');
        const stored = licenseManager.loadLicense();
        let isValid = false;
        if (stored?.key) {
            isValid = licenseManager.validateKey(stored.key);
        }
        console.log('License check complete. Valid:', isValid);

        if (isValid) {
            createMainWindow();
        } else {
            createLicenseWindow();
        }
    } catch (error) {
        console.error('CRITICAL ERROR during startup:', error);
    }
});

// License IPC
ipcMain.handle('license:get-machine-id', () => {
    return licenseManager.getMachineId();
});

ipcMain.handle('license:submit', (_, key: string) => {
    const isValid = licenseManager.validateKey(key);
    if (isValid) {
        licenseManager.saveLicense(key);
        createMainWindow();
        if (licenseWindow) {
            licenseWindow.close();
        }
        return true;
    }
    return false;
});

ipcMain.handle('license:check', () => {
    const stored = licenseManager.loadLicense();
    if (stored?.key) {
        return licenseManager.validateKey(stored.key);
    }
    return false;
});

ipcMain.handle('license:getStatus', () => {
    try {
        const stored = licenseManager.loadLicense();
        const isValid = stored?.key ? licenseManager.validateKey(stored.key) : false;
        return {
            licensed: isValid,
            machineId: licenseManager.getMachineId() || 'UNKNOWN-ID'
        };
    } catch (error) {
        console.error('[Main] Error in license:getStatus:', error);
        return {
            licensed: false,
            machineId: 'ERROR-FETCHING-ID'
        };
    }
});

// App Lifecycle
app.on('window-all-closed', () => {
    performBackup();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const stored = licenseManager.loadLicense();
        if (stored?.key && licenseManager.validateKey(stored.key)) {
            createMainWindow();
        } else {
            createLicenseWindow();
        }
    }
});

// Misc IPC
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('backup:create', () => performBackup());
