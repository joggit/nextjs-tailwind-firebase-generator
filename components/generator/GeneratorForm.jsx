'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  FileText, 
  Briefcase,
  ArrowRight,
  Plus,
  X
} from 'lucide-react'

export default function GeneratorForm({ config, onChange, onNext }) {
  const [customFeature, setCustomFeature] = useState('')

  const templates = [
    {
      id: 'modern',
      name: 'Modern Website',
      description: 'Clean, responsive business website',
      icon: Globe,
      features: ['Responsive Design', 'Contact Forms', 'SEO Optimized']
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Store',
      description: 'Online store with shopping cart',
      icon: ShoppingBag,
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration']
    },
    {
      id: 'saas',
      name: 'SaaS Platform',
      description: 'Software as a Service application',
      icon: BarChart3,
      features: ['User Dashboard', 'Subscription Billing', 'Analytics']
    },
    {
      id: 'blog',
      name: 'Blog Platform',
      description: 'Content management system',
      icon: FileText,
      features: ['Content Editor', 'Comments', 'SEO Tools']
    },
    {
      id: 'portfolio',
      name: 'Portfolio Site',
      description: 'Showcase your work and skills',
      icon: Briefcase,
      features: ['Project Gallery', 'About Section', 'Contact Form']
    },
    {
      id: 'crm',
      name: 'CRM System',
      description: 'Customer relationship management',
      icon: Users,
      features: ['Contact Management', 'Deal Tracking', 'Reports']
    },
    {
      id: 'ngo',
      name: 'NGO Website',
      description: 'Website for non-profit organizations',
      icon: Globe,
      features: ['Donation Forms', 'Event Management', 'Volunteer Sign-up']
    }
  ]

  const availableFeatures = [
    'Authentication',
    'User Profiles',
    'Admin Dashboard',
    'Email Integration',
    'Payment Processing',
    'File Upload',
    'Real-time Chat',
    'Push Notifications',
    'Analytics',
    'SEO Tools',
    'Multi-language',
    'Dark Mode'
  ]

  const handleTemplateSelect = (template) => {
    onChange({
      ...config,
      template: template.id,
      features: [...template.features]
    })
  }

  const handleFeatureToggle = (feature) => {
    const newFeatures = config.features.includes(feature)
      ? config.features.filter(f => f !== feature)
      : [...config.features, feature]
    
    onChange({ ...config, features: newFeatures })
  }

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !config.features.includes(customFeature)) {
      onChange({
        ...config,
        features: [...config.features, customFeature.trim()]
      })
      setCustomFeature('')
    }
  }

  const handleRemoveFeature = (feature) => {
    onChange({
      ...config,
      features: config.features.filter(f => f !== feature)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Create Your Project
      </h2>

      <div className="space-y-8">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChange({ ...config, name: e.target.value })}
            placeholder="Enter your project name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Template Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = template.icon
              return (
                <motion.button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    config.template === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.features.slice(0, 2).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{template.features.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Feature Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Features
          </h3>
          
          {/* Selected Features */}
          {config.features.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {config.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {feature}
                    <button
                      onClick={() => handleRemoveFeature(feature)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableFeatures.map((feature) => (
              <label
                key={feature}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={config.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>

          {/* Custom Feature Input */}
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Add custom feature..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomFeature()}
              />
              <button
                onClick={handleAddCustomFeature}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={onNext}
            disabled={!config.name || !config.template}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next: Design</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}