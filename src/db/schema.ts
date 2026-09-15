import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  studentId: text('student_id').notNull().unique(),
  email: text('email').notNull(),
  phone: text('phone'),
  grade: text('grade', { enum: ['11', '12'] }).notNull(),
  track: text('track', { enum: ['ciencias', 'humanidades'] }).notNull(),
  observation: text('observation'),
  status: text('status', { enum: ['pendiente', 'confirmado', 'procesado'] }).default('pendiente').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  grade: text('grade', { enum: ['11', '12'] }).notNull(),
  track: text('track', { enum: ['ciencias', 'humanidades', 'ambos'] }).default('ambos').notNull(),
  type: text('type', { enum: ['materia', 'electiva', 'avanzado'] }).notNull(),
  capacity: integer('capacity').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const selections = sqliteTable('selections', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  selectionType: text('selection_type', { enum: ['electiva1', 'electiva2', 'avanzado'] }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  studentSubjectUnique: uniqueIndex('student_subject_unique').on(table.studentId, table.subjectId),
}));

export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const selectionRules = sqliteTable('selection_rules', {
  id: text('id').primaryKey(),
  grade: text('grade', { enum: ['11', '12'] }).notNull(),
  minElectives: integer('min_electives').notNull().default(0),
  maxElectives: integer('max_electives').notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  gradeUnique: uniqueIndex('grade_unique').on(table.grade),
}));