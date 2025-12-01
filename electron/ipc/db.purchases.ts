import { ipcMain } from 'electron';
import { getDatabase, runQuery } from '../db';

export function registerPurchaseHandlers() {
    const db = getDatabase();

    ipcMain.handle('db:purchases:getAll', () => {
        return runQuery(() => {
            return db.prepare(`
                SELECT p.*, s.name as supplier_name 
                FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id 
                ORDER BY p.date DESC
            `).all();
        });
    });

    ipcMain.handle('db:purchases:create', (_, { supplierId, invoiceNumber, items, date }) => {
        return runQuery(() => {
            const transaction = db.transaction(() => {
                // 1. Create Purchase Record
                const purchaseStmt = db.prepare(`
                    INSERT INTO purchases (supplier_id, invoice_number, total_amount, date)
                    VALUES (?, ?, ?, ?)
                `);

                const totalAmount = items.reduce((sum: number, item: any) => sum + item.total, 0);
                const info = purchaseStmt.run(supplierId, invoiceNumber, totalAmount, date);
                const purchaseId = info.lastInsertRowid;

                // 2. Process Items
                const itemStmt = db.prepare(`
                    INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total)
                    VALUES (?, ?, ?, ?, ?)
                `);

                const updateProductStmt = db.prepare(`
                    UPDATE products 
                    SET stock_qty = stock_qty + ?, 
                        price_cost = ? 
                    WHERE id = ?
                `);

                const logStmt = db.prepare(`
                    INSERT INTO stock_adjustments (product_id, quantity_change, reason)
                    VALUES (?, ?, ?)
                `);

                for (const item of items) {
                    // Insert Item
                    itemStmt.run(purchaseId, item.productId, item.quantity, item.unitCost, item.total);

                    // Update Product Stock & Cost (Last Cost Strategy)
                    updateProductStmt.run(item.quantity, item.unitCost, item.productId);

                    // Log Adjustment
                    logStmt.run(item.productId, item.quantity, `Purchase Invoice: ${invoiceNumber}`);
                }

                return { id: purchaseId };
            });

            return transaction();
        });
    });
}
