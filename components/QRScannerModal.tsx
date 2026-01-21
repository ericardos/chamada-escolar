
import React, { useEffect, useState, useRef } from 'react';
import { XIcon } from './icons';

declare const Html5Qrcode: any;

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (decodedText: string) => string | null;
}

const SCANNER_ID = "qr-code-reader";

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScanSuccess }) => {
    const [lastScanned, setLastScanned] = useState<{name: string, time: string}[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const lastIdRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(SCANNER_ID);
        let isMounted = true;

        const successCallback = (decodedText: string) => {
            const now = Date.now();
            
            // Evita escanear o mesmo código repetidamente em menos de 2 segundos
            // Mas permite trocar de aluno instantaneamente
            if (decodedText === lastIdRef.current && (now - lastScanTimeRef.current < 2000)) {
                return;
            }

            const studentName = onScanSuccess(decodedText);
            
            if (studentName) {
                lastIdRef.current = decodedText;
                lastScanTimeRef.current = now;
                
                // Adiciona ao topo da lista de últimos escaneados
                setLastScanned(prev => [
                    { name: studentName, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) },
                    ...prev.slice(0, 4)
                ]);
                setErrorMsg(null);
                
                // Feedback tátil se disponível
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(100);
                }
            } else {
                setErrorMsg("QR Code não reconhecido");
                setTimeout(() => setErrorMsg(null), 2000);
            }
        };

        const config = { fps: 20, qrbox: { width: 250, height: 250 } };

        const startScanner = async () => {
            try {
                if (!isMounted) return;
                await html5QrCode.start({ facingMode: "environment" }, config, successCallback, undefined);
            } catch (err) {
                try {
                    if (!isMounted) return;
                    await html5QrCode.start({ facingMode: "user" }, config, successCallback, undefined);
                } catch (fallbackErr) {
                     if (isMounted) {
                        setErrorMsg('Câmera não disponível');
                     }
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 relative max-w-2xl w-full flex flex-col md:flex-row gap-6" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-12 right-0 text-white/50 hover:text-white transition p-2">
                    <XIcon />
                </button>

                {/* Área da Câmera */}
                <div className="flex-1 flex flex-col items-center">
                    <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight self-start">Escaneamento Contínuo</h2>
                    <div id={SCANNER_ID} className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-black relative">
                        {errorMsg && (
                            <div className="absolute inset-x-0 top-0 bg-rose-600 text-white text-[10px] font-black py-2 text-center uppercase tracking-widest z-10 animate-bounce">
                                {errorMsg}
                            </div>
                        )}
                    </div>
                    <p className="mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Aponte para o QR Code do aluno</p>
                </div>

                {/* Histórico Lateral */}
                <div className="w-full md:w-64 flex flex-col border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Últimos Registros</h3>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
                        {lastScanned.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
                                <p className="text-slate-700 text-[10px] uppercase font-bold italic">Aguardando leitura...</p>
                            </div>
                        ) : (
                            lastScanned.map((scan, i) => (
                                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-in slide-in-from-right-4 fade-in duration-300">
                                    <p className="text-emerald-400 font-black text-xs uppercase truncate">{scan.name}</p>
                                    <p className="text-emerald-500/50 text-[9px] font-bold mt-1">{scan.time} • PRESENÇA OK</p>
                                </div>
                            ))
                        )}
                    </div>
                    {lastScanned.length > 0 && (
                        <div className="mt-auto pt-4 text-center">
                            <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                {lastScanned.length} Alunos nesta sessão
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
