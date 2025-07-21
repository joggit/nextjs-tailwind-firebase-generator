'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Wand2,
  Monitor,
  Smartphone,
  ChevronDown,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Eye,
  Palette,
  Type,
  Layout as LayoutIcon
} from 'lucide-react'

export default function TemplatePreview({ config, onGenerate, onPrev }) {
  const [previewMode, setPreviewMode] = useState('desktop')

  // Safe property access with fallbacks
  const safeGet = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' && key in current ? current[key] : undefined;
      }, obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Get design configuration with comprehensive fallbacks
  const getDesignConfig = () => {
    const design = config?.design || {};

    return {
      name: safeGet(design, 'name', 'Modern Design'),
      colors: {
        primary: safeGet(design, 'colors.primary', '#3B82F6'),
        secondary: safeGet(design, 'colors.secondary', '#8B5CF6'),
        background: safeGet(design, 'colors.background', '#FFFFFF'),
        surface: safeGet(design, 'colors.surface', '#F9FAFB'),
        text: safeGet(design, 'colors.text', '#1F2937'),
        accent: safeGet(design, 'colors.accent', '#10B981')
      },
      fonts: {
        heading: safeGet(design, 'fonts.heading', 'Inter'),
        body: safeGet(design, 'fonts.body', 'Inter')
      },
      layout: {
        type: safeGet(design, 'layout.type', 'standard'),
        container: safeGet(design, 'layout.container', 'max-w-7xl')
      },
      effects: {
        shadow: safeGet(design, 'effects.shadow', 'md'),
        hoverAnimation: safeGet(design, 'effects.hoverAnimation', 'scale')
      }
    };
  };

  // Get header configuration with fallbacks
  const getHeaderConfig = () => {
    const headerData = config?.headerData || {};

    return {
      style: safeGet(headerData, 'style', 'solid'),
      logoText: safeGet(headerData, 'logoText', config?.businessName || 'Your Business'),
      menuItems: safeGet(headerData, 'menuItems', [
        { name: 'Home', link: '/', type: 'link', children: [] },
        { name: 'About', link: '/about', type: 'link', children: [] },
        {
          name: 'Services', link: '/services', type: 'dropdown', children: [
            { name: 'Consulting', link: '/services/consulting' },
            { name: 'Support', link: '/services/support' }
          ]
        },
        { name: 'Contact', link: '/contact', type: 'link', children: [] }
      ]),
      showCta: safeGet(headerData, 'showCta', true),
      ctaText: safeGet(headerData, 'ctaText', 'Get Started'),
      ctaLink: safeGet(headerData, 'ctaLink', '/contact')
    };
  };

  // Get footer configuration with fallbacks
  const getFooterConfig = () => {
    const footerData = config?.footerData || {};
    const businessName = config?.businessName || 'Your Business';

    return {
      style: safeGet(footerData, 'style', 'multiColumn'),
      companyName: safeGet(footerData, 'companyName', businessName),
      email: safeGet(footerData, 'email', `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`),
      phone: safeGet(footerData, 'phone', '(555) 123-4567'),
      showNewsletter: safeGet(footerData, 'showNewsletter', true)
    };
  };

  const design = getDesignConfig();
  const headerData = getHeaderConfig();
  const footerData = getFooterConfig();

  const template = config?.template || 'marketing';
  const businessName = config?.businessName || config?.name || 'Your Business';
  const industry = config?.industry || 'business';
  const businessDescription = config?.businessDescription || 'Professional services and solutions';

  // Get template-specific preview data
  const getPreviewData = () => {
    const baseData = {
      title: businessName,
      description: businessDescription
    };

    switch (template) {
      case 'ecommerce':
        return {
          ...baseData,
          hero: `Shop ${businessName}`,
          sections: ['Featured Products', 'Categories', 'Reviews', 'Cart'],
          cta: 'Shop Now',
          features: ['Product Catalog', 'Shopping Cart', 'Secure Checkout', 'Order Tracking'],
          bgGradient: 'from-emerald-50 to-teal-50'
        };

      case 'marketing':
        return {
          ...baseData,
          hero: `Welcome to ${businessName}`,
          sections: ['About', 'Services', 'Testimonials', 'Contact'],
          cta: 'Get Started',
          features: ['Responsive Design', 'Contact Forms', 'SEO Optimized', 'Analytics'],
          bgGradient: 'from-blue-50 to-indigo-50'
        };

      case 'web-app':
        return {
          ...baseData,
          hero: `${businessName} Platform`,
          sections: ['Dashboard', 'Analytics', 'Settings', 'Profile'],
          cta: 'Sign In',
          features: ['User Auth', 'Real-time Data', 'API Integration', 'Admin Panel'],
          bgGradient: 'from-purple-50 to-pink-50'
        };

      default:
        return {
          ...baseData,
          hero: `Welcome to ${businessName}`,
          sections: ['Home', 'About', 'Services', 'Contact'],
          cta: 'Learn More',
          features: ['Modern Design', 'Fast Loading', 'Mobile Ready', 'SEO Optimized'],
          bgGradient: 'from-blue-50 to-purple-50'
        };
    }
  };

  const preview = getPreviewData();

  // Check if configuration is complete
  const isComplete = () => {
    return !!(
      config?.businessName &&
      config?.template &&
      design?.colors?.primary
    );
  };

  // Get header style classes
  const getHeaderClasses = () => {
    const baseClasses = 'px-6 py-4 border-b';

    switch (headerData.style) {
      case 'transparent':
        return `${baseClasses} bg-transparent border-transparent`;
      case 'sticky':
        return `${baseClasses} bg-white/95 backdrop-blur-sm`;
      default:
        return `${baseClasses} bg-white`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview Your {template.charAt(0).toUpperCase() + template.slice(1).replace('-', ' ')} Website
        </h2>
        <p className="text-gray-600 mb-4">
          This preview shows how your website will look with your custom design configuration.
        </p>

        {/* Design Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Palette className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">{design.name}</div>
              <div className="text-xs text-blue-700">Design Theme</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Type className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-purple-900">{design.fonts.heading}</div>
              <div className="text-xs text-purple-700">Typography</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <LayoutIcon className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900 capitalize">{design.layout.type}</div>
              <div className="text-xs text-green-700">Layout Style</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
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
                {businessName.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${preview.bgGradient} min-h-96`}
            style={{ backgroundColor: design.colors.background }}
          >
            {/* Header Preview */}
            <div
              className={getHeaderClasses()}
              style={{ borderColor: design.colors.primary + '20' }}
            >
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: design.colors.primary }}
                  >
                    {headerData.logoText?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div>
                    <span
                      className="font-bold text-lg"
                      style={{
                        fontFamily: design.fonts.heading,
                        color: design.colors.primary
                      }}
                    >
                      {headerData.logoText}
                    </span>
                    <div className="text-xs text-gray-500 capitalize">
                      {industry}
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className={`${previewMode === 'mobile' ? 'hidden' : 'flex'} space-x-6`}>
                  {headerData.menuItems?.slice(0, 4).map((item, index) => (
                    <div key={index} className="relative group">
                      <span
                        className="flex items-center space-x-1 text-sm font-medium cursor-pointer"
                        style={{ color: design.colors.text }}
                      >
                        <span>{item.name}</span>
                        {item.children && item.children.length > 0 && (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </span>

                      {/* Dropdown Preview */}
                      {item.children && item.children.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div
                            className="bg-white rounded-lg shadow-lg border py-2 min-w-48"
                            style={{ borderColor: design.colors.primary + '20' }}
                          >
                            {item.children.slice(0, 3).map((child, childIndex) => (
                              <div key={childIndex} className="px-4 py-2 hover:bg-gray-50">
                                <div className="font-medium text-sm" style={{ color: design.colors.text }}>
                                  {child.name}
                                </div>
                                {child.description && (
                                  <div className="text-xs text-gray-500">{child.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* CTA Button */}
                {headerData.showCta && (
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: design.colors.primary,
                      color: design.colors.surface
                    }}
                  >
                    {headerData.ctaText}
                  </button>
                )}

                {/* Mobile Menu Button */}
                {previewMode === 'mobile' && (
                  <button className="p-2">
                    <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                    <div className="w-5 h-0.5 bg-gray-600"></div>
                  </button>
                )}
              </div>
            </div>

            {/* Hero Section */}
            <div className="px-6 py-16 text-center">
              <h1
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{
                  fontFamily: design.fonts.heading,
                  color: design.colors.text
                }}
              >
                {preview.hero}
              </h1>
              <p
                className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                style={{
                  fontFamily: design.fonts.body,
                  color: design.colors.text + 'CC'
                }}
              >
                {preview.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  className="px-8 py-3 font-semibold rounded-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: design.colors.primary,
                    color: design.colors.surface
                  }}
                >
                  {preview.cta}
                </button>
                <button
                  className="px-8 py-3 font-semibold rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: design.colors.primary,
                    color: design.colors.primary
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="px-6 pb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {preview.features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: design.colors.surface,
                      boxShadow: design.effects.shadow === 'none' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: design.colors.accent }}
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3
                      className="font-semibold mb-2"
                      style={{
                        fontFamily: design.fonts.heading,
                        color: design.colors.text
                      }}
                    >
                      {feature}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: design.fonts.body,
                        color: design.colors.text + '99'
                      }}
                    >
                      Description for {feature.toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Preview */}
            <div
              className="px-6 py-8 border-t"
              style={{
                backgroundColor: design.colors.text,
                borderColor: design.colors.primary + '20'
              }}
            >
              {footerData.style === 'multiColumn' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Company Info */}
                  <div>
                    <h4
                      className="font-semibold mb-3"
                      style={{ color: design.colors.surface }}
                    >
                      {footerData.companyName}
                    </h4>
                    <div className="space-y-2 text-sm" style={{ color: design.colors.surface + 'CC' }}>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{footerData.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{footerData.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4
                      className="font-semibold mb-3"
                      style={{ color: design.colors.surface }}
                    >
                      Quick Links
                    </h4>
                    <div className="space-y-2 text-sm">
                      {preview.sections.map((section, index) => (
                        <div key={index}>
                          <span style={{ color: design.colors.surface + 'CC' }}>{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter */}
                  {footerData.showNewsletter && (
                    <div>
                      <h4
                        className="font-semibold mb-3"
                        style={{ color: design.colors.surface }}
                      >
                        Stay Updated
                      </h4>
                      <div className="flex">
                        <input
                          type="email"
                          placeholder="Your email"
                          className="flex-1 px-3 py-2 rounded-l-lg text-sm"
                          style={{ backgroundColor: design.colors.surface }}
                        />
                        <button
                          className="px-4 py-2 rounded-r-lg text-sm font-medium"
                          style={{
                            backgroundColor: design.colors.primary,
                            color: design.colors.surface
                          }}
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <span style={{ color: design.colors.surface + 'CC' }}>
                    © 2024 {footerData.companyName}. All rights reserved.
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Template:</span>
            <div className="capitalize">{template.replace('-', ' ')}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Design Theme:</span>
            <div>{design.name}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Header Style:</span>
            <div className="capitalize">{headerData.style}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Footer Style:</span>
            <div className="capitalize">{footerData.style.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Menu Items:</span>
            <div>{headerData.menuItems?.length || 0}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Nested Menus:</span>
            <div>{headerData.menuItems?.filter(item => item.children?.length > 0).length || 0}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Features:</span>
            <div>{config?.features?.length || preview.features.length}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">CTA Button:</span>
            <div>{headerData.showCta ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Color Palette Display */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-700 mb-2">Color Palette:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(design.colors).map(([name, color]) => (
              <div key={name} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-gray-600 capitalize">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onGenerate}
          disabled={!isComplete()}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate {template.charAt(0).toUpperCase() + template.slice(1).replace('-', ' ')} Website</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}