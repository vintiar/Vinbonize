import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-purple-600 tracking-tight">
          Vinbonize
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/editor"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Editor
          </Link>
          <Link
            href="/borders"
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Borders
          </Link>
          <Link
            href="/upload-border"
            className="ml-2 px-4 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Upload Border
          </Link>
        </div>
      </div>
    </nav>
  )
}
