import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects, selections } from '@/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { subjectSchema } from '@/lib/validations';
import { generateId } from '@/utils/helpers';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    const type = searchParams.get('type');
    const activeOnly = searchParams.get('active') === 'true';

    const conditions = [];
    if (grade) conditions.push(eq(subjects.grade, grade as '11' | '12'));
    if (type) conditions.push(eq(subjects.type, type as 'materia' | 'electiva' | 'avanzado'));
    if (activeOnly) conditions.push(eq(subjects.active, true));

    const allSubjects = await db.query.subjects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (subjects, { asc }) => [asc(subjects.sortOrder), asc(subjects.name)],
    });

    // Calcular estadísticas de cupos
    const subjectsWithStats = await Promise.all(
      allSubjects.map(async (subject) => {
        const occupiedResult = await db
          .select({ count: count() })
          .from(selections)
          .where(eq(selections.subjectId, subject.id));
        const occupied = occupiedResult[0].count;
        return {
          ...subject,
          occupied,
          available: subject.capacity - occupied,
          occupancyRate: subject.capacity > 0 ? (occupied / subject.capacity) * 100 : 0,
        };
      })
    );

    return NextResponse.json(subjectsWithStats);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Error al obtener materias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = subjectSchema.parse(body);

    const subjectId = generateId();
    await db.insert(subjects).values({
      id: subjectId,
      ...validatedData,
    });

    return NextResponse.json({ success: true, id: subjectId, message: 'Materia creada' });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Error al crear materia' }, { status: 500 });
  }
}