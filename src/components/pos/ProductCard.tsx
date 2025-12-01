import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
    return (
        <Card className="overflow-hidden hover:border-indigo-500/50 transition-all duration-200 group bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-muted-foreground/20">
                        {product.category || 'General'}
                    </Badge>
                    <Badge className={product.stock_qty > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                        {product.stock_qty} in stock
                    </Badge>
                </div>
                <h3 className="font-semibold text-lg line-clamp-2 h-14 mb-2 group-hover:text-indigo-400 transition-colors">
                    {product.name}
                </h3>
                <div className="text-2xl font-bold text-foreground">
                    ${product.price_sell.toFixed(2)}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-500 border border-indigo-500/20"
                    onClick={() => onAdd(product)}
                    disabled={product.stock_qty <= 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
