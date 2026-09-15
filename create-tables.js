require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({ 
  url: process.env.DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

const schema = `
-- Students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('11', '12')),
  track TEXT NOT NULL CHECK (track IN ('ciencias', 'humanidades')),
  observation TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'procesado')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('11', '12')),
  track TEXT NOT NULL DEFAULT 'ambos' CHECK (track IN ('ciencias', 'humanidades', 'ambos')),
  type TEXT NOT NULL CHECK (type IN ('materia', 'electiva', 'avanzado')),
  capacity INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Selections table
CREATE TABLE IF NOT EXISTS selections (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  selection_type TEXT NOT NULL CHECK (selection_type IN ('electiva1', 'electiva2', 'avanzado')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(student_id, subject_id)
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Selection rules table
CREATE TABLE IF NOT EXISTS selection_rules (
  id TEXT PRIMARY KEY,
  grade TEXT NOT NULL CHECK (grade IN ('11', '12')) UNIQUE,
  min_electives INTEGER NOT NULL DEFAULT 0,
  max_electives INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

async function createTables() {
  const statements = schema.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (trimmed) {
      try {
        await client.execute(trimmed);
        console.log('✅ Ejecutado:', trimmed.split('\n')[0].trim());
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    }
  }
  
  // Verify tables
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('\n📋 Tablas creadas:', result.rows.map(r => r.name).join(', '));
}

createTables().catch(console.error);