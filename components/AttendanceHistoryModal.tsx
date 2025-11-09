import React, { useMemo } from 'react';
import { Student, AttendanceStatus } from '../types';
import { XIcon } from './icons';

interface AttendanceHistoryModalProps {
  students: Student[];
  onClose: () => void;
}

const StatusIndicator: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
    const statusStyles = {
        [AttendanceStatus.Present]: { text: 'P', color: 'bg-green-500 text-white', title: 'Presente' },
        [AttendanceStatus.Absent]: { text: 'F', color: 'bg-red-600 text-white', title: 'Falta' },
        [AttendanceStatus.Justified]: { text: 'J', color: 'bg-yellow-500 text-gray-900', title: 'Justificada' },
        [AttendanceStatus.Pending]: { text: '-', color: 'bg-gray-600 text-gray-300', title: 'Pendente' },
    };
    const { text, color, title } = statusStyles[status];
    return (
        <div title={title} className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>
            {text}
        </div>
    );
};

export const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ students, onClose }) => {
    const { sortedDates, studentRecords } = useMemo(() => {
        const allDates = new Set<string>();
        students.forEach(s => {
            Object.keys(s.attendance).forEach(date => allDates.add(date));
        });

        const sortedDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first

        const studentRecords = students.map(student => ({
            id: student.id,
            name: student.name,
            statuses: sortedDates.map(date => student.attendance[date] || AttendanceStatus.Pending)
        })).sort((a,b) => a.name.localeCompare(b.name));

        return { sortedDates, studentRecords };
    }, [students]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 relative max-w-6xl w-full flex flex-col" style={{maxHeight: '90vh'}} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Histórico de Presença</h2>
                        <p className="text-gray-400">Visão geral da frequência da turma.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <XIcon />
                    </button>
                </div>
                
                <div className="overflow-auto">
                    {students.length > 0 && sortedDates.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">
                                        Aluno
                                    </th>
                                    {sortedDates.map(date => (
                                        <th key={date} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            {new Date(date + 'T00:00:00').toLocaleDateString()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {studentRecords.map(record => (
                                    <tr key={record.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-800 z-10">
                                            {record.name}
                                        </td>
                                        {record.statuses.map((status, index) => (
                                            <td key={index} className="px-4 py-2 whitespace-nowrap text-sm">
                                                <div className="flex justify-center">
                                                    <StatusIndicator status={status} />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-400 py-12">Nenhum registro de presença encontrado para esta turma.</p>
                    )}
                </div>
            </div>
        </div>
    );
};