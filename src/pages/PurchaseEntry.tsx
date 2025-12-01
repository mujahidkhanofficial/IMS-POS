import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Search, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function PurchaseEntry() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [items, setItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, products]);

    const loadData = async () => {
        const suppliersResult = await window.electron.db.suppliers.getAll();
        const productsResult = await window.electron.db.products.getAll();

        if (suppliersResult.success && suppliersResult.data) setSuppliers(suppliersResult.data);
        if (productsResult.success && productsResult.data) setProducts(productsResult.data);
    };

    const addItem = (product: any) => {
        const existing = items.find(i => i.productId === product.id);
        if (existing) {
            alert('Product already in list');
            return;
        }
        setItems([...items, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitCost: product.price_cost || 0,
            total: (product.price_cost || 0) * 1
        }]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateItem = (index: number, field: string, value: number) => {
        const newItems = [...items];
        newItems[index][field] = value;
        newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async () => {
        if (!selectedSupplier || !invoiceNumber || items.length === 0) {
            alert('Please fill in all required fields and add at least one item.');
            return;
        }

        const purchase = {
            supplierId: parseInt(selectedSupplier),
            invoiceNumber,
            date,
            items
        };

        const result = await window.electron.db.purchases.create(purchase);
        if (result.success) {
            alert('Purchase recorded successfully! Stock updated.');
            // Reset form
            setInvoiceNumber('');
            setItems([]);
            setSelectedSupplier('');
            loadData(); // Reload products to get updated stock
        } else {
            alert('Failed to record purchase: ' + result.error);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stock In (Purchase Entry)</h2>
                    <p className="text-muted-foreground">Record new stock arrivals from suppliers.</p>
                </div>
                <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" /> Save Purchase
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="INV-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search product to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                                    {searchResults.map(product => (
                                        <div
                                            key={product.id}
                                            className="p-2 hover:bg-accent cursor-pointer flex justify-between"
                                            onClick={() => addItem(product)}
                                        >
                                            <span>{product.name}</span>
                                            <span className="text-muted-foreground text-sm">Stock: {product.stock_qty}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-[100px]">Qty</TableHead>
                                    <TableHead className="w-[120px]">Unit Cost</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.productId}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitCost}
                                                onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value))}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {item.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeItem(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No items added. Search above to add products.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-4">
                        <div className="text-2xl font-bold">
                            Total: <span className="text-green-600">${grandTotal.toFixed(2)}</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
