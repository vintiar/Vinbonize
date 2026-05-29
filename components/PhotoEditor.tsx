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

interface Props {
  border: Border | null
  photo: string | null
}

export default function PhotoEditor({ border, photo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Keep mutable draw state in refs to avoid stale closures
  const imgs = useRef<{ photo: HTMLImageElement | null; border: HTMLImageElement | null }>({
    photo: null,
    border: null,
  })
  const pan = useRef({ ox: 0, oy: 0 })
  const scaleRef = useRef(1)
  const dragging = useRef(false)
  const anchor = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const [scale, setScaleState] = useState(1)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { photo: photoEl, border: borderEl } = imgs.current
    const { ox, oy } = pan.current
    const sc = scaleRef.current

    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, SIZE, SIZE)

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
  }, [])

  useEffect(() => {
    if (!photo) {
      imgs.current.photo = null
      draw()
      return
    }
    loadImg(photo)
      .then((img) => {
        imgs.current.photo = img
        draw()
      })
      .catch(() => {})
  }, [photo, draw])

  useEffect(() => {
    if (!border) {
      imgs.current.border = null
      draw()
      return
    }
    loadImg(border.image_url)
      .then((img) => {
        imgs.current.border = img
        draw()
      })
      .catch(() => {})
  }, [border, draw])

  const clientToCanvas = (clientDelta: number, canvasSize: number) => {
    const canvas = canvasRef.current
    const rendered = canvas?.clientWidth ?? canvasSize
    return (clientDelta * canvasSize) / rendered
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    anchor.current = { mx: e.clientX, my: e.clientY, ox: pan.current.ox, oy: pan.current.oy }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    pan.current.ox = anchor.current.ox + clientToCanvas(e.clientX - anchor.current.mx, SIZE)
    pan.current.oy = anchor.current.oy + clientToCanvas(e.clientY - anchor.current.my, SIZE)
    draw()
  }
  const onMouseUp = () => { dragging.current = false }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragging.current = true
    anchor.current = { mx: t.clientX, my: t.clientY, ox: pan.current.ox, oy: pan.current.oy }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const t = e.touches[0]
    pan.current.ox = anchor.current.ox + clientToCanvas(t.clientX - anchor.current.mx, SIZE)
    pan.current.oy = anchor.current.oy + clientToCanvas(t.clientY - anchor.current.my, SIZE)
    draw()
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
    <div className="flex flex-col gap-4 items-center">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="w-full max-w-md rounded-2xl shadow-xl cursor-move touch-none select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      />

      <div className="w-full max-w-md space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1.5">
            <span className="font-medium">Zoom</span>
            <span>{Math.round(scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onDownload}
            disabled={!photo && !border}
            className="grow py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Download PNG
          </button>
        </div>

        {!photo && !border && (
          <p className="text-center text-xs text-gray-400">Select a border and upload a photo to get started</p>
        )}
      </div>
    </div>
  )
}
