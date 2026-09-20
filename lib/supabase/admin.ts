import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role client — bypasses RLS. Server-only: used by the webhook,
 * the AI engine, and API routes after they've verified an authenticated
 * session. Never import this into a client component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
