import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const result = await window.electron.db.products.getAll();
            if (result.success) {
                setProducts(result.data || []);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch products');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const deleteProduct = async (id: number) => {
        const result = await window.electron.db.products.delete(id);
        if (result.success) {
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        }
        return false;
    };

    const createProduct = async (product: Omit<Product, 'id'>) => {
        console.log('[useProducts] Creating product:', product);
        const result = await window.electron.db.products.create(product);
        console.log('[useProducts] Create result:', result);
        if (result.success) {
            setProducts(prev => {
                console.log('[useProducts] Updating state with:', result.data);
                return [...prev, result.data];
            });
            return true;
        }
        console.error('[useProducts] Create failed:', result.error);
        return false;
    };

    const updateProduct = async (product: Product) => {
        const result = await window.electron.db.products.update(product);
        if (result.success) {
            setProducts(prev => prev.map(p => p.id === product.id ? result.data : p));
            return true;
        }
        return false;
    };

    return { products, loading, error, refetch: fetchProducts, deleteProduct, createProduct, updateProduct };
}
