import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Your Site Name',
  description: 'Your site description',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    images: '/og-image.png'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Site',
    description: 'Your site description',
    images: ['/twitter-image.png']
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
