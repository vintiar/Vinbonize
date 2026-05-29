import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vinbonize — Photo Border Editor',
  description: 'Upload a border frame and composite it with your own photo. Download in one click.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          Vinbonize &mdash; Made with love
        </footer>
      </body>
    </html>
  )
}
