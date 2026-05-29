'use client'

import { useState, useCallback } from 'react'
import type { Border } from '@/lib/types'
import BorderCard from '@/components/BorderCard'
import DropZone from '@/components/DropZone'
import PhotoEditor from '@/components/PhotoEditor'

const ALL = 'all'

export default function EditorClient({ borders }: { borders: Border[] }) {
  const [selectedBorder, setSelectedBorder] = useState<Border | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState(ALL)

  const categories = [ALL, ...Array.from(new Set(borders.map((b) => b.category)))]

  const visibleBorders =
    activeCategory === ALL ? borders : borders.filter((b) => b.category === activeCategory)

  const handlePhoto = useCallback((dataUrl: string) => setPhoto(dataUrl), [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Photo Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Select a border, upload your photo, then download.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* ── Left panel ──────────────────────────── */}
        <div className="space-y-6">

          {/* Border picker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Choose Border</h2>

            {/* Category tabs */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors capitalize ${
                      activeCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {visibleBorders.map((b) => (
                <BorderCard
                  key={b.id}
                  border={b}
                  selected={selectedBorder?.id === b.id}
                  onSelect={setSelectedBorder}
                />
              ))}
            </div>

            {selectedBorder && (
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium text-gray-700">{selectedBorder.name}</span>
                </div>
                <button
                  onClick={() => setSelectedBorder(null)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Photo upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Your Photo</h2>
            <DropZone onFile={handlePhoto} preview={photo} label="Upload your photo" />
            {photo && (
              <button
                onClick={() => setPhoto(null)}
                className="mt-2.5 w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors py-1.5"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 p-4">
            <p className="text-xs font-bold text-purple-700 mb-2.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tips
            </p>
            <ul className="space-y-1.5 text-xs text-purple-700/80">
              <li>• Drag the canvas to reposition your photo</li>
              <li>• Use the zoom slider to fit your photo</li>
              <li>• Pinch with two fingers to zoom on mobile</li>
              <li>• The border is always drawn on top</li>
            </ul>
          </div>
        </div>

        {/* ── Right panel (canvas) ─────────────────── */}
        <div className="flex justify-center lg:justify-start">
          <PhotoEditor border={selectedBorder} photo={photo} />
        </div>
      </div>
    </div>
  )
}
