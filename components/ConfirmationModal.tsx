import React, { ReactNode } from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClassName?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClassName = 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition'
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition" aria-label="Fechar modal">
            <XIcon />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="text-gray-300 mb-6">
            {children}
        </div>
        <div className="flex justify-end gap-4">
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition">
                {cancelText}
            </button>
            <button onClick={onConfirm} className={confirmButtonClassName}>
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};