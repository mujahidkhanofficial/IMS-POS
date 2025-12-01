"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performBackup = performBackup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
function performBackup() {
    try {
        const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'ims.db');
        // Check if DB exists
        if (!fs_1.default.existsSync(dbPath)) {
            return { success: false, error: 'Database file not found' };
        }
        // Create Backup Directory
        const backupDir = path_1.default.join(electron_1.app.getPath('documents'), 'App_Backups');
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        // Generate Timestamped Filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path_1.default.join(backupDir, `ims_backup_${timestamp}.db`);
        // Copy File
        fs_1.default.copyFileSync(dbPath, backupPath);
        console.log(`Backup created at: ${backupPath}`);
        return { success: true, path: backupPath };
    }
    catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=backup.js.map