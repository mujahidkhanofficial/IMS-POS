import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    window: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
    },
    app: {
        getVersion: () => ipcRenderer.invoke('get-app-version'),
    },
    // Secure IPC wrapper
    ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
        on: (channel: string, func: (...args: any[]) => void) => {
            const subscription = (_event: any, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        },
        once: (channel: string, func: (...args: any[]) => void) => {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
    license: {
        getMachineId: () => ipcRenderer.invoke('license:get-machine-id'),
        validateKey: (key: string) => ipcRenderer.invoke('license:validate-key', key),
        saveKey: (key: string) => ipcRenderer.invoke('license:save-key', key),
        check: () => ipcRenderer.invoke('license:check'),
    },
    db: {
        products: {
            getAll: () => ipcRenderer.invoke('db:products:getAll'),
            search: (query: string) => ipcRenderer.invoke('db:products:search', query),
            create: (product: any) => ipcRenderer.invoke('db:products:create', product),
            update: (product: any) => ipcRenderer.invoke('db:products:update', product),
            delete: (id: number) => ipcRenderer.invoke('db:products:delete', id),
            adjustStock: (id: number, quantity: number, reason: string) => ipcRenderer.invoke('db:products:adjustStock', { id, quantity, reason }),
        },
        reports: {
            getDashboardData: () => ipcRenderer.invoke('db:reports:dashboard'),
            getSalesReport: (range: { startDate: string, endDate: string }) => ipcRenderer.invoke('db:reports:sales', range),
            getLowStockReport: () => ipcRenderer.invoke('db:reports:low-stock'),
            exportCSV: (data: any[], filename: string) => ipcRenderer.invoke('db:reports:export-csv', { data, filename }),
        },
    },
    backup: {
        create: () => ipcRenderer.invoke('backup:create'),
    },
});
