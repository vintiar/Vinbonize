'use client'

import type { Metadata } from 'next'
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
  const [success, setSuccess] = useState(false)

  const handleFile = useCallback((dataUrl: string) => {
    setPreview(dataUrl)
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => setFile(new File([blob], 'border.png', { type: blob.type })))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name.trim() || !supabase) return

    setLoading(true)
    setError(null)

    const ext = file.type.includes('svg') ? 'svg' : 'png'
    const path = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('borders')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) { setError(uploadErr.message); setLoading(false); return }

    const { data: urlData } = supabase.storage.from('borders').getPublicUrl(path)

    const { error: dbErr } = await supabase.from('borders').insert({
      name: name.trim(),
      image_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl,
      category,
      tags: [],
      download_count: 0,
    })

    if (dbErr) { setError(dbErr.message); setLoading(false); return }

    setSuccess(true)
    setTimeout(() => router.push('/borders'), 1500)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Supabase not configured</h1>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          To enable border uploads, add your Supabase credentials to{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>
        </p>
        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs text-gray-600 overflow-auto font-mono">
{`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="text-xs text-gray-400 mt-4">
          The editor still works with the 3 built-in sample borders.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Border</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a PNG with a transparent center — your border will be shared with everyone.
        </p>
      </div>

      {success ? (
        <div className="text-center py-16 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Border uploaded!</h2>
          <p className="text-sm text-gray-500">Redirecting to gallery…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File drop */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Border image
              <span className="ml-1.5 text-xs font-normal text-gray-400">(PNG with transparency)</span>
            </label>
            <DropZone
              onFile={handleFile}
              preview={preview}
              label="Drop your border PNG / SVG here"
              accept={{ 'image/png': ['.png'], 'image/svg+xml': ['.svg'] }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="name">
              Border name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classic Gold Frame"
              required
              maxLength={60}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-shadow appearance-none cursor-pointer"
            >
              <option value="general">General</option>
              <option value="classic">Classic</option>
              <option value="colorful">Colorful</option>
              <option value="formal">Formal</option>
              <option value="cute">Cute</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !name.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-200 hover:shadow-purple-300"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Border
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
