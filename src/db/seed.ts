import 'dotenv/config';
import { db } from './index';
import { subjects, admins, selectionRules } from './schema';
import { generateId } from '@/utils/helpers';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Crear administrador por defecto
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@colegio.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.insert(admins).values({
      id: generateId(),
      email: adminEmail,
      passwordHash,
    }).onConflictDoNothing();

    console.log('✅ Administrador creado');

    // Reglas de selección por defecto
    await db.insert(selectionRules).values([
      {
        id: generateId(),
        grade: '11',
        minElectives: 0,
        maxElectives: 5,
      },
      {
        id: generateId(),
        grade: '12',
        minElectives: 2,
        maxElectives: 2,
      },
    ]).onConflictDoNothing();

    console.log('✅ Reglas de selección creadas');

    // Materias de 12° - Electivas
    const electivas12 = [
      { name: 'Estadística', description: 'Estadística descriptiva e inferencial', capacity: 25, sortOrder: 1 },
      { name: 'Excel', description: 'Manejo avanzado de hojas de cálculo', capacity: 25, sortOrder: 2 },
      { name: 'Arte I', description: 'Fundamentos de arte y expresión visual', capacity: 20, sortOrder: 3 },
      { name: 'Psicología', description: 'Introducción a la psicología', capacity: 20, sortOrder: 4 },
      { name: 'Química III', description: 'Química avanzada', capacity: 15, sortOrder: 5 },
      { name: 'Relaciones Internacionales', description: 'Análisis de relaciones internacionales', capacity: 20, sortOrder: 6 },
    ];

    for (const e of electivas12) {
      await db.insert(subjects).values({
        id: generateId(),
        name: e.name,
        description: e.description,
        grade: '12',
        track: 'ambos',
        type: 'electiva',
        capacity: e.capacity,
        active: true,
        sortOrder: e.sortOrder,
      }).onConflictDoNothing();
    }

    console.log('✅ Electivas de 12° creadas');

    // Cursos avanzados de 12°
    const cursosAvanzados = [
      { name: 'Cálculo Avanzado - Electiva', description: 'Cálculo diferencial e integral avanzado', capacity: 20, sortOrder: 1, track: 'ciencias' as const },
      { name: 'Comparative Literature II Honors', description: 'Literatura comparada nivel avanzado', capacity: 20, sortOrder: 2, track: 'humanidades' as const },
      { name: 'Español Avanzado - Electiva', description: 'Lengua y literatura española avanzada', capacity: 20, sortOrder: 3, track: 'ambos' as const },
      { name: 'Física Avanzada II', description: 'Física moderna y avanzada', capacity: 15, sortOrder: 4, track: 'ciencias' as const },
      { name: 'Química III Avanzado - Electiva', description: 'Química orgánica e inorgánica avanzada', capacity: 15, sortOrder: 5, track: 'ciencias' as const },
      { name: 'Cálculo Avanzado', description: 'Cálculo multivariable y ecuaciones diferenciales', capacity: 20, sortOrder: 6, track: 'ciencias' as const },
    ];

    for (const c of cursosAvanzados) {
      await db.insert(subjects).values({
        id: generateId(),
        name: c.name,
        description: c.description,
        grade: '12',
        track: c.track,
        type: 'avanzado',
        capacity: c.capacity,
        active: true,
        sortOrder: c.sortOrder,
      }).onConflictDoNothing();
    }

    console.log('✅ Cursos avanzados de 12° creados');

    // Estructura para 11° (vacía para que el admin agregue)
    console.log('📋 Estructura para 11° lista (administrador debe agregar materias)');

    console.log('🎉 Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));