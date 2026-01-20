
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
    <div className="bg-slate-800/80 backdrop-blur-md p-2 rounded-t-2xl border-t border-x border-slate-700/50 flex justify-between items-center no-print">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {schools.map((school) => (
          <div key={school.id} className="relative group flex-shrink-0">
            <button
              onClick={() => onSelectSchool(school.id)}
              className={`pl-4 pr-10 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 rounded-xl flex items-center gap-2 border ${
                activeSchoolId === school.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 bg-slate-900/50 border-slate-700/50 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{school.name.toUpperCase()}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSchool(school.id);
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                activeSchoolId === school.id ? 'text-blue-200 hover:bg-blue-700' : 'text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100'
              }`}
              aria-label={`Remover escola ${school.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddSchool}
        className="ml-4 px-4 py-2.5 text-xs font-black text-white bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center gap-2 transition-all uppercase tracking-widest border border-slate-600 flex-shrink-0"
        title="Nova escola"
      >
        <PlusIcon />
        <span className="hidden sm:inline">Escola</span>
      </button>
    </div>
  );
};
