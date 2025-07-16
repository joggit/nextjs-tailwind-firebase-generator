'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  Palette, 
  Layout, 
  Eye, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Code, 
  Zap,
  Navigation,
  Menu,
  Plus,
  X,
  Upload,
  Link,
  Settings,
  Play,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText  
} from 'lucide-react'
import PageEditor from './PageEditor'

// Design theme options (keeping existing)
const DESIGN_THEMES = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with bold typography',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6', 
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB'
    },
    features: ['Sharp corners', 'Bold typography', 'High contrast', 'Minimalist'],
    preview: 'bg-gradient-to-br from-blue-500 to-purple-500'
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated design with refined typography',
    colors: {
      primary: '#1F2937',
      secondary: '#D97706',
      accent: '#DC2626', 
      background: '#FFFBEB',
      surface: '#FFFFFF'
    },
    features: ['Serif fonts', 'Warm colors', 'Spacious layout', 'Classic'],
    preview: 'bg-gradient-to-br from-amber-600 to-orange-600'
  },
}

// Layout options
const LAYOUT_OPTIONS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Classic header, main content, footer layout',
    icon: '□',
    features: ['Header navigation', 'Full-width content', 'Footer']
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Side navigation with main content area',
    icon: '⫿',
    features: ['Side navigation', 'Compact layout', 'Dashboard style']
  },
  centered: {
    id: 'centered',
    name: 'Centered',
    description: 'Centered content with maximum focus',
    icon: '▢',
    features: ['Centered content', 'Reading focused', 'Minimal distractions']
  },
}

// Hero style options
const HERO_STYLES = {
  centered: {
    id: 'centered',
    name: 'Centered',
    description: 'Classic centered hero with call-to-action',
    preview: 'text-center with large heading'
  },
  split: {
    id: 'split',
    name: 'Split',
    description: 'Text on one side, image on the other',
    preview: 'side-by-side content'
  },
  fullscreen: {
    id: 'fullscreen',
    name: 'Fullscreen',
    description: 'Full viewport height hero section',
    preview: 'immersive full-screen'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple text-focused hero',
    preview: 'clean and simple'
  },
}

// Hero background options
const HERO_BACKGROUNDS = {
  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Beautiful gradient background',
    preview: 'bg-gradient-to-br from-blue-500 to-purple-500'
  },
  solid: {
    id: 'solid',
    name: 'Solid Color',
    description: 'Simple solid color background',
    preview: 'bg-blue-600'
  },
  image: {
    id: 'image',
    name: 'Background Image',
    description: 'Custom background image',
    preview: 'bg-gray-400'
  },
  video: {
    id: 'video',
    name: 'Background Video',
    description: 'Video background with overlay',
    preview: 'bg-gray-800'
  }
}

// Header style options
const HEADER_STYLES = {
  solid: {
    id: 'solid',
    name: 'Solid',
    description: 'Traditional solid background header',
    preview: 'bg-white border-b border-gray-200'
  },
  transparent: {
    id: 'transparent',
    name: 'Transparent',
    description: 'Transparent header overlay',
    preview: 'bg-transparent'
  },
  sticky: {
    id: 'sticky',
    name: 'Sticky',
    description: 'Sticky header that follows scroll',
    preview: 'bg-white/95 backdrop-blur-sm'
  },
}

// Footer style options
const FOOTER_STYLES = {
  simple: {
    id: 'simple',
    name: 'Simple',
    description: 'Single row with essential info',
    preview: 'Single row footer'
  },
  multiColumn: {
    id: 'multiColumn',
    name: 'Multi-Column',
    description: 'Multiple columns with detailed info',
    preview: 'Multi-column layout'
  },
  newsletter: {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Focus on newsletter signup',
    preview: 'Newsletter focused'
  },
}

function DesignSelector({ config, onChange, onNext, onPrev }) {
  const [selectedSection, setSelectedSection] = useState('theme')
  const [expandedMenus, setExpandedMenus] = useState({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize all required data structures
  const initializeDataStructures = useCallback(() => {
    if (isInitialized) return

    console.log('Initializing DesignSelector data structures...')

    const updates = {}

    // Initialize design data
    if (!config.design) {
      updates.design = {
        theme: '',
        layout: '',
        heroStyle: '',
        graphics: ''
      }
    }

    // Initialize hero data
    if (!config.heroData) {
      updates.heroData = {
        headline: '',
        subheadline: '',
        primaryCta: 'Get Started',
        secondaryCta: 'Learn More',
        backgroundType: '',
        backgroundImage: '',
        backgroundVideo: ''
      }
    }

    // Initialize header data
    if (!config.headerData) {
      updates.headerData = {
        style: '',
        logoType: 'text',
        logoText: config.businessName || '',
        menuItems: [
          { name: 'Home', link: '/', type: 'link', children: [] },
          { name: 'About', link: '/about', type: 'link', children: [] },
          { name: 'Services', link: '/services', type: 'link', children: [] },
          { name: 'Contact', link: '/contact', type: 'link', children: [] }
        ],
        showCta: false,
        ctaText: 'Get Started',
        ctaLink: '/contact'
      }
    }

    // Initialize footer data
    if (!config.footerData) {
      updates.footerData = {
        style: '',
        companyName: config.businessName || '',
        email: '',
        phone: '',
        address: '',
        companyDescription: config.businessDescription || '',
        showNewsletter: false,
        newsletterTitle: 'Stay Updated',
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        }
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      setTimeout(() => {
        onChange({ ...config, ...updates })
        setIsInitialized(true)
      }, 0)
    } else {
      setIsInitialized(true)
    }
  }, [config, onChange, isInitialized])

  // Run initialization
  useEffect(() => {
    initializeDataStructures()
    // Log the config when it changes
    console.log('DesignSelector config initialized:', config)
  }, [initializeDataStructures])

  const updateDesign = useCallback((key, value) => {
    onChange({
      ...config,
      design: {
        ...config.design,
        [key]: value
      }
    })
  }, [config, onChange])

  const updateHeroData = useCallback((key, value) => {
    onChange({
      ...config,
      heroData: {
        ...config.heroData,
        [key]: value
      }
    })
  }, [config, onChange])

  const updateHeaderData = useCallback((key, value) => {
    onChange({
      ...config,
      headerData: {
        ...config.headerData,
        [key]: value
      }
    })
  }, [config, onChange])

  const updateFooterData = useCallback((key, value) => {
    onChange({
      ...config,
      footerData: {
        ...config.footerData,
        [key]: value
      }
    })
  }, [config, onChange])

  // Enhanced menu item functions with nested support
  const updateMenuItem = useCallback((index, key, value) => {
    const newMenuItems = [...(config.headerData?.menuItems || [])]
    newMenuItems[index] = { ...newMenuItems[index], [key]: value }
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const updateNestedMenuItem = useCallback((parentIndex, childIndex, key, value) => {
    const newMenuItems = [...(config.headerData?.menuItems || [])]
    if (!newMenuItems[parentIndex].children) {
      newMenuItems[parentIndex].children = []
    }
    newMenuItems[parentIndex].children[childIndex] = { 
      ...newMenuItems[parentIndex].children[childIndex], 
      [key]: value 
    }
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const addMenuItem = useCallback(() => {
    const newMenuItems = [...(config.headerData?.menuItems || [])]
    newMenuItems.push({ 
      name: 'New Item', 
      link: '/',
      type: 'link',
      children: []
    })
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const addNestedMenuItem = useCallback((parentIndex) => {
    const newMenuItems = [...(config.headerData?.menuItems || [])]
    if (!newMenuItems[parentIndex].children) {
      newMenuItems[parentIndex].children = []
    }
    newMenuItems[parentIndex].children.push({
      name: 'New Sub Item',
      link: '/',
      description: 'Sub menu description'
    })
    newMenuItems[parentIndex].type = 'dropdown'
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const removeMenuItem = useCallback((index) => {
    const newMenuItems = (config.headerData?.menuItems || []).filter((_, i) => i !== index)
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const removeNestedMenuItem = useCallback((parentIndex, childIndex) => {
    const newMenuItems = [...(config.headerData?.menuItems || [])]
    newMenuItems[parentIndex].children = newMenuItems[parentIndex].children.filter((_, i) => i !== childIndex)
    
    if (newMenuItems[parentIndex].children.length === 0) {
      newMenuItems[parentIndex].type = 'link'
    }
    
    updateHeaderData('menuItems', newMenuItems)
  }, [config.headerData?.menuItems, updateHeaderData])

  const toggleMenuExpansion = useCallback((index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }, [])

  const updateSocialLink = useCallback((platform, value) => {
    updateFooterData('socialLinks', {
      ...config.footerData?.socialLinks,
      [platform]: value
    })
  }, [config.footerData?.socialLinks, updateFooterData])

  // Updated isComplete function to properly check aligned data structures
  const isComplete = useCallback(() => {
    // Check basic design selections
    const hasDesignSettings = (
      config.design?.theme && 
      config.design?.layout && 
      config.design?.heroStyle
    )
    
    // Check detailed customization settings
    const hasCustomizationSettings = (
      config.headerData?.style && 
      config.footerData?.style &&
      config.heroData?.backgroundType
    )
    
    // Check pages - both simple and detailed structures
    const hasSimplePages = config.pages && Object.keys(config.pages).length > 0
    const hasDetailedPages = config.detailedPages && Object.keys(config.detailedPages).length > 0
    const hasEnabledPages = hasSimplePages && Object.values(config.pages).some(p => p.enabled !== false)
    
    // For pages, we need either structure to be valid
    const hasValidPages = (hasSimplePages && hasEnabledPages) || hasDetailedPages
    
    return hasDesignSettings && hasCustomizationSettings && hasValidPages
  }, [config])

  // Render functions for each section
  const renderThemeSelector = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Design Theme</h3>
        <p className="text-gray-600 mb-6">Select a visual style that matches your brand personality</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(DESIGN_THEMES).map((theme) => (
          <button
            key={theme.id}
            onClick={() => updateDesign('theme', theme.id)}
            className={`relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
              config.design?.theme === theme.id
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`w-full h-24 ${theme.preview} rounded-lg mb-4 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{theme.name}</span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{theme.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
            
            <div className="flex space-x-2 mb-3">
              {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
                <div
                  key={key}
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {theme.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
            
            {config.design?.theme === theme.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  const renderLayoutSelector = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Layout</h3>
        <p className="text-gray-600 mb-6">Select how your content will be organized and presented</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(LAYOUT_OPTIONS).map((layout) => (
          <button
            key={layout.id}
            onClick={() => updateDesign('layout', layout.id)}
            className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
              config.design?.layout === layout.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">{layout.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{layout.name}</h4>
                <p className="text-sm text-gray-600">{layout.description}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {layout.features.map((feature) => (
                <div key={feature} className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderHeroSelector = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Hero Style</h3>
        <p className="text-gray-600 mb-6">Select how your main section will capture attention</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(HERO_STYLES).map((hero) => (
          <button
            key={hero.id}
            onClick={() => updateDesign('heroStyle', hero.id)}
            className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
              config.design?.heroStyle === hero.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="w-full h-20 bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className={`text-xs text-gray-500 ${hero.preview}`}>
                {hero.name} Preview
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{hero.name}</h4>
            <p className="text-sm text-gray-600">{hero.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderHeroCustomization = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize Hero Section</h3>
        <p className="text-gray-600 mb-6">Design your website's main hero section to make a great first impression</p>
      </div>

      {/* Hero Content */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Hero Content</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Headline</label>
            <input
              type="text"
              value={config.heroData?.headline || ''}
              onChange={(e) => updateHeroData('headline', e.target.value)}
              placeholder={`Transform Your ${config.industry || 'Business'} with ${config.businessName || 'Our Solutions'}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-headline</label>
            <textarea
              value={config.heroData?.subheadline || ''}
              onChange={(e) => updateHeroData('subheadline', e.target.value)}
              placeholder={config.businessDescription || `Professional ${config.industry || 'business'} solutions designed for ${config.targetAudience || 'your success'}`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Call-to-Action Buttons</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
            <input
              type="text"
              value={config.heroData?.primaryCta || ''}
              onChange={(e) => updateHeroData('primaryCta', e.target.value)}
              placeholder="Get Started"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
            <input
              type="text"
              value={config.heroData?.secondaryCta || ''}
              onChange={(e) => updateHeroData('secondaryCta', e.target.value)}
              placeholder="Learn More"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Background Options */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Background Style</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(HERO_BACKGROUNDS).map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateHeroData('backgroundType', bg.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                config.heroData?.backgroundType === bg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-16 ${bg.preview} rounded mb-3 flex items-center justify-center`}>
                {bg.id === 'image' && <ImageIcon className="w-6 h-6 text-white" />}
                {bg.id === 'video' && <Play className="w-6 h-6 text-white" />}
                {bg.id === 'gradient' && <Sparkles className="w-6 h-6 text-white" />}
                {bg.id === 'solid' && <div className="w-6 h-6 bg-white rounded"></div>}
              </div>
              <h5 className="font-medium text-gray-900">{bg.name}</h5>
              <p className="text-sm text-gray-600">{bg.description}</p>
            </button>
          ))}
        </div>

        {/* Background Image Upload */}
        {config.heroData?.backgroundType === 'image' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
            <input
              type="url"
              value={config.heroData?.backgroundImage || ''}
              onChange={(e) => updateHeroData('backgroundImage', e.target.value)}
              placeholder="https://example.com/your-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter a URL to a high-quality image (recommended: 1920x1080px or larger)</p>
          </div>
        )}

        {/* Background Video */}
        {config.heroData?.backgroundType === 'video' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Video URL</label>
            <input
              type="url"
              value={config.heroData?.backgroundVideo || ''}
              onChange={(e) => updateHeroData('backgroundVideo', e.target.value)}
              placeholder="https://example.com/your-video.mp4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter a URL to an MP4 video file for background video</p>
          </div>
        )}
      </div>

      {/* Hero Preview */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Hero Preview</h4>
        <div className={`relative w-full h-64 rounded-lg overflow-hidden ${
          config.heroData?.backgroundType === 'gradient' ? HERO_BACKGROUNDS.gradient.preview :
          config.heroData?.backgroundType === 'solid' ? 'bg-blue-600' :
          config.heroData?.backgroundType === 'image' ? 'bg-gray-400' :
          'bg-gray-800'
        }`}>
          {config.heroData?.backgroundImage && config.heroData?.backgroundType === 'image' && (
            <img
              src={config.heroData.backgroundImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl px-4">
              <h1 className="text-3xl font-bold mb-4">
                {config.heroData?.headline || `Transform Your ${config.industry || 'Business'}`}
              </h1>
              <p className="text-lg mb-6 opacity-90">
                {config.heroData?.subheadline || `Professional ${config.industry || 'business'} solutions for your success`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  {config.heroData?.primaryCta || 'Get Started'}
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold">
                  {config.heroData?.secondaryCta || 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHeaderCustomization = () => ( 
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize Header & Navigation</h3>
        <p className="text-gray-600 mb-6">Design your website header and navigation menu with nested dropdown support</p>
      </div>

      {/* Header Style Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Header Style</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(HEADER_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => updateHeaderData('style', style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                config.headerData?.style === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-12 ${style.preview} rounded mb-3 flex items-center justify-center text-xs text-gray-500`}>
                Header Preview
              </div>
              <h5 className="font-medium text-gray-900">{style.name}</h5>
              <p className="text-sm text-gray-600">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Configuration */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Logo Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Type</label>
            <select
              value={config.headerData?.logoType || 'text'}
              onChange={(e) => updateHeaderData('logoType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text Logo</option>
              <option value="image">Image Logo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Text</label>
            <input
              type="text"
              value={config.headerData?.logoText || ''}
              onChange={(e) => updateHeaderData('logoText', e.target.value)}
              placeholder={config.businessName || "Your Business"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Menu Items with Nested Support */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Navigation Menu</h4>
          <button
            onClick={addMenuItem}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {(config.headerData?.menuItems || []).map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Main Menu Item */}
              <div className="p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleMenuExpansion(index)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {item.children && item.children.length > 0 ? (
                      expandedMenus[index] ? (
                        <FolderOpen className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Folder className="w-4 h-4 text-gray-500" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </button>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                      placeholder="Menu Name"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.link || ''}
                      onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                      placeholder="/page-url"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={item.type || 'link'}
                      onChange={(e) => updateMenuItem(index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="link">Single Link</option>
                      <option value="dropdown">Dropdown Menu</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addNestedMenuItem(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Add sub-menu item"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeMenuItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nested Menu Items */}
              {item.children && item.children.length > 0 && expandedMenus[index] && (
                <div className="bg-gray-50 border-t border-gray-200">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-700">Sub-menu Items</h5>
                      <button
                        onClick={() => addNestedMenuItem(index)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Add Sub-item
                      </button>
                    </div>
                    
                    {item.children.map((child, childIndex) => (
                      <div key={childIndex} className="flex items-center space-x-3 pl-6">
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={child.name || ''}
                            onChange={(e) => updateNestedMenuItem(index, childIndex, 'name', e.target.value)}
                            placeholder="Sub-menu Name"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={child.link || ''}
                            onChange={(e) => updateNestedMenuItem(index, childIndex, 'link', e.target.value)}
                            placeholder="/sub-page-url"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            value={child.description || ''}
                            onChange={(e) => updateNestedMenuItem(index, childIndex, 'description', e.target.value)}
                            placeholder="Description (optional)"
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <button
                          onClick={() => removeNestedMenuItem(index, childIndex)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Menu Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Menu Preview</h5>
          <div className="flex flex-wrap gap-2">
            {(config.headerData?.menuItems || []).map((item, index) => (
              <div key={index} className="relative group">
                <div className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm">
                  <span>{item.name || 'Unnamed'}</span>
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                
                {/* Dropdown Preview */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                    {item.children.map((child, childIndex) => (
                      <div key={childIndex} className="px-4 py-2 text-sm border-b border-gray-100 last:border-b-0">
                        <div className="font-medium text-gray-900">{child.name || 'Unnamed'}</div>
                        {child.description && (
                          <div className="text-xs text-gray-500 mt-1">{child.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header CTA Button */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Call-to-Action Button</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.headerData?.showCta || false}
              onChange={(e) => updateHeaderData('showCta', e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show CTA button in header</span>
          </label>
          
          {config.headerData?.showCta && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={config.headerData?.ctaText || ''}
                onChange={(e) => updateHeaderData('ctaText', e.target.value)}
                placeholder="Button Text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={config.headerData?.ctaLink || ''}
                onChange={(e) => updateHeaderData('ctaLink', e.target.value)}
                placeholder="Button Link"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderFooterCustomization = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize Footer</h3>
        <p className="text-gray-600 mb-6">Design your website footer with company info and links</p>
      </div>

      {/* Footer Style Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Footer Style</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(FOOTER_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => updateFooterData('style', style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                config.footerData?.style === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-full h-16 bg-gray-100 rounded mb-3 flex items-center justify-center text-xs text-gray-500">
                {style.preview}
              </div>
              <h5 className="font-medium text-gray-900">{style.name}</h5>
              <p className="text-sm text-gray-600">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={config.footerData?.companyName || ''}
              onChange={(e) => updateFooterData('companyName', e.target.value)}
              placeholder={config.businessName || "Your Company"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={config.footerData?.email || ''}
              onChange={(e) => updateFooterData('email', e.target.value)}
              placeholder="contact@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={config.footerData?.phone || ''}
              onChange={(e) => updateFooterData('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={config.footerData?.address || ''}
              onChange={(e) => updateFooterData('address', e.target.value)}
              placeholder="123 Business St, City, State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
          <textarea
            value={config.footerData?.companyDescription || ''}
            onChange={(e) => updateFooterData('companyDescription', e.target.value)}
            placeholder={config.businessDescription || "Brief description of your company"}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Newsletter Signup</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.footerData?.showNewsletter || false}
              onChange={(e) => updateFooterData('showNewsletter', e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Include newsletter signup in footer</span>
          </label>
          
          {config.footerData?.showNewsletter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Title</label>
              <input
                type="text"
                value={config.footerData?.newsletterTitle || ''}
                onChange={(e) => updateFooterData('newsletterTitle', e.target.value)}
                placeholder="Stay Updated"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Social Media Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['facebook', 'twitter', 'linkedin', 'instagram']).map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{platform}</label>
              <input
                type="url"
                value={config.footerData?.socialLinks?.[platform] || ''}
                onChange={(e) => updateSocialLink(platform, e.target.value)}
                placeholder={`https://${platform}.com/yourcompany`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const sections = [
    { id: 'theme', label: 'Theme', icon: Palette, component: renderThemeSelector },
    { id: 'layout', label: 'Layout', icon: Layout, component: renderLayoutSelector },
    { id: 'heroStyle', label: 'Hero Style', icon: Eye, component: renderHeroSelector },
    { id: 'hero', label: 'Hero Content', icon: Sparkles, component: renderHeroCustomization },
    { id: 'header', label: 'Header', icon: Navigation, component: renderHeaderCustomization },
    { id: 'footer', label: 'Footer', icon: Menu, component: renderFooterCustomization },
    { id: 'pages', label: 'Pages', icon: FileText, component: () => <PageEditor config={config} onChange={onChange} /> },
  ]

  if (!isInitialized) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Initializing design system...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Section Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    selectedSection === section.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="min-h-96">
        {sections.find(s => s.id === selectedSection)?.component()}
      </div>

      {/* Live Preview */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2" />
          Live Preview
        </h4>
        
        {/* Header Preview with Nested Menus */}
        <div className="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
          <div className={`px-6 py-4 ${HEADER_STYLES[config.headerData?.style]?.preview || 'bg-white'} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {(config.headerData?.logoText || config.businessName || 'L')[0].toUpperCase()}
                </div>
                <span className="font-bold text-gray-900">
                  {config.headerData?.logoText || config.businessName || 'Your Logo'}
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                {(config.headerData?.menuItems || []).slice(0, 4).map((item, index) => (
                  <div key={index} className="relative group">
                    <span className="text-sm text-gray-600 flex items-center space-x-1 cursor-pointer">
                      <span>{item.name}</span>
                      {item.children && item.children.length > 0 && (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                    {item.children && item.children.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                        {item.children.slice(0, 3).map((child, childIndex) => (
                          <div key={childIndex} className="px-3 py-2 text-xs border-b border-gray-100 last:border-b-0">
                            <div className="font-medium text-gray-900">{child.name}</div>
                            {child.description && (
                              <div className="text-gray-500 mt-1">{child.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              {config.headerData?.showCta && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  {config.headerData?.ctaText || 'CTA'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Preview */}
        <div className={`relative w-full h-32 rounded-lg overflow-hidden mb-4 ${
          config.heroData?.backgroundType === 'gradient' ? HERO_BACKGROUNDS.gradient.preview :
          config.heroData?.backgroundType === 'solid' ? 'bg-blue-600' :
          'bg-gray-400'
        }`}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-2">
                {config.heroData?.headline || `Welcome to ${config.businessName || 'Your Business'}`}
              </h3>
              <div className="flex gap-2 justify-center">
                <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
                  {config.heroData?.primaryCta || 'Get Started'}
                </span>
                <span className="border border-white text-white px-3 py-1 rounded text-xs">
                  {config.heroData?.secondaryCta || 'Learn More'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Design Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Theme:</span>
            <div className="font-medium text-gray-900 capitalize">{config.design?.theme || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Layout:</span>
            <div className="font-medium text-gray-900 capitalize">{config.design?.layout || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Hero Style:</span>
            <div className="font-medium text-gray-900 capitalize">{config.design?.heroStyle || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Hero BG:</span>
            <div className="font-medium text-gray-900 capitalize">{config.heroData?.backgroundType || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Header:</span>
            <div className="font-medium text-gray-900 capitalize">{config.headerData?.style || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Footer:</span>
            <div className="font-medium text-gray-900 capitalize">{config.footerData?.style || 'Not selected'}</div>
          </div>
        </div>
        
        {/* Pages Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pages:</span>
            <div className="space-x-4">
              <span className="font-medium text-gray-900">
                Simple: {config.pages ? Object.keys(config.pages).length : 0}
              </span>
              <span className="font-medium text-gray-900">
                Detailed: {config.detailedPages ? Object.keys(config.detailedPages).length : 0}
              </span>
              <span className="font-medium text-green-600">
                Enabled: {config.pages ? Object.values(config.pages).filter(p => p.enabled !== false).length : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">
            Configuration {isComplete() ? 'Complete' : 'In Progress'}
          </div>
          <div className="flex space-x-1">
            {sections.map((section) => {
              let isCompleted = false
              if (section.id === 'theme') isCompleted = !!config.design?.theme
              if (section.id === 'layout') isCompleted = !!config.design?.layout
              if (section.id === 'heroStyle') isCompleted = !!config.design?.heroStyle
              if (section.id === 'hero') isCompleted = !!config.heroData?.backgroundType
              if (section.id === 'header') isCompleted = !!config.headerData?.style
              if (section.id === 'footer') isCompleted = !!config.footerData?.style
              if (section.id === 'pages') {
                const hasSimplePages = config.pages && Object.keys(config.pages).length > 0
                const hasDetailedPages = config.detailedPages && Object.keys(config.detailedPages).length > 0
                isCompleted = hasSimplePages || hasDetailedPages
              }
              
              return (
                <div
                  key={section.id}
                  className={`w-2 h-2 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )
            })}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!isComplete()}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next: Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DesignSelector