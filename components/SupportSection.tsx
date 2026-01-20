
import React, { useState, useEffect, useRef } from 'react';

// Declaração para o compilador TS reconhecer a lib carregada via CDN
declare const QRCode: any;

export const SupportSection: React.FC<{ printMode?: boolean }> = ({ printMode = false }) => {
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pixKey = "fdf03993-fbdd-4b89-be41-6e63d2352729";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      // Minimiza automaticamente após 1.5 segundos da cópia para não atrapalhar a visão
      setTimeout(() => {
        setIsMinimized(true);
        setCopied(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (showPix && canvasRef.current && !isMinimized) {
      if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
        QRCode.toCanvas(
          canvasRef.current,
          pixKey,
          {
            width: 140,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          },
          (error: any) => {
            if (error) console.error('Erro ao gerar QR Code Pix:', error);
          }
        );
      }
    }
  }, [showPix, isMinimized, pixKey]);

  // Se estiver em modo de impressão, não minimizamos para garantir visibilidade no papel
  const activeMinimized = isMinimized && !printMode;

  if (activeMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 no-print animate-in fade-in slide-in-from-bottom-4">
        <button 
          onClick={() => {
            setIsMinimized(false);
            setShowPix(false);
          }}
          className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white p-3 rounded-full shadow-2xl flex items-center gap-2 group transition-all"
        >
          <div className="bg-[#fff3d6] p-1.5 rounded-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#d97706"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span className="text-xs font-bold pr-1">Apoiar</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-10 mb-6 mx-auto max-w-sm w-full transition-all duration-300 ${printMode ? 'block' : 'no-print'}`}>
      <div className="bg-[#f8f9fa] border border-gray-200 rounded-[30px] p-5 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Botão de minimizar manual */}
        {!printMode && (
            <button 
                onClick={() => setIsMinimized(true)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                title="Minimizar"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 12H6"/></svg>
            </button>
        )}

        <div className="flex items-center gap-4 w-full mb-4">
          <div className="bg-[#fff3d6] p-3 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[#1a202c] font-black italic text-md tracking-tight uppercase leading-none mb-1">APOIE O PROJETO</h3>
            <p className="text-[#718096] text-[12px] leading-tight">Considere apoiar o desenvolvedor para manter o site!</p>
          </div>
        </div>

        {!showPix ? (
          <button 
            onClick={() => setShowPix(true)}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all group"
          >
            VER CHAVE PIX
            <svg className="group-hover:rotate-12 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path><path d="M19 3v4"></path><path d="M21 5h-4"></path></svg>
          </button>
        ) : (
          <div className="w-full animate-in fade-in zoom-in-95 flex flex-col items-center">
            <div className="bg-white p-1.5 rounded-lg shadow-inner mb-3 border border-gray-100">
                <canvas ref={canvasRef} className="max-w-[140px] h-auto" />
            </div>
            <p className="text-[9px] text-gray-400 mb-2 font-mono break-all text-center px-4 leading-none">
                {pixKey}
            </p>
            <button 
              onClick={handleCopy}
              className={`w-full ${copied ? 'bg-green-600' : 'bg-[#0f172a]'} text-white py-2 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2`}
            >
              {copied ? 'COPIADO!' : 'COPIAR CHAVE'}
              {!copied && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
