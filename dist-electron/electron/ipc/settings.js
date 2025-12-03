"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSettingsHandlers = registerSettingsHandlers;
const electron_1 = require("electron");
const db_1 = require("../db");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db = (0, db_1.getDatabase)();
function registerSettingsHandlers() {
    // Get Settings
    electron_1.ipcMain.handle('settings:get', () => {
        return (0, db_1.runQuery)(() => {
            return db.prepare('SELECT * FROM settings').all();
        });
    });
    // Update Settings
    electron_1.ipcMain.handle('settings:update', (_, { key, value }) => {
        return (0, db_1.runQuery)(() => {
            const stmt = db.prepare(`
                INSERT INTO settings (key, value) 
                VALUES (@key, @value) 
                ON CONFLICT(key) DO UPDATE SET value = @value
            `);
            stmt.run({ key, value });
            return { key, value };
        });
    });
    // Backup Manual
    electron_1.ipcMain.handle('backup:manual', async () => {
        // Reuse existing backup logic or call it
        // Assuming performBackup is exported from ../backup
        const { performBackup } = require('../backup');
        return performBackup();
    });
    // Open Backup Folder
    electron_1.ipcMain.handle('backup:openFolder', async () => {
        const backupPath = path_1.default.join(electron_1.app.getPath('userData'), 'backups');
        if (!fs_1.default.existsSync(backupPath)) {
            fs_1.default.mkdirSync(backupPath, { recursive: true });
        }
        await electron_1.shell.openPath(backupPath);
        return true;
    });
    // Get App Version
    electron_1.ipcMain.handle('app:getVersion', () => {
        return electron_1.app.getVersion();
    });
}
//# sourceMappingURL=settings.js.map