'use client'

import { useState, useCallback } from 'react'
import type { Border } from '@/lib/types'
import BorderCard from '@/components/BorderCard'
import DropZone from '@/components/DropZone'
import PhotoEditor from '@/components/PhotoEditor'

export default function EditorClient({ borders }: { borders: Border[] }) {
  const [selectedBorder, setSelectedBorder] = useState<Border | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  const handlePhoto = useCallback((dataUrl: string) => {
    setPhoto(dataUrl)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Select a border, upload your photo, then download the result.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        {/* Left panel — controls */}
        <div className="space-y-6">
          {/* Border picker */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Choose Border</h2>
            <div className="grid grid-cols-3 gap-2">
              {borders.map((b) => (
                <BorderCard
                  key={b.id}
                  border={b}
                  selected={selectedBorder?.id === b.id}
                  onSelect={setSelectedBorder}
                />
              ))}
            </div>
            {selectedBorder && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">{selectedBorder.name}</span>
                <button
                  onClick={() => setSelectedBorder(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Photo uploader */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Your Photo</h2>
            <DropZone onFile={handlePhoto} preview={photo} label="Upload your photo" />
            {photo && (
              <button
                onClick={() => setPhoto(null)}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-xl bg-purple-50 p-4 text-xs text-purple-700 space-y-1">
            <p className="font-semibold mb-2">Tips</p>
            <p>• Drag the canvas to reposition your photo</p>
            <p>• Use the zoom slider to fit your photo</p>
            <p>• The border is always drawn on top</p>
          </div>
        </div>

        {/* Right panel — canvas preview */}
        <div className="flex flex-col items-center justify-start">
          <PhotoEditor border={selectedBorder} photo={photo} />
        </div>
      </div>
    </div>
  )
}
