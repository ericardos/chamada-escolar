
import React, { useEffect, useState, useRef } from 'react';
import { Student } from '../types';
import { XIcon } from './icons';

declare const QRCode: any;

interface StudentQRCodeModalProps {
  students: Student[];
  onClose: () => void;
}

const StudentQRItem: React.FC<{ student: Student }> = ({ student }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || typeof QRCode === 'undefined') return;
        
        QRCode.toCanvas(canvasRef.current, student.id, { 
          errorCorrectionLevel: 'M', 
          width: 200, 
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
    }, [student.id]);

    return (
        <div className="flex flex-col items-center justify-center p-4 border border-slate-700 bg-slate-800 rounded-xl">
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <canvas 
                    ref={canvasRef} 
                    className="qr-canvas-item" 
                    data-name={student.name}
                    style={{ width: '120px', height: '120px', display: 'block' }} 
                />
            </div>
            <span className="text-[10px] font-black text-slate-300 mt-2 uppercase truncate w-full text-center tracking-wider">
                {student.name}
            </span>
        </div>
    )
}

export const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({ students, onClose }) => {
  const handlePrint = () => {
    const canvases = document.querySelectorAll('.qr-canvas-item');
    if (canvases.length === 0) {
      alert("Os QR Codes ainda estão carregando...");
      return;
    }

    let htmlContent = '';
    canvases.forEach((canvas) => {
      const canvasEl = canvas as HTMLCanvasElement;
      const studentName = canvasEl.getAttribute('data-name') || "Aluno";
      const imageData = canvasEl.toDataURL("image/png");

      htmlContent += `
        <div style="width: 45mm; height: 55mm; border: 1px solid #ddd; margin: 2mm; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; page-break-inside: avoid; vertical-align: top; box-sizing: border-box; padding: 5mm;">
          <img src="${imageData}" style="width: 35mm; height: 35mm;" />
          <div style="margin-top: 3mm; font-family: sans-serif; font-size: 10pt; font-weight: bold; text-align: center; text-transform: uppercase; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${studentName}
          </div>
        </div>
      `;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up bloqueado! Por favor, autorize pop-ups para gerar o PDF.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir QR Codes</title>
        <style>
          @page { size: A4; margin: 5mm; }
          body { margin: 0; padding: 5mm; background: white; text-align: center; }
          .page { width: 200mm; margin: 0 auto; text-align: left; }
        </style>
      </head>
      <body>
        <div class="page">${htmlContent}</div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[99999] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 max-w-5xl w-full flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Gerar PDF de QR Codes</h2>
                <p className="text-xs text-slate-500">Pronto para imprimir em folha A4.</p>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={handlePrint} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 px-8 rounded-2xl shadow-xl shadow-emerald-900/20 active:scale-95 transition-all uppercase flex items-center gap-2"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    IMPRIMIR / SALVAR PDF
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-xl">
                    <XIcon />
                </button>
            </div>
        </div>
        
        <div className="overflow-y-auto flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {students.map((student) => (
                <StudentQRItem key={student.id} student={student} />
            ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <span>Total: {students.length} alunos</span>
            <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">DICA</span>
                <span>Se a janela não abrir, verifique se o navegador bloqueou o pop-up.</span>
            </div>
        </div>
      </div>
    </div>
  );
};
