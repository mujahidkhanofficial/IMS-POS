export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    price_cost: number;
    price_sell: number;
    stock_qty: number;
    min_stock_level: number;
    category?: string;
    brand?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Invoice {
    id?: number;
    customer_id?: number;
    total_amount: number;
    tax_amount: number;
    subtotal_amount: number;
    payment_method: 'cash' | 'card' | 'transfer';
    items: CartItem[];
    created_at?: string;
}
