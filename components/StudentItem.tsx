
import React from 'react';
import { Student, AttendanceStatus } from '../types';
import { TrashIcon } from './icons';

interface StudentItemProps {
    student: Student;
    selectedDate: string;
    onSetStatus: (id: string, status: AttendanceStatus) => void;
    onDelete: (id: string) => void;
}

const statusConfig = {
    [AttendanceStatus.Present]: { 
        label: 'P', 
        full: 'PRESENTE',
        style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20', 
        active: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-900/40' 
    },
    [AttendanceStatus.Absent]: { 
        label: 'F', 
        full: 'FALTA',
        style: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20', 
        active: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-900/40' 
    },
    [AttendanceStatus.Justified]: { 
        label: 'J', 
        full: 'JUSTIF.',
        style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20', 
        active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/40' 
    },
};

export const StudentItem: React.FC<StudentItemProps> = ({ student, selectedDate, onSetStatus, onDelete }) => {
    
    const currentStatus = student.attendance[selectedDate] || AttendanceStatus.Pending;
    const isPending = currentStatus === AttendanceStatus.Pending;

    return (
        <div 
            className={`bg-slate-900/40 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center justify-between gap-3 border border-slate-700/50 transition-all duration-200 group hover:border-slate-500/50 ${!isPending ? 'bg-slate-800/40' : ''}`}
        >
            <span className={`font-bold text-xs truncate flex-grow transition-colors ${isPending ? 'text-slate-300' : 'text-slate-400'}`}>
                {student.name}
            </span>
            
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1 p-0.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    {Object.values(AttendanceStatus).filter(s => s !== AttendanceStatus.Pending).map(status => (
                        <button
                            key={status}
                            onClick={() => onSetStatus(student.id, status)}
                            className={`w-7 h-7 text-[10px] font-black rounded-md transition-all duration-200 uppercase flex items-center justify-center ${currentStatus === status ? statusConfig[status].active : statusConfig[status].style}`}
                            title={statusConfig[status].full}
                        >
                            {statusConfig[status].label}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={() => onDelete(student.id)} 
                    className="text-slate-700 hover:text-rose-500 transition-all p-1.5 rounded-lg hover:bg-rose-500/10"
                >
                   <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </div>
    );
};
