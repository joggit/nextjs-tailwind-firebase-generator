// Fixed ProjectGenerator with Enhanced Design System
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
  Server,
  Sparkles,
  Globe,
  Settings,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import GeneratorForm from './GeneratorForm'
import DesignCustomizationStep from './DesignCustomizationStep'
import TemplatePreview from './TemplatePreview'

// Default values to ensure proper initialization
const DEFAULT_PAGES = [
  { id: 'home', title: 'Home', url: '/', type: 'home', enabled: true, sections: ['hero', 'features', 'testimonials'] },
  { id: 'about', title: 'About Us', url: '/about', type: 'about', enabled: true, sections: ['story', 'team', 'values'] },
  { id: 'services', title: 'Services', url: '/services', type: 'services', enabled: true, sections: ['services-list', 'pricing', 'cta'] },
  { id: 'contact', title: 'Contact', url: '/contact', type: 'contact', enabled: true, sections: ['contact-form', 'info', 'map'] }
]

const DEFAULT_DESIGN = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    neutral: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB'
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingWeight: '600',
    bodyWeight: '400'
  },
  layout: {
    type: 'standard',
    spacing: 'comfortable',
    borderRadius: '0.5rem',
    shadowStyle: 'modern'
  },
  components: {
    buttonStyle: 'modern',
    cardStyle: 'elevated',
    inputStyle: 'outlined'
  },
  effects: {
    animations: true,
    transitions: true,
    hover: true
  }
}

const DEFAULT_HEADER = {
  style: 'modern',
  logo: 'text',
  menuItems: [
    { id: 'home', label: 'Home', url: '/', type: 'internal', enabled: true },
    { id: 'about', label: 'About', url: '/about', type: 'internal', enabled: true },
    {
      id: 'services',
      label: 'Services',
      url: '/services',
      type: 'dropdown',
      enabled: true,
      children: [
        { id: 'service1', label: 'Consulting', url: '/services/consulting', type: 'internal' },
        { id: 'service2', label: 'Development', url: '/services/development', type: 'internal' }
      ]
    },
    { id: 'contact', label: 'Contact', url: '/contact', type: 'internal', enabled: true }
  ]
}

const DEFAULT_FOOTER = {
  style: 'modern',
  columns: 3,
  showSocial: true,
  showNewsletter: true
}

// Deployment Configuration
const DEPLOYMENT_API = {
  BASE_URL: 'http://75.119.141.162:5000',
  ENDPOINT: '/api/deploy/nodejs',
  DOMAINS_ENDPOINT: '/api/domains',
  STATUS_ENDPOINT: '/api/status'
}

const DOMAIN_STRUCTURE = [
  // Datablox domains
  { domain: 'datablox.co.za', port: 3000, type: 'main' },
  { domain: 'app.datablox.co.za', port: 3001, type: 'subdomain' },
  { domain: 'admin.datablox.co.za', port: 3002, type: 'subdomain' },
  { domain: 'api.datablox.co.za', port: 3003, type: 'subdomain' },
  { domain: 'docs.datablox.co.za', port: 3004, type: 'subdomain' },
  { domain: 'blog.datablox.co.za', port: 3005, type: 'subdomain' },
  { domain: 'support.datablox.co.za', port: 3006, type: 'subdomain' },

  // Monday Cafe domains
  { domain: 'mondaycafe.co.za', port: 3010, type: 'main' },
  { domain: 'menu.mondaycafe.co.za', port: 3011, type: 'subdomain' },
  { domain: 'order.mondaycafe.co.za', port: 3012, type: 'subdomain' },
  { domain: 'admin.mondaycafe.co.za', port: 3013, type: 'subdomain' },
  { domain: 'booking.mondaycafe.co.za', port: 3014, type: 'subdomain' },
  { domain: 'events.mondaycafe.co.za', port: 3015, type: 'subdomain' },
  { domain: 'loyalty.mondaycafe.co.za', port: 3016, type: 'subdomain' },

  // SmartWave domains
  { domain: 'smartwave.co.za', port: 3020, type: 'main' },
  { domain: 'app.smartwave.co.za', port: 3021, type: 'subdomain' },
  { domain: 'dashboard.smartwave.co.za', port: 3022, type: 'subdomain' },
  { domain: 'api.smartwave.co.za', port: 3023, type: 'subdomain' },
  { domain: 'docs.smartwave.co.za', port: 3024, type: 'subdomain' },
  { domain: 'analytics.smartwave.co.za', port: 3025, type: 'subdomain' },
  { domain: 'support.smartwave.co.za', port: 3026, type: 'subdomain' }
]

function ProjectGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: '',
    industry: '',
    businessType: '',
    targetAudience: '',
    businessDescription: '',
    template: '',

    // Design Configuration (Enhanced Design System) - Initialize with defaults
    design: DEFAULT_DESIGN,
    pages: DEFAULT_PAGES,
    headerData: DEFAULT_HEADER,
    footerData: DEFAULT_FOOTER,

    // Features
    features: [],

    // Advanced Options
    vectorEnhancement: true,
    enableAnalytics: true,
    enableSEO: true
  })

  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState('idle')
  const [deploymentConfig, setDeploymentConfig] = useState({
    selectedDomain: '',
    enableSSL: false,
    deploymentType: 'nodejs'
  })
  const [availableDomains, setAvailableDomains] = useState([])
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [deploymentLog, setDeploymentLog] = useState([])
  const [deploymentResult, setDeploymentResult] = useState(null)

  // Deployment helper functions
  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setDeploymentLog(prev => [...prev, { timestamp, message, type, id: Date.now() }])
  }

  const clearLogs = () => {
    setDeploymentLog([])
  }

  const fetchAvailableDomains = async () => {
    setLoadingDomains(true)
    try {
      addLogEntry('🔍 Checking available domains...', 'info')

      const response = await fetch(`${DEPLOYMENT_API.BASE_URL}${DEPLOYMENT_API.DOMAINS_ENDPOINT}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch domains: ${response.status}`)
      }

      const data = await response.json()
      const existingDomains = data.domains || []

      addLogEntry(`📊 API returned ${existingDomains.length} domain records`, 'info')

      const deployedDomainNames = existingDomains
        .filter(d => d.status === 'active' && d.site_type !== 'static')
        .map(d => d.domain_name)

      addLogEntry(`🚀 Found ${deployedDomainNames.length} active deployments: ${deployedDomainNames.join(', ')}`, 'info')

      const availableDomainsWithStatus = await Promise.all(
        DOMAIN_STRUCTURE.map(async (domain) => {
          const isConfigured = existingDomains.some(d => d.domain_name === domain.domain)
          const hasActiveDeployment = deployedDomainNames.includes(domain.domain)

          let hasRunningApp = false
          try {
            const statusResponse = await fetch(`${DEPLOYMENT_API.BASE_URL}/api/apps/status/${domain.domain.replace(/\./g, '-')}`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              hasRunningApp = statusData.success && statusData.status === 'running'
            }
          } catch (err) {
            hasRunningApp = false
          }

          return {
            ...domain,
            isConfigured,
            hasActiveDeployment,
            hasRunningApp,
            available: !hasRunningApp
          }
        })
      )

      const available = availableDomainsWithStatus.filter(d => d.available)

      availableDomainsWithStatus.forEach(domain => {
        const status = domain.hasRunningApp ? '🔴 Running' :
          domain.hasActiveDeployment ? '🟡 Configured' :
            '🟢 Available'
        addLogEntry(`  ${domain.domain}: ${status}`, 'info')
      })

      setAvailableDomains(available)
      addLogEntry(`✅ Found ${available.length} available domains for deployment`, 'success')

      if (available.length === 0) {
        addLogEntry('💡 All domains have running apps. Try stopping an app first or add more domains.', 'warning')
        const fallbackDomains = DOMAIN_STRUCTURE.map(d => ({ ...d, available: true }))
        setAvailableDomains(fallbackDomains)
        addLogEntry('🔄 Using fallback: showing all domains', 'info')
      }

    } catch (err) {
      setError(`Failed to fetch domains: ${err.message}`)
      addLogEntry(`❌ Error fetching domains: ${err.message}`, 'error')

      const fallbackDomains = DOMAIN_STRUCTURE.map(d => ({ ...d, available: true }))
      setAvailableDomains(fallbackDomains)
      addLogEntry('🔄 Using fallback: showing all domains', 'info')
    } finally {
      setLoadingDomains(false)
    }
  }

  const deployToServer = async () => {
    if (!deploymentConfig.selectedDomain) {
      setError('Please select a domain for deployment')
      return
    }

    const domainConfig = DOMAIN_STRUCTURE.find(d => d.domain === deploymentConfig.selectedDomain)
    if (!domainConfig) {
      setError('Invalid domain configuration')
      return
    }

    setError(null)
    setDeploymentResult(null)
    clearLogs()
    setDeploymentStatus('packaging')

    try {
      addLogEntry('📦 Generating deployment package...', 'info')

      const response = await fetch('/api/generate-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: result.data.project,
          optimization: 'production'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Package generation failed: ${response.status} - ${errorText}`)
      }
      const packageData = await response.json()
      if (!packageData.success) {
        throw new Error(packageData.error || 'Package generation failed')
      }
      addLogEntry(`✅ Package generated: ${packageData.fileCount} files`, 'success')

      setDeploymentStatus('deploying')
      addLogEntry('🚀 Deploying to server...', 'info')
      addLogEntry(`📡 Connecting to ${DEPLOYMENT_API.BASE_URL}`, 'info')
      addLogEntry(`🌐 Target domain: ${deploymentConfig.selectedDomain}`, 'info')
      addLogEntry(`🔌 Target port: ${domainConfig.port}`, 'info')

      const deployResponse = await fetch(`${DEPLOYMENT_API.BASE_URL}${DEPLOYMENT_API.ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: deploymentConfig.selectedDomain.replace(/\./g, '-'),
          files: packageData.files,
          deployConfig: {
            port: domainConfig.port,
            domain: deploymentConfig.selectedDomain,
            ssl: deploymentConfig.enableSSL,
            nodeVersion: '18',
            buildCommand: 'npm run build',
            startCommand: 'npm start'
          }
        })
      })

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text()
        throw new Error(`Deployment failed: ${deployResponse.status} - ${errorText}`)
      }
      const deployResult = await deployResponse.json()
      addLogEntry('✅ Deployed successfully to server!', 'success')

      setDeploymentStatus('success')
      const finalResult = {
        success: true,
        domain: deploymentConfig.selectedDomain,
        port: domainConfig.port,
        url: `http${deploymentConfig.enableSSL ? 's' : ''}://${deploymentConfig.selectedDomain}`,
        ssl: deploymentConfig.enableSSL,
        filesUploaded: packageData.fileCount,
        deploymentType: 'nodejs',
        serverResponse: deployResult,
        type: 'live-deployment'
      }

      addLogEntry(`🌐 Live at: ${finalResult.url}`, 'success')
      setDeploymentResult(finalResult)

      setTimeout(() => {
        fetchAvailableDomains()
      }, 2000)

    } catch (err) {
      setError(err.message)
      setDeploymentStatus('error')
      addLogEntry(`❌ Deployment failed: ${err.message}`, 'error')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addLogEntry(`📋 Copied: ${text}`, 'info')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

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
      title: 'Design System',
      description: 'Colors, fonts, layout, and components',
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
      console.log('🚀 Starting enhanced design system generation...')
      console.log('📊 Form data:', formData)

      // Validate design system configuration
      if (!formData.design || !formData.headerData || !formData.footerData) {
        throw new Error('Please complete the design configuration first.')
      }

      // Prepare the configuration for the enhanced API
      const generationConfig = {
        // Basic information
        businessName: formData.businessName,
        name: formData.businessName, // Also include name for compatibility
        industry: formData.industry,
        businessType: formData.businessType,
        targetAudience: formData.targetAudience,
        businessDescription: formData.businessDescription,
        template: formData.template,

        // Enhanced Design System Configuration
        design: formData.design,
        pages: formData.pages,
        headerData: formData.headerData,
        footerData: formData.footerData,

        // Features and options
        features: formData.features,
        vectorEnhancement: formData.vectorEnhancement,
        enableAnalytics: formData.enableAnalytics,
        enableSEO: formData.enableSEO,

        // Generation metadata
        generationType: 'enhanced-design-system',
        includeDesignSystem: true,
        includeCustomNavigation: true,
        responsive: true
      }

      console.log('📤 Sending enhanced generation request:', {
        businessName: generationConfig.businessName,
        template: generationConfig.template,
        designSystem: generationConfig.design ? 'configured' : 'missing',
        headerStyle: generationConfig.headerData?.style,
        footerStyle: generationConfig.footerData?.style,
        menuItems: generationConfig.headerData?.menuItems?.length || 0,
        pages: generationConfig.pages?.length || 0
      })

      // Use the correct API endpoint (without download parameter for JSON response)
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationConfig)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data)
        console.log('✅ Enhanced design system project generated successfully!')
        console.log('📊 Generation metadata:', data.data?.metadata)
      } else {
        throw new Error(data.error || 'Generation failed')
      }

    } catch (error) {
      console.error('❌ Enhanced generation failed:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fixed Download Function - Works with the combined generator route
  const downloadProject = async () => {
    if (!result) return

    try {
      setDownloading(true)
      setError(null)

      console.log('📦 Starting download...')

      // Prepare the same configuration used for generation
      const generationConfig = {
        businessName: formData.businessName,
        name: formData.businessName,
        industry: formData.industry,
        businessType: formData.businessType,
        targetAudience: formData.targetAudience,
        businessDescription: formData.businessDescription,
        template: formData.template,
        design: formData.design,
        pages: formData.pages,
        headerData: formData.headerData,
        footerData: formData.footerData,
        features: formData.features,
        vectorEnhancement: formData.vectorEnhancement,
        enableAnalytics: formData.enableAnalytics,
        enableSEO: formData.enableSEO,
        generationType: 'enhanced-design-system',
        includeDesignSystem: true,
        includeCustomNavigation: true,
        responsive: true
      }

      // Use the same route with download=true parameter
      const response = await fetch('/api/generator?download=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationConfig)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      // Get the filename from headers or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${formData.businessName || 'website'}.zip`

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]*)"/)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ Download completed successfully:', filename)

    } catch (error) {
      console.error('❌ Download failed:', error)
      setError(`Download failed: ${error.message}`)
    } finally {
      setDownloading(false)
    }
  }

  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Basic Info
        return !!(formData.businessName && formData.industry && formData.businessType && formData.template)
      case 1: // Design System
        return !!(
          formData.design &&
          formData.design.colors &&
          formData.design.typography &&
          formData.design.layout &&
          formData.headerData?.style &&
          formData.footerData?.style &&
          formData.pages?.length > 0
        )
      case 2: // Preview
        return true
      case 3: // Generate
        return !!result
      default:
        return false
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
          <DesignCustomizationStep
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
            downloading={downloading}
            result={result}
            error={error}
            onGenerate={handleGenerate}
            onDownload={downloadProject}
            onPrev={handlePrev}
            // Deployment props
            deploymentStatus={deploymentStatus}
            deploymentConfig={deploymentConfig}
            setDeploymentConfig={setDeploymentConfig}
            availableDomains={availableDomains}
            loadingDomains={loadingDomains}
            deploymentLog={deploymentLog}
            deploymentResult={deploymentResult}
            fetchAvailableDomains={fetchAvailableDomains}
            deployToServer={deployToServer}
            addLogEntry={addLogEntry}
            clearLogs={clearLogs}
            copyToClipboard={copyToClipboard}
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
          Create professional websites with custom design systems, advanced typography, and intelligent navigation
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

      {/* Global Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-96">
        {renderStepContent()}
      </div>

      {/* Enhanced Configuration Status (shown on design step) */}
      {currentStep === 1 && formData.design && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
            Enhanced Design System Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Colors</p>
                  <p className="text-lg font-bold text-blue-900">Custom Palette</p>
                </div>
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.design?.colors?.primary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.design?.colors?.secondary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.design?.colors?.accent }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Typography</p>
                  <p className="text-lg font-bold text-purple-900">{formData.design?.typography?.headingFont || 'Custom'}</p>
                </div>
                <Layout className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Layout</p>
                  <p className="text-lg font-bold text-green-900 capitalize">{formData.design?.layout?.type || 'Standard'}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pages</p>
                  <p className="text-lg font-bold text-orange-900">{formData.pages?.filter(p => p.enabled).length || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Enhanced Configuration Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Primary Color:</span>
                <span className="ml-2 font-medium">{formData.design?.colors?.primary}</span>
              </div>
              <div>
                <span className="text-gray-600">Heading Font:</span>
                <span className="ml-2 font-medium">{formData.design?.typography?.headingFont}</span>
              </div>
              <div>
                <span className="text-gray-600">Layout Type:</span>
                <span className="ml-2 font-medium capitalize">{formData.design?.layout?.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Pages:</span>
                <span className="ml-2 font-medium">{formData.pages?.filter(p => p.enabled).length || 0} enabled</span>
              </div>
              <div>
                <span className="text-gray-600">Menu Items:</span>
                <span className="ml-2 font-medium">{formData.headerData?.menuItems?.filter(m => m.enabled).length || 0} items</span>
              </div>
              <div>
                <span className="text-gray-600">Footer Style:</span>
                <span className="ml-2 font-medium capitalize">{formData.footerData?.style}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border text-xs">
          <h4 className="font-medium text-gray-700 mb-2">Debug Info</h4>
          <div className="space-y-1 text-gray-600">
            <div>Current Step: {currentStep} ({steps[currentStep]?.title})</div>
            <div>Business Name: {formData.businessName || 'Not set'}</div>
            <div>Template: {formData.template || 'Not selected'}</div>
            <div>Design System: {formData.design ? 'Configured' : 'Missing'}</div>
            <div>Header Data: {formData.headerData ? 'Configured' : 'Missing'}</div>
            <div>Footer Data: {formData.footerData ? 'Configured' : 'Missing'}</div>
            <div>Pages: {formData.pages?.length || 0} total, {formData.pages?.filter(p => p.enabled).length || 0} enabled</div>
            <div>Step Complete: {isStepComplete(currentStep) ? 'Yes' : 'No'}</div>
            <div>Result: {result ? 'Available' : 'None'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Updated GenerateStep Component with Deployment Integration
function GenerateStep(props) {
  const {
    config,
    loading,
    result,
    error,
    onGenerate,
    onDownload,
    onPrev,
    deploymentStatus,
    deploymentConfig,
    setDeploymentConfig,
    availableDomains,
    loadingDomains,
    deploymentLog,
    deploymentResult,
    fetchAvailableDomains,
    deployToServer,
    addLogEntry,
    clearLogs,
    copyToClipboard
  } = props

  const [downloading, setDownloading] = useState(false)
  const [showDeployment, setShowDeployment] = useState(false)

  const handleDownload = async () => {
    if (!result) return

    try {
      setDownloading(true)
      await onDownload()
    } catch (err) {
      console.error('❌ Download failed:', err)
      alert(`Download failed: ${err.message}`)
    } finally {
      setDownloading(false)
    }
  }

  const getDomainBadgeColor = (type) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800'
      case 'subdomain':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedDomainConfig = deploymentConfig?.selectedDomain ?
    DOMAIN_STRUCTURE.find(d => d.domain === deploymentConfig.selectedDomain) : null
  const isDeploying = deploymentStatus === 'packaging' || deploymentStatus === 'deploying'

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
              <p className="text-sm font-medium text-purple-600">Template</p>
              <p className="text-lg font-bold text-purple-900 capitalize">{config.template || 'Modern'}</p>
            </div>
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Layout</p>
              <p className="text-lg font-bold text-green-900 capitalize">{config.design?.layout?.type || 'Standard'}</p>
            </div>
            <Layout className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pages</p>
              <p className="text-lg font-bold text-orange-900">{config.pages?.filter(p => p.enabled)?.length || 4}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-600" />
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

      {/* Success Display with Deployment Options */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Website Generated Successfully!</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download ZIP
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowDeployment(!showDeployment)
                    if (!showDeployment && availableDomains && availableDomains.length === 0) {
                      fetchAvailableDomains?.()
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Server className="w-4 h-4 mr-2" />
                  {showDeployment ? 'Hide' : 'Deploy Live'}
                </button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Files Generated</div>
                <div className="text-gray-600">{result.data?.project?.fileCount || result.data?.metadata?.fileCount || 0} files</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Template</div>
                <div className="text-gray-600 capitalize">{result.data?.metadata?.template || config.template || 'Modern'}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Pages Created</div>
                <div className="text-gray-600">{config.pages?.filter(p => p.enabled)?.length || 4} pages</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="font-medium text-gray-900">Processing Time</div>
                <div className="text-gray-600">{result.data?.metadata?.processingTime || 'N/A'}</div>
              </div>
            </div>

            {/* Deployment Success */}
            {deploymentResult && deploymentResult.type === 'live-deployment' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">🚀 Live Deployment Successful!</span>
                  </div>
                  <a
                    href={deploymentResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Visit Site
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  <strong>URL:</strong> {deploymentResult.url} •
                  <strong> Domain:</strong> {deploymentResult.domain} •
                  <strong> Port:</strong> {deploymentResult.port}
                </div>
              </div>
            )}

            {/* Design Features */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">✨ Design Features Applied</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>{config.template || 'Modern'}</strong> template with custom color palette</p>
                <p>• <strong>{config.design?.layout?.type || 'Standard'}</strong> layout structure</p>
                <p>• <strong>{config.design?.typography?.headingFont || 'Inter'}</strong> typography system</p>
                <p>• Industry-specific content for <strong>{config.industry || 'business'}</strong></p>
                <p>• Responsive design optimized for all devices</p>
                <p>• Next.js 14 with Tailwind CSS</p>
              </div>
            </div>
          </div>

          {/* Deployment Panel */}
          {showDeployment && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Deploy to Server</h3>
                    <p className="text-sm text-gray-600">Deploy your website to one of our configured domains</p>
                  </div>
                </div>
                <button
                  onClick={fetchAvailableDomains}
                  disabled={loadingDomains || isDeploying}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh domains"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDomains ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Domain Selection */}
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Target Domain *
                  </label>

                  {loadingDomains ? (
                    <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Loading available domains...</span>
                    </div>
                  ) : (availableDomains && availableDomains.length === 0) ? (
                    <div className="p-3 border border-amber-300 rounded-lg bg-amber-50">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-800 font-medium">No domains available</span>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        All configured domains appear to have running apps. Check deployment logs for details.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availableDomains && availableDomains.map((domain) => (
                        <button
                          key={domain.domain}
                          onClick={() => setDeploymentConfig?.(prev => ({
                            ...prev,
                            selectedDomain: domain.domain
                          }))}
                          className={`p-3 text-left rounded-lg border transition-all ${deploymentConfig?.selectedDomain === domain.domain
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          disabled={isDeploying}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {domain.domain}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getDomainBadgeColor(domain.type)}`}>
                              {domain.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Port: {domain.port}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Domain Info */}
                {selectedDomainConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Selected Domain Configuration</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Domain:</span>
                        <div className="font-medium text-blue-900">{selectedDomainConfig.domain}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Port:</span>
                        <div className="font-medium text-blue-900">{selectedDomainConfig.port}</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Your app will be accessible at: http{deploymentConfig?.enableSSL ? 's' : ''}://{selectedDomainConfig.domain}
                    </div>
                  </div>
                )}

                {/* SSL Option */}
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deploymentConfig?.enableSSL || false}
                      onChange={(e) => setDeploymentConfig?.(prev => ({ ...prev, enableSSL: e.target.checked }))}
                      disabled={isDeploying}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Enable SSL/HTTPS (Recommended)</span>
                  </label>
                </div>
              </div>

              {/* Deploy Button */}
              <div className="mb-6">
                <button
                  onClick={deployToServer}
                  disabled={!deploymentConfig?.selectedDomain || isDeploying || (availableDomains && availableDomains.length === 0) || !deployToServer}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {isDeploying ? (
                    <span className="flex items-center justify-center">
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      {deploymentStatus === 'packaging' ? 'Generating Package...' : 'Deploying to Server...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Server className="w-5 h-5 mr-2" />
                      Deploy to {deploymentConfig?.selectedDomain || 'Selected Domain'}
                    </span>
                  )}
                </button>
              </div>

              {/* Deployment Log */}
              {deploymentLog && deploymentLog.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Deployment Log</h4>
                    <button
                      onClick={() => clearLogs?.()}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                      disabled={isDeploying}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
                    <div className="space-y-1">
                      {deploymentLog.map((entry) => (
                        <div key={entry.id} className="flex items-start space-x-2">
                          <span className="text-gray-500 min-w-20 text-xs">
                            {entry.timestamp}
                          </span>
                          <span className={`${entry.type === 'error' ? 'text-red-400' :
                            entry.type === 'success' ? 'text-green-400' :
                              entry.type === 'warning' ? 'text-yellow-400' :
                                'text-gray-300'
                            }`}>
                            {entry.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download Instructions */}
          {!showDeployment && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📦 After Download</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>1. Extract the ZIP file to your desired location</p>
                <p>2. Open terminal in the project directory</p>
                <p>3. Run <code className="px-2 py-1 bg-blue-100 rounded text-xs">npm install</code></p>
                <p>4. Start development with <code className="px-2 py-1 bg-blue-100 rounded text-xs">npm run dev</code></p>
                <p>5. Open <code className="px-2 py-1 bg-blue-100 rounded text-xs">http://localhost:3000</code> in your browser</p>
              </div>
            </div>
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