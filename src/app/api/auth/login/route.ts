import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { adminLoginSchema } from '@/lib/validations';
import { createSession, setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = adminLoginSchema.parse(body);

    const admin = await db.query.admins.findFirst({
      where: eq(admins.email, email),
    });

    if (!admin) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = await createSession(admin.id, admin.email);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}