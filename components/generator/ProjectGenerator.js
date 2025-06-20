'use client'

import { useState, useEffect } from 'react'
import {
  Brain, Zap, Download, Loader, CheckCircle, AlertCircle, Users, Building, Plus, X, Edit3, Globe,
  FileText, Phone, Info, Trash2, Clock, Cloud, Settings, ChevronRight, ChevronDown, Save, FolderOpen,
  ShoppingCart, Store
} from 'lucide-react'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, limit, updateDoc } from 'firebase/firestore'

// Firebase initialization function
function initializeFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    }
    return initializeApp(firebaseConfig)
  }
  return getApps()[0]
}

function ProjectGenerator() {
  const [formData, setFormData] = useState({
    // Project Type Selection
    projectType: '', // 'basic' or 'ecommerce'
    
    // First Section - Basic Business Information
    businessName: '',
    industry: '',
    businessType: '',
    targetAudience: '',
    businessDescription: '',
    template: 'modern',
    vectorEnhancement: true,

    // Ecommerce-specific options
    enableCheckout: true,
    enableUserAccounts: true,
    enableWishlist: true,
    enableInventoryTracking: true,

    // Second Section - Page Configuration
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

  // UI State
  const [activeTab, setActiveTab] = useState('home')
  const [showPageConfig, setShowPageConfig] = useState(false)

  // Firebase State
  const [savedConfigs, setSavedConfigs] = useState([])
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configName, setConfigName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [db, setDb] = useState(null)

  // Initialize Firebase and load configurations
  useEffect(() => {
    const initializeFirebaseAndLoadConfigs = async () => {
      try {
        const app = initializeFirebase()
        const database = getFirestore(app)
        setDb(database)

        // Load saved configurations
        await loadSavedConfigurations(database)
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error)
        setError('Failed to initialize Firebase. Some features may not work.')
      }
    }

    initializeFirebaseAndLoadConfigs()
  }, [])

  // Update pages when project type changes
  useEffect(() => {
    if (formData.projectType === 'ecommerce') {
      // Add ecommerce-specific pages
      const ecommercePages = [
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
            ctaText: 'Shop Now'
          }
        },
        {
          id: 'shop',
          name: 'Shop',
          type: 'shop',
          enabled: true,
          config: {}
        },
        {
          id: 'cart',
          name: 'Shopping Cart',
          type: 'cart',
          enabled: true,
          config: {}
        }
      ]
      
      setFormData(prev => ({
        ...prev,
        pages: ecommercePages
      }))
    } else if (formData.projectType === 'basic') {
      // Reset to basic pages
      const basicPages = [
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
      
      setFormData(prev => ({
        ...prev,
        pages: basicPages
      }))
    }
  }, [formData.projectType])

  // Firebase Functions
  const loadSavedConfigurations = async (database = db) => {
    if (!database) return

    setLoadingConfigs(true)
    try {
      const configsRef = collection(database, 'website_configurations')
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
      setError('Failed to load saved configurations')
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
      alert(`Configuration "${configName.trim()}" saved successfully!`)
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
      // Extract the form data from saved config (excluding metadata)
      const { name, createdAt, updatedAt, version, id, ...savedFormData } = config
      setFormData(savedFormData)
      setShowLoadDialog(false)

      console.log('✅ Configuration loaded:', name)
      alert(`Configuration "${name}" loaded successfully!`)
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

  const saveGeneratedWebsite = async (websiteData) => {
    if (!db) return

    try {
      const generationRecord = {
        businessName: formData.businessName,
        industry: formData.industry,
        template: formData.template,
        projectType: formData.projectType,
        generatedAt: new Date(),
        vectorEnhanced: formData.vectorEnhancement,
        pageCount: formData.pages.filter(p => p.enabled).length,
        fileCount: websiteData.metadata?.fileCount || 0,
        processingTime: websiteData.metadata?.processingTime || 'N/A'
      }

      await addDoc(collection(db, 'generated_websites'), generationRecord)
      console.log('✅ Website generation recorded in Firebase')
    } catch (error) {
      console.warn('⚠️ Failed to save generation record:', error)
    }
  }

  // Page type definitions
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
    shop: {
      label: 'Shop/Products',
      icon: Store,
      description: 'Product catalog and shopping interface',
      configFields: [
        {
          key: 'productsPerPage',
          label: 'Products Per Page',
          type: 'select',
          options: [
            { value: '12', label: '12 products' },
            { value: '24', label: '24 products' },
            { value: '48', label: '48 products' }
          ],
          default: '24'
        },
        {
          key: 'enableFilters',
          label: 'Enable Product Filters',
          type: 'checkbox',
          default: true
        },
        {
          key: 'enableSearch',
          label: 'Enable Product Search',
          type: 'checkbox',
          default: true
        }
      ]
    },
    cart: {
      label: 'Shopping Cart',
      icon: ShoppingCart,
      description: 'Shopping cart and checkout process',
      configFields: [
        {
          key: 'enableGuestCheckout',
          label: 'Allow Guest Checkout',
          type: 'checkbox',
          default: true
        },
        {
          key: 'enableCoupons',
          label: 'Enable Coupon Codes',
          type: 'checkbox',
          default: true
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Page management functions
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

    setActiveTab(newPage.id)
  }

  const removePage = (pageId) => {
    const updatedPages = formData.pages.filter(page => page.id !== pageId)
    setFormData(prev => ({
      ...prev,
      pages: updatedPages
    }))

    // Switch to first available tab
    if (activeTab === pageId && updatedPages.length > 0) {
      setActiveTab(updatedPages[0].id)
    }
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

  const renderPageConfigField = (page, field) => {
    const value = page.config[field.key]

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        )

      case 'select':
        return (
          <select
            value={value || field.default}
            onChange={(e) => updatePageConfig(page.id, field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updatePageConfig(page.id, field.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
            />
            <span className="text-sm text-gray-700">Enable this feature</span>
          </label>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || []
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
        )

      default:
        return null
    }
  }

  const handleSubmit = async () => {
  setLoading(true)
  setError(null)
  setResult(null)

  try {
    // Use single API endpoint but pass project type information
    const apiEndpoint = '/api/generate'
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        customRequirements: formData.businessDescription,
        pages: formData.pages.filter(page => page.enabled),
        // Explicitly pass project type and ecommerce flags
        projectType: formData.projectType, // 'basic' or 'ecommerce'
        isEcommerce: formData.projectType === 'ecommerce',
        // Ecommerce-specific options (only relevant if projectType is 'ecommerce')
        enableEcommerce: formData.projectType === 'ecommerce',
        enableCheckout: formData.enableCheckout,
        enableUserAccounts: formData.enableUserAccounts,
        enableWishlist: formData.enableWishlist,
        enableInventoryTracking: formData.enableInventoryTracking,
      }),
    })

    const data = await response.json()

    if (data.success) {
      setResult(data.data)
      // Save generation record to Firebase
      await saveGeneratedWebsite(data.data)
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

  const isBasicInfoComplete = formData.projectType && formData.businessName && formData.industry && formData.businessType
  const activePage = formData.pages.find(page => page.id === activeTab)

  return (
    <div className="max-w-7xl mx-auto">

      {/* Save Configuration Dialog */}
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

      {/* Load Configuration Dialog */}
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
                        {config.businessName} • {config.industry} • {config.projectType} • {config.pages?.filter(p => p.enabled).length || 0} pages
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

      {/* Save/Load Controls */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Configuration Management</h3>
            <p className="text-sm text-gray-600">Save your current settings or load a previous configuration</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowLoadDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Load</span>
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!isBasicInfoComplete}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">

        {/* SECTION 0: PROJECT TYPE SELECTION */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full mr-3 font-bold">
              0
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Project Type</h2>
            <span className="ml-3 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Website Option */}
            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                formData.projectType === 'basic' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, projectType: 'basic' }))}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Website</h3>
                  <p className="text-sm text-gray-600">Standard business website</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Home, About, Services, Contact pages</li>
                <li>• Contact forms and business info</li>
                <li>• Portfolio and testimonials</li>
                <li>• SEO optimized</li>
                <li>• Mobile responsive</li>
              </ul>
              {formData.projectType === 'basic' && (
                <div className="mt-4 flex items-center text-blue-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>

            {/* Ecommerce Option */}
            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                formData.projectType === 'ecommerce' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, projectType: 'ecommerce' }))}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">E-commerce Store</h3>
                  <p className="text-sm text-gray-600">Full online store</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Product catalog and search</li>
                <li>• Shopping cart and checkout</li>
                <li>• User accounts and wishlist</li>
                <li>• Payment integration ready</li>
                <li>• Inventory management</li>
              </ul>
              {formData.projectType === 'ecommerce' && (
                <div className="mt-4 flex items-center text-blue-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: BASIC BUSINESS INFORMATION (Required) */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full mr-3 font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Basic Business Information</h2>
            <span className="ml-3 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">Required</span>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          <div className="mb-6">
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

          {/* Ecommerce-specific options */}
          {formData.projectType === 'ecommerce' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                E-commerce Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="enableCheckout"
                    checked={formData.enableCheckout}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Checkout Process</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="enableUserAccounts"
                    checked={formData.enableUserAccounts}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable User Accounts</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="enableWishlist"
                    checked={formData.enableWishlist}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Wishlist</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="enableInventoryTracking"
                    checked={formData.enableInventoryTracking}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Inventory Tracking</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: PAGE CONFIGURATION (Optional) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setShowPageConfig(!showPageConfig)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full mr-3 font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Page Configuration</h2>
                <span className="ml-3 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">Optional</span>
              </div>
              {showPageConfig ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <p className="text-gray-600 mt-2 ml-11">
              {showPageConfig
                ? 'Customize individual pages or skip to use AI-generated defaults'
                : 'Click to expand and customize individual pages (optional)'
              }
            </p>
          </div>

          {showPageConfig && (
            <div className="p-6">
              {/* Page Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {formData.pages.map((page) => {
                    const PageIcon = pageTypes[page.type]?.icon || Info
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => setActiveTab(page.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${activeTab === page.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        <PageIcon className="w-4 h-4" />
                        <span>{page.name}</span>
                        {page.enabled && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={addPage}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>
              </div>

              {/* Active Page Configuration */}
              {activePage && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activePage.enabled}
                          onChange={(e) => updatePage(activePage.id, { enabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                        />
                        <span className="font-medium text-gray-900">Enable This Page</span>
                      </label>
                    </div>

                    {formData.pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePage(activePage.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Page</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Name
                      </label>
                      <input
                        type="text"
                        value={activePage.name}
                        onChange={(e) => updatePage(activePage.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Page name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Type
                      </label>
                      <select
                        value={activePage.type}
                        onChange={(e) => changePageType(activePage.id, e.target.value)}
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
                      <p className="text-sm text-gray-600">
                        {pageTypes[activePage.type]?.description}
                      </p>
                    </div>
                  </div>

                  {/* Page-specific Configuration */}
                  {activePage.enabled && pageTypes[activePage.type]?.configFields && (
                    <div className="space-y-6 border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-gray-600" />
                        Page Configuration
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pageTypes[activePage.type].configFields.map(field => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            {renderPageConfigField(activePage, field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Upload */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full mr-3 font-bold">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
            <span className="ml-3 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">Optional</span>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Business Documents
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload documents to enhance AI content generation (optional)
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Brain className="w-4 h-4 mr-1 text-blue-500" />
                    AI Processing
                  </span>
                  <span className="flex items-center">
                    <Settings className="w-4 h-4 mr-1 text-purple-500" />
                    Vector Storage
                  </span>
                </div>
              </div>

              <input
                type="file"
                multiple
                accept=".txt,.md,.pdf,.doc,.docx"
                className="hidden"
                id="document-upload"
              />

              <label
                htmlFor="document-upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Select Documents
              </label>

              <p className="text-xs text-gray-500">
                Supports: PDF, Word documents, text files (Max 10MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Vector Enhancement */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="vectorEnhancement"
              checked={formData.vectorEnhancement}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
            />
            <div>
              <div className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium text-gray-900">Enable Vector RAG Intelligence</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Use AI to analyze similar companies and generate industry-specific content
              </p>
            </div>
          </label>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600">
                {isBasicInfoComplete
                  ? `Your ${formData.projectType} project is ready! Click generate to create your website.`
                  : 'Please complete the required information first.'
                }
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !isBasicInfoComplete}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating {formData.projectType} site...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate {formData.projectType === 'ecommerce' ? 'E-commerce Store' : 'Website'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
              <span className="font-medium text-green-800">
                {formData.projectType === 'ecommerce' ? 'E-commerce Store' : 'Website'} Generated Successfully!
              </span>
            </div>
            <button
              onClick={downloadProject}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Project Type</div>
              <div className="text-gray-600 capitalize">{formData.projectType}</div>
            </div>
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