'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Border } from '@/lib/types'
import BorderCard from '@/components/BorderCard'

const ALL = 'all'

export default function BordersGallery({ borders }: { borders: Border[] }) {
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [search, setSearch] = useState('')

  const categories = [ALL, ...Array.from(new Set(borders.map((b) => b.category)))]

  const visible = borders.filter((b) => {
    const matchCat = activeCategory === ALL || b.category === activeCategory
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search borders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-colors capitalize ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visible.map((border) => (
            <Link key={border.id} href="/editor">
              <BorderCard border={border} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-500">No borders found</p>
          <p className="text-sm mt-1">
            {search ? `No results for "${search}"` : 'Be the first to upload a border!'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-purple-600 hover:underline">
              Clear search
            </button>
          )}
        </div>
      )}
    </>
  )
}
