import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let supabaseInstance: SupabaseClient<Database> | null = null

// Client for browser/student operations (uses anon key)
// Lazily initialized to avoid build-time errors when env vars aren't set
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Server-side client with service role for instructor operations
export function createServiceClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

// Log crisis incident for SB 243 compliance reporting
// Anonymized - only stores incident type and timestamp, no PII
export async function logCrisisIncident(type: 'self' | 'others' | null) {
  try {
    const supabase = createServiceClient()

    await supabase.from('crisis_incidents').insert({
      incident_type: type || 'unknown',
      detected_at: new Date().toISOString(),
    })
  } catch (error) {
    // Log error but don't throw - crisis response should not be blocked
    console.error('Failed to log crisis incident:', error)
  }
}
