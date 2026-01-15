import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { UserRepositoryImpl } from '@/lib/repositories/user';
import { Database } from '@/types/supabase';

const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const describeSupabase = process.env.RUN_SUPABASE_TESTS === 'true' && hasSupabaseEnv ? describe : describe.skip;

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://invalid.local',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'invalid'
);

const userRepo = new UserRepositoryImpl(supabase);

describeSupabase('UserRepository', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user via Supabase Auth
    const { data } = await supabase.auth.admin.createUser({
      email: 'test-user@example.com',
      password: 'Test123!@#',
      email_confirm: true
    });

		if (!data?.user?.id) {
			throw new Error('Failed to create Supabase test user (check RUN_SUPABASE_TESTS + env vars)');
		}
		testUserId = data.user.id;
  });

  afterAll(async () => {
    // Clean up
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should find user by id', async () => {
    const user = await userRepo.findById(testUserId);
    expect(user).toBeDefined();
    expect(user?.id).toBe(testUserId);
  });

  it('should find user by email', async () => {
    const user = await userRepo.findByEmail('test-user@example.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test-user@example.com');
  });

  it('should search users', async () => {
    const users = await userRepo.searchUsers('test-user', 10);
    expect(Array.isArray(users)).toBe(true);
  });

  it('should update last login', async () => {
    const result = await userRepo.updateLastLogin(testUserId);
    expect(result).toBeDefined();
  });
});
