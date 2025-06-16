'use client'

import { useState, useEffect } from 'react'
import {
  Brain, Zap, Download, Loader, CheckCircle, AlertCircle, Database, Users, Building,
  Plus, X, Edit3, Globe, FileText, Phone, Info, Save, FolderOpen, Trash2, Clock,
  Cloud, Wifi, WifiOff
} from 'lucide-react'
import DocumentToVectors from '@/components/vector/DocumentToVectors'
import { initializeFirebase } from '@/lib/firebase'
import { addDoc, collection, getDocs, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore'


function ProjectGenerator({ systemHealth }) {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    businessType: '',
    targetAudience: '',
    keyServices: [],
    businessDescription: '',
    template: 'modern',
    vectorEnhancement: true,
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
    ]
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [currentService, setCurrentService] = useState('')

  // Firebase state
  const [db, setDb] = useState(null)
  const [vectorRAG, setVectorRAG] = useState(null)
  const [savedConfigs, setSavedConfigs] = useState([])
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configName, setConfigName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)

  useEffect(() => {
    const dbInstance = initializeFirebase()
    setDb(dbInstance)
  }, [])



  const loadSavedConfigurations = async () => {
    if (!db) return

    setLoadingConfigs(true)
    try {
      const configsRef = collection(db, 'website_configurations')
      const q = query(configsRef, orderBy('updatedAt', 'desc'), limit(10))
      const querySnapshot = await getDocs(q)

      const configs = []
      querySnapshot.forEach((doc) => {
        configs.push({
          id: doc.id,
          ...doc.data()
        })
      })

      setSavedConfigs(configs)
      console.log(`📁 Loaded ${configs.length} saved configurations`)
    } catch (error) {
      console.error('❌ Failed to load configurations:', error)
    } finally {
      setLoadingConfigs(false)
    }
  }

  const saveConfiguration = async () => {
    if (!db || !configName.trim()) return

    setSavingConfig(true)
    try {
      const configData = {
        name: configName.trim(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0'
      }

      const docRef = await addDoc(collection(db, 'website_configurations'), configData)
      console.log('✅ Configuration saved with ID:', docRef.id)

      // Refresh saved configs
      await loadSavedConfigurations()

      setConfigName('')
      setShowSaveDialog(false)

      // Show success message
      setError(null)
      setResult({
        ...result,
        message: `Configuration "${configName.trim()}" saved successfully!`
      })
    } catch (error) {
      console.error('❌ Failed to save configuration:', error)
      setError('Failed to save configuration to Firebase')
    } finally {
      setSavingConfig(false)
    }
  }

  const loadConfiguration = async (configId) => {
    const config = savedConfigs.find(c => c.id === configId)
    if (!config) return

    try {
      // Extract the form data from saved config
      const { name, createdAt, updatedAt, version, id, ...savedFormData } = config
      setFormData(savedFormData)
      setShowLoadDialog(false)

      console.log('✅ Configuration loaded:', name)
    } catch (error) {
      console.error('❌ Failed to load configuration:', error)
      setError('Failed to load configuration')
    }
  }

  const deleteConfiguration = async (configId) => {
    if (!db || !confirm('Are you sure you want to delete this configuration?')) return

    try {
      await deleteDoc(doc(db, 'website_configurations', configId))
      await loadSavedConfigurations()
      console.log('✅ Configuration deleted')
    } catch (error) {
      console.error('❌ Failed to delete configuration:', error)
      setError('Failed to delete configuration')
    }
  }

  // Page type definitions (same as before)
  const pageTypes = {
    home: {
      label: 'Home Page',
      icon: Globe,
      description: 'Main landing page with hero section',
      configFields: [
        {
          key: 'heroStyle',
          label: 'Hero Style',
          type: 'select',
          options: [
            { value: 'gradient', label: 'Gradient Background' },
            { value: 'image', label: 'Hero Image' },
            { value: 'video', label: 'Background Video' },
            { value: 'minimal', label: 'Minimal Text' }
          ],
          default: 'gradient'
        },
        {
          key: 'heroContent',
          label: 'Hero Message',
          type: 'textarea',
          placeholder: 'Custom hero message (leave blank for AI generation)',
          default: ''
        },
        {
          key: 'showStats',
          label: 'Show Statistics',
          type: 'checkbox',
          default: true
        },
        {
          key: 'showTestimonials',
          label: 'Include Testimonials',
          type: 'checkbox',
          default: true
        },
        {
          key: 'ctaText',
          label: 'Call-to-Action Text',
          type: 'text',
          placeholder: 'Get Started',
          default: 'Get Started'
        }
      ]
    },
    about: {
      label: 'About Us',
      icon: Users,
      description: 'Company information and team details',
      configFields: [
        {
          key: 'includeTeam',
          label: 'Include Team Section',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeHistory',
          label: 'Include Company History',
          type: 'checkbox',
          default: false
        },
        {
          key: 'includeValues',
          label: 'Include Company Values',
          type: 'checkbox',
          default: true
        },
        {
          key: 'teamStyle',
          label: 'Team Display Style',
          type: 'select',
          options: [
            { value: 'cards', label: 'Team Cards' },
            { value: 'grid', label: 'Photo Grid' },
            { value: 'list', label: 'Simple List' }
          ],
          default: 'cards'
        },
        {
          key: 'missionStatement',
          label: 'Mission Statement',
          type: 'textarea',
          placeholder: 'Enter your mission statement (leave blank for AI generation)',
          default: ''
        }
      ]
    },
    services: {
      label: 'Services',
      icon: Zap,
      description: 'Service offerings and pricing',
      configFields: [
        {
          key: 'displayStyle',
          label: 'Services Display',
          type: 'select',
          options: [
            { value: 'cards', label: 'Service Cards' },
            { value: 'list', label: 'Detailed List' },
            { value: 'pricing', label: 'Pricing Table' },
            { value: 'categories', label: 'Categorized' }
          ],
          default: 'cards'
        },
        {
          key: 'showPricing',
          label: 'Include Pricing',
          type: 'checkbox',
          default: false
        },
        {
          key: 'includeTestimonials',
          label: 'Service Testimonials',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeFAQ',
          label: 'Include FAQ Section',
          type: 'checkbox',
          default: false
        },
        {
          key: 'ctaText',
          label: 'Service CTA Text',
          type: 'text',
          placeholder: 'Learn More',
          default: 'Learn More'
        }
      ]
    },
    contact: {
      label: 'Contact',
      icon: Phone,
      description: 'Contact information and forms',
      configFields: [
        {
          key: 'includeForm',
          label: 'Include Contact Form',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeMap',
          label: 'Include Location Map',
          type: 'checkbox',
          default: false
        },
        {
          key: 'contactMethods',
          label: 'Contact Methods',
          type: 'multiselect',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'address', label: 'Physical Address' },
            { value: 'social', label: 'Social Media' },
            { value: 'chat', label: 'Live Chat' }
          ],
          default: ['email', 'phone']
        },
        {
          key: 'formFields',
          label: 'Form Fields',
          type: 'multiselect',
          options: [
            { value: 'name', label: 'Name' },
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'company', label: 'Company' },
            { value: 'message', label: 'Message' },
            { value: 'budget', label: 'Budget' },
            { value: 'timeline', label: 'Timeline' }
          ],
          default: ['name', 'email', 'message']
        }
      ]
    },
    portfolio: {
      label: 'Portfolio',
      icon: FileText,
      description: 'Showcase work and projects',
      configFields: [
        {
          key: 'displayStyle',
          label: 'Portfolio Layout',
          type: 'select',
          options: [
            { value: 'grid', label: 'Grid Layout' },
            { value: 'masonry', label: 'Masonry Grid' },
            { value: 'carousel', label: 'Carousel' },
            { value: 'list', label: 'List View' }
          ],
          default: 'grid'
        },
        {
          key: 'includeFilters',
          label: 'Include Category Filters',
          type: 'checkbox',
          default: true
        },
        {
          key: 'showDetails',
          label: 'Show Project Details',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeTestimonials',
          label: 'Include Client Testimonials',
          type: 'checkbox',
          default: false
        }
      ]
    },
    blog: {
      label: 'Blog',
      icon: Edit3,
      description: 'Blog and news content',
      configFields: [
        {
          key: 'layoutStyle',
          label: 'Blog Layout',
          type: 'select',
          options: [
            { value: 'grid', label: 'Grid Cards' },
            { value: 'list', label: 'List View' },
            { value: 'magazine', label: 'Magazine Style' }
          ],
          default: 'grid'
        },
        {
          key: 'includeCategories',
          label: 'Include Categories',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeTags',
          label: 'Include Tags',
          type: 'checkbox',
          default: true
        },
        {
          key: 'includeSearch',
          label: 'Include Search',
          type: 'checkbox',
          default: false
        }
      ]
    },
    custom: {
      label: 'Custom Page',
      icon: Info,
      description: 'Custom page with your specifications',
      configFields: [
        {
          key: 'pageTitle',
          label: 'Page Title',
          type: 'text',
          placeholder: 'Enter page title',
          default: ''
        },
        {
          key: 'pageDescription',
          label: 'Page Description',
          type: 'textarea',
          placeholder: 'Describe what this page should contain',
          default: ''
        },
        {
          key: 'includeForm',
          label: 'Include Form',
          type: 'checkbox',
          default: false
        },
        {
          key: 'includeCTA',
          label: 'Include Call-to-Action',
          type: 'checkbox',
          default: true
        }
      ]
    }
  }

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Food & Beverage', 'Legal',
    'Education', 'Real Estate', 'Marketing', 'Consulting', 'Manufacturing',
    'Retail', 'Hospitality', 'Non-profit', 'Other'
  ]

  const businessTypes = [
    'Startup', 'Small Business', 'Enterprise', 'Agency', 'Freelancer',
    'Non-profit', 'E-commerce', 'SaaS', 'Consulting', 'Other'
  ]

  const templates = [
    { id: 'modern', name: 'Modern Business', description: 'Clean, professional design' },
    { id: 'saas', name: 'SaaS Platform', description: 'Software service focused' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store layout' },
    { id: 'portfolio', name: 'Portfolio', description: 'Showcase work and projects' },
    { id: 'corporate', name: 'Corporate', description: 'Enterprise-level design' },
    { id: 'blog', name: 'Blog Platform', description: 'Content-focused layout' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addService = () => {
    if (currentService.trim() && !formData.keyServices.includes(currentService.trim())) {
      setFormData(prev => ({
        ...prev,
        keyServices: [...prev.keyServices, currentService.trim()]
      }))
      setCurrentService('')
    }
  }

  const removeService = (serviceToRemove) => {
    setFormData(prev => ({
      ...prev,
      keyServices: prev.keyServices.filter(service => service !== serviceToRemove)
    }))
  }

  // Page management functions (same as before)
  const addPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      name: 'New Page',
      type: 'custom',
      enabled: true,
      config: {}
    }

    const pageType = pageTypes['custom']
    if (pageType) {
      pageType.configFields.forEach(field => {
        newPage.config[field.key] = field.default
      })
    }

    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }))
  }

  const removePage = (pageId) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.filter(page => page.id !== pageId)
    }))
  }

  const updatePage = (pageId, updates) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map(page =>
        page.id === pageId
          ? { ...page, ...updates }
          : page
      )
    }))
  }

  const updatePageConfig = (pageId, configKey, value) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map(page =>
        page.id === pageId
          ? {
            ...page,
            config: { ...page.config, [configKey]: value }
          }
          : page
      )
    }))
  }

  const changePageType = (pageId, newType) => {
    const pageType = pageTypes[newType]
    const newConfig = {}

    if (pageType) {
      pageType.configFields.forEach(field => {
        newConfig[field.key] = field.default
      })
    }

    updatePage(pageId, {
      type: newType,
      config: newConfig
    })
  }

  const renderPageConfig = (page) => {
    const pageType = pageTypes[page.type]
    if (!pageType || !pageType.configFields) return null

    return (
      <div className="space-y-4 border-l-4 border-blue-200 pl-4 ml-4">
        {pageType.configFields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={page.config[field.key] || ''}
                onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={page.config[field.key] || ''}
                onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            )}

            {field.type === 'select' && (
              <select
                value={page.config[field.key] || field.default}
                onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {field.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={page.config[field.key] || false}
                  onChange={(e) => updatePageConfig(page.id, field.key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Enable this feature</span>
              </label>
            )}

            {field.type === 'multiselect' && (
              <div className="space-y-2">
                {field.options.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(page.config[field.key] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = page.config[field.key] || []
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value)
                        updatePageConfig(page.id, field.key, newValues)
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // If vectorRAG is available, use it to enhance the request
      let enhancedData = { ...formData }

      if (vectorRAG && formData.vectorEnhancement) {
        console.log('🧠 Enhancing with Vector RAG...')
        try {
          // Store company data in vector database
          await vectorRAG.storeCompanyData(formData)

          // Find similar companies for context
          const similarCompanies = await vectorRAG.findSimilarCompanies(formData, 3)
          console.log(`🔍 Found ${similarCompanies.length} similar companies`)

          enhancedData.vectorContext = {
            similarCompanies,
            industryAnalysis: true,
            vectorEnhanced: true
          }
        } catch (vectorError) {
          console.warn('⚠️ Vector enhancement failed, continuing with standard generation:', vectorError)
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...enhancedData,
          customRequirements: formData.businessDescription,
          pages: formData.pages.filter(page => page.enabled)
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)

        // Optionally save the successful generation to Firebase
        if (db && formData.businessName) {
          try {
            await addDoc(collection(db, 'generated_websites'), {
              businessName: formData.businessName,
              industry: formData.industry,
              template: formData.template,
              generatedAt: new Date(),
              vectorEnhanced: formData.vectorEnhancement,
              pageCount: formData.pages.filter(p => p.enabled).length
            })
          } catch (saveError) {
            console.warn('Failed to save generation record:', saveError)
          }
        }
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

  const showHealthWarning = systemHealth && systemHealth.status !== 'healthy'

  return (
    <div className="max-w-4xl mx-auto">


      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Configuration</h3>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter configuration name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveConfiguration}
                disabled={!configName.trim() || savingConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {savingConfig && <Loader className="w-4 h-4 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Load Configuration</h3>

            {loadingConfigs ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span>Loading configurations...</span>
              </div>
            ) : savedConfigs.length === 0 ? (
              <div className="text-center py-8">
                <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No saved configurations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedConfigs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{config.name}</h4>
                      <div className="text-sm text-gray-600">
                        {config.businessName} • {config.industry} • {config.pages?.filter(p => p.enabled).length || 0} pages
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {config.updatedAt?.toDate ? config.updatedAt.toDate().toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadConfiguration(config.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteConfiguration(config.id)}
                        className="px-2 py-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vector Enhancement Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Vector RAG Enhanced</h3>
              <p className="text-blue-100">AI-powered website generation with industry intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <Database className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">Vector DB</div>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">AI Content</div>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">Industry Match</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Business Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
                required
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Who are your ideal customers?"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your business, services, and what makes you unique..."
            />
          </div>
        </div>

        {/* Services */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Key Services</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentService}
              onChange={(e) => setCurrentService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a service (e.g., Web Development, Consulting)"
            />
            <button
              type="button"
              onClick={addService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.keyServices.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Page Configuration */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Page Configuration</h3>
            <button
              type="button"
              onClick={addPage}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Page</span>
            </button>
          </div>

          <div className="space-y-6">
            {formData.pages.map((page, index) => (
              <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={page.enabled}
                        onChange={(e) => updatePage(page.id, { enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                      />
                      <span className="font-medium text-gray-900">Enable Page</span>
                    </label>
                  </div>

                  {formData.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Name
                    </label>
                    <input
                      type="text"
                      value={page.name}
                      onChange={(e) => updatePage(page.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Page name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Type
                    </label>
                    <select
                      value={page.type}
                      onChange={(e) => changePageType(page.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(pageTypes).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      {pageTypes[page.type]?.description}
                    </div>
                  </div>
                </div>

                {page.enabled && renderPageConfig(page)}
              </div>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Template Selection</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <label
                key={template.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.template === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={formData.template === template.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${formData.template === template.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                    }`}>
                    {formData.template === template.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Vector Enhancement Options */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Vector AI Enhancement
          </h3>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="vectorEnhancement"
              checked={formData.vectorEnhancement}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Enable Vector RAG Intelligence</span>
              <p className="text-sm text-gray-600">
                Use AI to analyze similar companies and generate industry-specific content
              </p>
            </div>
          </label>
        </div>

        <DocumentToVectors className="mt-12" />

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !formData.businessName || !formData.industry || !formData.businessType}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Vector-Enhanced Website
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Generation Failed</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Website Generated Successfully!</span>
            </div>
            <button
              onClick={downloadProject}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Files Generated</div>
              <div className="text-gray-600">{result.metadata?.fileCount || 0} files</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Pages Created</div>
              <div className="text-gray-600">{formData.pages.filter(p => p.enabled).length} pages</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Processing Time</div>
              <div className="text-gray-600">{result.metadata?.processingTime || 'N/A'}</div>
            </div>
          </div>

          {result.project?.generatedContent && (
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">AI-Generated Content Preview</h4>
              <p className="text-gray-600 text-sm">
                <strong>Headline:</strong> {result.project.generatedContent.hero?.headline || 'Generated with AI'}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Description:</strong> {result.project.generatedContent.hero?.subheadline || 'AI-enhanced content'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectGenerator