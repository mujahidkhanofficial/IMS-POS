import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Activate from '@/pages/Activate';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

import POS from '@/pages/POS';
import Dashboard from '@/pages/Dashboard';
import Reports from '@/pages/Reports';
import Inventory from '@/pages/Inventory';

// Placeholder Pages
const Settings = () => <div className="text-2xl font-bold">Settings</div>;

function App() {
    const [isChecking, setIsChecking] = useState(true);
    const [isActivated, setIsActivated] = useState(false);

    useEffect(() => {
        const checkLicense = async () => {
            try {
                const valid = await window.electron.license.check();
                setIsActivated(valid);
            } catch (error) {
                console.error('License check failed:', error);
                setIsActivated(false);
            } finally {
                setIsChecking(false);
            }
        };
        checkLicense();
    }, []);

    if (isChecking) {
        return (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <HashRouter>
                <Routes>
                    {!isActivated ? (
                        <>
                            <Route path="/activate" element={<Activate />} />
                            <Route path="*" element={<Navigate to="/activate" replace />} />
                        </>
                    ) : (
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/pos" element={<POS />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/activate" element={<Navigate to="/" replace />} />
                        </Route>
                    )}
                </Routes>
            </HashRouter>
        </ThemeProvider>
    );
}

export default App;
