/// <reference types="vite/client" />

interface Window {
    electron: {
        window: {
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
        app: {
            getVersion: () => Promise<string>;
        };
        ipcRenderer: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            on: (channel: string, func: (...args: any[]) => void) => () => void;
            once: (channel: string, func: (...args: any[]) => void) => void;
        };
        license: {
            getMachineId: () => Promise<string>;
            validateKey: (key: string) => Promise<boolean>;
            saveKey: (key: string) => Promise<boolean>;
            check: () => Promise<boolean>;
            getStatus: () => Promise<{ licensed: boolean; machineId: string }>;
            submit: (key: string) => Promise<boolean>;
        };
        db: {
            products: {
                getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
                search: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
                create: (product: any) => Promise<{ success: boolean; data?: any; error?: string }>;
                update: (product: any) => Promise<{ success: boolean; data?: any; error?: string }>;
                delete: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
                adjustStock: (id: number, quantity: number, reason: string) => Promise<{ success: boolean; data?: number; error?: string }>;
            };
            suppliers: {
                getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
                create: (supplier: any) => Promise<{ success: boolean; data?: any; error?: string }>;
                update: (supplier: any) => Promise<{ success: boolean; data?: any; error?: string }>;
                delete: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            };
            purchases: {
                getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
                create: (purchase: any) => Promise<{ success: boolean; data?: any; error?: string }>;
            };
            reports: {
                getDashboardData: () => Promise<{ success: boolean; data?: any; error?: string }>;
                getSalesReport: (range: { startDate: string, endDate: string }) => Promise<{ success: boolean; data?: any[]; error?: string }>;
                getLowStockReport: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
                exportCSV: (data: any[], filename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
            };
        };
        backup: {
            create: () => Promise<{ success: boolean; path?: string; error?: string }>;
            manual: () => Promise<{ success: boolean; path?: string; error?: string }>;
            openFolder: () => Promise<boolean>;
        };
        settings: {
            get: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
            update: (settings: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        };
        printer: {
            getPrinters: () => Promise<any[]>;
            printReceipt: (data: any) => Promise<{ success: boolean; error?: string }>;
        };
    };
}
