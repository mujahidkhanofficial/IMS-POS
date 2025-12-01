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
    },
});
//# sourceMappingURL=preload.js.map