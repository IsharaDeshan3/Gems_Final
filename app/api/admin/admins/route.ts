import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getRepositoryFactory } from '@/lib/repositories';
import { validatePasswordStrength } from '@/lib/security/auth';
import { enforceCsrf, getAdminClient } from '@/lib/auth/middleware-helper';
import { getRateLimitIdentifier, rateLimiters } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
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

  const userRepository = getRepositoryFactory(supabase).getUserRepository();
  const userProfile = await userRepository.findById(authUser.id);
  if (!userProfile || !['SuperAdmin', 'superadmin'].includes(userProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get admin and moderator users
  const admins = await userRepository.findByRole('admin');
  const moderators = await userRepository.findByRole('moderator');
  const allAdmins = [...admins, ...moderators];

  // Sort by creation date (newest first)
  allAdmins.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Remove sensitive fields
  const sanitizedAdmins = allAdmins.map(admin => ({
    id: admin.id,
    email: admin.email,
    first_name: admin.first_name,
    last_name: admin.last_name,
    role: admin.role,
    is_active: admin.is_active,
    two_factor_enabled: admin.two_factor_enabled,
    last_login: admin.last_login,
    created_at: admin.created_at,
    updated_at: admin.updated_at
  }));

  return NextResponse.json({ admins: sanitizedAdmins });
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getRateLimitIdentifier(request);
  const rl = await rateLimiters.api(`admin_admins:${clientId}`);
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

  const userRepository = getRepositoryFactory(supabase).getUserRepository();
  const userProfile = await userRepository.findById(authUser.id);
  if (!userProfile || !['SuperAdmin', 'superadmin'].includes(userProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const csrf = enforceCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  const body = await request.json();
  const { email, firstName, lastName, role, password } = body;

  if (!email || !firstName || !lastName || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Only allow Admin and Moderator roles
  if (!['admin', 'moderator'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Only Admin and Moderator can be created through this interface.' }, { status: 400 });
  }

  const { isValid, errors } = validatePasswordStrength(password);
  if (!isValid) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const adminSupabase = await getAdminClient(request);
  const adminUserRepository = getRepositoryFactory(adminSupabase).getUserRepository();

  // Check if email already exists
  const existingUser = await adminUserRepository.findByEmail(email.toLowerCase());
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
    }

    // Create user profile in our database
    const created = await adminUserRepository.create({
      id: authData.user.id,
      email: email.toLowerCase(),
      password_hash: '',
      first_name: firstName,
      last_name: lastName,
      phone: '',
      role: role as 'admin' | 'moderator',
      is_active: true,
      is_verified: true,
      two_factor_enabled: false
    });

    // TODO: Add audit logging
    // await auditLogRepository.create({
    //   user_id: authUser.id,
    //   action: 'ADMIN_CREATE',
    //   entity_type: 'user',
    //   entity_id: created.id,
    //   details: { target: created.email, role: created.role },
    //   ip_address: request.headers.get("x-forwarded-for") || "unknown",
    //   user_agent: request.headers.get("user-agent") || "unknown",
    //   success: true
    // });

    return NextResponse.json({
      admin: {
        id: created.id,
        email: created.email,
        first_name: created.first_name,
        last_name: created.last_name,
        role: created.role,
        is_active: created.is_active,
        created_at: created.created_at
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}