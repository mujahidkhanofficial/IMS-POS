import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    FileBarChart,
    Settings,
    Menu,
    ChevronLeft,
    Truck,
    Import,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'POS', path: '/pos' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: Truck, label: 'Suppliers', path: '/suppliers' },
        { icon: Import, label: 'Stock In', path: '/purchase-entry' },
        { icon: FileBarChart, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div
            className={cn(
                "border-r border-border bg-background transition-all duration-300 ease-in-out flex flex-col h-full",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-border h-14">
                {!collapsed && (
                    <span className="font-bold text-lg tracking-tight text-foreground">
                        IMS
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-zinc-900"
                >
                    {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto py-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-none border-l-2 transition-all duration-100 group",
                                isActive
                                    ? "border-white bg-zinc-900 text-white"
                                    : "border-transparent text-muted-foreground hover:bg-zinc-900 hover:text-zinc-300"
                            )}
                        >
                            <item.icon
                                size={18}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-zinc-300"
                                )}
                            />
                            {!collapsed && (
                                <span className={cn("text-sm font-medium", isActive && "font-semibold")}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-900 text-muted-foreground hover:text-white",
                        collapsed && "justify-center px-0"
                    )}
                    onClick={() => window.electron.window.close()}
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-sm font-medium">Exit</span>}
                </button>

                {!collapsed && (
                    <div className="mt-4 text-[10px] text-center text-zinc-700">
                        v1.0.2 • Licensed
                    </div>
                )}
            </div>
        </div>
    );
}
