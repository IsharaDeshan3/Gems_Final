import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { enforceCsrf } from '@/lib/auth/middleware-helper';
import { getRateLimitIdentifier, rateLimiters } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientId = getRateLimitIdentifier(request);
  const rl = await rateLimiters.auth(`reauth:${clientId}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csrf = enforceCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // Verify password by attempting sign in (used only as a credential check)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.email!,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('reauth', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 5 * 60, // 5 minutes
    path: '/',
  });
  return res;
}
