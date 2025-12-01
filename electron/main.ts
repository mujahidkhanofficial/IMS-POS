import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initializeDatabase } from './db';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        frame: false, // Custom title bar
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Initialize Database
    try {
        initializeDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }

    // Load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Window controls IPC
    ipcMain.on('window-minimize', () => mainWindow?.minimize());
    ipcMain.on('window-maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('window-close', () => mainWindow?.close());
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Backup IPC
import { performBackup } from './backup';

ipcMain.handle('backup:create', () => {
    return performBackup();
});

app.on('window-all-closed', () => {
    // Perform Auto-Backup
    performBackup();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Database IPC

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion());

// Licensing IPC
import { licenseManager } from './license';

ipcMain.handle('license:get-machine-id', () => {
    return licenseManager.getMachineId();
});

ipcMain.handle('license:validate-key', (_, key: string) => {
    return licenseManager.validateKey(key);
});

ipcMain.handle('license:save-key', (_, key: string) => {
    return licenseManager.saveKey(key);
});

ipcMain.handle('license:check', () => {
    return licenseManager.checkLicense();
});

// Print IPC
ipcMain.handle('print:receipt', async (_, data) => {
    console.log('Printing Receipt:', data);
    // In a real app, this would send ESC/POS commands to a thermal printer
    // For now, we just log it.
    return { success: true };
});

// Database IPC
import { registerProductHandlers } from './ipc/db.products';
import { registerReportHandlers } from './ipc/db.reports';

registerProductHandlers();
registerReportHandlers();

