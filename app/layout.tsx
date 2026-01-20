import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chest X-Ray Assistant | Medical AI',
  description: 'AI-powered chest X-ray analysis assistant for educational purposes. Not a diagnostic tool.',
  keywords: ['chest X-ray', 'medical AI', 'chexpert', 'radiology assistant'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
