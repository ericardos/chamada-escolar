import React, { useEffect, useState } from 'react';
import { XIcon } from './icons';

declare const Html5Qrcode: any;

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (decodedText: string) => string | null;
}

const SCANNER_ID = "qr-code-reader";

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScanSuccess }) => {
    const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(SCANNER_ID);
        let isMounted = true;

        const successCallback = (decodedText: string) => {
            // Prevent multiple scans while a status message is being shown
            if (scanStatus) return;

            const studentName = onScanSuccess(decodedText);
            if(studentName) {
                setScanStatus({ type: 'success', message: `Presente: ${studentName}` });
            } else {
                setScanStatus({ type: 'error', message: 'QR Code não reconhecido' });
            }
            
            setTimeout(() => {
                if (isMounted) setScanStatus(null);
            }, 2000);
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        const startScanner = async () => {
            try {
                if (!isMounted) return;
                await html5QrCode.start({ facingMode: "environment" }, config, successCallback, undefined);
            } catch (err) {
                console.log("Failed to start with back camera, trying front camera.", err);
                try {
                    if (!isMounted) return;
                    await html5QrCode.start({ facingMode: "user" }, config, successCallback, undefined);
                } catch (fallbackErr) {
                     if (isMounted) {
                        console.error("Error starting any camera:", fallbackErr);
                        setScanStatus({ type: 'error', message: 'Câmera não disponível' });
                     }
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            // The library throws an error if stop() is called when the scanner is not running.
            // We check the state before stopping to prevent an uncaught error.
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(error => {
                    console.error("Failed to stop the QR scanner.", error);
                });
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 relative max-w-xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">Escanear Presença</h2>
                <div id={SCANNER_ID} className="w-full max-w-sm aspect-square rounded-lg overflow-hidden border-2 border-gray-600"></div>
                <div className="mt-4 text-center h-10">
                    {scanStatus && (
                         <p className={`text-lg font-semibold transition-opacity duration-300 ${scanStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                           {scanStatus.message}
                         </p>
                    )}
                </div>
            </div>
        </div>
    );
};