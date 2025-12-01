import { ipcMain, shell, app } from 'electron';
import { getDatabase, runQuery } from '../db';
import path from 'path';
import fs from 'fs';

const db = getDatabase();

export function registerSettingsHandlers() {
    // Get Settings
    ipcMain.handle('settings:get', () => {
        return runQuery(() => {
            return db.prepare('SELECT * FROM settings').all();
        });
    });

    // Update Settings
    ipcMain.handle('settings:update', (_, { key, value }) => {
        return runQuery(() => {
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
    ipcMain.handle('backup:manual', async () => {
        // Reuse existing backup logic or call it
        // Assuming performBackup is exported from ../backup
        const { performBackup } = require('../backup');
        return performBackup();
    });

    // Open Backup Folder
    ipcMain.handle('backup:openFolder', async () => {
        const backupPath = path.join(app.getPath('userData'), 'backups');
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        await shell.openPath(backupPath);
        return true;
    });

    // Get App Version
    ipcMain.handle('app:getVersion', () => {
        return app.getVersion();
    });
}
