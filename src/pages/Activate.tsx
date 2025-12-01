import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Activation() {
    const [machineId, setMachineId] = useState<string>('Loading...');
    const [licenseKey, setLicenseKey] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch Machine ID on mount
        window.electron.license.getMachineId().then(id => {
            setMachineId(id);
        });
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(machineId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleActivate = async () => {
        setError('');
        setIsLoading(true);

        try {
            const isValid = await window.electron.license.saveKey(licenseKey);
            if (isValid) {
                // Reload to trigger app check
                window.location.reload();
            } else {
                setError('Invalid License Key. Please check and try again.');
            }
        } catch (err) {
            setError('An error occurred during activation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />

            <Card className="w-full max-w-md border-indigo-500/20 shadow-2xl bg-card/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 mx-auto">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    </div>
                    <CardTitle className="text-2xl text-center">Product Activation</CardTitle>
                    <CardDescription className="text-center">
                        Enter your license key to activate the software.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Machine ID</label>
                        <div className="flex gap-2">
                            <div className="flex-1 h-10 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono text-muted-foreground flex items-center">
                                {machineId}
                            </div>
                            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Share this ID with the administrator to receive your license key.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">License Key</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="pl-9 font-mono uppercase"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleActivate}
                        disabled={isLoading || !licenseKey}
                    >
                        {isLoading ? 'Verifying...' : 'Activate License'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
