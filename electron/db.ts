import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { schema, defaultSettings } from '../db/schema';

let db: Database.Database;

export function getDatabase() {
  if (!db) {
    initializeDatabase();
  }
  return db;
}

export function initializeDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'app.db');

  console.log(`Initializing database at: ${dbPath}`);

  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Execute Schema
    db.exec(schema);

    // Migrations: Check for missing columns in existing tables
    try {
      const tableInfo = db.pragma('table_info(products)') as any[];
      const hasBrand = tableInfo.some(col => col.name === 'brand');
      if (!hasBrand) {
        console.log('Migrating: Adding brand column to products table...');
        db.prepare('ALTER TABLE products ADD COLUMN brand TEXT').run();
      }
    } catch (err) {
      console.error('Migration failed:', err);
    }

    // Initialize Default Settings
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    const insertMany = db.transaction((settings) => {
      for (const setting of settings) insertSetting.run(setting.key, setting.value);
    });
    insertMany(defaultSettings);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Generic Response Wrapper
export interface DBResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function runQuery<T>(operation: () => T): DBResult<T> {
  try {
    const data = operation();
    return { success: true, data };
  } catch (err: any) {
    console.error('Database Error:', err);
    return { success: false, error: err.message };
  }
}
