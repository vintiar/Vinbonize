import type { Metadata } from 'next'
import { fetchBorders } from '@/lib/borders'
import BordersGallery from '@/components/BordersGallery'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Border Gallery' }

export default async function BordersPage() {
  const borders = await fetchBorders()
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Border Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{borders.length} border{borders.length !== 1 ? 's' : ''} available</p>
        </div>
        <Link
          href="/upload-border"
          className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-full hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Border
        </Link>
      </div>
      <BordersGallery borders={borders} />
    </div>
  )
}
