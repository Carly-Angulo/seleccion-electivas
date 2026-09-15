require('dotenv').config();
const crypto = require('crypto');

const libsqlUrl = process.env.DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const hostname = libsqlUrl.replace('libsql://', '');
const HTTP_URL = `https://${hostname}/v2/pipeline`;

function generateId() {
  return crypto.randomUUID();
}

async function executeSQL(sql, params = []) {
  const response = await fetch(HTTP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args: params.map(p => ({ type: 'text', value: String(p) })) } }]
    })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  
  return response.json();
}

async function seed() {
  console.log('🌱 Iniciando seed via HTTP API...');
  
  try {
    // Admin
    const adminEmail = 'admin';
    const adminPassword = 'admin12345';
    // Simple hash for demo - in production use bcrypt
    const passwordHash = '$2a$10$' + crypto.randomBytes(22).toString('base64').replace(/[+/=]/g, '');
    
    await executeSQL(
      `INSERT OR IGNORE INTO admins (id, email, password_hash) VALUES (?, ?, ?)`,
      [generateId(), adminEmail, passwordHash]
    );
    console.log('✅ Administrador creado');

    // Selection rules
    await executeSQL(
      `INSERT OR IGNORE INTO selection_rules (id, grade, min_electives, max_electives) VALUES (?, ?, ?, ?)`,
      [generateId(), '11', 0, 5]
    );
    await executeSQL(
      `INSERT OR IGNORE INTO selection_rules (id, grade, min_electives, max_electives) VALUES (?, ?, ?, ?)`,
      [generateId(), '12', 2, 2]
    );
    console.log('✅ Reglas de selección creadas');

    // Electivas 12°
    const electivas12 = [
      { name: 'Estadística', description: 'Estadística descriptiva e inferencial', capacity: 25, sortOrder: 1 },
      { name: 'Excel', description: 'Manejo avanzado de hojas de cálculo', capacity: 25, sortOrder: 2 },
      { name: 'Arte I', description: 'Fundamentos de arte y expresión visual', capacity: 20, sortOrder: 3 },
      { name: 'Psicología', description: 'Introducción a la psicología', capacity: 20, sortOrder: 4 },
      { name: 'Química III', description: 'Química avanzada', capacity: 15, sortOrder: 5 },
      { name: 'Relaciones Internacionales', description: 'Análisis de relaciones internacionales', capacity: 20, sortOrder: 6 },
    ];

    for (const e of electivas12) {
      await executeSQL(
        `INSERT OR IGNORE INTO subjects (id, name, description, grade, track, type, capacity, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateId(), e.name, e.description, '12', 'ambos', 'electiva', e.capacity, 1, e.sortOrder]
      );
    }
    console.log('✅ Electivas de 12° creadas');

    // Cursos avanzados 12°
    const cursosAvanzados = [
      { name: 'Cálculo Avanzado - Electiva', description: 'Cálculo diferencial e integral avanzado', capacity: 20, sortOrder: 1, track: 'ciencias' },
      { name: 'Comparative Literature II Honors', description: 'Literatura comparada nivel avanzado', capacity: 20, sortOrder: 2, track: 'humanidades' },
      { name: 'Español Avanzado - Electiva', description: 'Lengua y literatura española avanzada', capacity: 20, sortOrder: 3, track: 'ambos' },
      { name: 'Física Avanzada II', description: 'Física moderna y avanzada', capacity: 15, sortOrder: 4, track: 'ciencias' },
      { name: 'Química III Avanzado - Electiva', description: 'Química orgánica e inorgánica avanzada', capacity: 15, sortOrder: 5, track: 'ciencias' },
      { name: 'Cálculo Avanzado', description: 'Cálculo multivariable y ecuaciones diferenciales', capacity: 20, sortOrder: 6, track: 'ciencias' },
    ];

    for (const c of cursosAvanzados) {
      await executeSQL(
        `INSERT OR IGNORE INTO subjects (id, name, description, grade, track, type, capacity, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateId(), c.name, c.description, '12', c.track, 'avanzado', c.capacity, 1, c.sortOrder]
      );
    }
    console.log('✅ Cursos avanzados de 12° creados');

    console.log('📋 Estructura para 11° lista (administrador debe agregar materias)');
    console.log('🎉 Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

seed().catch(() => process.exit(1));