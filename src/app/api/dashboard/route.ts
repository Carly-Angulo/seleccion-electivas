import { NextResponse } from 'next/server';
import { db } from '@/db';
import { students, subjects, selections, selectionRules } from '@/db/schema';
import { eq, count, and, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Estadísticas generales
    const totalStudents = await db.select({ count: count() }).from(students);
    const grade11 = await db.select({ count: count() }).from(students).where(eq(students.grade, '11'));
    const grade12 = await db.select({ count: count() }).from(students).where(eq(students.grade, '12'));
    const ciencias = await db.select({ count: count() }).from(students).where(eq(students.track, 'ciencias'));
    const humanidades = await db.select({ count: count() }).from(students).where(eq(students.track, 'humanidades'));

    // Selecciones totales
    const totalSelections = await db.select({ count: count() }).from(selections);
    const advancedSelections = await db
      .select({ count: count() })
      .from(selections)
      .where(eq(selections.selectionType, 'avanzado'));

    // Estudiantes por grado
    const studentsByGrade = [
      { name: '11º', value: grade11[0].count },
      { name: '12º', value: grade12[0].count },
    ];

    // Estudiantes por bachillerato
    const studentsByTrack = [
      { name: 'Ciencias', value: ciencias[0].count },
      { name: 'Humanidades', value: humanidades[0].count },
    ];

    // Selecciones de electivas
    const electivas = await db.query.subjects.findMany({
      where: eq(subjects.type, 'electiva'),
    });

    const electiveSelections = await Promise.all(
      electivas.map(async (subject) => {
        const countResult = await db
          .select({ count: count() })
          .from(selections)
          .where(eq(selections.subjectId, subject.id));
        return { name: subject.name, value: countResult[0].count };
      })
    );

    // Cursos avanzados
    const avanzados = await db.query.subjects.findMany({
      where: eq(subjects.type, 'avanzado'),
    });

    const advancedCourseSelections = await Promise.all(
      avanzados.map(async (subject) => {
        const countResult = await db
          .select({ count: count() })
          .from(selections)
          .where(eq(selections.subjectId, subject.id));
        return { name: subject.name, value: countResult[0].count };
      })
    );

    // Cupos
    const allSubjects = await db.query.subjects.findMany();
    const capacityData = await Promise.all(
      allSubjects.map(async (subject) => {
        const countResult = await db
          .select({ count: count() })
          .from(selections)
          .where(eq(selections.subjectId, subject.id));
        const occupied = countResult[0].count;
        return {
          subject: subject.name,
          grade: subject.grade,
          type: subject.type,
          total: subject.capacity,
          occupied,
          available: subject.capacity - occupied,
          occupancyRate: subject.capacity > 0 ? (occupied / subject.capacity) * 100 : 0,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalStudents: totalStudents[0].count,
        grade11Count: grade11[0].count,
        grade12Count: grade12[0].count,
        cienciasCount: ciencias[0].count,
        humanidadesCount: humanidades[0].count,
        totalSelections: totalSelections[0].count,
        totalAdvancedSelections: advancedSelections[0].count,
      },
      charts: {
        studentsByGrade,
        studentsByTrack,
        electiveSelections,
        advancedCourseSelections,
        capacityData,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Error al obtener dashboard' }, { status: 500 });
  }
}