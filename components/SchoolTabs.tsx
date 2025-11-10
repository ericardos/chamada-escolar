import React from 'react';
import { School } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface SchoolTabsProps {
  schools: School[];
  activeSchoolId: string | null;
  onSelectSchool: (id: string) => void;
  onAddSchool: () => void;
  onDeleteSchool: (id: string) => void;
}

export const SchoolTabs: React.FC<SchoolTabsProps> = ({ schools, activeSchoolId, onSelectSchool, onAddSchool, onDeleteSchool }) => {
  return (
    <div className="bg-gray-800 p-2 rounded-t-lg shadow-lg flex justify-between items-center no-print">
      <div className="flex items-center overflow-x-auto">
        {schools.map((school) => (
          <div key={school.id} className="relative flex-shrink-0">
            <button
              onClick={() => onSelectSchool(school.id)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none rounded-md flex items-center gap-2 ${
                activeSchoolId === school.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{school.name}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSchool(school.id);
              }}
              className="ml-1 p-1 rounded-full text-gray-400 hover:bg-red-800 hover:text-white transition-colors"
              aria-label={`Remover escola ${school.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddSchool}
        className="ml-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-1 transition-colors flex-shrink-0"
        title="Adicionar nova escola"
      >
        <PlusIcon />
        <span className="hidden sm:inline">Nova Escola</span>
      </button>
    </div>
  );
};
