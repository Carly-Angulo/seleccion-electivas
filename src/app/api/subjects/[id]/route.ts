import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects, selections } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { subjectSchema } from '@/lib/validations';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.id, id),
    });

    if (!subject) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
    }

    const occupiedResult = await db
      .select({ count: count() })
      .from(selections)
      .where(eq(selections.subjectId, id));
    const occupied = occupiedResult[0].count;

    return NextResponse.json({
      ...subject,
      occupied,
      available: subject.capacity - occupied,
      occupancyRate: subject.capacity > 0 ? (occupied / subject.capacity) * 100 : 0,
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json({ error: 'Error al obtener materia' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.id, id),
    });

    if (!subject) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
    }

    const validatedData = subjectSchema.partial().parse(body);

    // Validar que la nueva capacidad no sea menor a los estudiantes asignados
    if (validatedData.capacity !== undefined) {
      const occupiedResult = await db
        .select({ count: count() })
        .from(selections)
        .where(eq(selections.subjectId, id));
      const occupied = occupiedResult[0].count;

      if (validatedData.capacity < occupied) {
        return NextResponse.json(
          { error: 'La cantidad de cupos no puede ser menor que el número de estudiantes actualmente asignados' },
          { status: 400 }
        );
      }
    }

    await db
      .update(subjects)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subjects.id, id));

    return NextResponse.json({ success: true, message: 'Materia actualizada' });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Error al actualizar materia' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar si tiene estudiantes asignados
    const occupiedResult = await db
      .select({ count: count() })
      .from(selections)
      .where(eq(selections.subjectId, id));
    const occupied = occupiedResult[0].count;

    if (occupied > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una materia con estudiantes asignados. Desactívela en su lugar.' },
        { status: 400 }
      );
    }

    await db.delete(subjects).where(eq(subjects.id, id));

    return NextResponse.json({ success: true, message: 'Materia eliminada' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Error al eliminar materia' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.active === undefined) {
      return NextResponse.json({ error: 'Campo active requerido' }, { status: 400 });
    }

    await db
      .update(subjects)
      .set({
        active: body.active,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subjects.id, id));

    return NextResponse.json({ success: true, message: body.active ? 'Materia activada' : 'Materia desactivada' });
  } catch (error) {
    console.error('Error toggling subject:', error);
    return NextResponse.json({ error: 'Error al cambiar estado' }, { status: 500 });
  }
}