import { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getRepositoryFactory } from '@/lib/repositories';

export async function getAuthenticatedUser(request: NextRequest) {
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

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, supabase, error: error?.message || 'Unauthorized' };
  }

  const userRepository = getRepositoryFactory(supabase).getUserRepository();
  const userProfile = await userRepository.findById(user.id);

  return { user: userProfile, supabase, error: null };
}

export async function getAdminClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
}

export function isAdminRole(role: string): boolean {
  return ['SuperAdmin', 'Admin', 'Moderator', 'superadmin', 'admin', 'moderator'].includes(role);
}

export function isHighAdminRole(role: string): boolean {
  return ['SuperAdmin', 'Admin', 'superadmin', 'admin'].includes(role);
}

export function isMutatingMethod(method: string): boolean {
  const m = method.toUpperCase();
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
}

/**
 * Enforce CSRF protection for state-changing API requests.
 * Uses a double-submit cookie approach: `csrfToken` cookie must match `x-csrf-token` header.
 */
export function enforceCsrf(request: NextRequest): { ok: true } | { ok: false; error: string } {
  if (!isMutatingMethod(request.method)) {
    return { ok: true };
  }

  const header = request.headers.get('x-csrf-token') || request.headers.get('x-csrf') || '';
  const cookie = request.cookies.get('csrfToken')?.value || '';

  if (!header || !cookie) {
    return { ok: false, error: 'CSRF token missing' };
  }

  if (header !== cookie) {
    return { ok: false, error: 'CSRF token invalid' };
  }

  return { ok: true };
}
