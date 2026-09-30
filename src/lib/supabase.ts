import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL ?? 'http://missing', import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'missing')
export const BUCKET = 'wedding-photos'
export type Photo = { id: string; file_path: string; guest_name: string | null; uploaded_at: string; approved: boolean }
export const photoUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, '')
export const uploadPageUrl = () => `${SITE_URL || window.location.origin}/photos`
