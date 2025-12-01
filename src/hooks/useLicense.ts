import { useState, useEffect, useCallback } from 'react';

export function useLicense() {
    const [isLicensed, setIsLicensed] = useState<boolean>(false);
    const [machineId, setMachineId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const checkLicense = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Defensive check for Electron environment
        if (!window.electron) {
            console.error('[useLicense] window.electron is undefined. Are you running in a browser?');
            setError('Electron environment not detected.');
            setLoading(false);
            return;
        }

        try {
            console.log('[useLicense] Requesting license status...');
            const status = await window.electron.license.getStatus();

            console.log('[useLicense] Received status:', status);

            if (!status) {
                throw new Error('Received empty response from main process');
            }

            // Safe destructuring with defaults
            const { licensed = false, machineId = '' } = status || {};

            setIsLicensed(licensed);
            setMachineId(machineId);

            if (!machineId) {
                console.warn('[useLicense] Machine ID is empty');
            }

        } catch (err: any) {
            console.error('[useLicense] Failed to check license:', err);
            console.error('[useLicense] Stack:', err.stack);
            setError(err.message || 'Failed to verify license');
            setIsLicensed(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkLicense();
    }, [checkLicense]);

    const validateAndSaveKey = async (key: string): Promise<boolean> => {
        if (!window.electron) {
            console.error('[useLicense] Cannot submit key: window.electron is undefined');
            return false;
        }

        try {
            console.log('[useLicense] Submitting key...');
            const success = await window.electron.license.submit(key);
            console.log('[useLicense] Submission result:', success);

            if (success) {
                await checkLicense();
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('[useLicense] Failed to submit license:', error);
            return false;
        }
    };

    return { isLicensed, machineId, loading, error, checkLicense, validateAndSaveKey };
}
