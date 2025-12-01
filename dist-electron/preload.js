"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    window: {
        minimize: () => electron_1.ipcRenderer.send('window-minimize'),
        maximize: () => electron_1.ipcRenderer.send('window-maximize'),
        close: () => electron_1.ipcRenderer.send('window-close'),
    },
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    },
    // Secure IPC wrapper
    ipcRenderer: {
        invoke: (channel, ...args) => electron_1.ipcRenderer.invoke(channel, ...args),
        on: (channel, func) => {
            const subscription = (_event, ...args) => func(...args);
            electron_1.ipcRenderer.on(channel, subscription);
            return () => electron_1.ipcRenderer.removeListener(channel, subscription);
        },
        once: (channel, func) => {
            electron_1.ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
    license: {
        getMachineId: () => electron_1.ipcRenderer.invoke('license:get-machine-id'),
        validateKey: (key) => electron_1.ipcRenderer.invoke('license:validate-key', key),
        saveKey: (key) => electron_1.ipcRenderer.invoke('license:save-key', key),
        check: () => electron_1.ipcRenderer.invoke('license:check'),
        getStatus: () => electron_1.ipcRenderer.invoke('license:getStatus'),
        submit: (key) => electron_1.ipcRenderer.invoke('license:submit', key),
    },
    db: {
        products: {
            getAll: () => electron_1.ipcRenderer.invoke('db:products:getAll'),
            search: (query) => electron_1.ipcRenderer.invoke('db:products:search', query),
            create: (product) => electron_1.ipcRenderer.invoke('db:products:create', product),
            update: (product) => electron_1.ipcRenderer.invoke('db:products:update', product),
            delete: (id) => electron_1.ipcRenderer.invoke('db:products:delete', id),
            adjustStock: (id, quantity, reason) => electron_1.ipcRenderer.invoke('db:products:adjustStock', { id, quantity, reason }),
        },
        reports: {
            getDashboardData: () => electron_1.ipcRenderer.invoke('db:reports:dashboard'),
            getSalesReport: (range) => electron_1.ipcRenderer.invoke('db:reports:sales', range),
            getLowStockReport: () => electron_1.ipcRenderer.invoke('db:reports:low-stock'),
            exportCSV: (data, filename) => electron_1.ipcRenderer.invoke('db:reports:export-csv', { data, filename }),
        },
    },
    backup: {
        create: () => electron_1.ipcRenderer.invoke('backup:create'),
        manual: () => electron_1.ipcRenderer.invoke('backup:manual'),
        openFolder: () => electron_1.ipcRenderer.invoke('backup:openFolder'),
    },
    settings: {
        get: () => electron_1.ipcRenderer.invoke('settings:get'),
        update: (settings) => electron_1.ipcRenderer.invoke('settings:update', settings),
    },
});
//# sourceMappingURL=preload.js.map