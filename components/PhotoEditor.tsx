'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { Border } from '@/lib/types'

const SIZE = 800

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCheckerboard(ctx: CanvasRenderingContext2D) {
  const tile = 20
  for (let y = 0; y < SIZE; y += tile) {
    for (let x = 0; x < SIZE; x += tile) {
      ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? '#f3f4f6' : '#e5e7eb'
      ctx.fillRect(x, y, tile, tile)
    }
  }
}

interface Props {
  border: Border | null
  photo: string | null
}

export default function PhotoEditor({ border, photo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgs = useRef<{ photo: HTMLImageElement | null; border: HTMLImageElement | null }>({
    photo: null,
    border: null,
  })
  const pan = useRef({ ox: 0, oy: 0 })
  const scaleRef = useRef(1)
  const dragging = useRef(false)
  const anchor = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const lastPinchDist = useRef<number | null>(null)

  const [scale, setScaleState] = useState(1)
  const [loading, setLoading] = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { photo: photoEl, border: borderEl } = imgs.current
    const { ox, oy } = pan.current
    const sc = scaleRef.current

    drawCheckerboard(ctx)

    if (photoEl) {
      const r = Math.max(SIZE / photoEl.naturalWidth, SIZE / photoEl.naturalHeight)
      const w = photoEl.naturalWidth * r
      const h = photoEl.naturalHeight * r
      ctx.save()
      ctx.translate(SIZE / 2 + ox, SIZE / 2 + oy)
      ctx.scale(sc, sc)
      ctx.drawImage(photoEl, -w / 2, -h / 2, w, h)
      ctx.restore()
    }

    if (borderEl) {
      ctx.drawImage(borderEl, 0, 0, SIZE, SIZE)
    }

    // Empty state hint
    if (!photoEl && !borderEl) {
      ctx.fillStyle = 'rgba(107,114,128,0.35)'
      ctx.font = '600 18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Select a border + upload a photo', SIZE / 2, SIZE / 2 - 12)
      ctx.font = '400 14px system-ui, sans-serif'
      ctx.fillStyle = 'rgba(107,114,128,0.25)'
      ctx.fillText('to get started', SIZE / 2, SIZE / 2 + 16)
    }
  }, [])

  useEffect(() => {
    if (!photo) {
      imgs.current.photo = null
      draw()
      return
    }
    setLoading(true)
    loadImg(photo)
      .then((img) => { imgs.current.photo = img; draw() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [photo, draw])

  useEffect(() => {
    if (!border) {
      imgs.current.border = null
      draw()
      return
    }
    setLoading(true)
    loadImg(border.image_url)
      .then((img) => { imgs.current.border = img; draw() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [border, draw])

  const toCanvasDelta = (delta: number) => {
    const w = canvasRef.current?.clientWidth ?? SIZE
    return (delta * SIZE) / w
  }

  // ── Mouse ─────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    anchor.current = { mx: e.clientX, my: e.clientY, ox: pan.current.ox, oy: pan.current.oy }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    pan.current.ox = anchor.current.ox + toCanvasDelta(e.clientX - anchor.current.mx)
    pan.current.oy = anchor.current.oy + toCanvasDelta(e.clientY - anchor.current.my)
    draw()
  }
  const onMouseUp = () => { dragging.current = false }

  // ── Touch (pan + pinch zoom) ──────────────────────────
  const pinchDist = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = pinchDist(e.touches)
      dragging.current = false
      return
    }
    const t = e.touches[0]
    dragging.current = true
    anchor.current = { mx: t.clientX, my: t.clientY, ox: pan.current.ox, oy: pan.current.oy }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = pinchDist(e.touches)
      const ratio = dist / lastPinchDist.current
      const newScale = Math.min(3, Math.max(0.3, scaleRef.current * ratio))
      scaleRef.current = newScale
      setScaleState(newScale)
      lastPinchDist.current = dist
      draw()
      return
    }
    if (!dragging.current) return
    const t = e.touches[0]
    pan.current.ox = anchor.current.ox + toCanvasDelta(t.clientX - anchor.current.mx)
    pan.current.oy = anchor.current.oy + toCanvasDelta(t.clientY - anchor.current.my)
    draw()
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) lastPinchDist.current = null
    dragging.current = false
  }

  const onScaleChange = (v: number) => {
    scaleRef.current = v
    setScaleState(v)
    draw()
  }

  const onReset = () => {
    pan.current = { ox: 0, oy: 0 }
    scaleRef.current = 1
    setScaleState(1)
    draw()
  }

  const onDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'vinbonize.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-lg">
      {/* Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 ring-1 ring-gray-200">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="w-full cursor-move touch-none select-none block"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full border-[3px] border-purple-600 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full space-y-4">
        {/* Zoom */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Zoom
            </div>
            <span className="text-sm font-bold text-purple-600">{Math.round(scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1.5 px-0.5">
            <span>30%</span><span>300%</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={onDownload}
            disabled={!photo && !border}
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
