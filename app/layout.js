import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Next.js AI Generator',
    template: '%s | Next.js AI Generator'
  },
  description: 'AI-powered Next.js application generator with GUI interface',
  keywords: ['Next.js', 'AI', 'Generator', 'React', 'Tailwind', 'Firebase'],
  authors: [{ name: 'AI Generator Team' }],
  creator: 'Next.js AI Generator',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    title: 'Next.js AI Generator',
    description: 'Create production-ready Next.js applications with AI assistance',
    siteName: 'Next.js AI Generator'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  )
}
