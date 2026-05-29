'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface DropZoneProps {
  onFile: (dataUrl: string) => void
  label?: string
  accept?: Record<string, string[]>
  preview?: string | null
}

export default function DropZone({ onFile, label = 'Drop your photo here', accept, preview }: DropZoneProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) onFile(e.target.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden aspect-square flex flex-col items-center justify-center ${
        isDragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center select-none">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xs text-gray-400">Click or drag & drop</p>
        </div>
      )}
      {preview && (
        <div className="group/overlay absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover/overlay:opacity-100 text-white text-sm font-medium transition-opacity">Change photo</span>
        </div>
      )}
    </div>
  )
}
