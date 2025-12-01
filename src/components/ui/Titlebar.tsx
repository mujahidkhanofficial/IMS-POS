import { Minus, Square, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Titlebar() {
    const location = useLocation();

    // Simple breadcrumb logic
    const getBreadcrumb = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        return path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    };

    return (
        <div className="h-8 bg-background/80 backdrop-blur-md border-b flex items-center justify-between select-none draggable-region z-50 w-full">
            <div className="px-4 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="font-semibold tracking-wide">IMS POS</span>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-foreground">{getBreadcrumb()}</span>
            </div>

            <div className="flex h-full no-drag">
                <button
                    onClick={() => window.electron.window.minimize()}
                    className="h-full px-4 hover:bg-muted/50 flex items-center justify-center transition-colors group"
                >
                    <Minus size={14} className="text-muted-foreground group-hover:text-foreground" />
                </button>
                <button
                    onClick={() => window.electron.window.maximize()}
                    className="h-full px-4 hover:bg-muted/50 flex items-center justify-center transition-colors group"
                >
                    <Square size={12} className="text-muted-foreground group-hover:text-foreground" />
                </button>
                <button
                    onClick={() => window.electron.window.close()}
                    className="h-full px-4 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors group"
                >
                    <X size={14} className="text-muted-foreground group-hover:text-destructive-foreground" />
                </button>
            </div>
        </div>
    );
}
