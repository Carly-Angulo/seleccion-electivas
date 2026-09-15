import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { selectionRules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { selectionRuleSchema } from '@/lib/validations';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rules = await db.query.selectionRules.findMany();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: 'Error al obtener reglas' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = selectionRuleSchema.parse(body);

    // Upsert rule
    const existing = await db.query.selectionRules.findFirst({
      where: eq(selectionRules.grade, validatedData.grade),
    });

    if (existing) {
      await db
        .update(selectionRules)
        .set({
          minElectives: validatedData.minElectives,
          maxElectives: validatedData.maxElectives,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(selectionRules.grade, validatedData.grade));
    } else {
      await db.insert(selectionRules).values({
        ...validatedData,
        id: crypto.randomUUID(),
      });
    }

    return NextResponse.json({ success: true, message: 'Regla actualizada' });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ error: 'Error al actualizar regla' }, { status: 500 });
  }
}