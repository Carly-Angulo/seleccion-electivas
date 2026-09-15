import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, selections, subjects } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { formatDateShort, getGradeLabel, getTrackLabel, getStatusLabel } from '@/utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', '11', '12', 'subject', 'advanced'
    const subjectId = searchParams.get('subjectId');

    let allStudents;
    let title = '';

    if (type === '11' || type === '12') {
      allStudents = await db.query.students.findMany({
        where: eq(students.grade, type as '11' | '12'),
        with: {
          selections: {
            with: {
              subject: true,
            },
          },
        },
        orderBy: (students, { asc }) => [asc(students.lastName), asc(students.firstName)],
      });
      title = `Estudiantes de ${getGradeLabel(type as '11' | '12')} Grado`;
    } else if (type === 'subject' && subjectId) {
      const subject = await db.query.subjects.findFirst({ where: eq(subjects.id, subjectId) });
      if (!subject) {
        return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
      }
      title = `Estudiantes de ${subject.name}`;
      
      const studentIds = await db
        .select({ studentId: selections.studentId })
        .from(selections)
        .where(eq(selections.subjectId, subjectId));
      
      const ids = studentIds.map(s => s.studentId);
      if (ids.length === 0) {
        allStudents = [];
      } else {
        allStudents = await db.query.students.findMany({
          where: inArray(students.id, ids),
          with: {
            selections: {
              with: {
                subject: true,
              },
            },
          },
          orderBy: (students, { asc }) => [asc(students.lastName), asc(students.firstName)],
        });
      }
    } else if (type === 'advanced' && subjectId) {
      const subject = await db.query.subjects.findFirst({ where: eq(subjects.id, subjectId) });
      if (!subject) {
        return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
      }
      title = `Estudiantes de ${subject.name}`;
      
      const studentIds = await db
        .select({ studentId: selections.studentId })
        .from(selections)
        .where(and(eq(selections.subjectId, subjectId), eq(selections.selectionType, 'avanzado')));
      
      const ids = studentIds.map(s => s.studentId);
      if (ids.length === 0) {
        allStudents = [];
      } else {
        allStudents = await db.query.students.findMany({
          where: inArray(students.id, ids),
          with: {
            selections: {
              with: {
                subject: true,
              },
            },
          },
          orderBy: (students, { asc }) => [asc(students.lastName), asc(students.firstName)],
        });
      }
    } else {
      allStudents = await db.query.students.findMany({
        with: {
          selections: {
            with: {
              subject: true,
            },
          },
        },
        orderBy: (students, { asc }) => [asc(students.lastName), asc(students.firstName)],
      });
      title = 'Todos los Estudiantes';
    }

    const doc = new jsPDF('landscape');

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

    if (type === '11') {
      // Columnas para 11°
      const columns = [
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'ID', dataKey: 'identificacion' },
        { header: 'Correo', dataKey: 'correo' },
        { header: 'Grado', dataKey: 'grado' },
        { header: 'Bachillerato', dataKey: 'bachillerato' },
        { header: 'Materias', dataKey: 'materias' },
        { header: 'Observaciones', dataKey: 'observaciones' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Fecha', dataKey: 'fecha' },
      ];

      const data = allStudents.map((s) => ({
        nombre: s.firstName,
        apellido: s.lastName,
        identificacion: s.studentId,
        correo: s.email,
        grado: getGradeLabel(s.grade),
        bachillerato: getTrackLabel(s.track),
        materias: s.selections.map(sel => sel.subject?.name).filter(Boolean).join(', '),
        observaciones: s.observation || '',
        estado: getStatusLabel(s.status),
        fecha: formatDateShort(s.createdAt),
      }));

      autoTable(doc, {
        columns,
        body: data,
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [14, 116, 144], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 249, 255] },
        columnStyles: {
          materias: { cellWidth: 60 },
          observaciones: { cellWidth: 50 },
        },
      });
    } else {
      // Columnas para 12° y general
      const columns = [
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Apellido', dataKey: 'apellido' },
        { header: 'ID', dataKey: 'identificacion' },
        { header: 'Correo', dataKey: 'correo' },
        { header: 'Grado', dataKey: 'grado' },
        { header: 'Bachillerato', dataKey: 'bachillerato' },
        { header: 'Electiva 1', dataKey: 'electiva1' },
        { header: 'Electiva 2', dataKey: 'electiva2' },
        { header: 'Curso Avanzado', dataKey: 'avanzado' },
        { header: 'Observaciones', dataKey: 'observaciones' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Fecha', dataKey: 'fecha' },
      ];

      const data = allStudents.map((s) => ({
        nombre: s.firstName,
        apellido: s.lastName,
        identificacion: s.studentId,
        correo: s.email,
        grado: getGradeLabel(s.grade),
        bachillerato: getTrackLabel(s.track),
        electiva1: s.selections.find(sel => sel.selectionType === 'electiva1')?.subject?.name || '',
        electiva2: s.selections.find(sel => sel.selectionType === 'electiva2')?.subject?.name || '',
        avanzado: s.selections.find(sel => sel.selectionType === 'avanzado')?.subject?.name || '',
        observaciones: s.observation || '',
        estado: getStatusLabel(s.status),
        fecha: formatDateShort(s.createdAt),
      }));

      autoTable(doc, {
        columns,
        body: data,
        startY: 35,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [14, 116, 144], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 249, 255] },
        columnStyles: {
          observaciones: { cellWidth: 50 },
          electiva1: { cellWidth: 40 },
          electiva2: { cellWidth: 40 },
          avanzado: { cellWidth: 50 },
        },
      });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json({ error: 'Error al exportar PDF' }, { status: 500 });
  }
}