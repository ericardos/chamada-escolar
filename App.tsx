
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
import { SupportSection } from './components/SupportSection';

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
    const month = date.getMonth();
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
    
    // Encontrar o aluno
    const student = activeClass.students.find(s => s.id === studentId);
    if (!student) return null;

    studentName = student.name;

    // Atualizar estado
    updateClass(activeClass.id, cls => ({
        ...cls,
        students: cls.students.map(s => {
            if (s.id === studentId) {
                return { 
                    ...s, 
                    attendance: { ...s.attendance, [selectedDate]: AttendanceStatus.Present } 
                };
            }
            return s;
        })
    }));

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
             <div className="text-center py-10 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl">
                <div className="bg-slate-700/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <SchoolIcon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenhuma escola cadastrada</h3>
                <p className="mt-1 text-slate-400 text-sm max-w-xs mx-auto">Comece adicionando uma instituição.</p>
                <div className="mt-6">
                    <button
                    type="button"
                    onClick={() => setShowAddSchoolModal(true)}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                    <PlusIcon />
                    <span className="ml-2">Cadastrar Escola</span>
                    </button>
                </div>
            </div>
          );
      }

      if (!activeClass) {
          return (
             <div className="text-center py-10 bg-slate-800/30 backdrop-blur-sm border-x border-b border-slate-700/50 p-6 rounded-b-2xl shadow-xl">
                <div className="bg-slate-700/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <StudentsIcon className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Pronto para começar?</h3>
                <p className="mt-1 text-slate-400 text-sm max-w-xs mx-auto">Crie uma turma nesta escola.</p>
                <div className="mt-6">
                    <button
                    type="button"
                    onClick={() => setShowAddClassModal(true)}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/20 transition-all active:scale-95"
                    >
                    <PlusIcon />
                    <span className="ml-2">Criar Turma</span>
                    </button>
                </div>
            </div>
          );
      }

      return (
          <main className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-4 rounded-b-2xl shadow-xl">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <form onSubmit={handleAddStudent} className="flex-grow flex gap-2">
                    <input
                        type="text"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        placeholder="Novo aluno..."
                        className="flex-grow bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg text-xs">
                        <PlusIcon />
                        <span>Adicionar</span>
                    </button>
                    </form>

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <button onClick={() => setShowScannerModal(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs">
                            <CameraIcon />
                            <span>Escanear</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs">
                            <UploadIcon />
                             <span>Importar</span>
                        </button>
                        <input type="file" accept=".csv,.txt" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => setShowClearConfirmModal(true)} disabled={activeClass.students.length === 0} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 shadow-lg text-xs">
                            <BroomIcon />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-700/50 p-3 rounded-xl mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-lg">
                                <HistoryIcon className="text-blue-400 h-4 w-4" />
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="bg-transparent text-white font-bold text-sm border-none p-0 focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowQrModal(true)} disabled={activeClass.students.length === 0} className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider disabled:opacity-50">
                                QR CODES
                            </button>
                            <button onClick={() => setShowHistoryModal(true)} disabled={activeClass.students.length === 0} className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider disabled:opacity-50">
                                HISTÓRICO
                            </button>
                            <button onClick={handleExportCSV} disabled={activeClass.students.length === 0} className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider disabled:opacity-50">
                                EXPORTAR
                            </button>
                        </div>
                    </div>
                </div>
            
                <Summary students={activeClass.students} selectedDate={selectedDate} />
            
                <div className="flex items-center justify-between mt-6 mb-2 px-1">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        LISTAGEM <span className="bg-slate-700 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md">{activeClass.students.length}</span>
                    </h2>
                    {activeClass.students.length > 1 && (
                        <button onClick={toggleSortOrder} className="text-slate-500 hover:text-white flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider">
                            {sortOrder === SortOrder.Asc ? <SortAscendingIcon /> : <SortDescendingIcon />}
                            ORDEM
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {sortedStudents.length === 0 ? (
                        <div className="col-span-full text-center py-10 bg-slate-900/20 border border-dashed border-slate-700/50 rounded-xl">
                             <p className="text-slate-600 text-xs font-medium italic">Nenhum aluno cadastrado.</p>
                        </div>
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
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <div className="container mx-auto max-w-5xl px-4 py-2 flex-grow overflow-hidden flex flex-col">
        <Header />
        
        <div className="flex-grow flex flex-col min-h-0">
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
        
        <SupportSection />
      </div>
      
      {showQrModal && activeClass && (
        <StudentQRCodeModal 
            students={activeClass.students} 
            className={activeClass.name}
            onClose={() => setShowQrModal(false)} 
        />
      )}
      {showScannerModal && <QRScannerModal onScanSuccess={handleScanSuccess} onClose={() => setShowScannerModal(false)} />}
      {showAddSchoolModal && <AddSchoolModal onAddSchool={handleAddSchool} onClose={() => setShowAddSchoolModal(false)} />}
      {showAddClassModal && <AddClassModal onAddClass={handleAddClass} onClose={() => setShowAddClassModal(false)} />}
      {showHistoryModal && activeClass && <AttendanceHistoryModal students={activeClass.students} onClose={() => setShowHistoryModal(false)} />}
      
      <ConfirmationModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={handleClearAll}
        title="Limpar Lista"
      >
        <p>Remover todos os alunos desta turma?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={handleConfirmDeleteClass}
        title="Excluir Turma"
        confirmText='Excluir'
      >
        {classToDelete && <p>Deseja excluir <strong>{classToDelete.name}</strong>?</p>}
      </ConfirmationModal>

       <ConfirmationModal
        isOpen={!!schoolToDelete}
        onClose={() => setSchoolToDelete(null)}
        onConfirm={handleConfirmDeleteSchool}
        title="Excluir Escola"
        confirmText='Excluir'
      >
        {schoolToDelete && <p>Deseja excluir a escola <strong>{schoolToDelete.name}</strong>?</p>}
      </ConfirmationModal>
    </div>
  );
};

export default App;
