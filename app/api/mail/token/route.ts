import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { auth } from '@/auth';
import { upsertMailBackendUser } from '@/lib/mail-user-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'admin' && role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  await upsertMailBackendUser({
    accountId: session.user.id,
    name: session.user.name ?? session.user.email ?? 'User',
    email: session.user.email ?? '',
    role,
  });

  const key = new TextEncoder().encode(secret);
  const token = await new SignJWT({
    role,
    email: (session.user.email ?? '').toLowerCase(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.user.id)
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(key);

  return NextResponse.json({ token });
}
