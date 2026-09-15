import { NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects, selections } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allSubjects = await db.query.subjects.findMany({
      orderBy: (subjects, { asc }) => [asc(subjects.grade), asc(subjects.sortOrder)],
    });

    const capacityData = await Promise.all(
      allSubjects.map(async (subject) => {
        const occupiedResult = await db
          .select({ count: count() })
          .from(selections)
          .where(eq(selections.subjectId, subject.id));
        const occupied = occupiedResult[0].count;
        const available = subject.capacity - occupied;
        const occupancyRate = subject.capacity > 0 ? (occupied / subject.capacity) * 100 : 0;

        return {
          id: subject.id,
          subject: subject.name,
          grade: subject.grade,
          type: subject.type,
          total: subject.capacity,
          occupied,
          available,
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          active: subject.active,
        };
      })
    );

    return NextResponse.json(capacityData);
  } catch (error) {
    console.error('Error fetching capacity report:', error);
    return NextResponse.json({ error: 'Error al obtener reporte de cupos' }, { status: 500 });
  }
}