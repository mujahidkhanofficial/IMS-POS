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
            reports: {
                getDashboardData: () => Promise<{ success: boolean; data?: any; error?: string }>;
                getSalesReport: (range: { startDate: string, endDate: string }) => Promise<{ success: boolean; data?: any[]; error?: string }>;
                getLowStockReport: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
                exportCSV: (data: any[], filename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
            };
        };
        backup: {
            create: () => Promise<{ success: boolean; path?: string; error?: string }>;
        };
    };
}
