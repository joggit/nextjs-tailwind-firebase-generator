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
  Settings,
  ChevronDown,
  Server
} from 'lucide-react'
import GeneratorForm from './GeneratorForm'
import DesignSelector from './DesignSelector'
import TemplatePreview from './TemplatePreview'
import DeploymentManager from './DeploymentManager'

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

    // Enhanced Header Configuration with Nested Menu Support
    headerData: {
      style: 'solid',
      logoType: 'text',
      logoText: '',
      logoImage: null,
      showCta: true,
      ctaText: 'Get Started',
      ctaLink: '/contact',
      menuItems: [
        {
          name: 'Home',
          link: '/',
          type: 'link',
          children: []
        },
        {
          name: 'About',
          link: '/about',
          type: 'link',
          children: []
        },
        {
          name: 'Services',
          link: '/services',
          type: 'dropdown',
          children: [
            { name: 'Consulting', link: '/services/consulting', description: 'Expert consulting services' },
            { name: 'Support', link: '/services/support', description: '24/7 customer support' }
          ]
        },
        {
          name: 'Contact',
          link: '/contact',
          type: 'link',
          children: []
        }
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

    // Advanced Options
    vectorEnhancement: true,
    enableAnalytics: true,
    enableSEO: true
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showDeployment, setShowDeployment] = useState(false)

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
      description: 'Theme, header, footer, and nested menus',
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
    },
    {
      id: 'deploy',
      title: 'Deploy',
      description: 'Deploy to server',
      icon: Server,
      component: 'deploy'
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
    // Allow access to deployment step only after successful generation
    if (stepIndex === 4 && !result) {
      return
    }

    if (stepIndex <= currentStep || isStepComplete(stepIndex - 1)) {
      setCurrentStep(stepIndex)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting project generation...')

      // Make API call to generate project
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) // Send the formData instead of undefined config
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate project')
      }

      // Check if response is JSON (project data) or binary (ZIP file)
      const contentType = response.headers.get('Content-Type')

      if (contentType && contentType.includes('application/json')) {
        // If API returns project data as JSON
        const projectData = await response.json()
        setResult(projectData)
        console.log('✅ Project generated successfully!')

      } else {
        // If API returns ZIP file directly
        const blob = await response.blob()

        // Create a mock result object for the UI
        setResult({
          project: {
            name: formData.businessName,
            type: formData.businessType,
            id: `project_${Date.now()}`
          },
          metadata: {
            fileCount: 'Multiple',
            processingTime: 'Complete',
            generatedAt: new Date().toISOString()
          }
        })
        // Auto-download the ZIP file
        console.log('✅ Project generated successfully!')
      }

    } catch (error) {
      console.error('❌ Generation failed:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle deployment completion
  const handleDeploymentComplete = (deploymentData) => {
    console.log('Deployment completed:', deploymentData)
    // Add success notification or additional logic here
  }

  const downloadProject = async () => {
    if (!result) return

    try {
      // If we have the project data, make a download request
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to download project')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData.businessName || 'website'}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ Project downloaded successfully!')

    } catch (err) {
      console.error('❌ Download failed:', err)
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
      case 3: // Generate
        return !!result
      case 4: // Deploy
        return !!result // Can only access deploy if generation is complete
      default:
        return false
    }
  }

  // Enhanced menu analysis functions
  const getMenuAnalysis = () => {
    const menuItems = formData.headerData.menuItems || []
    const totalItems = menuItems.length
    const dropdownMenus = menuItems.filter(item => item.type === 'dropdown' || (item.children && item.children.length > 0))
    const nestedItems = menuItems.reduce((sum, item) => sum + (item.children?.length || 0), 0)

    return {
      totalItems,
      dropdownMenus: dropdownMenus.length,
      nestedItems,
      hasNestedMenus: nestedItems > 0
    }
  }

  const getCustomizationSummary = () => {
    const menuAnalysis = getMenuAnalysis()

    return {
      theme: formData.design.theme,
      heroStyle: formData.design.heroStyle,
      headerStyle: formData.headerData.style,
      footerStyle: formData.footerData.style,
      logoType: formData.headerData.logoType,
      menuItems: menuAnalysis.totalItems,
      dropdownMenus: menuAnalysis.dropdownMenus,
      nestedItems: menuAnalysis.nestedItems,
      socialLinks: Object.values(formData.footerData.socialLinks || {}).filter(url => url.trim()).length,
      newsletter: formData.footerData.showNewsletter,
      ctaButton: formData.headerData.showCta,
      heroBackground: formData.heroData.backgroundType
    }
  }

  // Add deployment step rendering
  const renderDeployStep = () => {
    if (!result || !result.project) {
      return (
        <div className="text-center py-12">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project to Deploy</h3>
          <p className="text-gray-600 mb-4">Please generate a website first before deploying.</p>
          <button
            onClick={() => setCurrentStep(3)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Generate
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploy Your Website</h2>
          <p className="text-gray-600">Deploy your generated website to a live server with nginx multi-hosting</p>
        </div>

        <DeploymentManager
          project={result.project}
          onDeploymentComplete={handleDeploymentComplete}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Generate</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Start New Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
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
            onDeploy={() => setCurrentStep(4)} // Add deploy callback
          />
        )

      case 'deploy':
        return renderDeployStep()

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
          Create and deploy professional websites with custom header, nested menus, footer, and AI-powered content generation
        </p>

        {/* Enhanced Step Progress */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === index
              const isCompleted = index < currentStep || (index === currentStep && isStepComplete(index))
              const isAccessible = index <= currentStep || isStepComplete(index - 1) || (index === 4 && result)
              const isDeploymentStep = index === 4

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isCompleted
                      ? 'bg-green-500 text-white shadow-lg transform scale-105'
                      : isActive
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : isAccessible
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : isDeploymentStep && !result
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    title={isDeploymentStep && !result ? 'Generate a website first to enable deployment' : ''}
                  >
                    {isCompleted && index !== currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}

                    {/* Show deployment availability indicator */}
                    {isDeploymentStep && result && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                    )}
                  </button>

                  <div className="ml-3 text-left">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-6 transition-colors duration-200 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'
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

      {/* Enhanced Customization Preview with Nested Menu Support (shown on design step) */}
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

          {/* Enhanced Nested Menu Analysis */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Navigation & Customization Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Menu Items:</span>
                <span className="ml-2 font-medium">{getMenuAnalysis().totalItems} items</span>
              </div>
              <div>
                <span className="text-gray-600">Dropdown Menus:</span>
                <span className="ml-2 font-medium">{getMenuAnalysis().dropdownMenus} dropdowns</span>
              </div>
              <div>
                <span className="text-gray-600">Nested Items:</span>
                <span className="ml-2 font-medium">{getMenuAnalysis().nestedItems} sub-items</span>
              </div>
              <div>
                <span className="text-gray-600">Hero Background:</span>
                <span className="ml-2 font-medium capitalize">{formData.heroData.backgroundType}</span>
              </div>
              <div>
                <span className="text-gray-600">Logo Type:</span>
                <span className="ml-2 font-medium capitalize">{formData.headerData.logoType}</span>
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

            {/* Nested Menu Preview */}
            {getMenuAnalysis().hasNestedMenus && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Nested Menu Structure:</h5>
                <div className="space-y-1 text-xs">
                  {formData.headerData.menuItems?.map((item, index) => (
                    <div key={index}>
                      <span className="text-gray-600">{item.name}</span>
                      {item.children && item.children.length > 0 && (
                        <div className="ml-4 text-gray-500">
                          {item.children.map((child, childIndex) => (
                            <div key={childIndex} className="flex items-center">
                              <ChevronDown className="w-3 h-3 mr-1" />
                              {child.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Generate Step Component with Deployment Integration
function GenerateStep({ config, loading, result, error, onGenerate, onDownload, onPrev, onDeploy }) {
  const summary = getCustomizationSummary(config)

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Custom Website
        </h2>
        <p className="text-gray-600">
          Ready to create your website with nested navigation menus, custom header, footer, and AI-powered content
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
              <p className="text-sm font-medium text-purple-600">Navigation</p>
              <p className="text-lg font-bold text-purple-900">{summary.menuItems} + {summary.nestedItems}</p>
              <p className="text-xs text-purple-600">Items + Nested</p>
            </div>
            <Navigation className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Dropdowns</p>
              <p className="text-lg font-bold text-green-900">{summary.dropdownMenus}</p>
              <p className="text-xs text-green-600">Nested Menus</p>
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

      {/* Enhanced Customization Features Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎨 Advanced Features Included
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>{summary.headerStyle}</strong> header style</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span><strong>{summary.dropdownMenus}</strong> dropdown menus</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>{summary.nestedItems}</strong> nested menu items</span>
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
                Generating with Nested Menus...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Website with Nested Navigation
              </>
            )}
          </button>

          {loading && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Creating your website with {summary.dropdownMenus} dropdown menus and {summary.nestedItems} nested items...</p>
              <p className="text-xs mt-1">Applying custom header, footer, and responsive navigation</p>
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

      {/* Enhanced Success Display with Deployment Option */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Website Generated Successfully! 🎉</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Files Generated</div>
                <div className="text-gray-600">{result.metadata?.fileCount || 'Multiple'} files</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Menu Items</div>
                <div className="text-gray-600">{summary.menuItems} + {summary.nestedItems} nested</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Dropdown Menus</div>
                <div className="text-gray-600">{summary.dropdownMenus} dropdowns</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-900">Processing Time</div>
                <div className="text-gray-600">{result.metadata?.processingTime || 'Complete'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={onDownload}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Project
              </button>

              <button
                onClick={onDeploy}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Server className="w-4 h-4 mr-2" />
                Deploy to Server
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Generate Another
              </button>
            </div>

            {/* Detailed success message with nested menu info */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">✨ Navigation & Customizations Applied</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>{summary.dropdownMenus}</strong> dropdown menus with <strong>{summary.nestedItems}</strong> nested items</p>
                <p>• Custom <strong>{summary.headerStyle}</strong> header with {config.headerData.logoType} logo</p>
                <p>• <strong>{summary.footerStyle}</strong> footer layout with company information</p>
                <p>• Responsive navigation that works on all devices</p>
                <p>• <strong>{summary.socialLinks}</strong> social media links integrated</p>
                <p>• Newsletter signup: <strong>{config.footerData.showNewsletter ? 'Enabled' : 'Disabled'}</strong></p>
                <p>• Header CTA button: <strong>{config.headerData.showCta ? 'Enabled' : 'Disabled'}</strong></p>
                <p>• Mobile-friendly nested menu structure</p>
              </div>
            </div>
          </div>
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
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">✨ Ready for deployment</p>
            <p className="text-xs text-blue-600">Click "Deploy to Server" to go live!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get customization summary
function getCustomizationSummary(config) {
  const menuItems = config.headerData.menuItems || []
  const totalItems = menuItems.length
  const dropdownMenus = menuItems.filter(item => item.type === 'dropdown' || (item.children && item.children.length > 0))
  const nestedItems = menuItems.reduce((sum, item) => sum + (item.children?.length || 0), 0)

  return {
    theme: config.design.theme,
    heroStyle: config.design.heroStyle,
    headerStyle: config.headerData.style,
    footerStyle: config.footerData.style,
    logoType: config.headerData.logoType,
    menuItems: totalItems,
    dropdownMenus: dropdownMenus.length,
    nestedItems,
    socialLinks: Object.values(config.footerData.socialLinks || {}).filter(url => url.trim()).length,
    newsletter: config.footerData.showNewsletter,
    ctaButton: config.headerData.showCta,
    heroBackground: config.heroData.backgroundType
  }
}

export default ProjectGenerator