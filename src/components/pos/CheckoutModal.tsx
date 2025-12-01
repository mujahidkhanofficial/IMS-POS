import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreditCard, Banknote, Landmark } from 'lucide-react';

interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    onConfirm: (paymentMethod: 'cash' | 'card' | 'transfer', amountReceived: number) => void;
}

export function CheckoutModal({ open, onOpenChange, total, onConfirm }: CheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [change, setChange] = useState(0);

    useEffect(() => {
        if (open) {
            setAmountReceived('');
            setChange(0);
        }
    }, [open]);

    useEffect(() => {
        const received = parseFloat(amountReceived) || 0;
        setChange(Math.max(0, received - total));
    }, [amountReceived, total]);

    const handleConfirm = () => {
        onConfirm(paymentMethod, parseFloat(amountReceived) || 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Amount</div>
                        <div className="text-4xl font-bold text-indigo-500">${total.toFixed(2)}</div>
                    </div>

                    <Tabs defaultValue="cash" onValueChange={(v) => setPaymentMethod(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="cash"><Banknote className="w-4 h-4 mr-2" /> Cash</TabsTrigger>
                            <TabsTrigger value="card"><CreditCard className="w-4 h-4 mr-2" /> Card</TabsTrigger>
                            <TabsTrigger value="transfer"><Landmark className="w-4 h-4 mr-2" /> Transfer</TabsTrigger>
                        </TabsList>

                        <TabsContent value="cash" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Amount Received</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    className="text-lg font-mono"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-md border border-green-500/20">
                                <span className="font-medium text-green-600">Change Due:</span>
                                <span className="font-bold text-xl text-green-600">${change.toFixed(2)}</span>
                            </div>
                        </TabsContent>

                        <TabsContent value="card" className="mt-4">
                            <div className="text-center text-muted-foreground py-8">
                                Waiting for card terminal...
                            </div>
                        </TabsContent>

                        <TabsContent value="transfer" className="mt-4">
                            <div className="text-center text-muted-foreground py-8">
                                Verify bank transfer receipt.
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                        onClick={handleConfirm}
                        disabled={paymentMethod === 'cash' && (parseFloat(amountReceived) || 0) < total}
                    >
                        Confirm Payment (F10)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
