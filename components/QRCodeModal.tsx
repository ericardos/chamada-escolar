
import React, { useEffect } from 'react';
import { Student } from '../types';

declare const QRCode: any;

interface StudentQRCodeModalProps {
  students: Student[];
  onClose: () => void;
  className?: string;
}

export const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({ students, onClose, className = "Turma" }) => {
  
  useEffect(() => {
    // Pequeno fôlego para a UI respirar
    const timer = setTimeout(() => {
      generatePDF();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const generatePDF = async () => {
    try {
      // 1. Validar se as bibliotecas existem
      const jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
      
      if (!jsPDF) {
        throw new Error("Biblioteca jsPDF não carregada. Verifique sua conexão.");
      }
      if (!QRCode) {
        throw new Error("Biblioteca QRCode não carregada.");
      }

      // 2. Configurar o Documento
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const cols = 3;
      const cardWidth = (pageWidth - (margin * 2)) / cols;
      const cardHeight = 60; // Altura do card no PDF

      let x = margin;
      let y = margin;
      let colCount = 0;

      // 3. Loop de Alunos
      for (let i = 0; i < students.length; i++) {
        const student = students[i];

        // Gerar QR Code como DataURL (mais rápido que canvas)
        const qrDataUrl = await new Promise<string>((resolve, reject) => {
          QRCode.toDataURL(student.id, { 
            margin: 1, 
            width: 250,
            errorCorrectionLevel: 'M'
          }, (err: any, url: string) => {
            if (err) reject(err);
            else resolve(url);
          });
        });

        // Verificar quebra de página
        if (y + cardHeight > pageHeight - margin) {
          doc.addPage();
          x = margin;
          y = margin;
          colCount = 0;
        }

        // Desenhar Borda do Card
        doc.setDrawColor(200);
        doc.rect(x + 1, y + 1, cardWidth - 2, cardHeight - 2);

        // Inserir QR Code
        const qrSize = 35;
        const qrX = x + (cardWidth / 2) - (qrSize / 2);
        const qrY = y + 5;
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Inserir Nome
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(0);
        
        const name = student.name.toUpperCase();
        const truncatedName = name.length > 25 ? name.substring(0, 22) + '...' : name;
        const textWidth = doc.getTextWidth(truncatedName);
        const textX = x + (cardWidth / 2) - (textWidth / 2);
        
        doc.text(truncatedName, textX, qrY + qrSize + 8);

        // Atualizar Grid
        colCount++;
        if (colCount >= cols) {
          colCount = 0;
          x = margin;
          y += cardHeight;
        } else {
          x += cardWidth;
        }
      }

      // 4. Salvar
      const fileName = `LISTA_QR_${className.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (error: any) {
      console.error("Falha ao gerar PDF:", error);
      alert(`Erro: ${error.message || "Não foi possível gerar o arquivo"}`);
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-700 p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full text-center">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Preparando PDF</h2>
          <p className="text-slate-400 text-sm font-medium italic">Isso pode levar alguns segundos...</p>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full animate-[loading_2s_infinite] w-1/3 rounded-full"></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(310%); }
        }
      `}</style>
    </div>
  );
};
