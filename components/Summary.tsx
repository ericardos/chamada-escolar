
import React, { useMemo } from 'react';
import { Student, AttendanceStatus } from '../types';

interface SummaryProps {
  students: Student[];
  selectedDate: string;
}

export const Summary: React.FC<SummaryProps> = ({ students, selectedDate }) => {
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let justified = 0;
    let pending = 0;

    students.forEach(s => {
        const status = s.attendance[selectedDate] || AttendanceStatus.Pending;
        switch(status) {
            case AttendanceStatus.Present:
                present++;
                break;
            case AttendanceStatus.Absent:
                absent++;
                break;
            case AttendanceStatus.Justified:
                justified++;
                break;
            default:
                pending++;
                break;
        }
    });
    
    return { present, absent, justified, pending, total: students.length };
  }, [students, selectedDate]);

  if (summary.total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-2 text-center bg-slate-900/60 p-2 rounded-xl border border-slate-700/50 mb-2">
      <div className="flex flex-col items-center">
        <p className="text-sm font-black text-emerald-400 leading-tight">{summary.present}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Pres.</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-black text-rose-400 leading-tight">{summary.absent}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Falta</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-black text-amber-400 leading-tight">{summary.justified}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Just.</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-black text-slate-300 leading-tight">{summary.pending}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Pend.</p>
      </div>
      <div className="flex flex-col items-center border-l border-slate-700/50">
        <p className="text-sm font-black text-blue-400 leading-tight">{summary.total}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Total</p>
      </div>
    </div>
  );
};
