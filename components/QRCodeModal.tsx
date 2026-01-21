
import React, { useEffect, useRef } from 'react';
import { Student } from '../types';

declare const QRCode: any;

interface StudentQRCodeModalProps {
  students: Student[];
  onClose: () => void;
}

// Este componente não renderiza mais um Modal Visual, ele dispara a ação de geração de página
export const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({ students, onClose }) => {
  useEffect(() => {
    handleGeneratePrintPage();
    onClose(); // Fecha o modal imediatamente pois a nova aba será aberta
  }, []);

  const handleGeneratePrintPage = async () => {
    if (students.length === 0) {
      alert("Não há alunos para gerar QR Codes.");
      return;
    }

    // Criamos uma janela temporária para renderizar os QR codes e pegar os Base64
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    let htmlCards = '';

    // Gerar os QR Codes de forma assíncrona para garantir que todos sejam criados
    for (const student of students) {
      const canvas = document.createElement('canvas');
      await new Promise<void>((resolve) => {
        QRCode.toCanvas(canvas, student.id, { 
          width: 250, 
          margin: 1,
          errorCorrectionLevel: 'M' 
        }, () => resolve());
      });

      const imgData = canvas.toDataURL("image/png");
      htmlCards += `
        <div class="qr-card">
          <img src="${imgData}" />
          <div class="student-name">${student.name}</div>
        </div>
      `;
    }

    document.body.removeChild(tempContainer);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("O navegador bloqueou a abertura da página. Por favor, permita pop-ups.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Impressão - Lista de QR Codes</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            margin: 0; 
            padding: 0; 
            background: #f1f5f9; 
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .no-print-bar {
            width: 100%;
            background: #1e293b;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .print-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
          }
          .print-btn:hover { background: #1d4ed8; }
          .page-container {
            background: white;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 20px auto;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            box-sizing: border-box;
          }
          .qr-card {
            border: 1px solid #e2e8f0;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-inside: avoid;
            background: white;
          }
          .qr-card img { width: 100%; height: auto; max-width: 140px; }
          .student-name {
            margin-top: 10px;
            font-size: 10pt;
            font-weight: 800;
            text-align: center;
            text-transform: uppercase;
            color: #1e293b;
            word-break: break-all;
          }
          @media print {
            .no-print-bar { display: none; }
            body { background: white; }
            .page-container { 
              margin: 0; 
              box-shadow: none; 
              width: 100%;
              padding: 0;
            }
            .qr-card { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div style="text-align: left">
            <div style="font-weight: 900; font-size: 16px">PÁGINA DE IMPRESSÃO</div>
            <div style="font-size: 12px; opacity: 0.8">Clique no botão ao lado para salvar como PDF</div>
          </div>
          <button class="print-btn" onclick="window.print()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            BAIXAR PDF / IMPRIMIR
          </button>
        </div>
        <div class="page-container">
          ${htmlCards}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return null; // O componente não precisa renderizar nada no DOM principal
};
