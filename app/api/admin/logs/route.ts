import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, isAdminRole } from '@/lib/auth/middleware-helper';
import { getRepositoryFactory } from '@/lib/repositories';
import { getRateLimitIdentifier, rateLimiters } from '@/lib/rate-limit';

// Cache for 30 seconds to reduce database load
export const revalidate = 30;

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getRateLimitIdentifier(request);
  const rl = await rateLimiters.api(`admin_logs:${clientId}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { user, supabase, error } = await getAuthenticatedUser(request);
  if (error || !user || !isAdminRole(user.role)) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error ? 401 : 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim();

    const rawLimit = Number(url.searchParams.get('limit') || '20');
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;

    const auditRepo = getRepositoryFactory(supabase).getAuditLogRepository();
    const logs = q ? await auditRepo.searchLogs(q, limit) : await auditRepo.getRecentActivity(limit);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        user_id: log.user_id || '',
        entity_type: log.entity_type,
        created_at: log.created_at,
      })),
    });
  } catch (e) {
    console.error('Admin logs error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
