"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPrinterHandlers = registerPrinterHandlers;
const electron_1 = require("electron");
function registerPrinterHandlers() {
    // Get list of available printers
    electron_1.ipcMain.handle('print:getPrinters', async (event) => {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window)
            return [];
        return window.webContents.getPrintersAsync();
    });
    // Print Receipt
    electron_1.ipcMain.handle('print:receipt', async (_, data) => {
        const { printerName, width = '58mm', items, total, storeName, address, invoiceNumber, date } = data;
        // Create a hidden window for rendering the receipt
        let printWindow = new electron_1.BrowserWindow({
            show: false,
            width: width === '58mm' ? 250 : 350, // Approx width in px
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            }
        });
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        margin: 0;
                        padding: 5px;
                        width: 100%;
                        color: black;
                        background: white;
                    }
                    .header { text-align: center; margin-bottom: 10px; }
                    .store-name { font-size: 16px; font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 5px 0; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .totals { margin-top: 10px; text-align: right; }
                    .footer { text-align: center; margin-top: 15px; font-size: 10px; }
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="store-name">${storeName || 'Store Name'}</div>
                    <div>${address || ''}</div>
                    <div class="divider"></div>
                    <div>Invoice: ${invoiceNumber}</div>
                    <div>${new Date(date).toLocaleString()}</div>
                </div>
                
                <div class="divider"></div>

                <div class="items">
                    ${items.map((item) => `
                        <div class="item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="divider"></div>

                <div class="totals">
                    <div><strong>Total: $${Number(total).toFixed(2)}</strong></div>
                </div>

                <div class="footer">
                    Thank you for your purchase!
                </div>
            </body>
            </html>
        `;
        try {
            await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
            const options = {
                silent: true,
                deviceName: printerName,
            };
            // If no printer name provided, it will use default
            await printWindow.webContents.print(options);
            printWindow.close();
            return { success: true };
        }
        catch (error) {
            console.error('Printing failed:', error);
            if (!printWindow.isDestroyed())
                printWindow.close();
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=printer.js.map