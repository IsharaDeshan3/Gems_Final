import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { getAuthenticatedUser } from '@/lib/auth/middleware-helper';

jest.mock('@/lib/auth/middleware-helper', () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockedGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<
  typeof getAuthenticatedUser
>;

describe('admin middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated visitors to the admin login page before rendering', async () => {
    mockedGetAuthenticatedUser.mockResolvedValue({
      user: null,
      supabase: null,
      error: 'Unauthorized',
    } as any);

    const request = new NextRequest('https://example.com/admin');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://example.com/admin/login?reason=unauthenticated'
    );
  });

  it('allows verified admins through', async () => {
    mockedGetAuthenticatedUser.mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'Admin',
        firstName: 'Amina',
        lastName: 'Khan',
      },
      supabase: null,
      error: null,
    } as any);

    const request = new NextRequest('https://example.com/admin');
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
