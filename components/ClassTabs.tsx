
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
    <div className="flex bg-slate-900/30 border-x border-slate-700/50 overflow-hidden no-print">
      <div className="flex-grow flex items-center overflow-x-auto scrollbar-hide">
        {classes.map((cls) => (
          <div key={cls.id} className="relative flex-shrink-0 group border-r border-slate-700/30">
            <button
              onClick={() => onSelectClass(cls.id)}
              className={`px-6 py-4 text-xs font-black tracking-widest transition-all duration-200 focus:outline-none pr-12 uppercase ${
                activeClassId === cls.id
                  ? 'bg-slate-800/40 text-blue-400 border-b-2 border-blue-500 shadow-inner'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
              }`}
            >
              {cls.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClass(cls.id);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Remover turma ${cls.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddClass}
        className="px-6 py-4 text-xs font-black text-slate-300 bg-slate-800/50 hover:bg-slate-700 transition-all border-l border-slate-700/50 flex items-center gap-2 uppercase tracking-widest flex-shrink-0"
      >
        <PlusIcon />
        <span className="hidden sm:inline">Nova Turma</span>
      </button>
    </div>
  );
};
