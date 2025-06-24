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
  ArrowLeft,
  Navigation,
  Menu,
  Settings
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
      graphics: 'illustrations'
    },
    
    // Hero Configuration
    heroData: {
      headline: '',
      subheadline: '',
      primaryCta: 'Get Started',
      secondaryCta: 'Learn More',
      backgroundType: 'gradient',
      backgroundImage: '',
      backgroundVideo: ''
    },
    
    // Header Configuration
    headerData: {
      style: 'solid',
      logoType: 'text',
      logoText: '',
      logoImage: null,
      showCta: true,
      ctaText: 'Get Started',
      ctaLink: '/contact',
      menuItems: [
        { name: 'Home', link: '/' },
        { name: 'About', link: '/about' },
        { name: 'Services', link: '/services' },
        { name: 'Contact', link: '/contact' }
      ]
    },
    
    // Footer Configuration
    footerData: {
      style: 'multiColumn',
      companyName: '',
      companyDescription: '',
      email: '',
      phone: '',
      address: '',
      showNewsletter: true,
      newsletterTitle: 'Stay Updated',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
      },
      quickLinks: [
        { name: 'Privacy Policy', link: '/privacy' },
        { name: 'Terms of Service', link: '/terms' },
        { name: 'Support', link: '/support' }
      ]
    },
    
    // Features
    features: [],
    
    // Pages Configuration
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
      },
      {
        id: 'about',
        name: 'About',
        type: 'about',
        enabled: true,
        config: {}
      },
      {
        id: 'services',
        name: 'Services',
        type: 'services',
        enabled: true,
        config: {}
      },
      {
        id: 'contact',
        name: 'Contact',
        type: 'contact',
        enabled: true,
        config: {}
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

  // Auto-populate header and footer data when business info changes
  useEffect(() => {
    if (formData.businessName) {
      setFormData(prev => ({
        ...prev,
        headerData: {
          ...prev.headerData,
          logoText: prev.headerData.logoText || formData.businessName
        },
        footerData: {
          ...prev.footerData,
          companyName: prev.footerData.companyName || formData.businessName,
          companyDescription: prev.footerData.companyDescription || formData.businessDescription || `Professional ${formData.industry || 'business'} services`,
          email: prev.footerData.email || `contact@${formData.businessName.toLowerCase().replace(/\s+/g, '')}.com`
        }
      }))
    }
  }, [formData.businessName, formData.businessDescription, formData.industry])

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
      title: 'Customization',
      description: 'Theme, header, footer, and layout',
      icon: Palette,
      component: 'design'
    },
    {
      id: 'preview',
      title: 'Preview',
      description: 'Review your website design',
      icon: Eye,
      component: 'preview'
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'Create your website files',
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
    // Simple validation
    if (!formData.businessName) {
      throw new Error('Business name is required')
    }
    if (!formData.industry) {
      throw new Error('Industry is required')
    }
    if (!formData.businessType) {
      throw new Error('Business type is required')
    }

    console.log('🚀 Starting generation for:', formData.businessName)

    const payload = {
      // Core business information
      businessName: formData.businessName,
      industry: formData.industry,
      businessType: formData.businessType,
      targetAudience: formData.targetAudience || 'customers',
      businessDescription: formData.businessDescription || `${formData.businessName} - Professional ${formData.industry} Services`,
      
      // Template and design
      template: formData.template || 'modern',
      design: formData.design || { theme: 'modern', layout: 'standard' },
      
      // Your existing customization data
      heroData: formData.heroData || {},
      headerData: formData.headerData || {},
      footerData: formData.footerData || {},
      
      // Pages and features
      pages: formData.pages?.filter(page => page.enabled) || [],
      features: formData.features || [],
      
      // Options
      vectorEnhancement: formData.vectorEnhancement || false,
      enableAnalytics: formData.enableAnalytics !== false,
      enableSEO: formData.enableSEO !== false,
      
      // Metadata
      generationType: 'enhanced-customization',
      apiVersion: '2.1'
    }

    console.log('📦 Sending payload with businessName:', payload.businessName)

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('📡 Response status:', response.status)

    const data = await response.json()

    if (data.success) {
      setResult(data.data)
      console.log('✅ Generation successful')
    } else {
      setError(data.error || 'Failed to generate project')
      console.error('❌ Generation failed:', data.error)
    }
  } catch (err) {
    setError(`Generation failed: ${err.message}`)
    console.error('❌ Generation error:', err)
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
        return !!(formData.businessName && formData.industry && formData.businessType)
      case 1: // Design/Customization
        return !!(
          formData.design.theme && 
          formData.design.layout && 
          formData.design.heroStyle && 
          formData.headerData.style && 
          formData.footerData.style
        )
      case 2: // Preview
        return true
      default:
        return false
    }
  }

  const getCustomizationSummary = () => {
    return {
      theme: formData.design.theme,
      heroStyle: formData.design.heroStyle,
      headerStyle: formData.headerData.style,
      footerStyle: formData.footerData.style,
      logoType: formData.headerData.logoType,
      menuItems: formData.headerData.menuItems?.length || 0,
      socialLinks: Object.values(formData.footerData.socialLinks || {}).filter(url => url.trim()).length,
      newsletter: formData.footerData.showNewsletter,
      ctaButton: formData.headerData.showCta,
      heroBackground: formData.heroData.backgroundType
    }
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
          Create a professional website with custom header, footer, and AI-powered content generation
        </p>

        {/* Enhanced Step Progress */}
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

      {/* Enhanced Customization Preview (shown on design step) */}
      {currentStep === 1 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Current Customization Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Theme</p>
                  <p className="text-lg font-bold text-blue-900 capitalize">{formData.design.theme}</p>
                </div>
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Hero</p>
                  <p className="text-lg font-bold text-indigo-900 capitalize">{formData.design.heroStyle}</p>
                </div>
                <Eye className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Header</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{formData.headerData.style}</p>
                </div>
                <Navigation className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Footer</p>
                  <p className="text-lg font-bold text-green-900 capitalize">{formData.footerData.style}</p>
                </div>
                <Menu className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Layout</p>
                  <p className="text-lg font-bold text-orange-900 capitalize">{formData.design.layout}</p>
                </div>
                <Layout className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          {/* Detailed Customization Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Customization Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hero Style:</span>
                <span className="ml-2 font-medium capitalize">{formData.design.heroStyle}</span>
              </div>
              <div>
                <span className="text-gray-600">Hero Background:</span>
                <span className="ml-2 font-medium capitalize">{formData.heroData.backgroundType}</span>
              </div>
              <div>
                <span className="text-gray-600">Logo:</span>
                <span className="ml-2 font-medium">
                  {formData.headerData.logoType} - "{formData.headerData.logoText || formData.businessName || 'Not set'}"
                </span>
              </div>
              <div>
                <span className="text-gray-600">Menu Items:</span>
                <span className="ml-2 font-medium">{formData.headerData.menuItems?.length || 0} items</span>
              </div>
              <div>
                <span className="text-gray-600">Header CTA:</span>
                <span className="ml-2 font-medium">{formData.headerData.showCta ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="text-gray-600">Newsletter:</span>
                <span className="ml-2 font-medium">{formData.footerData.showNewsletter ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="text-gray-600">Social Links:</span>
                <span className="ml-2 font-medium">
                  {Object.values(formData.footerData.socialLinks || {}).filter(url => url.trim()).length} configured
                </span>
              </div>
              <div>
                <span className="text-gray-600">Contact Info:</span>
                <span className="ml-2 font-medium">
                  {[formData.footerData.email, formData.footerData.phone, formData.footerData.address].filter(Boolean).length} fields
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Generate Step Component
function GenerateStep({ config, loading, result, error, onGenerate, onDownload, onPrev }) {
  const summary = {
    theme: config.design.theme,
    heroStyle: config.design.heroStyle,
    headerStyle: config.headerData.style,
    footerStyle: config.footerData.style,
    menuItems: config.headerData.menuItems?.length || 0,
    socialLinks: Object.values(config.footerData.socialLinks || {}).filter(url => url.trim()).length,
    heroBackground: config.heroData.backgroundType
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Custom Website
        </h2>
        <p className="text-gray-600">
          Ready to create your website with custom header, footer, and AI-powered content
        </p>
      </div>

      {/* Enhanced Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Business</p>
              <p className="text-lg font-bold text-blue-900 truncate">{config.businessName}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Header</p>
              <p className="text-lg font-bold text-purple-900 capitalize">{summary.headerStyle}</p>
            </div>
            <Navigation className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Footer</p>
              <p className="text-lg font-bold text-green-900 capitalize">{summary.footerStyle}</p>
            </div>
            <Menu className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Theme</p>
              <p className="text-lg font-bold text-orange-900 capitalize">{summary.theme}</p>
            </div>
            <Palette className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Customization Features Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎨 Custom Features Included
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>{summary.headerStyle}</strong> header style</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span><strong>{summary.footerStyle}</strong> footer layout</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>{summary.menuItems}</strong> navigation items</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span><strong>{config.headerData.logoType}</strong> logo type</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span><strong>{summary.socialLinks}</strong> social links</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span>Newsletter: <strong>{config.footerData.showNewsletter ? 'Yes' : 'No'}</strong></span>
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
                Generating Custom Website...
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
              <p>Creating your website with custom header and footer...</p>
              <p className="text-xs mt-1">Applying {summary.menuItems} menu items and {summary.socialLinks} social links</p>
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

      {/* Enhanced Success Display */}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Files Generated</div>
                <div className="text-gray-600">{result.metadata?.fileCount || 0} files</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Header Style</div>
                <div className="text-gray-600 capitalize">{summary.headerStyle}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Footer Style</div>
                <div className="text-gray-600 capitalize">{summary.footerStyle}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Processing Time</div>
                <div className="text-gray-600">{result.metadata?.processingTime || 'N/A'}</div>
              </div>
            </div>

            {/* Detailed success message */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">✨ Customizations Applied Successfully</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Custom <strong>{summary.headerStyle}</strong> header with {config.headerData.logoType} logo</p>
                <p>• <strong>{summary.footerStyle}</strong> footer layout with company information</p>
                <p>• <strong>{summary.menuItems}</strong> navigation menu items configured</p>
                <p>• <strong>{summary.socialLinks}</strong> social media links integrated</p>
                <p>• Newsletter signup: <strong>{config.footerData.showNewsletter ? 'Enabled' : 'Disabled'}</strong></p>
                <p>• Header CTA button: <strong>{config.headerData.showCta ? 'Enabled' : 'Disabled'}</strong></p>
                <p>• Fully responsive design optimized for all devices</p>
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