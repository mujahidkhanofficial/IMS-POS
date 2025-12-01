"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSupplierHandlers = registerSupplierHandlers;
const electron_1 = require("electron");
const db_1 = require("../db");
function registerSupplierHandlers() {
    const db = (0, db_1.getDatabase)();
    electron_1.ipcMain.handle('db:suppliers:getAll', () => {
        return (0, db_1.runQuery)(() => {
            return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
        });
    });
    electron_1.ipcMain.handle('db:suppliers:create', (_, supplier) => {
        return (0, db_1.runQuery)(() => {
            const stmt = db.prepare('INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)');
            const info = stmt.run(supplier.name, supplier.contact, supplier.address);
            return { id: info.lastInsertRowid, ...supplier };
        });
    });
    electron_1.ipcMain.handle('db:suppliers:update', (_, supplier) => {
        return (0, db_1.runQuery)(() => {
            const stmt = db.prepare('UPDATE suppliers SET name = ?, contact = ?, address = ? WHERE id = ?');
            stmt.run(supplier.name, supplier.contact, supplier.address, supplier.id);
            return supplier;
        });
    });
    electron_1.ipcMain.handle('db:suppliers:delete', (_, id) => {
        return (0, db_1.runQuery)(() => {
            // Check if used in products
            const count = db.prepare('SELECT COUNT(*) as count FROM products WHERE supplier_id = ?').get(id);
            if (count.count > 0) {
                throw new Error('Cannot delete supplier associated with products.');
            }
            db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
            return { id };
        });
    });
}
//# sourceMappingURL=db.suppliers.js.map