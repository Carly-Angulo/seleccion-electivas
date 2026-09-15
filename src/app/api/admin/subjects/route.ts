import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allSubjects = await db.query.subjects.findMany({
      orderBy: (subjects, { desc }) => [desc(subjects.createdAt)],
    });

    return NextResponse.json(allSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Error al obtener materias' }, { status: 500 });
  }
}