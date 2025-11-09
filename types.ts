export enum AttendanceStatus {
  Present = 'Presente',
  Absent = 'Falta',
  Justified = 'Justificada',
  Pending = 'Pendente'
}

export interface Student {
  id: string;
  name: string;
  attendance: { [date: string]: AttendanceStatus };
}

export enum SortOrder {
    None = 'none',
    Asc = 'asc',
    Desc = 'desc'
}

export interface Class {
    id: string;
    name: string;
    students: Student[];
}