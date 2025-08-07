// Enhanced Project Generator without Preview Step
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
  ArrowLeft,
  Info
} from 'lucide-react'

// Import new step components
import BasicInfoThemeStep from './BasicInfoThemeStep'
import DetailedDesignStep from './DetailedDesignStep'
import PagesContentStep from './PagesContentStep'

// Initial form data with FIXED structure - blocks organized by page ID
const initialFormData = {
  // === STEP 1: Basic Site Info & Theme ===
  projectName: '',
  businessName: '', // Added for backward compatibility
  description: '',
  industry: 'technology',
  targetAudience: 'professionals',
  template: 'modern', // Added for compatibility

  // Theme Configuration (Step 1)
  theme: {
    primaryColor: '#1E40AF',
    secondaryColor: '#FBBF24',
    accentColor: '#10B981', // Added accent color
    fontFamily: 'Inter, sans-serif',
    iconLibrary: 'Heroicons',
    layout: {
      header: 'fixed',
      footer: 'static',
      sidebar: 'hidden'
    },
    typography: {
      baseFontSize: '16px',
      headingFontSize: '2rem',
      bodyFontSize: '1rem',
      lineHeight: '1.5'
    }
  },

  // === STEP 2: Detailed Design (Header, Footer, etc.) ===
  header: {
    levels: 1,
    types: ['marketing', 'ngo', 'ecommerce', 'webapp'],
    logo: '/images/logo.png',
    menuItems: [
      { label: 'Home', link: '/' },
      { label: 'About', link: '/about' },
      { label: 'Contact', link: '/contact' }
    ],
    showIcons: true
  },

  footer: {
    text: '© 2025 Your Company',
    links: [
      { label: 'Privacy Policy', link: '/privacy' },
      { label: 'Terms of Service', link: '/terms' }
    ]
  },

  // === STEP 3: Pages & Content ===
  pages: {
    home: {
      title: 'Home',
      enabled: true,
      blocks: ['hero', 'features']
    },
    about: {
      title: 'About Us',
      enabled: true,
      blocks: ['team'] // Changed from 'missionStatement' to 'team'
    },
    contact: {
      title: 'Contact',
      enabled: true,
      blocks: ['contactInfo']
    },
    shop: {
      title: 'Shop',
      enabled: false,
      blocks: ['productList']
    }
  },

  // FIXED: Content Blocks organized by PAGE ID, not category
  blocks: {
    home: {
      hero: {
        title: 'Welcome to Our Project',
        subtitle: 'Building modern web applications with Next.js and Tailwind CSS',
        buttonText: 'Get Started',
        buttonLink: '/get-started'
      },
      features: {
        title: 'Why Choose Us',
        subtitle: 'What makes us different',
        items: [
          {
            title: 'Fast Performance',
            description: 'Optimized for speed and efficiency.',
            icon: 'Zap'
          },
          {
            title: 'Responsive Design',
            description: 'Looks great on all devices.',
            icon: 'Monitor'
          },
          {
            title: 'Secure & Reliable',
            description: 'Built with security best practices.',
            icon: 'Shield'
          }
        ]
      }
    },
    about: {
      team: {
        title: 'Meet Our Team',
        subtitle: 'The people behind our success',
        members: [
          {
            name: 'Jason',
            role: 'CEO',
            bio: 'Visionary leader with 10+ years of experience in technology.',
            image: '',
            linkedin: '',
            email: ''
          },
          {
            name: 'James',
            role: 'Developer',
            bio: 'Full-stack developer passionate about creating amazing user experiences.',
            image: '',
            linkedin: '',
            email: ''
          }
        ]
      }
    },
    contact: {
      contactInfo: {
        title: 'Get In Touch',
        address: '123 Business Street\nCity, State 12345',
        phone: '(555) 123-4567',
        email: 'info@company.com',
        businessHours: 'Mon-Fri: 9AM-5PM\nSat-Sun: Closed'
      }
    }
  },

  // === Component Styling ===
  components: {
    navbar: {
      backgroundColor: '#1E40AF',
      textColor: '#FFFFFF',
      hoverColor: '#2563EB'
    },
    button: {
      primaryColor: '#2563EB',
      secondaryColor: '#FBBF24',
      textColor: '#FFFFFF',
      borderRadius: '0.5rem'
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      shadow: 'md'
    }
  },

  animations: {
    enabled: true,
    scrollReveal: true,
    hoverEffects: true,
    transition: 'ease-in-out'
  },

  meta: {
    title: '',
    keywords: ['Next.js', 'Tailwind', 'Firebase', 'webapp', 'template'],
    ogImage: '/images/og-image.png',
    themeColor: '#1E40AF'
  }
}

function ProjectGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Updated steps array - REMOVED PREVIEW STEP
  const steps = [
    {
      id: 'basic-theme',
      title: 'Basic Info & Theme',
      description: 'Project details and visual theme',
      icon: Info,
      component: 'basic-theme'
    },
    {
      id: 'detailed-design',
      title: 'Design Details',
      description: 'Header, footer, and layout',
      icon: Palette,
      component: 'detailed-design'
    },
    {
      id: 'pages-content',
      title: 'Pages & Content',
      description: 'Page structure and content',
      icon: Layout,
      component: 'pages-content'
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'Create your website',
      icon: Code,
      component: 'generate'
    }
  ]

  // Sync form data whenever it changes
  useEffect(() => {
    // Console log config changes for debugging
    console.log('📝 Config Updated:', {
      projectName: formData.projectName,
      themeColors: {
        primary: formData.theme?.primaryColor,
        secondary: formData.theme?.secondaryColor
      },
      headerItems: formData.header?.menuItems?.length || 0,
      enabledPages: Object.values(formData.pages || {}).filter(p => p.enabled).length,
      blocksStructure: Object.keys(formData.blocks || {}),
      aboutTeamMembers: formData.blocks?.about?.team?.members?.length || 0
    })
  }, [formData])

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

  // Updated handleGenerate function that expects JSON response
  // Replace your existing handleGenerate function with this:

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting generation with data:', {
        projectName: formData.projectName,
        theme: formData.theme?.primaryColor,
        pages: Object.keys(formData.pages || {}).filter(key => formData.pages[key].enabled)
      })

      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Ensure compatibility
          businessName: formData.projectName || formData.businessName,
          designConfig: formData.design,
          customRequirements: formData.description,
          pages: formData.pages || {},
          useDesignSystem: true
        }),
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response content-type:', response.headers.get('content-type'))

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
          throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`)
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      // Parse JSON response
      const data = await response.json()
      console.log('✅ Generation response:', data)

      if (data.success) {
        setResult(data.data)
        console.log('✅ Generation successful:', {
          projectId: data.data.projectId,
          fileCount: data.data.metadata?.fileCount,
          processingTime: data.data.metadata?.processingTime,
          downloadUrl: data.data.metadata?.download?.downloadUrl
        })
      } else {
        setError(data.error || 'Failed to generate project')
      }

    } catch (err) {
      console.error('🔥 Generation error:', err)
      setError(`Generation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Updated downloadProject function to use the download API
  const downloadProject = async () => {
    if (!result?.projectId) {
      setError('No project available for download')
      return
    }
    try {
      console.log('📥 Starting download for project:', result.projectId)
      const response = await fetch(`/api/download?id=${result.projectId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      // Handle ZIP download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `${formData.projectName || 'website'}.zip`
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]+)"/)
        if (matches) filename = matches[1]
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      console.log('✅ Download completed:', filename)

    } catch (err) {
      console.error('🔥 Download error:', err)
      setError(`Download failed: ${err.message}`)
    }
  }

  // New deploy function (placeholder for deployment functionality)
  const deployProject = async () => {
    if (!result?.projectId) {
      setError('No project available for deployment')
      return
    }

    try {
      console.log('🚀 Starting deployment for project:', result.projectId)

      // TODO: Implement deployment logic
      // This could integrate with Vercel, Netlify, or other deployment services

      // For now, show a placeholder
      alert(`Deployment feature coming soon!\n\nProject ID: ${result.projectId}\n\nFor now, please download and deploy manually.`)

    } catch (err) {
      console.error('🔥 Deployment error:', err)
      setError(`Deployment failed: ${err.message}`)
    }
  }
  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Basic Info & Theme
        return formData.projectName &&
          formData.description &&
          formData.theme?.primaryColor &&
          formData.theme?.secondaryColor &&
          formData.theme?.fontFamily
      case 1: // Detailed Design
        return formData.header?.menuItems?.length > 0 &&
          formData.footer?.text
      case 2: // Pages & Content
        return Object.values(formData.pages || {}).some(page => page.enabled)
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
      case 'basic-theme':
        return (
          <BasicInfoThemeStep
            config={formData}
            onChange={setFormData}
            onNext={handleNext}
          />
        )

      case 'detailed-design':
        console.log('🎨 Rendering DetailedDesignStep with config:', {
          header: formData.header,
          footer: formData.footer,
          components: formData.components,
          theme: formData.theme
        })
        return (
          <DetailedDesignStep
            config={formData}
            onChange={setFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )

      case 'pages-content':
        console.log('📄 Rendering PagesContentStep with:', {
          pages: Object.keys(formData.pages || {}),
          enabledPages: Object.values(formData.pages || {}).filter(p => p.enabled).length,
          blocks: Object.keys(formData.blocks || {}),
          teamMembers: formData.blocks?.about?.team?.members?.length || 0
        })
        return (
          <PagesContentStep
            config={formData}
            onChange={setFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )

      case 'generate':
        console.log('⚡ Rendering GenerateStep - ready to generate!')
        return (
          <GenerateStep
            config={formData}
            loading={loading}
            result={result}
            error={error}
            onGenerate={handleGenerate}
            onDownload={downloadProject}
            onDeploy={deployProject}  // Add this
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
          Enhanced AI Website Generator
        </h1>
        <p className="text-gray-600 mb-6">
          Create a professional website with advanced theme customization and AI-powered content generation
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
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isCompleted
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

      {/* Theme Preview (shown when theme is configured) */}
      {formData.theme?.primaryColor && currentStep > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Theme Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg text-white text-center"
              style={{ backgroundColor: formData.theme.primaryColor }}
            >
              <div className="font-semibold">Primary</div>
              <div className="text-xs opacity-75">{formData.theme.primaryColor}</div>
            </div>

            <div
              className="p-4 rounded-lg text-white text-center"
              style={{ backgroundColor: formData.theme.secondaryColor }}
            >
              <div className="font-semibold">Secondary</div>
              <div className="text-xs opacity-75">{formData.theme.secondaryColor}</div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Typography</div>
              <div className="text-xs text-gray-600" style={{ fontFamily: formData.theme.fontFamily }}>
                {formData.theme.fontFamily?.split(',')[0]}
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <div className="font-semibold text-gray-900">Layout</div>
              <div className="text-xs text-gray-600 capitalize">
                {formData.theme.layout?.header} Header
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <details>
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Debug Info (Development Only)
            </summary>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <div>Current Step: {currentStep} ({steps[currentStep]?.title})</div>
              <div>Can Proceed: {canProceed() ? 'Yes' : 'No'}</div>
              <div>Project Name: {formData.projectName || 'Not set'}</div>
              <div>Description Length: {formData.description?.length || 0} chars</div>
              <div>Primary Color: {formData.theme?.primaryColor || 'Not set'}</div>
              <div>Secondary Color: {formData.theme?.secondaryColor || 'Not set'}</div>
              <div>Font Family: {formData.theme?.fontFamily || 'Not set'}</div>
              <div>Header Type: {formData.theme?.layout?.header || 'Not set'}</div>
              <div>Menu Items: {formData.header?.menuItems?.length || 0}</div>
              <div>Footer Links: {formData.footer?.links?.length || 0}</div>
              <div>Enabled Pages: {Object.values(formData.pages || {}).filter(p => p.enabled).length}</div>
              <div>Total Blocks: {Object.values(formData.pages || {}).reduce((sum, page) => sum + (page.blocks?.length || 0), 0)}</div>
              <div>Blocks Structure: {JSON.stringify(Object.keys(formData.blocks || {}))}</div>
              <div>About Team Members: {formData.blocks?.about?.team?.members?.length || 0}</div>
              <div>Animations Enabled: {formData.animations?.enabled ? 'Yes' : 'No'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

// Replace your existing GenerateStep function with this:

function GenerateStep({ config, loading, result, error, onGenerate, onDownload, onPrev }) {
  // New deploy handler
  const handleDeploy = async () => {
    if (!result?.projectId) {
      alert('No project available for deployment')
      return
    }

    // TODO: Implement actual deployment
    alert(`🚀 Deployment Feature Coming Soon!\n\nProject ID: ${result.projectId}\n\nFor now, please download and deploy manually to:\n• Vercel\n• Netlify\n• GitHub Pages\n• Your hosting provider`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Website
        </h2>
        <p className="text-gray-600">
          Create your professionally designed website, then choose to download or deploy
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Project</p>
              <p className="text-lg font-bold text-blue-900">{config.projectName}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Theme</p>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-white"
                  style={{ backgroundColor: config.theme?.primaryColor }}
                />
                <p className="text-lg font-bold text-purple-900">Custom</p>
              </div>
            </div>
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Layout</p>
              <p className="text-lg font-bold text-green-900 capitalize">{config.theme?.layout?.header}</p>
            </div>
            <Layout className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pages</p>
              <p className="text-lg font-bold text-orange-900">
                {Object.values(config.pages || {}).filter(p => p.enabled).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Generation Button */}
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
                Generating Website...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Website
              </>
            )}
          </button>

          {loading && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Creating your custom-themed website...</p>
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

      {/* Success Display - NEW: Download & Deploy Options */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Website Generated Successfully!</h3>
                <p className="text-green-700 text-sm">Your custom website is ready. Choose an option below.</p>
              </div>
            </div>

            {/* Download & Deploy Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Download Option */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                <div className="text-center">
                  <Download className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Download Project</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Get the complete source code as a ZIP file. Perfect for custom hosting or further development.
                  </p>
                  <button
                    onClick={onDownload}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2 inline" />
                    Download ZIP
                  </button>
                </div>
              </div>

              {/* Deploy Option */}
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-6">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-purple-900 mb-2">Deploy Online</h4>
                  <p className="text-purple-700 text-sm mb-4">
                    Deploy your website instantly to the web. Get a live URL in seconds.
                  </p>
                  <button
                    onClick={handleDeploy}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2 inline" />
                    Deploy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Project Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{result.metadata?.fileCount || 0}</div>
                <div className="text-sm text-gray-600">Files Generated</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{result.metadata?.pages?.enabled || 0}</div>
                <div className="text-sm text-gray-600">Pages Created</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{result.metadata?.content?.teamMembers || 0}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{result.metadata?.processingTime || 'N/A'}</div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">✨ What's Included:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Complete Next.js 14 project</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Custom theme with your colors</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Responsive mobile design</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>SEO optimized structure</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Professional UI components</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Team & contact pages</span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            {result.metadata && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📋 Project Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Project ID:</strong> {result.projectId}</p>
                  <p><strong>Generated:</strong> {new Date(result.metadata.generatedAt).toLocaleString()}</p>
                  <p><strong>Theme:</strong> {result.metadata.theme?.primaryColor} primary, {result.metadata.theme?.secondaryColor} secondary</p>
                  <p><strong>Pages:</strong> {result.metadata.pages?.list?.map(p => p.title).join(', ')}</p>
                  {result.metadata.download?.expiresIn && (
                    <p><strong>Download expires:</strong> {result.metadata.download.expiresIn}</p>
                  )}
                </div>
              </div>
            )}
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