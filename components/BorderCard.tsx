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
      title={border.name}
      className={`group relative rounded-xl overflow-hidden aspect-square bg-gray-100 transition-all duration-200 ${
        selected
          ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg scale-[1.04]'
          : 'hover:shadow-md hover:scale-[1.03]'
      } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <Image
        src={border.thumbnail_url ?? border.image_url}
        alt={border.name}
        fill
        className="object-cover"
        unoptimized
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-x-0 bottom-0 p-1.5 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <p className="text-white text-[10px] font-semibold truncate leading-tight">{border.name}</p>
      </div>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Download count badge */}
      {border.download_count > 0 && (
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 rounded-md text-[9px] font-bold text-white backdrop-blur-sm">
          {border.download_count > 999 ? `${Math.round(border.download_count / 1000)}k` : border.download_count}
        </div>
      )}
    </button>
  )
}
