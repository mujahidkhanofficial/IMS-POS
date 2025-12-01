"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
exports.runQuery = runQuery;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const schema_1 = require("../db/schema");
let db;
function getDatabase() {
    if (!db) {
        initializeDatabase();
    }
    return db;
}
function initializeDatabase() {
    const userDataPath = electron_1.app.getPath('userData');
    const dbPath = path_1.default.join(userDataPath, 'app.db');
    console.log(`Initializing database at: ${dbPath}`);
    try {
        db = new better_sqlite3_1.default(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        // Execute Schema
        db.exec(schema_1.schema);
        // Initialize Default Settings
        const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
        const insertMany = db.transaction((settings) => {
            for (const setting of settings)
                insertSetting.run(setting.key, setting.value);
        });
        insertMany(schema_1.defaultSettings);
        console.log('Database initialized successfully.');
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}
function runQuery(operation) {
    try {
        const data = operation();
        return { success: true, data };
    }
    catch (err) {
        console.error('Database Error:', err);
        return { success: false, error: err.message };
    }
}
//# sourceMappingURL=db.js.map