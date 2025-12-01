"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProductHandlers = registerProductHandlers;
const electron_1 = require("electron");
const db_1 = require("../db");
const db = (0, db_1.getDatabase)();
// Handlers
function registerProductHandlers() {
    // Get All Products
    electron_1.ipcMain.handle('db:products:getAll', () => {
        return (0, db_1.runQuery)(() => {
            return db.prepare('SELECT * FROM products ORDER BY name ASC').all();
        });
    });
    // Search Products
    electron_1.ipcMain.handle('db:products:search', (_, query) => {
        return (0, db_1.runQuery)(() => {
            const searchTerm = `%${query}%`;
            return db.prepare(`
        SELECT * FROM products 
        WHERE name LIKE ? OR sku LIKE ? OR barcode LIKE ?
        LIMIT 50
      `).all(searchTerm, searchTerm, searchTerm);
        });
    });
    // Create Product
    electron_1.ipcMain.handle('db:products:create', (_, product) => {
        return (0, db_1.runQuery)(() => {
            const stmt = db.prepare(`
        INSERT INTO products (name, sku, barcode, price_cost, price_sell, stock_qty, min_stock_level, category, brand)
        VALUES (@name, @sku, @barcode, @price_cost, @price_sell, @stock_qty, @min_stock_level, @category, @brand)
      `);
            const info = stmt.run(product);
            return { id: info.lastInsertRowid, ...product };
        });
    });
    // Update Product
    electron_1.ipcMain.handle('db:products:update', (_, { id, ...product }) => {
        return (0, db_1.runQuery)(() => {
            const stmt = db.prepare(`
        UPDATE products 
        SET name = @name, sku = @sku, barcode = @barcode, 
            price_cost = @price_cost, price_sell = @price_sell, 
            min_stock_level = @min_stock_level, category = @category, brand = @brand
        WHERE id = @id
      `);
            stmt.run({ ...product, id });
            return { id, ...product };
        });
    });
    // Delete Product
    electron_1.ipcMain.handle('db:products:delete', (_, id) => {
        return (0, db_1.runQuery)(() => {
            db.prepare('DELETE FROM products WHERE id = ?').run(id);
            return true;
        });
    });
    // Adjust Stock
    electron_1.ipcMain.handle('db:products:adjustStock', (_, { id, quantity, reason }) => {
        return (0, db_1.runQuery)(() => {
            const transaction = db.transaction(() => {
                // Update stock
                db.prepare('UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?').run(quantity, id);
                // Log adjustment
                db.prepare('INSERT INTO stock_adjustments (product_id, quantity_change, reason) VALUES (?, ?, ?)').run(id, quantity, reason);
                // Return new stock
                const product = db.prepare('SELECT stock_qty FROM products WHERE id = ?').get(id);
                return product.stock_qty;
            });
            return transaction();
        });
    });
}
//# sourceMappingURL=db.products.js.map