import { Outlet } from 'react-router-dom';
import { Titlebar } from '@/components/ui/Titlebar';
import { Sidebar } from '@/components/ui/Sidebar';

export default function AppLayout() {
    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-foreground relative">
            {/* Ambient Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Titlebar />
            <div className="flex-1 flex overflow-hidden relative z-10">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-background/40 backdrop-blur-sm p-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
