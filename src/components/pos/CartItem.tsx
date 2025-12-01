import { CartItem as ICartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
    item: ICartItem;
    onUpdateQuantity: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/50 hover:bg-card/50 transition-colors">
            <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-medium truncate text-sm">{item.name}</h4>
                <div className="text-xs text-muted-foreground mt-1">
                    ${item.price_sell.toFixed(2)} x {item.quantity}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="font-bold text-indigo-400 w-16 text-right">
                    ${(item.price_sell * item.quantity).toFixed(2)}
                </div>

                <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                    >
                        <Minus size={12} />
                    </Button>
                    <span className="w-6 text-center text-xs font-mono">{item.quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                        <Plus size={12} />
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(item.id)}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
}
