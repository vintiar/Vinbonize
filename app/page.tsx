import Link from 'next/link'
import Image from 'next/image'
import { fetchBorders } from '@/lib/borders'

export default async function Home() {
  const borders = await fetchBorders()
  const preview = borders.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-block mb-4 px-3 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full tracking-wide uppercase">
            Photo Border Editor
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Add beautiful borders<br />
            <span className="text-purple-600">to your photos</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Pick or upload a border frame, drop in your photo, adjust position and zoom, then download the result in one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/editor"
              className="px-8 py-3.5 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors shadow-sm"
            >
              Open Editor
            </Link>
            <Link
              href="/borders"
              className="px-8 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Browse Borders
            </Link>
          </div>
        </div>
      </section>

      {/* Sample borders preview */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Sample Borders</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Elegant frames ready to use — or upload your own.</p>
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {preview.map((b) => (
            <Link key={b.id} href="/editor" className="group block relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-100">
              <Image
                src={b.thumbnail_url ?? b.image_url}
                alt={b.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{b.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Pick a Border', desc: 'Choose from our gallery of beautiful frame borders.' },
              { step: '2', title: 'Upload Your Photo', desc: 'Drag & drop your photo and adjust the position.' },
              { step: '3', title: 'Download', desc: 'Export the composited image as a PNG in one click.' },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
