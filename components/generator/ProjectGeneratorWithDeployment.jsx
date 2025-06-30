// File: components/generator/ProjectGeneratorWithDeployment.js
'use client'

import { useState } from 'react'
import ProjectGenerator from './ProjectGenerator'
import DeploymentIntegration from './DeploymentIntegration'

export default function ProjectGeneratorWithDeployment() {
  const [currentView, setCurrentView] = useState('generator') // generator, deployment
  const [generatedProject, setGeneratedProject] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)

  const handleProjectGenerated = (project) => {
    setGeneratedProject(project)
    // Automatically proceed to deployment after generation
    setCurrentView('deployment')
  }

  const handleBackToGenerator = () => {
    setCurrentView('generator')
  }

  const handleDeploymentComplete = (result) => {
    setDeploymentResult(result)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'generator' && (
        <div className="container mx-auto px-4 py-8">
          <ProjectGenerator onProjectGenerated={handleProjectGenerated} />
        </div>
      )}

      {currentView === 'deployment' && generatedProject && (
        <div className="container mx-auto px-4 py-8">
          <DeploymentIntegration
            project={generatedProject}
            onBack={handleBackToGenerator}
            onComplete={handleDeploymentComplete}
          />
        </div>
      )}
    </div>
  )
}
