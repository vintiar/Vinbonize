'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import DropZone from '@/components/DropZone'

export default function UploadBorderPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((dataUrl: string) => {
    setPreview(dataUrl)
    // Convert data URL back to File for upload
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => setFile(new File([blob], 'border.png', { type: blob.type })))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name.trim()) return
    if (!supabase) return

    setLoading(true)
    setError(null)

    const ext = file.type.includes('png') ? 'png' : file.type.includes('svg') ? 'svg' : 'png'
    const path = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('borders')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('borders').getPublicUrl(path)

    const { error: dbError } = await supabase.from('borders').insert({
      name: name.trim(),
      image_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl,
      category,
      tags: [],
      download_count: 0,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push('/borders')
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Supabase not configured</h1>
        <p className="text-sm text-gray-500 mb-4">
          To enable border uploads, add your Supabase credentials to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>:
        </p>
        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs text-gray-700 overflow-auto">
          {`NEXT_PUBLIC_SUPABASE_URL=your_project_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="text-xs text-gray-400 mt-4">
          You can still use the editor with the built-in sample borders.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Border</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a PNG border with transparency to share with everyone.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Border image (PNG with transparency)</label>
          <DropZone
            onFile={handleFile}
            preview={preview}
            label="Drop your border PNG here"
            accept={{ 'image/png': ['.png'], 'image/svg+xml': ['.svg'] }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">
            Border name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Classic Gold Frame"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="general">General</option>
            <option value="classic">Classic</option>
            <option value="colorful">Colorful</option>
            <option value="formal">Formal</option>
            <option value="cute">Cute</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !name.trim() || loading}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Border'}
        </button>
      </form>
    </div>
  )
}
