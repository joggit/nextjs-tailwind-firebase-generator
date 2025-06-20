// Enhanced Project Generator with Design System Integration
// File: components/generator/ProjectGenerator.js

'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Zap, 
  Download, 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Building, 
  Palette,
  Layout,
  Eye,
  Code,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import GeneratorForm from './GeneratorForm'
import DesignSelector from './DesignSelector'
import TemplatePreview from './TemplatePreview'
import CodeViewer from './CodeViewer'

function ProjectGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: '',
    industry: '',
    businessType: '',
    targetAudience: '',
    businessDescription: '',
    template: 'modern',
    
    // Design Configuration
    design: {
      theme: 'modern',
      layout: 'standard',
      heroStyle: 'centered',
      graphics: 'illustrations',
      customizations: {}
    },
    
    // Features
    features: [],
    pages: [
      {
        id: 'home',
        name: 'Home',
        type: 'home',
        enabled: true,
        config: {
          heroStyle: 'gradient',
          heroContent: '',
          showStats: true,
          showTestimonials: true,
          ctaText: 'Get Started'
        }
      }
    ],
    
    // Advanced Options
    vectorEnhancement: true,
    enableAnalytics: true,
    enableSEO: true
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Business details and requirements',
      icon: Building,
      component: 'form'
    },
    {
      id: 'design',
      title: 'Design',
      description: 'Visual style and layout',
      icon: Palette,
      component: 'design'
    },
    {
      id: 'preview',
      title: 'Preview',
      description: 'Review your configuration',
      icon: Eye,
      component: 'preview'
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'Create your website',
      icon: Code,
      component: 'generate'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep || isStepComplete(stepIndex - 1)) {
      setCurrentStep(stepIndex)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Use the design-aware generator endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Include design configuration in the generation request
          designConfig: formData.design,
          customRequirements: formData.businessDescription,
          pages: formData.pages.filter(page => page.enabled),
          useDesignSystem: true // Flag to use design-aware generation
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        console.log('✅ Design-aware generation successful:', data.data)
      } else {
        setError(data.error || 'Failed to generate project')
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadProject = async () => {
    if (!result) return

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: result.project }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.businessName || 'website'}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        setError('Failed to download project')
      }
    } catch (err) {
      setError(`Download failed: ${err.message}`)
    }
  }

  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Basic Info
        return formData.businessName && formData.industry && formData.businessType
      case 1: // Design
        return formData.design.theme && formData.design.layout && formData.design.heroStyle
      case 2: // Preview
        return true // Preview is always "complete" once reached
      default:
        return false
    }
  }

  const canProceed = () => {
    return isStepComplete(currentStep)
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.component) {
      case 'form':
        return (
          <GeneratorForm
            config={formData}
            onChange={setFormData}
            onNext={handleNext}
          />
        )
      
      case 'design':
        return (
          <DesignSelector
            config={formData}
            onChange={setFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )
      
      case 'preview':
        return (
          <TemplatePreview
            config={formData}
            onGenerate={() => setCurrentStep(3)}
            onPrev={handlePrev}
          />
        )
      
      case 'generate':
        return (
          <GenerateStep
            config={formData}
            loading={loading}
            result={result}
            error={error}
            onGenerate={handleGenerate}
            onDownload={downloadProject}
            onPrev={handlePrev}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Website Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Create a professional website with AI-powered design and content generation
        </p>

        {/* Step Progress */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === index
              const isCompleted = index < currentStep || (index === currentStep && isStepComplete(index))
              const isAccessible = index <= currentStep || isStepComplete(index - 1)
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg transform scale-105'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : isAccessible
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted && index !== currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="ml-3 text-left">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-6 transition-colors duration-200 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {renderStepContent()}
      </div>

      {/* Design Preview (shown on design step) */}
      {currentStep === 1 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Design Selection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Theme</p>
                  <p className="text-lg font-bold text-blue-900 capitalize">{formData.design.theme}</p>
                </div>
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Layout</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{formData.design.layout}</p>
                </div>
                <Layout className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Hero Style</p>
                  <p className="text-lg font-bold text-green-900 capitalize">{formData.design.heroStyle}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Current Step: {currentStep} ({steps[currentStep]?.title})</div>
            <div>Can Proceed: {canProceed() ? 'Yes' : 'No'}</div>
            <div>Business Name: {formData.businessName || 'Not set'}</div>
            <div>Design Theme: {formData.design.theme}</div>
            <div>Layout: {formData.design.layout}</div>
            <div>Hero Style: {formData.design.heroStyle}</div>
            <div>Graphics: {formData.design.graphics}</div>
            <div>Pages Enabled: {formData.pages.filter(p => p.enabled).length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Generate Step Component
function GenerateStep({ config, loading, result, error, onGenerate, onDownload, onPrev }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Website
        </h2>
        <p className="text-gray-600">
          Ready to create your professionally designed website with AI-powered content
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Business</p>
              <p className="text-lg font-bold text-blue-900">{config.businessName}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Theme</p>
              <p className="text-lg font-bold text-purple-900 capitalize">{config.design.theme}</p>
            </div>
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Layout</p>
              <p className="text-lg font-bold text-green-900 capitalize">{config.design.layout}</p>
            </div>
            <Layout className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pages</p>
              <p className="text-lg font-bold text-orange-900">{config.pages.filter(p => p.enabled).length}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Design Features Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Design Features Included
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Custom Theme</p>
            <p className="text-xs text-gray-600 capitalize">{config.design.theme} style</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Layout className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Responsive Layout</p>
            <p className="text-xs text-gray-600 capitalize">{config.design.layout}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Hero Section</p>
            <p className="text-xs text-gray-600 capitalize">{config.design.heroStyle}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">AI Content</p>
            <p className="text-xs text-gray-600">Industry-specific</p>
          </div>
        </div>
      </div>

      {/* Generation Controls */}
      {!result && !error && (
        <div className="text-center">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI Design System...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Website with Custom Design
              </>
            )}
          </button>
          
          {loading && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Creating your custom-designed website...</p>
              <p className="text-xs mt-1">This may take a few moments</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Generation Failed</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <div className="mt-4">
            <button
              onClick={onGenerate}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Custom Website Generated Successfully!</span>
              </div>
              <button
                onClick={onDownload}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Files Generated</div>
                <div className="text-gray-600">{result.metadata?.fileCount || 0} files</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Design Theme</div>
                <div className="text-gray-600 capitalize">{config.design.theme}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Pages Created</div>
                <div className="text-gray-600">{config.pages.filter(p => p.enabled).length} pages</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Processing Time</div>
                <div className="text-gray-600">{result.metadata?.processingTime || 'N/A'}</div>
              </div>
            </div>

            {/* Design-specific success message */}
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">✨ Design Features Applied</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>{config.design.theme}</strong> theme with custom color palette</p>
                <p>• <strong>{config.design.layout}</strong> layout structure</p>
                <p>• <strong>{config.design.heroStyle}</strong> hero section design</p>
                <p>• Industry-specific content for <strong>{config.industry}</strong></p>
                <p>• Responsive design optimized for all devices</p>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          {result.project && (
            <CodeViewer project={result.project} />
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        {result && (
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Generate Another</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProjectGenerator