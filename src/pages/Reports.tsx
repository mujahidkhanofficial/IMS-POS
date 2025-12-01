import { useState, useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function Reports() {
    const { salesData, lowStockData, loading, fetchSalesReport, fetchLowStockReport, exportCSV } = useReports();
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        fetchSalesReport(startDate, endDate);
        fetchLowStockReport();
    }, []);

    const handleSalesSearch = () => {
        fetchSalesReport(startDate, endDate);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            </div>

            <Tabs defaultValue="sales" className="w-full">
                <TabsList>
                    <TabsTrigger value="sales"><FileText className="w-4 h-4 mr-2" /> Sales Report</TabsTrigger>
                    <TabsTrigger value="low-stock"><AlertTriangle className="w-4 h-4 mr-2" /> Low Stock</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Sales History</CardTitle>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-40"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-40"
                                />
                                <Button onClick={handleSalesSearch} variant="secondary">Filter</Button>
                                <Button onClick={() => exportCSV(salesData, 'sales_report.csv')} variant="outline">
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                            </TableRow>
                                        ) : salesData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">No records found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            salesData.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="font-mono">{sale.invoice_number || `INV-${sale.id}`}</TableCell>
                                                    <TableCell>{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString()}</TableCell>
                                                    <TableCell>{sale.customer_name || 'Walk-in'}</TableCell>
                                                    <TableCell className="capitalize">{sale.payment_method}</TableCell>
                                                    <TableCell className="text-right font-medium">${sale.total_amount.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="low-stock">
                    <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Low Stock Alert</CardTitle>
                            <Button onClick={() => exportCSV(lowStockData, 'low_stock_report.csv')} variant="outline">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Current Stock</TableHead>
                                            <TableHead className="text-right">Min Level</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                            </TableRow>
                                        ) : lowStockData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24">No low stock items.</TableCell>
                                            </TableRow>
                                        ) : (
                                            lowStockData.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell className="text-right font-bold text-red-500">{item.stock_qty}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground">{item.min_stock_level}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="destructive">Low Stock</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
