import { useState, useEffect, useCallback } from 'react';

interface DashboardData {
    salesToday: number;
    transactionsToday: number;
    lowStockCount: number;
    revenueTrend: { date: string; total: number }[];
}

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await window.electron.db.reports.getDashboardData();
            if (result.success) {
                setData(result.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, refetch: fetchData };
}
