import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useCart } from '@/hooks/useCart';
import { useBarcodeListener } from '@/hooks/useBarcodeListener';
import { ProductCard } from '@/components/pos/ProductCard';
import { CartItem } from '@/components/pos/CartItem';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Trash2 } from 'lucide-react';

export default function POS() {
    const { products, loading: productsLoading } = useProducts();
    const { results: searchResults, search, loading: searchLoading } = useProductSearch();
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totals } = useCart();

    const [searchQuery, setSearchQuery] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus search on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Handle Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) search(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, search]);

    // Barcode Listener
    useBarcodeListener((barcode) => {
        const product = products.find(p => p.barcode === barcode || p.sku === barcode);
        if (product) {
            addToCart(product);
            // Play beep sound (optional)
        } else {
            // Show error toast
            console.warn('Product not found:', barcode);
        }
    });

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F10') {
                e.preventDefault();
                if (cart.length > 0) setIsCheckoutOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]);

    const displayedProducts = searchQuery ? searchResults : products;

    const handleCheckout = async (method: 'cash' | 'card' | 'transfer', amountReceived: number) => {
        // 1. Create Invoice Object
        const invoice = {
            total_amount: totals.total,
            tax_amount: totals.tax,
            subtotal_amount: totals.subtotal,
            payment_method: method,
            items: cart
        };

        // 2. Save to DB (TODO: Implement Invoice IPC)
        console.log('Saving Invoice:', invoice);

        // 3. Print Receipt
        try {
            // Fetch store settings for receipt header
            const settingsResult = await window.electron.settings.get();
            const settings = settingsResult.success && settingsResult.data
                ? settingsResult.data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
                : {};

            await window.electron.printer.printReceipt({
                printerName: settings.printer_name,
                width: settings.printer_width,
                storeName: settings.store_name || 'My Store',
                address: settings.store_address || '',
                invoiceNumber: `INV-${Date.now()}`, // Temporary ID generation
                date: new Date().toISOString(),
                items: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price_sell
                })),
                total: totals.total,
                amount_received: amountReceived,
                change: amountReceived - totals.total
            });
        } catch (err) {
            console.error('Printing failed:', err);
        }

        // 4. Clear Cart & Close Modal
        clearCart();
        setIsCheckoutOpen(false);
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    return (
        <div className="flex h-full gap-4 p-4">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search products by name, SKU, or scan barcode..."
                        className="pl-9 h-12 text-lg bg-card/50 backdrop-blur-sm border-indigo-500/20 focus-visible:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {productsLoading || searchLoading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Loading products...</div>
                    ) : displayedProducts.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No products found.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {displayedProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAdd={addToCart} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className="w-[400px] flex flex-col bg-card/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border/50 bg-indigo-500/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <ShoppingCart className="w-5 h-5 text-indigo-400" />
                        Current Order
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" /> Clear
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <ShoppingCart className="w-12 h-12 mb-2" />
                            <p>Cart is empty</p>
                            <p className="text-xs">Scan items or click to add</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                            />
                        ))
                    )}
                </div>

                <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border/50 space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tax (0%)</span>
                            <span>${totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-indigo-400 pt-2 border-t border-border/50">
                            <span>Total</span>
                            <span>${totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Checkout (F10)
                    </Button>
                </div>
            </div>

            <CheckoutModal
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                total={totals.total}
                onConfirm={handleCheckout}
            />
        </div>
    );
}
