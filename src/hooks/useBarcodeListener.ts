import { useEffect, useRef } from 'react';

export function useBarcodeListener(onScan: (barcode: string) => void) {
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            // If time between keys is too long, reset buffer (manual typing vs scanner)
            if (now - lastKeyTime.current > 100) {
                buffer.current = '';
            }
            lastKeyTime.current = now;

            if (e.key === 'Enter') {
                if (buffer.current.length > 2) {
                    onScan(buffer.current);
                    buffer.current = '';
                }
            } else if (e.key.length === 1) {
                buffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
}
