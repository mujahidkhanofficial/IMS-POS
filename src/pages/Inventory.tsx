import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Product } from '@/types';

export default function Inventory() {
    const { products, loading, deleteProduct, createProduct, updateProduct } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        sku: '',
        barcode: '',
        price_cost: 0,
        price_sell: 0,
        stock_qty: 0,
        min_stock_level: 5,
        category: '',
        brand: '',
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.barcode?.includes(debouncedSearch)
    );

    const rowVirtualizer = useVirtualizer({
        count: filteredProducts.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 53, // Approximate row height
        overscan: 5,
    });

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                barcode: '',
                price_cost: 0,
                price_sell: 0,
                stock_qty: 0,
                min_stock_level: 5,
                category: '',
                brand: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingProduct) {
                await updateProduct({ ...editingProduct, ...formData });
            } else {
                await createProduct(formData as Omit<Product, 'id'>);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="p-6 space-y-6 h-screen flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-900 p-2 rounded-md border border-border shrink-0">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name, SKU, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none bg-transparent focus-visible:ring-0"
                />
            </div>

            <div
                ref={parentRef}
                className="rounded-md border border-border bg-zinc-900 overflow-auto flex-1"
            >
                <Table>
                    <TableHeader className="sticky top-0 bg-zinc-900 z-10">
                        <TableRow>
                            <TableHead className="w-[300px]">Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            position: 'relative'
                        }}
                    >
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">Loading products...</TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No products found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const product = filteredProducts[virtualRow.index];
                                return (
                                    <TableRow
                                        key={product.id}
                                        style={{
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <TableCell className="font-medium w-[300px] flex-none">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 mr-2 text-indigo-500" />
                                                <span className="truncate">{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs flex-1">{product.sku}</TableCell>
                                        <TableCell className="flex-1">{product.category}</TableCell>
                                        <TableCell className="text-right flex-1">${product.price_cost.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold flex-1">${product.price_sell.toFixed(2)}</TableCell>
                                        <TableCell className="text-right flex-1">
                                            <span className={product.stock_qty <= product.min_stock_level ? "text-red-500 font-bold" : "text-green-500"}>
                                                {product.stock_qty}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right flex-1">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand</Label>
                                    <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Barcode</Label>
                                    <Input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cost Price</Label>
                                    <Input type="number" value={formData.price_cost} onChange={(e) => setFormData({ ...formData, price_cost: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Selling Price</Label>
                                    <Input type="number" value={formData.price_sell} onChange={(e) => setFormData({ ...formData, price_sell: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Initial Stock</Label>
                                    <Input type="number" value={formData.stock_qty} onChange={(e) => setFormData({ ...formData, stock_qty: parseInt(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Stock Level</Label>
                                    <Input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save Product</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
