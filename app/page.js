'use client'
import ProjectGenerator from '@/components/generator/ProjectGenerator'
import { Zap, Database, Globe, } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Responsive Next Js,Firebase, Tailwind Application Generator
          </h1>
        </div>
        {/* Main Generator Component */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Website</h2>
            <p className="text-blue-100">Fill in your business details and watch AI create your perfect website</p>
          </div>
          <div className="p-8">
            <ProjectGenerator />
          </div>
        </div>
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">

        </footer>
      </div>
    </main>
  )
}