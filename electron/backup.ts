import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function performBackup(): { success: boolean; path?: string; error?: string } {
    try {
        const dbPath = path.join(app.getPath('userData'), 'ims.db');

        // Check if DB exists
        if (!fs.existsSync(dbPath)) {
            return { success: false, error: 'Database file not found' };
        }

        // Create Backup Directory
        const backupDir = path.join(app.getPath('documents'), 'App_Backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Generate Timestamped Filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `ims_backup_${timestamp}.db`);

        // Copy File
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Backup created at: ${backupPath}`);

        return { success: true, path: backupPath };
    } catch (error: any) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
}
