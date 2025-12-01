import { ipcMain } from 'electron';
import { getDatabase, runQuery } from '../db';

const db = getDatabase();

// Types
interface ProductInput {
    name: string;
    sku?: string;
    barcode?: string;
    price_cost: number;
    price_sell: number;
    stock_qty: number;
    min_stock_level: number;
    category?: string;
    brand?: string;
}

// Handlers
export function registerProductHandlers() {

    // Get All Products
    ipcMain.handle('db:products:getAll', () => {
        return runQuery(() => {
            return db.prepare('SELECT * FROM products ORDER BY name ASC').all();
        });
    });

    // Search Products
    ipcMain.handle('db:products:search', (_, query: string) => {
        return runQuery(() => {
            const searchTerm = `%${query}%`;
            return db.prepare(`
        SELECT * FROM products 
        WHERE name LIKE ? OR sku LIKE ? OR barcode LIKE ?
        LIMIT 50
      `).all(searchTerm, searchTerm, searchTerm);
        });
    });

    // Create Product
    ipcMain.handle('db:products:create', (_, product: ProductInput) => {
        return runQuery(() => {
            const stmt = db.prepare(`
        INSERT INTO products (name, sku, barcode, price_cost, price_sell, stock_qty, min_stock_level, category, brand)
        VALUES (@name, @sku, @barcode, @price_cost, @price_sell, @stock_qty, @min_stock_level, @category, @brand)
      `);
            const info = stmt.run(product);
            return { id: info.lastInsertRowid, ...product };
        });
    });

    // Update Product
    ipcMain.handle('db:products:update', (_, { id, ...product }: ProductInput & { id: number }) => {
        return runQuery(() => {
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
    ipcMain.handle('db:products:delete', (_, id: number) => {
        return runQuery(() => {
            db.prepare('DELETE FROM products WHERE id = ?').run(id);
            return true;
        });
    });

    // Adjust Stock
    ipcMain.handle('db:products:adjustStock', (_, { id, quantity, reason }: { id: number, quantity: number, reason: string }) => {
        return runQuery(() => {
            const transaction = db.transaction(() => {
                // Update stock
                db.prepare('UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?').run(quantity, id);

                // Log adjustment
                db.prepare('INSERT INTO stock_adjustments (product_id, quantity_change, reason) VALUES (?, ?, ?)').run(id, quantity, reason);

                // Return new stock
                const product = db.prepare('SELECT stock_qty FROM products WHERE id = ?').get(id) as { stock_qty: number };
                return product.stock_qty;
            });
            return transaction();
        });
    });
}
