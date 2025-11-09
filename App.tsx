
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, AttendanceStatus, SortOrder, Class } from './types';
import { Header } from './components/Header';
import { Summary } from './components/Summary';
import { StudentQRCodeModal } from './components/QRCodeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { StudentItem } from './components/StudentItem';
import { PlusIcon, UploadIcon, QrCodeIcon, BroomIcon, SortAscendingIcon, SortDescendingIcon, CameraIcon, StudentsIcon, ExportIcon, HistoryIcon } from './components/icons';
import { ClassTabs } from './components/ClassTabs';
import { AddClassModal } from './components/AddClassModal';
import { QRScannerModal } from './components/QRScannerModal';
import { AttendanceHistoryModal } from './components/AttendanceHistoryModal';

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
};


const App: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>(() => {
    try {
      const savedClasses = localStorage.getItem('attendance-classes-v2');
      return savedClasses ? JSON.parse(savedClasses) : [];
    } catch (error) {
      console.error("Failed to parse classes from localStorage", error);
      return [];
    }
  });
  const [activeClassId, setActiveClassId] = useState<string | null>(() => {
    const savedClasses = localStorage.getItem('attendance-classes-v2');
    if (savedClasses) {
        try {
            const parsedClasses = JSON.parse(savedClasses);
            return parsedClasses.length > 0 ? parsedClasses[0].id : null;
        } catch (error) {
            return null;
        }
    }
    return null;
  });
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [newStudentName, setNewStudentName] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.None);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('attendance-classes-v2', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    if (!activeClassId && classes.length > 0) {
        setActiveClassId(classes[0].id);
    }
    if (classes.length === 0) {
        setActiveClassId(null);
    }
  }, [classes, activeClassId]);

  const activeClass = useMemo(() => classes.find(c => c.id === activeClassId), [classes, activeClassId]);
  
  const updateStudentsForActiveClass = (newStudents: Student[]) => {
    if (!activeClassId) return;
    const newClasses = classes.map(c => 
      c.id === activeClassId ? { ...c, students: newStudents } : c
    );
    setClasses(newClasses);
  };

  const handleSetStatus = (id: string, status: AttendanceStatus) => {
    if (!activeClass) return;
    const updatedStudents = activeClass.students.map(s => {
      if (s.id === id) {
        const newAttendance = { ...s.attendance, [selectedDate]: status };
        return { ...s, attendance: newAttendance };
      }
      return s;
    });
    updateStudentsForActiveClass(updatedStudents);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && activeClass) {
      const newStudent: Student = {
        id: `${Date.now()}-${Math.random()}`,
        name: newStudentName.trim(),
        attendance: {},
      };
      updateStudentsForActiveClass([...activeClass.students, newStudent]);
      setNewStudentName('');
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (!activeClass) return;
    updateStudentsForActiveClass(activeClass.students.filter(s => s.id !== id));
  };
  
  const handleClearAll = () => {
    if (!activeClass) return;
    updateStudentsForActiveClass([]);
    setShowClearConfirmModal(false);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeClass) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const names = text.split('\n').filter(name => name.trim() !== '');
        const newStudents: Student[] = names.map(name => ({
          id: `${Date.now()}-${Math.random()}-${name}`,
          name: name.trim(),
          attendance: {},
        }));
        updateStudentsForActiveClass([...activeClass.students, ...newStudents]);
      };
      reader.readAsText(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAddClass = (name: string) => {
    const newClass: Class = {
        id: `${Date.now()}`,
        name,
        students: []
    };
    const newClasses = [...classes, newClass];
    setClasses(newClasses);
    setActiveClassId(newClass.id);
    setShowAddClassModal(false);
  };
  
  const handleRequestDeleteClass = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    if (foundClass) {
        setClassToDelete(foundClass);
    }
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    
    const deletedIndex = classes.findIndex(c => c.id === classToDelete.id);
    const newClasses = classes.filter(c => c.id !== classToDelete.id);
    
    if (activeClassId === classToDelete.id) {
        if (newClasses.length > 0) {
            const newIndex = Math.max(0, deletedIndex - 1);
            setActiveClassId(newClasses[newIndex].id);
        } else {
            setActiveClassId(null);
        }
    }
    
    setClasses(newClasses);
    setClassToDelete(null);
  };

  const handleExportCSV = () => {
    if (!activeClass || activeClass.students.length === 0) return;

    // Get year, month, and days in month from selectedDate
    const date = new Date(selectedDate + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date).toUpperCase();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Define status map
    const statusMap = {
        [AttendanceStatus.Present]: 'P',
        [AttendanceStatus.Absent]: 'F',
        [AttendanceStatus.Justified]: 'FJ',
    };

    // Find total number of class days in the month for percentage calculation
    const classDaysInMonth = new Set<string>();
    activeClass.students.forEach(student => {
        for (const d in student.attendance) {
            const recordDate = new Date(d + 'T00:00:00');
            if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
                classDaysInMonth.add(d);
            }
        }
    });
    const totalClassesInMonth = classDaysInMonth.size;

    // Build CSV content
    let csvContent = 'CONTROLE DE FREQUÊNCIA\n\n';
    csvContent += `Ano,${year},,Mês,${monthName}\n\n`;
    csvContent += 'P,Presença\n';
    csvContent += 'F,Falta\n';
    csvContent += 'FJ,Falta Justificada\n\n';


    // Create headers
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const headers = ['Nº', 'Nome', ...dayHeaders, 'Total de Faltas', '% de Frequência'];
    csvContent += headers.join(',') + '\n';

    // Process each student
    const rows = activeClass.students.map((student, index) => {
        const studentRow = [(index + 1).toString(), `"${student.name.replace(/"/g, '""')}"`];
        let totalAbsences = 0;
        let totalPresents = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = day.toString().padStart(2, '0');
            const monthString = (month + 1).toString().padStart(2, '0');
            const currentDate = `${year}-${monthString}-${dayString}`;
            
            const status = student.attendance[currentDate];
            let mappedStatus = '';

            if (status && status !== AttendanceStatus.Pending) {
                 const typedStatus = status as keyof typeof statusMap;
                 mappedStatus = statusMap[typedStatus] || '';
                 if (status === AttendanceStatus.Absent) {
                    totalAbsences++;
                 }
                 if (status === AttendanceStatus.Present) {
                    totalPresents++;
                 }
            }
            studentRow.push(mappedStatus);
        }

        const attendancePercentage = totalClassesInMonth > 0
            ? `${Math.round((totalPresents / totalClassesInMonth) * 100)}%`
            : '0%';
        
        studentRow.push(totalAbsences.toString());
        studentRow.push(attendancePercentage);

        return studentRow.join(',');
    });

    csvContent += rows.join('\n');
    
    // Generate and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = `Frequencia_${activeClass.name.replace(/\s+/g, '_')}_${monthName}_${year}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleScanSuccess = (studentId: string): string | null => {
    if (!activeClass) return null;
    let studentName: string | null = null;
    
    const studentExists = activeClass.students.some(s => s.id === studentId);
    if (!studentExists) return null;

    const updatedStudents = activeClass.students.map(s => {
        if (s.id === studentId) {
            studentName = s.name;
            const newAttendance = { ...s.attendance, [selectedDate]: AttendanceStatus.Present };
            return { ...s, attendance: newAttendance };
        }
        return s;
    });
    
    if(studentName) {
        updateStudentsForActiveClass(updatedStudents);
    }
    return studentName;
  };

  const sortedStudents = useMemo(() => {
    if (!activeClass) return [];
    return [...activeClass.students].sort((a, b) => {
      if (sortOrder === SortOrder.Asc) {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === SortOrder.Desc) {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [activeClass, sortOrder]);

  const toggleSortOrder = () => {
    if (sortOrder === SortOrder.None || sortOrder === SortOrder.Desc) {
        setSortOrder(SortOrder.Asc);
    } else {
        setSortOrder(SortOrder.Desc);
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans">
      <div className="container mx-auto max-w-4xl p-4">
        <Header />

        <ClassTabs 
            classes={classes}
            activeClassId={activeClassId}
            onSelectClass={setActiveClassId}
            onAddClass={() => setShowAddClassModal(true)}
            onDeleteClass={handleRequestDeleteClass}
        />

        <main className="bg-gray-800 p-6 rounded-b-lg shadow-2xl">
          {activeClass ? (
            <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                    <input
                        type="text"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        placeholder="Inserir nome manualmente..."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition">
                        <PlusIcon />
                        <span className="hidden sm:inline">Adicionar</span>
                    </button>
                    </form>

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                        <button onClick={() => setShowScannerModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition text-sm sm:text-base">
                            <CameraIcon />
                            <span className="hidden sm:inline">Escanear QR</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition text-sm sm:text-base">
                            <UploadIcon />
                             <span className="hidden sm:inline">Planilha</span>
                        </button>
                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => setShowClearConfirmModal(true)} disabled={activeClass.students.length === 0} className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base">
                            <BroomIcon />
                             <span className="hidden sm:inline">Limpar</span>
                        </button>
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-6 mb-6">
                     <div className="flex items-center gap-2">
                        <label htmlFor="date-picker" className="font-semibold text-gray-300">Data da Chamada:</label>
                        <input
                            id="date-picker"
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                        <button onClick={() => setShowQrModal(true)} disabled={activeClass.students.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base">
                            <QrCodeIcon />
                             <span className="hidden sm:inline">Ver QRs</span>
                        </button>
                        <button onClick={() => setShowHistoryModal(true)} disabled={activeClass.students.length === 0} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition disabled:bg-gray-500 disabled:cursor-not-allowed text-sm sm:text-base">
                            <HistoryIcon />
                             <span className="hidden sm:inline">Histórico</span>
                        </button>
                        <button onClick={handleExportCSV} disabled={activeClass.students.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded-md flex items-center justify-center gap-2 transition disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base">
                            <ExportIcon />
                             <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                 </div>
            
                <Summary students={activeClass.students} selectedDate={selectedDate} />
            
                {activeClass.students.length > 1 && (
                        <div className="flex justify-end mt-4">
                            <button onClick={toggleSortOrder} className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition text-sm">
                                {sortOrder === SortOrder.Asc ? <SortAscendingIcon /> : <SortDescendingIcon />}
                                Ordenar {sortOrder === SortOrder.Asc ? 'A-Z' : 'Z-A'}
                            </button>
                        </div>
                    )}

                <div className="mt-6 space-y-3">
                    {sortedStudents.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">Nenhum aluno nesta turma. Adicione um nome ou carregue uma planilha.</p>
                    ) : (
                        sortedStudents.map(student => (
                        <StudentItem 
                            key={student.id}
                            student={student}
                            selectedDate={selectedDate}
                            onSetStatus={handleSetStatus}
                            onDelete={handleDeleteStudent}
                        />
                        ))
                    )}
                </div>
            </>
          ) : (
             <div className="text-center py-12">
                <StudentsIcon className="mx-auto h-16 w-16 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-white">Nenhuma turma encontrada</h3>
                <p className="mt-1 text-sm text-gray-400">Crie sua primeira turma para começar.</p>
                <div className="mt-6">
                    <button
                    type="button"
                    onClick={() => setShowAddClassModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                    <PlusIcon />
                    Criar Turma
                    </button>
                </div>
            </div>
          )}
        </main>
      </div>
      
      {showQrModal && activeClass && <StudentQRCodeModal students={activeClass.students} onClose={() => setShowQrModal(false)} />}
      {showScannerModal && <QRScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScannerModal(false)} />}
      {showAddClassModal && <AddClassModal onAddClass={handleAddClass} onClose={() => setShowAddClassModal(false)} />}
      {showHistoryModal && activeClass && <AttendanceHistoryModal students={activeClass.students} onClose={() => setShowHistoryModal(false)} />}
      
      <ConfirmationModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={handleClearAll}
        title="Limpar Lista de Alunos"
      >
        <p>Você tem certeza que deseja remover todos os alunos desta turma? Esta ação não pode ser desfeita.</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={handleConfirmDeleteClass}
        title="Excluir Turma"
        confirmText='Excluir'
      >
        {classToDelete && <p>Você tem certeza que deseja excluir a turma <strong>{classToDelete.name}</strong>? Todos os alunos serão removidos permanentemente.</p>}
      </ConfirmationModal>
    </div>
  );
};

export default App;
