
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, AttendanceStatus, SortOrder, Class, School } from './types';
import { Header } from './components/Header';
import { Summary } from './components/Summary';
import { StudentQRCodeModal } from './components/QRCodeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { StudentItem } from './components/StudentItem';
import { PlusIcon, UploadIcon, QrCodeIcon, BroomIcon, SortAscendingIcon, SortDescendingIcon, CameraIcon, StudentsIcon, ExportIcon, HistoryIcon, SchoolIcon } from './components/icons';
import { ClassTabs } from './components/ClassTabs';
import { AddClassModal } from './components/AddClassModal';
import { QRScannerModal } from './components/QRScannerModal';
import { AttendanceHistoryModal } from './components/AttendanceHistoryModal';
import { SchoolTabs } from './components/SchoolTabs';
import { AddSchoolModal } from './components/AddSchoolModal';

const getTodayString = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const savedSchools = localStorage.getItem('attendance-schools-v1');
      return savedSchools ? JSON.parse(savedSchools) : [];
    } catch (error) {
      console.error("Failed to parse schools from localStorage", error);
      return [];
    }
  });

  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [newStudentName, setNewStudentName] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.None);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State Persistence & Initialization ---
  useEffect(() => {
    localStorage.setItem('attendance-schools-v1', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    if (!activeSchoolId && schools.length > 0) {
      setActiveSchoolId(schools[0].id);
    }
    if (schools.length === 0) {
      setActiveSchoolId(null);
    }
  }, [schools, activeSchoolId]);

  const activeSchool = useMemo(() => schools.find(s => s.id === activeSchoolId), [schools, activeSchoolId]);

  useEffect(() => {
    if (activeSchool) {
        if (!activeClassId || !activeSchool.classes.find(c => c.id === activeClassId)) {
            setActiveClassId(activeSchool.classes[0]?.id || null);
        }
    } else {
        setActiveClassId(null);
    }
  }, [activeSchool, activeClassId]);

  const activeClass = useMemo(() => activeSchool?.classes.find(c => c.id === activeClassId), [activeSchool, activeClassId]);
  
  // --- Data Mutation Helpers ---
  const updateSchool = (schoolId: string, updateFn: (school: School) => School) => {
    setSchools(schools.map(s => s.id === schoolId ? updateFn(s) : s));
  };

  const updateClass = (classId: string, updateFn: (cls: Class) => Class) => {
    if (!activeSchoolId) return;
    updateSchool(activeSchoolId, school => ({
      ...school,
      classes: school.classes.map(c => c.id === classId ? updateFn(c) : c)
    }));
  };

  const updateStudentsForActiveClass = (newStudents: Student[]) => {
    if (!activeClassId) return;
    updateClass(activeClassId, cls => ({ ...cls, students: newStudents }));
  };

  // --- Handlers ---
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
  
  const handleAddSchool = (name: string) => {
    const newSchool: School = {
        id: `${Date.now()}`,
        name,
        classes: []
    };
    const newSchools = [...schools, newSchool];
    setSchools(newSchools);
    setActiveSchoolId(newSchool.id);
    setShowAddSchoolModal(false);
  };

  const handleRequestDeleteSchool = (schoolId: string) => {
      const school = schools.find(s => s.id === schoolId);
      if (school) setSchoolToDelete(school);
  }
  
  const handleConfirmDeleteSchool = () => {
      if (!schoolToDelete) return;

      const deletedIndex = schools.findIndex(s => s.id === schoolToDelete.id);
      const newSchools = schools.filter(s => s.id !== schoolToDelete.id);

      if (activeSchoolId === schoolToDelete.id) {
          if (newSchools.length > 0) {
              const newIndex = Math.max(0, deletedIndex - 1);
              setActiveSchoolId(newSchools[newIndex].id);
          } else {
              setActiveSchoolId(null);
          }
      }
      setSchools(newSchools);
      setSchoolToDelete(null);
  };

  const handleAddClass = (name: string) => {
    if (!activeSchoolId) return;
    const newClass: Class = {
        id: `${Date.now()}`,
        name,
        students: []
    };
    updateSchool(activeSchoolId, school => ({
        ...school,
        classes: [...school.classes, newClass]
    }));
    setActiveClassId(newClass.id);
    setShowAddClassModal(false);
  };
  
  const handleRequestDeleteClass = (classId: string) => {
    const foundClass = activeSchool?.classes.find(c => c.id === classId);
    if (foundClass) {
        setClassToDelete(foundClass);
    }
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete || !activeSchoolId) return;
    
    updateSchool(activeSchoolId, school => {
        const deletedIndex = school.classes.findIndex(c => c.id === classToDelete.id);
        const newClasses = school.classes.filter(c => c.id !== classToDelete.id);
        
        if (activeClassId === classToDelete.id) {
            if (newClasses.length > 0) {
                const newIndex = Math.max(0, deletedIndex - 1);
                setActiveClassId(newClasses[newIndex].id);
            } else {
                setActiveClassId(null);
            }
        }
        return { ...school, classes: newClasses };
    });

    setClassToDelete(null);
  };

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
    
  const handleExportCSV = () => {
    if (!activeSchool || !activeClass || activeClass.students.length === 0) return;

    const date = new Date(selectedDate + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date).toUpperCase();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const statusMap = {
        [AttendanceStatus.Present]: 'P',
        [AttendanceStatus.Absent]: 'F',
        [AttendanceStatus.Justified]: 'FJ',
    };

    let csvContent = `ESCOLA ${activeSchool.name.toUpperCase()}\n\n`;
    csvContent += 'CONTROLE DE FREQUÊNCIA\n';
    csvContent += `Ano,${year},,Mês,${monthName}\n\n`;
    csvContent += 'P,Presença\n';
    csvContent += 'F,Falta\n';
    csvContent += 'FJ,Falta Justificada\n\n';

    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const headers = ['Nº', 'Nome', ...dayHeaders, 'Total de Falta de Frequencia'];
    csvContent += headers.join(',') + '\n';

    const rows = activeClass.students.map((student, index) => {
        const studentRow = [(index + 1).toString(), `"${student.name.replace(/"/g, '""')}"`];
        let totalAbsences = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = day.toString().padStart(2, '0');
            const monthString = (month + 1).toString().padStart(2, '0');
            const currentDate = `${year}-${monthString}-${dayString}`;
            
            const status = student.attendance[currentDate];
            let mappedStatus = '';

            if (status && status !== AttendanceStatus.Pending) {
                 const typedStatus = status as keyof typeof statusMap;
                 mappedStatus = statusMap[typedStatus] || '';
                 if (status === AttendanceStatus.Absent || status === AttendanceStatus.Justified) {
                    totalAbsences++;
                 }
            }
            studentRow.push(mappedStatus);
        }
        
        studentRow.push(totalAbsences.toString());
        return studentRow.join(',');
    });

    csvContent += rows.join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const fileName = `Frequencia_${activeSchool.name.replace(/\s+/g, '_')}_${activeClass.name.replace(/\s+/g, '_')}_${monthName}_${year}.csv`;
    
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const renderContent = () => {
      if (schools.length === 0) {
          return (
             <div className="text-center py-12 bg-gray-800 p-6 rounded-lg shadow-2xl">
                <SchoolIcon className="mx-auto h-16 w-16 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-white">Nenhuma escola encontrada</h3>
                <p className="mt-1 text-sm text-gray-400">Crie sua primeira escola para começar.</p>
                <div className="mt-6">
                    <button
                    type="button"
                    onClick={() => setShowAddSchoolModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                    <PlusIcon />
                    Criar Escola
                    </button>
                </div>
            </div>
          );
      }

      if (!activeClass) {
          return (
             <div className="text-center py-12 bg-gray-800 p-6 rounded-b-lg shadow-2xl">
                <StudentsIcon className="mx-auto h-16 w-16 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-white">Nenhuma turma nesta escola</h3>
                <p className="mt-1 text-sm text-gray-400">Crie uma turma para começar a adicionar alunos.</p>
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
          );
      }

      return (
          <main className="bg-gray-800 p-6 rounded-b-lg shadow-2xl">
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
                        <input type="file" accept=".csv,.txt" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
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
        </main>
      );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans">
      <div className="container mx-auto max-w-4xl p-4">
        <Header />

        {schools.length > 0 && (
            <>
                <SchoolTabs
                    schools={schools}
                    activeSchoolId={activeSchoolId}
                    onSelectSchool={setActiveSchoolId}
                    onAddSchool={() => setShowAddSchoolModal(true)}
                    onDeleteSchool={handleRequestDeleteSchool}
                />
                <ClassTabs 
                    classes={activeSchool?.classes || []}
                    activeClassId={activeClassId}
                    onSelectClass={setActiveClassId}
                    onAddClass={() => setShowAddClassModal(true)}
                    onDeleteClass={handleRequestDeleteClass}
                />
            </>
        )}
        
        {renderContent()}

      </div>
      
      {showQrModal && activeClass && <StudentQRCodeModal students={activeClass.students} onClose={() => setShowQrModal(false)} />}
      {showScannerModal && <QRScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScannerModal(false)} />}
      {showAddSchoolModal && <AddSchoolModal onAddSchool={handleAddSchool} onClose={() => setShowAddSchoolModal(false)} />}
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
        {classToDelete && <p>Você tem certeza que deseja excluir a turma <strong>{classToDelete.name}</strong>? Todos os dados dos alunos serão removidos permanentemente.</p>}
      </ConfirmationModal>

       <ConfirmationModal
        isOpen={!!schoolToDelete}
        onClose={() => setSchoolToDelete(null)}
        onConfirm={handleConfirmDeleteSchool}
        title="Excluir Escola"
        confirmText='Excluir'
      >
        {schoolToDelete && <p>Você tem certeza que deseja excluir a escola <strong>{schoolToDelete.name}</strong>? Todas as turmas e alunos associados serão removidos permanentemente.</p>}
      </ConfirmationModal>
    </div>
  );
};

export default App;
