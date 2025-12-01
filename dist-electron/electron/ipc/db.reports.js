"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerReportHandlers = registerReportHandlers;
const electron_1 = require("electron");
const db_1 = require("../db");
const fs_1 = __importDefault(require("fs"));
const db = (0, db_1.getDatabase)();
function registerReportHandlers() {
    // Dashboard KPI Data
    electron_1.ipcMain.handle('db:reports:dashboard', () => {
        return (0, db_1.runQuery)(() => {
            const today = new Date().toISOString().split('T')[0];
            // Sales Today
            const salesToday = db.prepare(`
        SELECT SUM(total_amount) as total, COUNT(*) as count 
        FROM invoices 
        WHERE date(created_at) = ?
      `).get(today);
            // Low Stock Count
            const lowStock = db.prepare(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE stock_qty <= min_stock_level
      `).get();
            // 7-Day Revenue Trend
            const revenueTrend = db.prepare(`
        SELECT date(created_at) as date, SUM(total_amount) as total
        FROM invoices
        WHERE created_at >= date('now', '-6 days')
        GROUP BY date(created_at)
        ORDER BY date(created_at) ASC
      `).all();
            return {
                salesToday: salesToday.total || 0,
                transactionsToday: salesToday.count || 0,
                lowStockCount: lowStock.count || 0,
                revenueTrend
            };
        });
    });
    // Sales Report
    electron_1.ipcMain.handle('db:reports:sales', (_, { startDate, endDate }) => {
        return (0, db_1.runQuery)(() => {
            return db.prepare(`
        SELECT i.id, i.invoice_number, i.created_at, i.total_amount, i.payment_method, c.name as customer_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE date(i.created_at) BETWEEN ? AND ?
        ORDER BY i.created_at DESC
      `).all(startDate, endDate);
        });
    });
    // Low Stock Report
    electron_1.ipcMain.handle('db:reports:low-stock', () => {
        return (0, db_1.runQuery)(() => {
            return db.prepare(`
        SELECT * FROM products 
        WHERE stock_qty <= min_stock_level
        ORDER BY stock_qty ASC
      `).all();
        });
    });
    // CSV Export
    electron_1.ipcMain.handle('db:reports:export-csv', async (_, { data, filename }) => {
        try {
            if (!data || data.length === 0)
                return { success: false, error: 'No data to export' };
            const { filePath } = await electron_1.dialog.showSaveDialog({
                title: 'Export Report',
                defaultPath: filename,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });
            if (!filePath)
                return { success: false, cancelled: true };
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ].join('\n');
            fs_1.default.writeFileSync(filePath, csvContent);
            return { success: true, filePath };
        }
        catch (error) {
            console.error('Export failed:', error);
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=db.reports.js.map