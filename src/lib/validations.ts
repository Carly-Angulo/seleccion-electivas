import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string().min(1, 'Nombre es obligatorio'),
  lastName: z.string().min(1, 'Apellido es obligatorio'),
  studentId: z.string().min(1, 'Identificación es obligatoria'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
  grade: z.enum(['11', '12']),
  track: z.enum(['ciencias', 'humanidades']),
  observation: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Nombre es obligatorio'),
  description: z.string().optional(),
  grade: z.enum(['11', '12']),
  track: z.enum(['ciencias', 'humanidades', 'ambos']),
  type: z.enum(['materia', 'electiva', 'avanzado']),
  capacity: z.number().int().min(0, 'La capacidad debe ser un número positivo'),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const selectionSchema = z.object({
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  subjectId: z.string().min(1, 'ID de materia requerido'),
  selectionType: z.enum(['electiva1', 'electiva2', 'avanzado']),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'Contraseña es obligatoria'),
});

export const selectionRuleSchema = z.object({
  grade: z.enum(['11', '12']),
  minElectives: z.number().int().min(0).max(10),
  maxElectives: z.number().int().min(0).max(10),
});

export const exportFiltersSchema = z.object({
  grade: z.enum(['11', '12', 'all']).optional(),
  track: z.enum(['ciencias', 'humanidades', 'all']).optional(),
  subjectId: z.string().optional(),
  status: z.enum(['pendiente', 'confirmado', 'procesado', 'all']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});