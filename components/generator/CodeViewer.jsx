// Code Viewer Component
// File: src/components/generator/CodeViewer.jsx

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Copy, CheckCircle } from 'lucide-react'

export default function CodeViewer({ project }) {
  const [selectedFile, setSelectedFile] = useState('app/page.js')
  const [copied, setCopied] = useState(false)

  const sampleFiles = {
    'app/page.js': `'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import Features from '@/components/Features'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
    </div>
  )
}`,
    'app/layout.js': `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '${project?.name || 'Generated App'}',
  description: 'Generated with AI-powered Next.js generator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}`,
    'components/Hero.jsx': `'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Your App
          </h1>
          <p className="text-xl mb-8">
            Built with Next.js, Tailwind CSS, and AI
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </motion.div>
      </div>
    </section>
  )
}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sampleFiles[selectedFile])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="border-b bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Generated Code
        </h3>
        <div className="flex space-x-2 overflow-x-auto">
          {Object.keys(sampleFiles).map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-1 text-sm rounded whitespace-nowrap ${
                selectedFile === file
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-3 h-3 inline mr-1" />
              {file}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </button>
        
        <pre className="p-4 text-sm text-gray-800 overflow-x-auto max-h-96">
          <code>{sampleFiles[selectedFile]}</code>
        </pre>
      </div>
    </div>
  )
}
