
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
    const [showFlash, setShowFlash] = useState(false);
    
    // Usamos um Ref para a função de sucesso para evitar que o scanner 
    // fique preso em uma versão antiga (stale closure) da função quando o estado do App muda
    const onScanSuccessRef = useRef(onScanSuccess);
    const lastIdRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);

    // Atualiza o ref sempre que a prop mudar
    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
    }, [onScanSuccess]);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(SCANNER_ID);
        let isMounted = true;

        const successCallback = (decodedText: string) => {
            const now = Date.now();
            
            // Evita scans duplicados do MESMO QR Code em menos de 2 segundos
            if (decodedText === lastIdRef.current && (now - lastScanTimeRef.current < 2000)) {
                return;
            }

            // Executa a função mais recente através do Ref
            const studentName = onScanSuccessRef.current(decodedText);
            
            if (studentName) {
                lastIdRef.current = decodedText;
                lastScanTimeRef.current = now;
                
                // Feedback visual e tátil
                setShowFlash(true);
                setTimeout(() => setShowFlash(false), 500);
                
                setLastScanned(prev => [
                    { name: studentName, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) },
                    ...prev.slice(0, 4)
                ]);
                setErrorMsg(null);
                
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(80);
                }
            } else {
                setErrorMsg("Não cadastrado");
                setTimeout(() => setErrorMsg(null), 2000);
            }
        };

        const config = { 
            fps: 20, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        const startScanner = async () => {
            try {
                if (!isMounted) return;
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    config, 
                    successCallback, 
                    undefined
                );
            } catch (err) {
                try {
                    if (!isMounted) return;
                    await html5QrCode.start(
                        { facingMode: "user" }, 
                        config, 
                        successCallback, 
                        undefined
                    );
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
    }, []); // Array vazio garante que o scanner só inicie UMA VEZ

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl relative max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* Cabeçalho Fixo */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Scanner Ativo</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="bg-slate-800 hover:bg-rose-600 text-white p-2 rounded-xl transition-all active:scale-90 shadow-lg"
                    >
                        <XIcon />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-0 overflow-y-auto">
                    {/* Área da Câmera */}
                    <div className="flex-1 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-800 relative">
                        <div id={SCANNER_ID} className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-black relative max-w-[320px]">
                            {/* Flash de Sucesso */}
                            {showFlash && (
                                <div className="absolute inset-0 bg-emerald-500/40 z-30 pointer-events-none animate-out fade-out duration-500"></div>
                            )}
                            
                            {errorMsg && (
                                <div className="absolute inset-x-0 top-0 bg-rose-600 text-white text-[10px] font-black py-2 text-center uppercase tracking-widest z-40 animate-pulse">
                                    {errorMsg}
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">
                            Aponte para o QR Code. O registro é automático.
                        </p>
                    </div>

                    {/* Histórico Lateral */}
                    <div className="w-full md:w-72 flex flex-col p-6 bg-slate-950/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registrados Agora</h3>
                            <span className="bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                                {lastScanned.length}
                            </span>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {lastScanned.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
                                    <p className="text-slate-700 text-[10px] uppercase font-bold italic">Nenhuma leitura ainda</p>
                                </div>
                            ) : (
                                lastScanned.map((scan, i) => (
                                    <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-in slide-in-from-right-4 fade-in duration-300">
                                        <p className="text-emerald-400 font-black text-xs uppercase truncate">{scan.name}</p>
                                        <p className="text-emerald-500/50 text-[9px] font-bold mt-1">{scan.time} • PRESENÇA</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {lastScanned.length > 0 && (
                            <div className="mt-auto pt-6 text-center">
                                <p className="text-slate-600 text-[9px] font-medium leading-tight">
                                    Continue apontando para os próximos QR Codes da lista.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
