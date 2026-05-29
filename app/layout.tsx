import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Vinbonize — Photo Border Editor', template: '%s | Vinbonize' },
  description: 'Add beautiful borders to your photos. Pick a frame, upload your photo, adjust, and download. Free and instant.',
  keywords: ['photo border', 'frame editor', 'twinbonize', 'photo frame', 'foto bingkai'],
  openGraph: {
    title: 'Vinbonize — Photo Border Editor',
    description: 'Add beautiful borders to your photos in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="py-8 border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
            <span className="font-semibold text-gray-500">Vinbonize</span>
            <span>Made with love — free photo border editor</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
