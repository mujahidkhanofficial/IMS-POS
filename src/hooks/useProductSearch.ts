import { useState, useCallback } from 'react';
import { Product } from '../types';

export function useProductSearch() {
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const search = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const result = await window.electron.db.products.search(query);
            if (result.success) {
                setResults(result.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { results, loading, search };
}
