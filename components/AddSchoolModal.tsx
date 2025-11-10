import React, { useState } from 'react';
import { XIcon } from './icons';

interface AddSchoolModalProps {
  onClose: () => void;
  onAddSchool: (name: string) => void;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddSchool(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition" aria-label="Fechar modal">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Criar Nova Escola</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da Escola"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-white"
            autoFocus
          />
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition disabled:bg-gray-500" disabled={!name.trim()}>
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
