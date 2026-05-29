import { supabase, isSupabaseConfigured } from './supabase'
import type { Border } from './types'

export const MOCK_BORDERS: Border[] = [
  {
    id: 'mock-classic',
    name: 'Classic Gold',
    image_url: '/borders/classic.svg',
    thumbnail_url: '/borders/classic.svg',
    category: 'classic',
    tags: ['gold', 'elegant'],
    download_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-pink',
    name: 'Pink Gradient',
    image_url: '/borders/pink.svg',
    thumbnail_url: '/borders/pink.svg',
    category: 'colorful',
    tags: ['pink', 'gradient', 'cute'],
    download_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-blue',
    name: 'Blue Formal',
    image_url: '/borders/blue.svg',
    thumbnail_url: '/borders/blue.svg',
    category: 'formal',
    tags: ['blue', 'formal', 'geometric'],
    download_count: 0,
    created_at: new Date().toISOString(),
  },
]

export async function fetchBorders(): Promise<Border[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_BORDERS
  const { data, error } = await supabase
    .from('borders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data || data.length === 0) return MOCK_BORDERS
  return data as Border[]
}

export async function uploadBorder(
  file: File,
  name: string,
  category: string,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' }

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('borders')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) return { success: false, error: uploadError.message }

  const { data: urlData } = supabase.storage.from('borders').getPublicUrl(path)

  const { error: dbError } = await supabase.from('borders').insert({
    name,
    image_url: urlData.publicUrl,
    thumbnail_url: urlData.publicUrl,
    category,
    tags: [],
    download_count: 0,
  })
  if (dbError) return { success: false, error: dbError.message }

  return { success: true }
}
