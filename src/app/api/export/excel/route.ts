import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { getSession } from '@/lib/auth';
import { formatDateShort } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');

    if (!grade || !['11', '12'].includes(grade)) {
      return NextResponse.json({ error: 'Grado requerido (11 o 12)' }, { status: 400 });
    }

    const allStudents = await db.query.students.findMany({
      where: eq(students.grade, grade as '11' | '12'),
      with: {
        selections: {
          with: {
            subject: true,
          },
        },
      },
      orderBy: (students, { asc }) => [asc(students.lastName), asc(students.firstName)],
    });

    const workbook = XLSX.utils.book_new();

    if (grade === '11') {
      // Excel para 11°
      const data = allStudents.map((student) => {
        const materias = student.selections
          .map((s) => s.subject?.name)
          .filter(Boolean)
          .join(', ');

        return {
          ID: student.id,
          Nombre: student.firstName,
          Apellido: student.lastName,
          Identificación: student.studentId,
          Correo: student.email,
          Grado: `${student.grade}º`,
          Bachillerato: student.track.charAt(0).toUpperCase() + student.track.slice(1),
          'Materias seleccionadas': materias,
          Observaciones: student.observation || '',
          Estado: student.status.charAt(0).toUpperCase() + student.status.slice(1),
          'Fecha de registro': formatDateShort(student.createdAt),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 36 }, // ID
        { wch: 20 }, // Nombre
        { wch: 20 }, // Apellido
        { wch: 20 }, // Identificación
        { wch: 30 }, // Correo
        { wch: 10 }, // Grado
        { wch: 15 }, // Bachillerato
        { wch: 40 }, // Materias
        { wch: 30 }, // Observaciones
        { wch: 15 }, // Estado
        { wch: 20 }, // Fecha
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes 11º');
    } else {
      // Excel para 12°
      const data = allStudents.map((student) => {
        const electiva1 = student.selections.find((s) => s.selectionType === 'electiva1')?.subject?.name || '';
        const electiva2 = student.selections.find((s) => s.selectionType === 'electiva2')?.subject?.name || '';
        const avanzado = student.selections.find((s) => s.selectionType === 'avanzado')?.subject?.name || '';

        return {
          ID: student.id,
          Nombre: student.firstName,
          Apellido: student.lastName,
          Identificación: student.studentId,
          Correo: student.email,
          Grado: `${student.grade}º`,
          Bachillerato: student.track.charAt(0).toUpperCase() + student.track.slice(1),
          'Electiva 1': electiva1,
          'Electiva 2': electiva2,
          'Curso avanzado': avanzado,
          Observaciones: student.observation || '',
          Estado: student.status.charAt(0).toUpperCase() + student.status.slice(1),
          'Fecha de registro': formatDateShort(student.createdAt),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);

      const colWidths = [
        { wch: 36 }, // ID
        { wch: 20 }, // Nombre
        { wch: 20 }, // Apellido
        { wch: 20 }, // Identificación
        { wch: 30 }, // Correo
        { wch: 10 }, // Grado
        { wch: 15 }, // Bachillerato
        { wch: 30 }, // Electiva 1
        { wch: 30 }, // Electiva 2
        { wch: 35 }, // Curso avanzado
        { wch: 30 }, // Observaciones
        { wch: 15 }, // Estado
        { wch: 20 }, // Fecha
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes 12º');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Estudiantes_${grade}_Grado.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return NextResponse.json({ error: 'Error al exportar Excel' }, { status: 500 });
  }
}