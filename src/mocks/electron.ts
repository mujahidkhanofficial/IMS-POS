// Mock Electron API for Browser Development
if (!window.electron) {
    console.warn('Electron API not found. Using mock implementation for browser testing.');

    window.electron = {
        window: {
            minimize: () => console.log('Mock: Minimize'),
            maximize: () => console.log('Mock: Maximize'),
            close: () => console.log('Mock: Close'),
        },
        app: {
            getVersion: () => Promise.resolve('1.0.0-mock'),
        },
        ipcRenderer: {
            invoke: (channel, ...args) => {
                console.log(`Mock IPC Invoke: ${channel}`, args);
                return Promise.resolve({ success: true });
            },
            on: () => () => { },
            once: () => { },
        },
        license: {
            getMachineId: () => Promise.resolve('mock-machine-id'),
            validateKey: () => Promise.resolve(true),
            saveKey: () => Promise.resolve(true),
            check: () => Promise.resolve(true),
        },
        db: {
            products: {
                getAll: () => Promise.resolve({ success: true, data: [] }),
                search: () => Promise.resolve({ success: true, data: [] }),
                create: () => Promise.resolve({ success: true }),
                update: () => Promise.resolve({ success: true }),
                delete: () => Promise.resolve({ success: true }),
                adjustStock: () => Promise.resolve({ success: true }),
            },
            reports: {
                getDashboardData: () => Promise.resolve({
                    success: true,
                    data: {
                        salesToday: 1250.50,
                        transactionsToday: 15,
                        lowStockCount: 3,
                        revenueTrend: [
                            { date: '2023-10-01', total: 500 },
                            { date: '2023-10-02', total: 750 },
                            { date: '2023-10-03', total: 600 },
                            { date: '2023-10-04', total: 900 },
                            { date: '2023-10-05', total: 1200 },
                            { date: '2023-10-06', total: 850 },
                            { date: '2023-10-07', total: 1250 },
                        ]
                    }
                }),
                getSalesReport: () => Promise.resolve({ success: true, data: [] }),
                getLowStockReport: () => Promise.resolve({ success: true, data: [] }),
                exportCSV: () => Promise.resolve({ success: true }),
            },
        },
        backup: {
            create: () => Promise.resolve({ success: true }),
        }
    };
}

export { };
