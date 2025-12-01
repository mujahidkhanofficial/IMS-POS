import { useState, useCallback } from 'react';

export function useReports() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [lowStockData, setLowStockData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSalesReport = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        try {
            const result = await window.electron.db.reports.getSalesReport({ startDate, endDate });
            if (result.success) {
                setSalesData(result.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLowStockReport = useCallback(async () => {
        setLoading(true);
        try {
            const result = await window.electron.db.reports.getLowStockReport();
            if (result.success) {
                setLowStockData(result.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportCSV = async (data: any[], filename: string) => {
        try {
            const result = await window.electron.db.reports.exportCSV(data, filename);
            return result.success;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return { salesData, lowStockData, loading, fetchSalesReport, fetchLowStockReport, exportCSV };
}
