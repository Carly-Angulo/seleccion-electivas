import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects } from '@/db/schema';
import { eq, and, or, ilike, count, desc, inArray, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const grade = searchParams.get('grade');
    const track = searchParams.get('track');
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(students.firstName, `%${search}%`),
          ilike(students.lastName, `%${search}%`),
          ilike(students.studentId, `%${search}%`),
          ilike(students.email, `%${search}%`)
        )!
      );
    }

    if (grade) conditions.push(eq(students.grade, grade as '11' | '12'));
    if (track) conditions.push(eq(students.track, track as 'ciencias' | 'humanidades'));
    if (status) conditions.push(eq(students.status, status as 'pendiente' | 'confirmado' | 'procesado'));

    let studentIds: string[] | null = null;
    if (subject) {
      const selectionResults = await db
        .select({ studentId: selections.studentId })
        .from(selections)
        .where(eq(selections.subjectId, subject));
      studentIds = selectionResults.map(s => s.studentId);
      if (studentIds.length > 0) {
        conditions.push(inArray(students.id, studentIds));
      } else {
        return NextResponse.json([]);
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

    return NextResponse.json(allStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}