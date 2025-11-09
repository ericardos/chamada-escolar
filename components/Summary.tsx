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
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-center bg-gray-900/50 p-4 rounded-lg">
      <div>
        <p className="text-2xl font-bold text-green-400">{summary.present}</p>
        <p className="text-sm text-gray-400">Presentes</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-red-400">{summary.absent}</p>
        <p className="text-sm text-gray-400">Faltas</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-yellow-400">{summary.justified}</p>
        <p className="text-sm text-gray-400">Justificadas</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-400">{summary.pending}</p>
        <p className="text-sm text-gray-400">Pendentes</p>
      </div>
      <div className="col-span-3 md:col-span-1 mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-4">
        <p className="text-2xl font-bold text-blue-400">{summary.total}</p>
        <p className="text-sm text-gray-400">Total</p>
      </div>
    </div>
  );
};