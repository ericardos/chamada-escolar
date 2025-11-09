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
    [AttendanceStatus.Present]: { label: 'Presente', style: 'bg-green-500 hover:bg-green-600 text-white', active: 'ring-2 ring-offset-2 ring-offset-gray-700 ring-green-400' },
    [AttendanceStatus.Absent]: { label: 'Falta', style: 'bg-red-600 hover:bg-red-700 text-white', active: 'ring-2 ring-offset-2 ring-offset-gray-700 ring-red-400' },
    [AttendanceStatus.Justified]: { label: 'Justificada', style: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900', active: 'ring-2 ring-offset-2 ring-offset-gray-700 ring-yellow-300' },
};

export const StudentItem: React.FC<StudentItemProps> = ({ student, selectedDate, onSetStatus, onDelete }) => {
    
    const currentStatus = student.attendance[selectedDate] || AttendanceStatus.Pending;
    const isPending = currentStatus === AttendanceStatus.Pending;

    return (
        <div 
            className={`bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all duration-300 ${isPending ? 'border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
        >
            <span className="font-medium text-lg truncate flex-grow text-center sm:text-left">{student.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-2">
                {Object.values(AttendanceStatus).filter(s => s !== AttendanceStatus.Pending).map(status => (
                    <button
                        key={status}
                        onClick={() => onSetStatus(student.id, status)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none ${statusConfig[status].style} ${currentStatus === status ? statusConfig[status].active : 'opacity-70 hover:opacity-100'}`}
                        aria-label={`Marcar ${student.name} como ${status}`}
                    >
                        {statusConfig[status].label}
                    </button>
                ))}
                </div>
                <button 
                    onClick={() => onDelete(student.id)} 
                    className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remover ${student.name}`}
                >
                   <TrashIcon />
                </button>
            </div>
        </div>
    );
};