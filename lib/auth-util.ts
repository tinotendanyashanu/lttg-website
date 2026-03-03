import { auth } from '@/auth';

export async function getSessionWithDevBypass() {
  let session = await auth();

  if (process.env.NODE_ENV === 'development') {
    session = {
      user: {
        id: 'dev-mock-id',
        name: 'Dev User',
        email: 'dev@leotech.com',
        role: 'admin',
        isEmailVerified: true,
      } as any,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  return session;
}
