import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function backendBase() {
  const u = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!u) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  let normalized = u.trim().replace(/^['"]|['"]$/g, '');
  if (normalized.startsWith('NEXT_PUBLIC_BACKEND_URL=')) {
    normalized = normalized.split('=', 2)[1].trim().replace(/^['"]|['"]$/g, '');
  }
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized.replace(/^\/+/, '')}`;
  }
  return normalized.replace(/\/$/, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  // Forward to backend
  const backendUrl = `${backendBase()}/social/callback?code=${code}&state=${state}`;
  
  try {
    const response = await fetch(backendUrl);
    
    if (response.ok) {
        // After successful connection, redirect back to the social management page
        return NextResponse.redirect(new URL('/portal/employee/social', request.url));
    } else {
        const errorData = await response.json();
        return NextResponse.json({ error: errorData.detail || 'Failed to connect social account' }, { status: response.status });
    }
  } catch (error) {
    console.error('Meta callback error:', error);
    return NextResponse.json({ error: 'Internal server error during callback' }, { status: 500 });
  }
}
