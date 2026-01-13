import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { validateEnv } from './env'

type SupabaseClientAny = SupabaseClient<any, 'public', any>

let cachedClient: SupabaseClientAny | null = null
let cachedAdminClient: SupabaseClientAny | null | undefined = undefined

function isNextBuildPhase(): boolean {
  // During `next build`, Next.js evaluates route modules. Avoid throwing at import-time.
  const phase = process.env.NEXT_PHASE
  return phase === 'phase-production-build' || phase === 'phase-development-build'
}

function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && anonKey) {
    return { url, anonKey }
  }

  if (isNextBuildPhase()) {
    // Placeholder values allow compilation/build even when env isn't configured.
    // If the app actually calls Supabase at runtime, `getSupabaseClient()` will validate.
    return {
      url: url ?? 'https://example.supabase.co',
      anonKey: anonKey ?? 'public-anon-key'
    }
  }

  // Runtime usage must have real env vars.
  validateEnv()
  // validateEnv() throws, but keep TS happy.
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  }
}

export function getSupabaseClient(): SupabaseClientAny {
  if (cachedClient) return cachedClient

  const { url, anonKey } = getSupabasePublicEnv()
  cachedClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
  return cachedClient
}

export function getSupabaseAdminClient(): SupabaseClientAny | null {
  if (cachedAdminClient !== undefined) return cachedAdminClient

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    cachedAdminClient = null
    return cachedAdminClient
  }

  const { url } = getSupabasePublicEnv()
  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return cachedAdminClient
}

// Helper function to get current authenticated user
export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get current session
export async function getCurrentSession() {
  const supabase = getSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}