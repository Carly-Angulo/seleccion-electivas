import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects, selectionRules } from '@/db/schema';
import { eq, and, inArray, count, sql } from 'drizzle-orm';
import { studentSchema } from '@/lib/validations';
import { generateId } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (studentId) {
      const student = await db.query.students.findFirst({
        where: eq(students.studentId, studentId),
        with: {
          selections: {
            with: {
              subject: true,
            },
          },
        },
      });
      return NextResponse.json(student);
    }

    const allStudents = await db.query.students.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = studentSchema.parse(body);

    // Verificar si ya existe un estudiante con el mismo ID
    const existingStudent = await db.query.students.findFirst({
      where: eq(students.studentId, validatedData.studentId),
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Ya existe una selección registrada para este estudiante' },
        { status: 400 }
      );
    }

    // Verificar reglas de selección
    const rule = await db.query.selectionRules.findFirst({
      where: eq(selectionRules.grade, validatedData.grade),
    });

    if (!rule) {
      return NextResponse.json(
        { error: 'No hay reglas configuradas para este grado' },
        { status: 400 }
      );
    }

    // Validar electivas para 12°
    if (validatedData.grade === '12') {
      const electiva1 = body.electiva1;
      const electiva2 = body.electiva2;

      if (!electiva1 || !electiva2) {
        return NextResponse.json(
          { error: 'Debes seleccionar exactamente dos electivas' },
          { status: 400 }
        );
      }

      if (electiva1 === electiva2) {
        return NextResponse.json(
          { error: 'No puedes seleccionar la misma electiva dos veces' },
          { status: 400 }
        );
      }

      // Verificar cupos disponibles
      const subject1 = await db.query.subjects.findFirst({
        where: eq(subjects.id, electiva1),
      });
      const subject2 = await db.query.subjects.findFirst({
        where: eq(subjects.id, electiva2),
      });

      if (!subject1 || !subject2) {
        return NextResponse.json(
          { error: 'Una o ambas electivas no existen' },
          { status: 400 }
        );
      }

      if (!subject1.active || !subject2.active) {
        return NextResponse.json(
          { error: 'Una o ambas electivas no están disponibles' },
          { status: 400 }
        );
      }

      // Contar selecciones actuales
      const count1 = await db
        .select({ count: count() })
        .from(selections)
        .where(eq(selections.subjectId, electiva1));
      const count2 = await db
        .select({ count: count() })
        .from(selections)
        .where(eq(selections.subjectId, electiva2));

      if (count1[0].count >= subject1.capacity) {
        return NextResponse.json(
          { error: `La electiva ${subject1.name} tiene cupo lleno` },
          { status: 400 }
        );
      }

      if (count2[0].count >= subject2.capacity) {
        return NextResponse.json(
          { error: `La electiva ${subject2.name} tiene cupo lleno` },
          { status: 400 }
        );
      }
    }

    // Crear estudiante
    const studentId = generateId();
    const now = new Date().toISOString();

    await db.insert(students).values({
      id: studentId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      studentId: validatedData.studentId,
      email: validatedData.email,
      phone: validatedData.phone,
      grade: validatedData.grade,
      track: validatedData.track,
      observation: validatedData.observation,
      status: 'pendiente',
      createdAt: now,
      updatedAt: now,
    });

    // Crear selecciones
    const selectionData: typeof selections.$inferInsert[] = [];

    if (validatedData.grade === '12') {
      // Electiva 1
      selectionData.push({
        id: generateId(),
        studentId,
        subjectId: body.electiva1,
        selectionType: 'electiva1',
        createdAt: now,
      });
      // Electiva 2
      selectionData.push({
        id: generateId(),
        studentId,
        subjectId: body.electiva2,
        selectionType: 'electiva2',
        createdAt: now,
      });
      // Curso avanzado (opcional)
      if (body.avanzado) {
        selectionData.push({
          id: generateId(),
          studentId,
          subjectId: body.avanzado,
          selectionType: 'avanzado',
          createdAt: now,
        });
      }
    } else {
      // Para 11°, materias seleccionadas (array)
      if (body.materias && Array.isArray(body.materias)) {
        for (const materiaId of body.materias) {
          selectionData.push({
            id: generateId(),
            studentId,
            subjectId: materiaId,
            selectionType: 'electiva1', // genérico para 11°
            createdAt: now,
          });
        }
      }
    }

    if (selectionData.length > 0) {
      await db.insert(selections).values(selectionData);
    }

    return NextResponse.json({
      success: true,
      studentId,
      message: 'Selección registrada correctamente',
    });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al registrar selección' }, { status: 500 });
  }
}