import { useState, useCallback, useMemo } from 'react';
import { Product, CartItem } from '../types';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const totals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
        const tax = subtotal * 0.0; // 0% tax for now, can be configured
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totals
    };
}
