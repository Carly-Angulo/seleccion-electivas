import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { studentSchema } from '@/lib/validations';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.query.students.findFirst({
      where: eq(students.id, id),
      with: {
        selections: {
          with: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Error al obtener estudiante' }, { status: 500 });
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

    const student = await db.query.students.findFirst({
      where: eq(students.id, id),
    });

    if (!student) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Si se está cambiando el studentId, verificar que no exista otro
    if (body.studentId && body.studentId !== student.studentId) {
      const existing = await db.query.students.findFirst({
        where: eq(students.studentId, body.studentId),
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un estudiante con ese número de identificación' },
          { status: 400 }
        );
      }
    }

    const validatedData = studentSchema.partial().parse(body);

    await db
      .update(students)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(students.id, id));

    return NextResponse.json({ success: true, message: 'Estudiante actualizado' });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Error al actualizar estudiante' }, { status: 500 });
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

    // Eliminar selecciones primero (cascade debería manejar esto, pero por seguridad)
    await db.delete(selections).where(eq(selections.studentId, id));
    await db.delete(students).where(eq(students.id, id));

    return NextResponse.json({ success: true, message: 'Estudiante eliminado' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Error al eliminar estudiante' }, { status: 500 });
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

    if (!body.status) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const validStatuses = ['pendiente', 'confirmado', 'procesado'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    await db
      .update(students)
      .set({
        status: body.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(students.id, id));

    return NextResponse.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}