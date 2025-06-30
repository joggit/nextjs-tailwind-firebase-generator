// File: components/generator/DeploymentIntegration.jsx
'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Download, 
  Cloud,
  ArrowRight,
  ArrowLeft 
} from 'lucide-react'

export default function DeploymentIntegration({ project, onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [packageReady, setPackageReady] = useState(false)
  const [packageInfo, setPackageInfo] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)
  const [error, setError] = useState(null)
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false)

  const steps = [
    {
      id: 'package',
      title: 'Package Generation',
      description: 'Prepare project for deployment',
      icon: Download
    },
    {
      id: 'deploy',
      title: 'Server Deployment',
      description: 'Deploy to your server infrastructure',
      icon: Cloud
    },
    {
      id: 'complete',
      title: 'Deployment Complete',
      description: 'Your site is now live',
      icon: CheckCircle
    }
  ]

  const generatePackage = async () => {
    try {
      setError(null)
      setIsGeneratingPackage(true)
      
      console.log('🏗️ Starting package generation for project:', project?.id || 'unknown');
      
      // Prepare the request payload with both project ID and project data as fallback
      const requestPayload = {
        projectId: project?.id,
        project: project, // Include full project as fallback
        optimization: 'production'
      };

      console.log('📦 Package request payload:', {
        projectId: requestPayload.projectId,
        hasProject: !!requestPayload.project,
        projectFilesCount: Object.keys(requestPayload.project?.files || {}).length
      });

      const response = await fetch('/api/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      })

      const data = await response.json()
      console.log('📦 Package generation response:', data);

      if (data.success) {
        setPackageInfo(data)
        setPackageReady(true)
        setCurrentStep(1)
        console.log('✅ Package generation successful');
      } else {
        console.error('❌ Package generation failed:', data);
        throw new Error(data.error || 'Package generation failed')
      }
    } catch (err) {
      console.error('❌ Package generation error:', err);
      setError(`Package generation failed: ${err.message}`)
    } finally {
      setIsGeneratingPackage(false)
    }
  }

  const handleDeploymentComplete = (result) => {
    setDeploymentResult(result)
    setCurrentStep(2)
    onComplete?.(result)
  }

  const downloadProject = async () => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${project.name || 'website'}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Download failed')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const retryPackageGeneration = () => {
    setError(null)
    setCurrentStep(0)
    setPackageReady(false)
    setPackageInfo(null)
    generatePackage()
  }

  useEffect(() => {
    // Auto-generate package when component mounts
    if (project && !packageReady && currentStep === 0 && !isGeneratingPackage) {
      console.log('🚀 Auto-generating package for project:', project.name);
      generatePackage()
    }
  }, [project])

  // Debug info for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DeploymentIntegration Debug:', {
        hasProject: !!project,
        projectId: project?.id,
        projectName: project?.name,
        projectFiles: Object.keys(project?.files || {}).length,
        currentStep,
        packageReady,
        error
      });
    }
  }, [project, currentStep, packageReady, error])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Deploy Your Website</h2>
        
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === index
            const isCompleted = currentStep > index
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isActive && index === 0 && isGeneratingPackage ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 transition-colors ${
                    currentStep > index ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center">
            {isGeneratingPackage ? (
              <>
                <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generating Deployment Package
                </h3>
                <p className="text-gray-600 mb-6">
                  Preparing your project files for deployment...
                </p>
              </>
            ) : packageInfo ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Package Ready!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your deployment package has been prepared successfully.
                </p>
              </>
            ) : (
              <>
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preparing Package
                </h3>
                <p className="text-gray-600 mb-6">
                  Click the button below to generate your deployment package.
                </p>
                <button
                  onClick={generatePackage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Package
                </button>
              </>
            )}
            
            {packageInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Package Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Size:</span>
                    <div className="font-medium text-blue-900">
                      {(packageInfo.packageSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600">Files:</span>
                    <div className="font-medium text-blue-900">{packageInfo.files}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Optimization:</span>
                    <div className="font-medium text-blue-900">{packageInfo.optimization}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Status:</span>
                    <div className="font-medium text-green-900">Ready</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 1 && packageReady && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center mb-6">
            <Cloud className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready for Deployment
            </h3>
            <p className="text-gray-600">
              Your package is ready. Choose a deployment method below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3">Manual Deployment</h4>
              <p className="text-gray-600 text-sm mb-4">
                Download the package and deploy manually to your server using the included scripts.
              </p>
              <button
                onClick={downloadProject}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Package
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3">Automated Deployment</h4>
              <p className="text-gray-600 text-sm mb-4">
                Deploy directly to your server using SSH (coming soon).
              </p>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => handleDeploymentComplete({
                siteName: project.name,
                serverType: 'manual',
                url: `http://${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.yourdomain.com`,
                domain: `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.yourdomain.com`
              })}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark as Deployed
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && deploymentResult && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Deployment Successful!
            </h3>
            <p className="text-gray-600">
              Your website has been deployed and is now live
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Deployment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Site Name:</span>
                  <span className="font-medium text-green-900">{deploymentResult.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Server:</span>
                  <span className="font-medium text-green-900 capitalize">{deploymentResult.serverType}</span>
                </div>
                {deploymentResult.domain && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Domain:</span>
                    <span className="font-medium text-green-900">{deploymentResult.domain}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Quick Actions</h4>
              <div className="space-y-3">
                <a
                  href={deploymentResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Visit Live Site
                </a>
                <button
                  onClick={downloadProject}
                  className="block w-full bg-gray-600 text-white text-center py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Download Source Code
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">What's Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">🎨 Customize Design</h5>
                <p className="text-gray-600">
                  Download the source code and customize the design to match your brand
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">📈 Add Analytics</h5>
                <p className="text-gray-600">
                  Set up Google Analytics or other tracking tools to monitor your site
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">🔒 Configure SSL</h5>
                <p className="text-gray-600">
                  Ensure your site is secure with proper SSL certificate configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium text-red-800">Deployment Error</span>
                <p className="text-red-700 mt-1 text-sm">{error}</p>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={retryPackageGeneration}
                className="text-red-600 hover:text-red-700 text-sm underline"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generator</span>
        </button>

        {currentStep === 2 && (
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Create Another Site</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}