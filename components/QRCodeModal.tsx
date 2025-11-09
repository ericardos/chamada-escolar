import React, { useEffect, useState, useRef } from 'react';
import { Student } from '../types';
import { XIcon } from './icons';

// This tells TypeScript that a 'QRCode' variable will exist in the global scope,
// loaded from the script tag in index.html
declare const QRCode: any;

interface StudentQRCodeModalProps {
  students: Student[];
  onClose: () => void;
}

const StudentQRItem: React.FC<{ student: Student }> = ({ student }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'loading' | 'generated' | 'error'>('loading');
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Check if the QRCode library has loaded
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library is not available.');
            setStatus('error');
            return;
        }

        const canvas = canvasRef.current;
        QRCode.toCanvas(canvas, student.id, { errorCorrectionLevel: 'H', width: 128 }, (error: Error | null) => {
            if (error) {
                console.error(`Failed to generate QR code for ${student.name}:`, error);
                setStatus('error');
            } else {
                setStatus('generated');
                // Create a data URL for the download link
                setQrDataUrl(canvas.toDataURL('image/png'));
            }
        });

    }, [student.id, student.name]);

    const fileName = `${student.name.replace(/\s+/g, '_')}.png`;

    return (
        <div className="print-item flex flex-col items-center justify-center p-4 border border-gray-600 rounded-lg text-center bg-gray-700">
            <span className="font-semibold text-white mb-2 truncate" title={student.name}>{student.name}</span>
            <div className="bg-white p-1 rounded-md h-[136px] w-[136px] flex items-center justify-center">
                {status === 'loading' && <p className="text-xs text-gray-600">Gerando...</p>}
                {status === 'error' && <p className="text-xs text-red-500 text-center font-semibold">Erro ao<br/>gerar QR</p>}
                <a 
                  href={qrDataUrl || '#'} 
                  download={qrDataUrl ? fileName : undefined}
                  title={qrDataUrl ? `Clique para baixar ${fileName}` : 'Gerando QR Code...'}
                  className={qrDataUrl ? 'cursor-pointer' : 'cursor-default'}
                >
                    <canvas 
                        ref={canvasRef} 
                        style={{ display: status !== 'error' ? 'block' : 'none' }} 
                        aria-label={`QR Code for ${student.name}`}
                    />
                </a>
            </div>
        </div>
    )
}

export const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({ students, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 relative max-w-4xl w-full flex flex-col" style={{maxHeight: '90vh'}} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <div>
                <h2 className="text-2xl font-bold text-white">QR Codes da Turma</h2>
                <p className="text-gray-400">Imprima esta página e distribua os QR Codes para os alunos.</p>
            </div>
            <div>
                 <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mr-4">
                    Imprimir
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                    <XIcon />
                </button>
            </div>
        </div>
        
        <div className="overflow-y-auto print-container">
             {students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {students.map(student => (
                       <StudentQRItem key={student.id} student={student} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 py-8">Nenhum aluno para exibir QR Codes.</p>
            )}
        </div>
      </div>
    </div>
  );
};