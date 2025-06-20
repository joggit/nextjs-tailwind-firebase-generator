'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Palette, Layout, Eye, Sparkles, Monitor, Smartphone, Code, Zap } from 'lucide-react'

// Design theme options with visual previews
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
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design with maximum whitespace',
    colors: {
      primary: '#000000',
      secondary: '#4B5563',
      accent: '#6B7280',
      background: '#FFFFFF',
      surface: '#FAFAFA'
    },
    features: ['Lots of whitespace', 'Simple typography', 'Neutral colors', 'Clean'],
    preview: 'bg-gradient-to-br from-gray-800 to-gray-600'
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business design',
    colors: {
      primary: '#1E40AF',
      secondary: '#059669',
      accent: '#DC2626',
      background: '#F8FAFC',
      surface: '#FFFFFF'
    },
    features: ['Professional', 'Trust-building', 'Conservative', 'Reliable'],
    preview: 'bg-gradient-to-br from-blue-700 to-green-600'
  }
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
  magazine: {
    id: 'magazine',
    name: 'Magazine',
    description: 'Multi-column layout for content-rich sites',
    icon: '⫸',
    features: ['Multi-column', 'Content rich', 'Editorial style']
  },
  landing: {
    id: 'landing',
    name: 'Landing',
    description: 'Single-page sections for conversion',
    icon: '⬇',
    features: ['Single page', 'Section-based', 'Conversion focused']
  }
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
  video: {
    id: 'video',
    name: 'Video',
    description: 'Background video with overlay text',
    preview: 'video background'
  },
  animated: {
    id: 'animated',
    name: 'Animated',
    description: 'Hero with motion graphics and animations',
    preview: 'dynamic animations'
  }
}

// Graphics options
const GRAPHICS_OPTIONS = {
  illustrations: {
    id: 'illustrations',
    name: 'Illustrations',
    description: 'Custom vector illustrations',
    icon: '🎨'
  },
  photography: {
    id: 'photography',
    name: 'Photography',
    description: 'Professional photography',
    icon: '📸'
  },
  icons: {
    id: 'icons',
    name: 'Icons',
    description: 'Icon-focused design',
    icon: '⚡'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Text and shapes only',
    icon: '▢'
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

  const isComplete = () => {
    return config.design.theme && config.design.layout && config.design.heroStyle && config.design.graphics
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
            {/* Theme preview */}
            <div className={`w-full h-24 ${theme.preview} rounded-lg mb-4 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{theme.name}</span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">{theme.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
            
            {/* Color palette preview */}
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
            
            {/* Features */}
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
              config.design.layout === layout.id
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
              config.design.heroStyle === hero.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {/* Hero preview mockup */}
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

  const renderGraphicsSelector = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Graphics Style</h3>
        <p className="text-gray-600 mb-6">Select the type of visual elements for your site</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(GRAPHICS_OPTIONS).map((graphics) => (
          <button
            key={graphics.id}
            onClick={() => updateDesign('graphics', graphics.id)}
            className={`p-6 border-2 rounded-xl text-center transition-all hover:shadow-md ${
              config.design.graphics === graphics.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-4xl mb-3">{graphics.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2">{graphics.name}</h4>
            <p className="text-sm text-gray-600">{graphics.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const sections = [
    { id: 'theme', label: 'Theme', icon: Palette, component: renderThemeSelector },
    { id: 'layout', label: 'Layout', icon: Layout, component: renderLayoutSelector },
    { id: 'hero', label: 'Hero', icon: Eye, component: renderHeroSelector },
    { id: 'graphics', label: 'Graphics', icon: Sparkles, component: renderGraphicsSelector }
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

      {/* Design Preview Summary */}
      {config.design.theme && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Your Design Selection
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Theme:</span>
              <div className="font-medium text-gray-900 capitalize">{config.design.theme || 'Not selected'}</div>
            </div>
            <div>
              <span className="text-gray-600">Layout:</span>
              <div className="font-medium text-gray-900 capitalize">{config.design.layout || 'Not selected'}</div>
            </div>
            <div>
              <span className="text-gray-600">Hero Style:</span>
              <div className="font-medium text-gray-900 capitalize">{config.design.heroStyle || 'Not selected'}</div>
            </div>
            <div>
              <span className="text-gray-600">Graphics:</span>
              <div className="font-medium text-gray-900 capitalize">{config.design.graphics || 'Not selected'}</div>
            </div>
          </div>
          
          {/* Preview colors if theme selected */}
          {config.design.theme && DESIGN_THEMES[config.design.theme] && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Color Palette:</span>
              <div className="flex space-x-2 mt-2">
                {Object.entries(DESIGN_THEMES[config.design.theme].colors).slice(0, 5).map(([key, color]) => (
                  <div
                    key={key}
                    className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            Design Selection {isComplete() ? 'Complete' : 'In Progress'}
          </div>
          <div className="flex space-x-1">
            {sections.map((section) => {
              const isCompleted = config.design[section.id === 'hero' ? 'heroStyle' : section.id]
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