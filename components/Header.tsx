
import React from 'react';

export const Header: React.FC = () => (
  <header className="py-4 mb-2 no-print">
    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div className="flex items-center gap-4">
        {/* Compact Horizontal Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5-.5h.01M12 20v1M4 12H2m15.5-.5h.01M6 6h.01M6 18h.01M18 6h.01M18 18h.01M2 6h4v4H2V6zm14 0h4v4h-4V6zM2 14h4v4H2v-4zm14 0h4v4h-4v-4z" />
          </svg>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-white leading-none">
            Chamada <span className="text-blue-400">QR</span>
          </h1>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter mt-1">
            Criado pelo Prof. Ricardo ARTE
          </span>
        </div>
      </div>

      <div className="hidden sm:block text-right">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Controle de Frequência</p>
        <p className="text-[9px] text-slate-600">v1.5 Premium Edition</p>
      </div>
    </div>
  </header>
);
