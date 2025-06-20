// Template Preview Component - Fixed
// File: components/generator/TemplatePreview.jsx

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Wand2 } from 'lucide-react'

export default function TemplatePreview({ config, onGenerate, onPrev }) {
  // Safely get styling properties with defaults
  const getStyle = (path, defaultValue) => {
    try {
      return path.split('.').reduce((obj, key) => obj?.[key], config) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const theme = getStyle('styling.theme', 'light');
  const primaryColor = getStyle('styling.primaryColor', '#3B82F6');
  const features = config?.features || [];
  const template = config?.template || 'modern';
  const name = config?.name || config?.businessName || 'Your Application';

  const getPreviewData = () => {
    const baseData = {
      title: name,
      description: 'Generated with AI-powered Next.js generator'
    }

    switch (template) {
      case 'ecommerce':
        return {
          ...baseData,
          hero: 'Discover Amazing Products',
          sections: ['Featured Products', 'Categories', 'Customer Reviews'],
          cta: 'Shop Now'
        }
      case 'saas':
        return {
          ...baseData,
          hero: 'Transform Your Business',
          sections: ['Features', 'Pricing', 'Testimonials'],
          cta: 'Start Free Trial'
        }
      case 'blog':
        return {
          ...baseData,
          hero: 'Stories Worth Reading',
          sections: ['Latest Posts', 'Categories', 'Newsletter'],
          cta: 'Read More'
        }
      case 'portfolio':
        return {
          ...baseData,
          hero: 'Creative Excellence',
          sections: ['Projects', 'About', 'Skills'],
          cta: 'View Work'
        }
      case 'crm':
        return {
          ...baseData,
          hero: 'Manage Your Customers',
          sections: ['Dashboard', 'Contacts', 'Analytics'],
          cta: 'Get Started'
        }
      default:
        return {
          ...baseData,
          hero: 'Welcome to the Future',
          sections: ['About', 'Services', 'Contact'],
          cta: 'Learn More'
        }
    }
  }

  const preview = getPreviewData()

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview Your Application
        </h2>
        <p className="text-gray-600">
          This is how your application will look with the selected configuration.
        </p>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-gray-100 px-4 py-3 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
                localhost:3000
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
                : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
            }}
          >
            {/* Header */}
            <div className={`px-8 py-4 border-b ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-800' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {name || 'Your App'}
                  </span>
                </div>
                <nav className="hidden md:flex space-x-6">
                  {preview.sections.map((section) => (
                    <span 
                      key={section}
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {section}
                    </span>
                  ))}
                </nav>
              </div>
            </div>

            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="text-center max-w-2xl">
                <h1 className={`text-4xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {preview.hero}
                </h1>
                <p className={`text-lg mb-8 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {preview.description}
                </p>
                <button
                  className="px-6 py-3 text-white rounded-lg font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  {preview.cta}
                </button>
              </div>
            </div>

            {/* Features Bar */}
            {features.length > 0 && (
              <div className={`px-8 py-4 border-t ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex flex-wrap gap-2">
                  {features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: primaryColor + '20',
                        color: primaryColor
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                  {features.length > 4 && (
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      +{features.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Template:</span>
            <span className="ml-2 capitalize">{template}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Theme:</span>
            <span className="ml-2 capitalize">{theme}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Features:</span>
            <span className="ml-2">{features.length} selected</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">AI Content:</span>
            <span className="ml-2">{getStyle('content.useAI', false) ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}