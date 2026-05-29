'use client'

import Image from 'next/image'
import type { Border } from '@/lib/types'

interface BorderCardProps {
  border: Border
  selected?: boolean
  onSelect?: (border: Border) => void
}

export default function BorderCard({ border, selected, onSelect }: BorderCardProps) {
  return (
    <button
      onClick={() => onSelect?.(border)}
      className={`group relative rounded-xl overflow-hidden aspect-square bg-gray-100 transition-all duration-200 ${
        selected
          ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg'
          : 'hover:shadow-md hover:scale-[1.02]'
      } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <Image
        src={border.thumbnail_url ?? border.image_url}
        alt={border.name}
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-medium truncate">{border.name}</p>
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}
