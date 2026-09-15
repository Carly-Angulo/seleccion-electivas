import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getGradeLabel(grade: '11' | '12'): string {
  return `${grade}º`;
}

export function getTrackLabel(track: 'ciencias' | 'humanidades'): string {
  return track.charAt(0).toUpperCase() + track.slice(1);
}

export function getStatusLabel(status: 'pendiente' | 'confirmado' | 'procesado'): string {
  const labels = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    procesado: 'Procesado',
  };
  return labels[status];
}

export function getStatusColor(status: 'pendiente' | 'confirmado' | 'procesado'): string {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmado: 'bg-green-100 text-green-800',
    procesado: 'bg-blue-100 text-blue-800',
  };
  return colors[status];
}

export function getSubjectTypeLabel(type: 'materia' | 'electiva' | 'avanzado'): string {
  const labels = {
    materia: 'Materia',
    electiva: 'Electiva',
    avanzado: 'Curso Avanzado',
  };
  return labels[type];
}

export function getSubjectTypeColor(type: 'materia' | 'electiva' | 'avanzado'): string {
  const colors = {
    materia: 'bg-blue-100 text-blue-800',
    electiva: 'bg-purple-100 text-purple-800',
    avanzado: 'bg-orange-100 text-orange-800',
  };
  return colors[type];
}