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
            // Check if settings table exists, if not create it (or assume it exists from schema)
            // For now, let's assume a simple key-value store or a single row table
            // Let's use a single row table 'store_settings'
            const settings = db.prepare('SELECT * FROM store_settings LIMIT 1').get();
            if (!settings) {
                // Return defaults
                return {
                    storeName: 'My Store',
                    address: '',
                    phone: '',
                    taxRate: 0
                };
            }
            return settings;
        });
    });
    // Update Settings
    electron_1.ipcMain.handle('settings:update', (_, settings) => {
        return (0, db_1.runQuery)(() => {
            const existing = db.prepare('SELECT id FROM store_settings LIMIT 1').get();
            if (existing) {
                db.prepare(`
                    UPDATE store_settings 
                    SET store_name = @storeName, address = @address, phone = @phone, tax_rate = @taxRate
                    WHERE id = @id
                `).run({ ...settings, id: existing.id });
            }
            else {
                db.prepare(`
                    INSERT INTO store_settings (store_name, address, phone, tax_rate)
                    VALUES (@storeName, @address, @phone, @taxRate)
                `).run(settings);
            }
            return true;
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