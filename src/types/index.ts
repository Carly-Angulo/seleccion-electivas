export type Grade = '11' | '12';
export type Track = 'ciencias' | 'humanidades';
export type SubjectType = 'materia' | 'electiva' | 'avanzado';
export type SubjectTrack = 'ciencias' | 'humanidades' | 'ambos';
export type StudentStatus = 'pendiente' | 'confirmado' | 'procesado';
export type SelectionType = 'electiva1' | 'electiva2' | 'avanzado';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone?: string;
  grade: Grade;
  track: Track;
  observation?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  grade: Grade;
  track: SubjectTrack;
  type: SubjectType;
  capacity: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Selection {
  id: string;
  studentId: string;
  subjectId: string;
  selectionType: SelectionType;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SelectionRule {
  id: string;
  grade: Grade;
  minElectives: number;
  maxElectives: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithSelections extends Student {
  selections: SelectionWithSubject[];
}

export interface SelectionWithSubject extends Selection {
  subject: Subject;
}

export interface SubjectWithStats extends Subject {
  occupied: number;
  available: number;
  occupancyRate: number;
}

export interface DashboardStats {
  totalStudents: number;
  grade11Count: number;
  grade12Count: number;
  cienciasCount: number;
  humanidadesCount: number;
  totalSelections: number;
  totalAdvancedSelections: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface CapacityChartData {
  subject: string;
  total: number;
  occupied: number;
  available: number;
}