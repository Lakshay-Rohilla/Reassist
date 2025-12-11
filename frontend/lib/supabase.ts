import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Creates a Supabase client for use in the browser
 */
export function createClient() {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
        // Return a mock client that won't crash but also won't work
        return null as any
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Get a singleton Supabase client instance
 */
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
    if (!isSupabaseConfigured()) {
        return null as any
    }
    if (!supabaseInstance) {
        supabaseInstance = createClient()
    }
    return supabaseInstance
}
