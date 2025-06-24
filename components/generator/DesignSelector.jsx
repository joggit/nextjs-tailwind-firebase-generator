'use client'

import { useState } from 'react'
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
  Image as ImageIcon
} from 'lucide-react'

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
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and playful with unique elements',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#F3F4F6',
      surface: '#FFFFFF'
    },
    features: ['Rounded corners', 'Bright colors', 'Animations', 'Playful'],
    preview: 'bg-gradient-to-br from-pink-500 to-purple-500'
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    description: 'Futuristic design with neon accents',
    colors: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#0F172A',
      surface: '#1E293B'
    },
    features: ['Dark theme', 'Neon effects', 'Monospace fonts', 'Futuristic'],
    preview: 'bg-gradient-to-br from-cyan-500 to-blue-600'
  }
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
  centered: {
    id: 'centered',
    name: 'Centered',
    description: 'Centered logo and navigation',
    preview: 'bg-white text-center'
  },
  leftAligned: {
    id: 'leftAligned',
    name: 'Left Aligned',
    description: 'Logo left, navigation right',
    preview: 'bg-white justify-between'
  }
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
  contactFocused: {
    id: 'contactFocused',
    name: 'Contact Focused',
    description: 'Emphasizes contact information',
    preview: 'Contact information focus'
  }
}

function DesignSelector({ config, onChange, onNext, onPrev }) {
  const [selectedSection, setSelectedSection] = useState('theme')

  const updateDesign = (key, value) => {
    onChange({
      ...config,
      design: {
        ...config.design,
        [key]: value
      }
    })
  }

  const updateHeroData = (key, value) => {
    onChange({
      ...config,
      heroData: {
        ...config.heroData,
        [key]: value
      }
    })
  }

  const updateHeaderData = (key, value) => {
    onChange({
      ...config,
      headerData: {
        ...config.headerData,
        [key]: value
      }
    })
  }

  const updateFooterData = (key, value) => {
    onChange({
      ...config,
      footerData: {
        ...config.footerData,
        [key]: value
      }
    })
  }

  const updateMenuItem = (index, key, value) => {
    const newMenuItems = [...(config.headerData.menuItems || [])]
    newMenuItems[index] = { ...newMenuItems[index], [key]: value }
    updateHeaderData('menuItems', newMenuItems)
  }

  const addMenuItem = () => {
    const newMenuItems = [...(config.headerData.menuItems || [])]
    newMenuItems.push({ name: 'New Item', link: '/' })
    updateHeaderData('menuItems', newMenuItems)
  }

  const removeMenuItem = (index) => {
    const newMenuItems = config.headerData.menuItems.filter((_, i) => i !== index)
    updateHeaderData('menuItems', newMenuItems)
  }

  const updateSocialLink = (platform, value) => {
    updateFooterData('socialLinks', {
      ...config.footerData.socialLinks,
      [platform]: value
    })
  }

  const isComplete = () => {
    return (
      config.design.theme && 
      config.design.layout && 
      config.design.heroStyle && 
      config.headerData.style && 
      config.footerData.style &&
      config.heroData.backgroundType
    )
  }

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
              config.design.theme === theme.id
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
            
            {config.design.theme === theme.id && (
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
              value={config.heroData.headline}
              onChange={(e) => updateHeroData('headline', e.target.value)}
              placeholder={`Transform Your ${config.industry || 'Business'} with ${config.businessName || 'Our Solutions'}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-headline</label>
            <textarea
              value={config.heroData.subheadline}
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
              value={config.heroData.primaryCta}
              onChange={(e) => updateHeroData('primaryCta', e.target.value)}
              placeholder="Get Started"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
            <input
              type="text"
              value={config.heroData.secondaryCta}
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
                config.heroData.backgroundType === bg.id
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
        {config.heroData.backgroundType === 'image' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
            <input
              type="url"
              value={config.heroData.backgroundImage}
              onChange={(e) => updateHeroData('backgroundImage', e.target.value)}
              placeholder="https://example.com/your-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter a URL to a high-quality image (recommended: 1920x1080px or larger)</p>
          </div>
        )}

        {/* Background Video */}
        {config.heroData.backgroundType === 'video' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Video URL</label>
            <input
              type="url"
              value={config.heroData.backgroundVideo}
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
          config.heroData.backgroundType === 'gradient' ? HERO_BACKGROUNDS.gradient.preview :
          config.heroData.backgroundType === 'solid' ? 'bg-blue-600' :
          config.heroData.backgroundType === 'image' ? 'bg-gray-400' :
          'bg-gray-800'
        }`}>
          {config.heroData.backgroundImage && config.heroData.backgroundType === 'image' && (
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
                {config.heroData.headline || `Transform Your ${config.industry || 'Business'}`}
              </h1>
              <p className="text-lg mb-6 opacity-90">
                {config.heroData.subheadline || `Professional ${config.industry || 'business'} solutions for your success`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  {config.heroData.primaryCta || 'Get Started'}
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold">
                  {config.heroData.secondaryCta || 'Learn More'}
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
        <p className="text-gray-600 mb-6">Design your website header and navigation menu</p>
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
                config.headerData.style === style.id
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
              value={config.headerData.logoType}
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
              value={config.headerData.logoText}
              onChange={(e) => updateHeaderData('logoText', e.target.value)}
              placeholder={config.businessName || "Your Business"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Menu Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Navigation Menu</h4>
          <button
            onClick={addMenuItem}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {(config.headerData.menuItems || []).map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                  placeholder="Menu Name"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={item.link}
                  onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                  placeholder="/page-url"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => removeMenuItem(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Header CTA Button */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Call-to-Action Button</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.headerData.showCta}
              onChange={(e) => updateHeaderData('showCta', e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show CTA button in header</span>
          </label>
          
          {config.headerData.showCta && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={config.headerData.ctaText}
                onChange={(e) => updateHeaderData('ctaText', e.target.value)}
                placeholder="Button Text"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={config.headerData.ctaLink}
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
                config.footerData.style === style.id
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
              value={config.footerData.companyName}
              onChange={(e) => updateFooterData('companyName', e.target.value)}
              placeholder={config.businessName || "Your Company"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={config.footerData.email}
              onChange={(e) => updateFooterData('email', e.target.value)}
              placeholder="contact@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={config.footerData.phone}
              onChange={(e) => updateFooterData('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={config.footerData.address}
              onChange={(e) => updateFooterData('address', e.target.value)}
              placeholder="123 Business St, City, State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
          <textarea
            value={config.footerData.companyDescription}
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
              checked={config.footerData.showNewsletter}
              onChange={(e) => updateFooterData('showNewsletter', e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Include newsletter signup in footer</span>
          </label>
          
          {config.footerData.showNewsletter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Title</label>
              <input
                type="text"
                value={config.footerData.newsletterTitle}
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
          {Object.entries(config.footerData.socialLinks || {}).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{platform}</label>
              <input
                type="url"
                value={url}
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
    { id: 'hero', label: 'Hero', icon: Sparkles, component: renderHeroCustomization },
    { id: 'header', label: 'Header', icon: Navigation, component: renderHeaderCustomization },
    { id: 'footer', label: 'Footer', icon: Menu, component: renderFooterCustomization },
    { id: 'layout', label: 'Layout', icon: Layout, component: () => <div>Layout selector (existing)</div> }
  ]

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
        
        {/* Header Preview */}
        <div className="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
          <div className={`px-6 py-4 ${HEADER_STYLES[config.headerData.style]?.preview || 'bg-white'} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {(config.headerData.logoText || config.businessName || 'L')[0].toUpperCase()}
                </div>
                <span className="font-bold text-gray-900">
                  {config.headerData.logoText || config.businessName || 'Your Logo'}
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                {(config.headerData.menuItems || []).slice(0, 4).map((item, index) => (
                  <span key={index} className="text-sm text-gray-600">{item.name}</span>
                ))}
              </nav>
              {config.headerData.showCta && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  {config.headerData.ctaText || 'CTA'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Preview */}
        <div className={`relative w-full h-32 rounded-lg overflow-hidden mb-4 ${
          config.heroData.backgroundType === 'gradient' ? HERO_BACKGROUNDS.gradient.preview :
          config.heroData.backgroundType === 'solid' ? 'bg-blue-600' :
          'bg-gray-400'
        }`}>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-2">
                {config.heroData.headline || `Welcome to ${config.businessName || 'Your Business'}`}
              </h3>
              <div className="flex gap-2 justify-center">
                <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
                  {config.heroData.primaryCta || 'Get Started'}
                </span>
                <span className="border border-white text-white px-3 py-1 rounded text-xs">
                  {config.heroData.secondaryCta || 'Learn More'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Design Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Theme:</span>
            <div className="font-medium text-gray-900 capitalize">{config.design.theme || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Hero:</span>
            <div className="font-medium text-gray-900 capitalize">{config.heroData.backgroundType || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Header:</span>
            <div className="font-medium text-gray-900 capitalize">{config.headerData.style || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Footer:</span>
            <div className="font-medium text-gray-900 capitalize">{config.footerData.style || 'Not selected'}</div>
          </div>
          <div>
            <span className="text-gray-600">Menu Items:</span>
            <div className="font-medium text-gray-900">{config.headerData.menuItems?.length || 0}</div>
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
            Customization {isComplete() ? 'Complete' : 'In Progress'}
          </div>
          <div className="flex space-x-1">
            {sections.map((section) => {
              let isCompleted = false
              if (section.id === 'theme') isCompleted = !!config.design.theme
              if (section.id === 'hero') isCompleted = !!config.heroData.backgroundType
              if (section.id === 'header') isCompleted = !!config.headerData.style
              if (section.id === 'footer') isCompleted = !!config.footerData.style
              if (section.id === 'layout') isCompleted = !!config.design.layout
              
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