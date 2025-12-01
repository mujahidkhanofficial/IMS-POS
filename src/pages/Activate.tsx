import { useState } from 'react';
import { useLicense } from '@/hooks/useLicense';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Activate() {
    const { machineId, validateAndSaveKey, error: hookError } = useLicense();
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleActivate = async () => {
        setError('');
        setLoading(true);
        try {
            const isValid = await validateAndSaveKey(key);
            if (isValid) {
                setSuccess(true);
            } else {
                setError('Invalid License Key. Please check the key and try again.');
            }
        } catch (err) {
            setError('An error occurred during activation.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (machineId) {
            navigator.clipboard.writeText(machineId);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background" />
            <Card className="relative w-full max-w-lg border-indigo-500/20 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-3 text-center pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-4 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <Lock className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        Activate Software
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground/80 max-w-sm mx-auto">
                        This software is hardware-locked. Please enter your license key to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(error || hookError) && (
                        <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Activation Failed</AlertTitle>
                            <AlertDescription>{error || hookError}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="border-green-500/20 bg-green-500/10 text-green-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>License activated successfully. Redirecting...</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Machine ID</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Input
                                    readOnly
                                    value={machineId || (loading ? 'Fetching ID...' : 'Error: Could not retrieve ID')}
                                    className={`font-mono text-sm h-11 ${!machineId && !loading ? 'text-red-400 border-red-500/50 bg-red-500/10' : 'bg-muted/30 border-white/5'}`}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 border-white/5 bg-muted/30 hover:bg-muted/50"
                                onClick={copyToClipboard}
                                title="Copy Machine ID"
                            >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">
                            Please provide this ID to your administrator to receive a valid license key.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="license-key" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">License Key</Label>
                        <Input
                            id="license-key"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            disabled={loading || success}
                            className="font-mono text-sm bg-muted/30 border-white/5 h-11 placeholder:text-muted-foreground/30"
                        />
                    </div>
                </CardContent>
                <CardFooter className="pt-2 pb-8">
                    <Button
                        className="w-full h-11 text-base font-medium bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300"
                        onClick={handleActivate}
                        disabled={loading || success || !key}
                    >
                        {loading ? 'Verifying License...' : 'Activate License'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
