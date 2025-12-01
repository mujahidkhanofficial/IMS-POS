import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import POS from '@/pages/POS';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Activate from '@/pages/Activate';
import Suppliers from '@/pages/Suppliers';
import PurchaseEntry from '@/pages/PurchaseEntry';
import { useLicense } from '@/hooks/useLicense';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
    const { isLicensed, loading } = useLicense();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Initializing System...</p>
                </div>
            </div>
        );
    }

    if (!isLicensed) {
        return (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Activate />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/purchase-entry" element={<PurchaseEntry />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
