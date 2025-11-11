import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Job Tracker | Find AI/ML Jobs in Sweden',
  description: 'Find and analyze AI/ML job opportunities in Sweden with AI-powered matching',
  keywords: 'AI jobs, ML jobs, Sweden, Stockholm, job search, career',
  openGraph: {
    title: 'AI Job Tracker',
    description: 'AI-powered job matching for engineers',
    url: 'https://ai-job-tracker.vercel.app',
    siteName: 'AI Job Tracker',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
