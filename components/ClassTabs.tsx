import React from 'react';
import { Class } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface ClassTabsProps {
  classes: Class[];
  activeClassId: string | null;
  onSelectClass: (id: string) => void;
  onAddClass: () => void;
  onDeleteClass: (id: string) => void;
}

export const ClassTabs: React.FC<ClassTabsProps> = ({ classes, activeClassId, onSelectClass, onAddClass, onDeleteClass }) => {
  return (
    <div className="flex border-b border-gray-700 no-print">
      <div className="flex-grow flex items-center overflow-x-auto">
        {classes.map((cls) => (
          <div key={cls.id} className="relative flex-shrink-0">
            <button
              onClick={() => onSelectClass(cls.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none pr-8 ${
                activeClassId === cls.id
                  ? 'border-b-2 border-blue-500 text-white bg-gray-800 rounded-t-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cls.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClass(cls.id);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label={`Remover turma ${cls.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddClass}
        className="ml-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-t-lg flex items-center gap-1 transition-colors flex-shrink-0"
      >
        <PlusIcon />
        <span className="hidden sm:inline">Nova Turma</span>
      </button>
    </div>
  );
};
