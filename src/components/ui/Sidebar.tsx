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
        { icon: FileBarChart, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div
            className={cn(
                "border-r bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col h-full",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-border/50 h-14">
                {!collapsed && (
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        Menu
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto h-8 w-8"
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
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                            )}
                            <item.icon
                                size={20}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-indigo-500" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            {!collapsed && (
                                <span className={cn("text-sm font-medium", isActive && "font-semibold")}>
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state could go here */}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground",
                        collapsed && "justify-center px-0"
                    )}
                    onClick={() => window.electron.window.close()}
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="text-sm font-medium">Exit</span>}
                </button>

                {!collapsed && (
                    <div className="mt-4 text-[10px] text-center text-muted-foreground/50">
                        v1.0.0 • Licensed
                    </div>
                )}
            </div>
        </div>
    );
}
