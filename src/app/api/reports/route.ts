import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects } from '@/db/schema';
import { eq, and, count, gte, lte, inArray, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { exportFiltersSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = exportFiltersSchema.parse(Object.fromEntries(searchParams));

    const conditions = [];

    if (filters.grade && filters.grade !== 'all') {
      conditions.push(eq(students.grade, filters.grade));
    }
    if (filters.track && filters.track !== 'all') {
      conditions.push(eq(students.track, filters.track));
    }
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(students.status, filters.status));
    }
    if (filters.dateFrom) {
      conditions.push(gte(students.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(students.createdAt, filters.dateTo + 'T23:59:59'));
    }
    if (filters.subjectId) {
      // Subquery para obtener IDs de estudiantes que tienen esta materia
      const studentIds = await db
        .select({ studentId: selections.studentId })
        .from(selections)
        .where(eq(selections.subjectId, filters.subjectId));
      const ids = studentIds.map(s => s.studentId);
      if (ids.length > 0) {
        conditions.push(inArray(students.id, ids));
      } else {
        return NextResponse.json({ students: [], total: 0 });
      }
    }

    const allStudents = await db.query.students.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        selections: {
          with: {
            subject: true,
          },
        },
      },
      orderBy: (students, { desc }) => [desc(students.createdAt)],
    });

    return NextResponse.json({
      students: allStudents,
      total: allStudents.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}