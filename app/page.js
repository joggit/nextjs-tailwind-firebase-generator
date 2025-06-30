// File: app/page.js (Updated to include deployment)
'use client'
import ProjectGeneratorWithDeployment from '@/components/generator/ProjectGeneratorWithDeployment'
import { Brain, Zap, Database, Globe, Server, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Full-Stack Website Generator & Deployer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate professional Next.js websites with AI-powered design systems and deploy them instantly to your servers
          </p>
        </div>
        {/* Feature Highlights */}
        {/* Main Generator Component */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create & Deploy Your Website</h2>
            <p className="text-blue-100">Design with AI, customize with our design system, and deploy to your servers instantly</p>
          </div>
          <div className="p-8">
            <ProjectGeneratorWithDeployment />
          </div>
        </div>

        {/* Technology Stack */}
        {/* Deployment Features */}
        {/* Quick Links */}
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p className="mb-4">
            Built with ❤️ using Vector RAG technology, AI-powered design systems, and automated deployment
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm">
            <span>Generate unlimited websites</span>
            <span>•</span>
            <span>Deploy instantly</span>
            <span>•</span>
            <span>Scale automatically</span>
          </div>
        </footer>
      </div>
    </main>
  )
}