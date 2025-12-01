import { ipcMain, dialog } from 'electron';
import { getDatabase, runQuery } from '../db';
import fs from 'fs';
import path from 'path';

const db = getDatabase();

export function registerReportHandlers() {

    // Dashboard KPI Data
    ipcMain.handle('db:reports:dashboard', () => {
        return runQuery(() => {
            const today = new Date().toISOString().split('T')[0];

            // Sales Today
            const salesToday = db.prepare(`
        SELECT SUM(total_amount) as total, COUNT(*) as count 
        FROM invoices 
        WHERE date(created_at) = ?
      `).get(today) as { total: number, count: number };

            // Low Stock Count
            const lowStock = db.prepare(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE stock_qty <= min_stock_level
      `).get() as { count: number };

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
    ipcMain.handle('db:reports:sales', (_, { startDate, endDate }: { startDate: string, endDate: string }) => {
        return runQuery(() => {
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
    ipcMain.handle('db:reports:low-stock', () => {
        return runQuery(() => {
            return db.prepare(`
        SELECT * FROM products 
        WHERE stock_qty <= min_stock_level
        ORDER BY stock_qty ASC
      `).all();
        });
    });

    // CSV Export
    ipcMain.handle('db:reports:export-csv', async (_, { data, filename }: { data: any[], filename: string }) => {
        try {
            if (!data || data.length === 0) return { success: false, error: 'No data to export' };

            const { filePath } = await dialog.showSaveDialog({
                title: 'Export Report',
                defaultPath: filename,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });

            if (!filePath) return { success: false, cancelled: true };

            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ].join('\n');

            fs.writeFileSync(filePath, csvContent);
            return { success: true, filePath };
        } catch (error: any) {
            console.error('Export failed:', error);
            return { success: false, error: error.message };
        }
    });
}
