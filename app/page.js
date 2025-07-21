'use client'

import { useState } from 'react'
import ProjectGenerator from '../components/generator/ProjectGenerator'

export default function HomePage() {
  const [project, setProject] = useState(null)

  const handleProjectGenerated = (project) => {
    setProject(project)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <ProjectGenerator onProjectGenerated={handleProjectGenerated} />
          </div>
        </div>
      </div>
    </main>
  )
}
