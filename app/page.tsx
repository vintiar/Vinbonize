import Link from 'next/link'
import Image from 'next/image'
import { fetchBorders } from '@/lib/borders'

export default async function Home() {
  const borders = await fetchBorders()
  const preview = borders.slice(0, 3)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-100 rounded-full blur-[120px] opacity-50" />
        <div className="pointer-events-none absolute top-20 right-0 w-[400px] h-[400px] bg-pink-100 rounded-full blur-[100px] opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold rounded-full tracking-wide">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            Free Photo Border Editor
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.08] tracking-tight">
            Make your photos<br />
            <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              stand out
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pick a beautiful border, upload your photo, drag to position, then download. No account needed — it&apos;s instant.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/editor"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-bold text-base rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5"
            >
              Start Editing Free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/borders"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold text-base rounded-2xl hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all"
            >
              Browse Borders
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {[
              { label: 'No sign-up required' },
              { label: 'Works on mobile' },
              { label: 'Download as PNG' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Border preview ─────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready-to-use Borders</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Pick from our curated collection — or upload your own custom border frame.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto">
            {preview.map((b) => (
              <Link
                key={b.id}
                href="/editor"
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-200 hover:-translate-y-1"
              >
                <Image
                  src={b.thumbnail_url ?? b.image_url}
                  alt={b.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <p className="text-white text-xs font-semibold truncate">{b.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/borders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              View all borders
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three simple steps to a beautiful photo.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                title: 'Pick a Border',
                desc: 'Choose from our gallery of beautiful frame borders or upload your own.',
              },
              {
                step: '02',
                icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
                title: 'Upload Your Photo',
                desc: 'Drag & drop your photo onto the canvas. Adjust zoom and position.',
              },
              {
                step: '03',
                icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
                title: 'Download',
                desc: 'Export the composited image as a full-quality PNG in one click.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="group relative text-center p-6 rounded-2xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all duration-300">
                <div className="absolute top-4 right-4 text-xs font-bold text-gray-200 group-hover:text-purple-200 transition-colors">{step}</div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-5 transition-colors">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-purple-600 to-violet-700 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to try it?</h2>
          <p className="text-purple-200 mb-8 text-lg">Free, instant, no account required.</p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold text-base rounded-2xl hover:bg-purple-50 transition-all shadow-lg"
          >
            Open Editor
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
