# Vinbonize

A Twinbonize-inspired photo border editor. Users pick a border frame, upload their photo, adjust position/zoom on a canvas, then download the composited PNG.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — uses `@import "tailwindcss"` (no `tailwind.config.js`)
- **Supabase** — Postgres DB + Storage for borders (optional; falls back to mock borders)
- **react-dropzone** — drag & drop file upload
- **HTML5 Canvas** — client-side image compositing (no server required)

## Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Landing page with hero + border preview |
| `/editor` | Client | Main canvas editor |
| `/borders` | Server | Browse all borders |
| `/upload-border` | Client | Upload a new border (requires Supabase) |

## Key files

```
app/
  layout.tsx          Root layout (Navbar, metadata)
  page.tsx            Landing page
  editor/page.tsx     Canvas editor (client component)
  borders/page.tsx    Border gallery (server component)
  upload-border/page.tsx  Upload form (client component)
components/
  Navbar.tsx          Sticky navigation bar
  BorderCard.tsx      Reusable border thumbnail card
  PhotoEditor.tsx     Canvas compositing engine
  DropZone.tsx        Drag & drop file uploader
lib/
  types.ts            Border TypeScript interface
  supabase.ts         Supabase client (null-safe when unconfigured)
  borders.ts          fetchBorders(), MOCK_BORDERS fallback
public/borders/       Sample SVG border frames (classic, pink, blue)
supabase/migrations/  001_init.sql — DB schema + storage policies
```

## Canvas compositing logic

`PhotoEditor.tsx` uses pure HTML5 Canvas:
1. Draw gray background
2. Draw user photo with pan offset + scale (cover-fit)
3. Draw border PNG on top at full canvas size (transparent holes reveal photo)

All state (`pan`, `scale`, loaded images) lives in `useRef` to avoid re-renders during drag.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase creds (optional)
npm run dev
```

The app works without Supabase — three built-in sample borders are always available. The `/upload-border` page shows a setup notice when Supabase isn't configured.

## Supabase setup

1. Create a project at supabase.com
2. Run `supabase/migrations/001_init.sql` in the SQL editor
3. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

## Important Next.js 16 notes

- **Tailwind v4**: No `tailwind.config.js` — configure via `@theme` in `globals.css`
- **Dynamic params**: `params` is a `Promise` in page components — `await params` before use
- **Server components**: Pages are server components by default; add `'use client'` for interactivity
