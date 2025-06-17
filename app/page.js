'use client'
import ProjectGenerator from '@/components/generator/ProjectGenerator'
import {  Zap, Database, Globe,  } from 'lucide-react'

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
        {/* Technology Stack */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Powered by Advanced Technology</h3>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-medium">OpenAI GPT</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="font-medium">LangChain</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-medium">Firebase</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-medium">Vector DB</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-medium">Next.js</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/vector"
            className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300"
          >
            <Database className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vector Admin</h3>
            <p className="text-gray-600 text-sm">Manage documents, view analytics, and configure vector settings</p>
          </a>
          <a
            href="/demo"
            className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
          >
            <Zap className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Demo</h3>
            <p className="text-gray-600 text-sm">See vector enhancement in action with sample business data</p>
          </a>
          <a
            href="/insights"
            className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-green-300"
          >
            <Globe className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Insights</h3>
            <p className="text-gray-600 text-sm">Explore AI-generated insights from business data analysis</p>
          </a>
        </div>
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p className="mb-4">
            Built with ❤️ using Vector RAG technology • Generate unlimited websites with AI precision
          </p>
        </footer>
      </div>
    </main>
  )
}