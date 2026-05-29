import { fetchBorders } from '@/lib/borders'
import BorderCard from '@/components/BorderCard'
import Link from 'next/link'

export default async function BordersPage() {
  const borders = await fetchBorders()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Border Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{borders.length} borders available</p>
        </div>
        <Link
          href="/upload-border"
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors"
        >
          Upload Border
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {borders.map((border) => (
          <Link key={border.id} href="/editor">
            <BorderCard border={border} />
          </Link>
        ))}
      </div>

      {borders.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-medium">No borders yet</p>
          <p className="text-sm mt-1">Be the first to upload a border!</p>
        </div>
      )}
    </div>
  )
}
