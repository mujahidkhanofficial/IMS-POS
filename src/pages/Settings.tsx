import { useEffect, useState } from 'react';
import { useLicense } from '@/hooks/useLicense';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Monitor, Info, Printer } from 'lucide-react';

export default function Settings() {
    const { machineId, isLicensed } = useLicense();
    const [appVersion, setAppVersion] = useState('Loading...');
    const [printers, setPrinters] = useState<any[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState<string>('');
    const [paperWidth, setPaperWidth] = useState<string>('58mm');

    useEffect(() => {
        window.electron.app.getVersion().then(setAppVersion);
        loadPrinters();
        loadSettings();
    }, []);

    const loadPrinters = async () => {
        const list = await window.electron.printer.getPrinters();
        setPrinters(list);
    };

    const loadSettings = async () => {
        const result = await window.electron.settings.get();
        if (result.success && result.data) {
            const settings = result.data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
            if (settings.printer_name) setSelectedPrinter(settings.printer_name);
            if (settings.printer_width) setPaperWidth(settings.printer_width);
        }
    };

    const saveSettings = async (key: string, value: string) => {
        await window.electron.settings.update({ key, value });
    };

    const handlePrinterChange = (value: string) => {
        setSelectedPrinter(value);
        saveSettings('printer_name', value);
    };

    const handleWidthChange = (value: string) => {
        setPaperWidth(value);
        saveSettings('printer_width', value);
    };

    const handleTestPrint = async () => {
        await window.electron.printer.printReceipt({
            printerName: selectedPrinter,
            width: paperWidth,
            storeName: 'Test Store',
            address: '123 Test St, City',
            invoiceNumber: 'TEST-001',
            date: new Date().toISOString(),
            items: [
                { name: 'Test Item 1', quantity: 1, price: 10.00 },
                { name: 'Test Item 2', quantity: 2, price: 5.50 },
            ],
            total: 21.00
        });
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Printer className="w-5 h-5 text-indigo-500" />
                        <CardTitle>Printer Configuration</CardTitle>
                    </div>
                    <CardDescription>Configure your thermal receipt printer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Select Printer</Label>
                            <Select value={selectedPrinter} onValueChange={handlePrinterChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a printer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {printers.map((p) => (
                                        <SelectItem key={p.name} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Paper Width</Label>
                            <Select value={paperWidth} onValueChange={handleWidthChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select width" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="58mm">58mm (Standard Thermal)</SelectItem>
                                    <SelectItem value="80mm">80mm (Wide Thermal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleTestPrint} variant="outline" className="w-full sm:w-auto">
                        <Printer className="w-4 h-4 mr-2" /> Test Print
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                        <CardTitle>License Information</CardTitle>
                    </div>
                    <CardDescription>Manage your application license and activation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">License Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant={isLicensed ? "default" : "destructive"} className={isLicensed ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20" : ""}>
                                    {isLicensed ? 'Active License' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Machine ID</Label>
                            <div className="font-mono text-sm bg-muted/50 p-2 rounded border break-all">
                                {machineId}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-indigo-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-500" />
                        <CardTitle>About Application</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">App Name</Label>
                            <div className="font-medium">Inventory POS System</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Version</Label>
                            <div className="font-medium">v{appVersion}</div>
                        </div>
                    </div>
                    <Separator />
                    <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                            &copy; 2025 IMS POS System. All rights reserved.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
