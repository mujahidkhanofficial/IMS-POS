import { ipcMain } from 'electron';
import { getDatabase, runQuery } from '../db';

export function registerSupplierHandlers() {
    const db = getDatabase();

    ipcMain.handle('db:suppliers:getAll', () => {
        return runQuery(() => {
            return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
        });
    });

    ipcMain.handle('db:suppliers:create', (_, supplier) => {
        return runQuery(() => {
            const stmt = db.prepare('INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)');
            const info = stmt.run(supplier.name, supplier.contact, supplier.address);
            return { id: info.lastInsertRowid, ...supplier };
        });
    });

    ipcMain.handle('db:suppliers:update', (_, supplier) => {
        return runQuery(() => {
            const stmt = db.prepare('UPDATE suppliers SET name = ?, contact = ?, address = ? WHERE id = ?');
            stmt.run(supplier.name, supplier.contact, supplier.address, supplier.id);
            return supplier;
        });
    });

    ipcMain.handle('db:suppliers:delete', (_, id) => {
        return runQuery(() => {
            // Check if used in products
            const count = db.prepare('SELECT COUNT(*) as count FROM products WHERE supplier_id = ?').get(id) as { count: number };
            if (count.count > 0) {
                throw new Error('Cannot delete supplier associated with products.');
            }
            db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
            return { id };
        });
    });
}
