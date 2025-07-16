// Updated Template Preview Component
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

  const theme = getStyle('design.theme', 'modern');
  const primaryColor = getStyle('styling.primaryColor', '#3B82F6');
  const features = config?.features || [];
  const template = config?.template || 'marketing';
  const businessName = config?.businessName || config?.name || 'Your Business';
  const industry = config?.industry || 'business';
  const businessDescription = config?.businessDescription || 'Professional services and solutions';

  // Map templates to their corresponding template paths and deployment types
  const getTemplateDeploymentInfo = (templateId) => {
    const templateMap = {
      'ecommerce': {
        pathType: 'ECOMMERCE_TEMPLATE_PATHS',
        deploymentType: 'ecommerce',
        description: 'Full e-commerce site with shopping cart and payment integration'
      },
      'marketing': {
        pathType: 'BASE_TEMPLATE_PATHS',
        deploymentType: 'base',
        description: 'Professional marketing website with modern design'
      },
      'web-app': {
        pathType: 'BASE_TEMPLATE_PATHS', 
        deploymentType: 'base',
        description: 'Interactive web application with user authentication'
      },
      'analytics': {
        pathType: 'BASE_TEMPLATE_PATHS',
        deploymentType: 'base', 
        description: 'Data dashboard with charts and reporting features'
      },
      'ngo': {
        pathType: 'BASE_TEMPLATE_PATHS',
        deploymentType: 'base',
        description: 'Non-profit website with donation and volunteer features'
      },
      'blog': {
        pathType: 'BASE_TEMPLATE_PATHS',
        deploymentType: 'base',
        description: 'Content management system for blogs and articles'
      },
      'portfolio': {
        pathType: 'BASE_TEMPLATE_PATHS',
        deploymentType: 'base',
        description: 'Professional portfolio to showcase work and projects'
      }
    };
    
    return templateMap[templateId] || templateMap['marketing'];
  };

  const getPreviewData = () => {
    const deploymentInfo = getTemplateDeploymentInfo(template);
    const baseData = {
      title: businessName,
      description: businessDescription,
      deploymentType: deploymentInfo.deploymentType,
      pathType: deploymentInfo.pathType
    };

    switch (template) {
      case 'ecommerce':
        return {
          ...baseData,
          hero: `Shop ${businessName}`,
          sections: ['Featured Products', 'Categories', 'Customer Reviews', 'Shopping Cart'],
          cta: 'Shop Now',
          features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Order Management'],
          bgGradient: 'from-emerald-50 to-teal-50',
          darkBgGradient: 'from-emerald-900 to-teal-900'
        };
      
      case 'marketing':
        return {
          ...baseData,
          hero: `Welcome to ${businessName}`,
          sections: ['About Us', 'Services', 'Testimonials', 'Contact'],
          cta: 'Get Started',
          features: ['Responsive Design', 'Contact Forms', 'SEO Optimized', 'Analytics'],
          bgGradient: 'from-blue-50 to-indigo-50',
          darkBgGradient: 'from-blue-900 to-indigo-900'
        };
      
      case 'web-app':
        return {
          ...baseData,
          hero: `${businessName} Platform`,
          sections: ['Dashboard', 'User Management', 'Settings', 'Analytics'],
          cta: 'Sign In',
          features: ['User Authentication', 'Data Management', 'Real-time Updates', 'API Integration'],
          bgGradient: 'from-purple-50 to-pink-50',
          darkBgGradient: 'from-purple-900 to-pink-900'
        };
      
      case 'analytics':
        return {
          ...baseData,
          hero: `${businessName} Analytics`,
          sections: ['Dashboard', 'Reports', 'Data Export', 'User Insights'],
          cta: 'View Reports',
          features: ['Charts & Graphs', 'Data Export', 'User Roles', 'Real-time Data'],
          bgGradient: 'from-orange-50 to-red-50',
          darkBgGradient: 'from-orange-900 to-red-900'
        };
      
      case 'ngo':
        return {
          ...baseData,
          hero: `Support ${businessName}`,
          sections: ['Our Mission', 'Programs', 'Volunteer','Contact', 'Donate'],
          cta: 'Donate Now',
          features: ['Donation Integration', 'Event Management', 'Volunteer Sign-up', 'Impact Stories'],
          bgGradient: 'from-green-50 to-emerald-50',
          darkBgGradient: 'from-green-900 to-emerald-900'
        };
      
      case 'blog':
        return {
          ...baseData,
          hero: `${businessName} Blog`,
          sections: ['Latest Posts', 'Categories', 'Archive', 'Subscribe'],
          cta: 'Read More',
          features: ['Post Management', 'Comments', 'Categories', 'Newsletter'],
          bgGradient: 'from-yellow-50 to-orange-50',
          darkBgGradient: 'from-yellow-900 to-orange-900'
        };
      
      case 'portfolio':
        return {
          ...baseData,
          hero: `${businessName} Portfolio`,
          sections: ['Projects', 'About', 'Skills', 'Contact'],
          cta: 'View Work',
          features: ['Project Gallery', 'Testimonials', 'Contact Form', 'Resume Download'],
          bgGradient: 'from-slate-50 to-gray-50',
          darkBgGradient: 'from-slate-900 to-gray-900'
        };
      
      default:
        return {
          ...baseData,
          hero: `Welcome to ${businessName}`,
          sections: ['Home', 'About', 'Services', 'Contact'],
          cta: 'Learn More',
          features: ['Responsive Design', 'Modern UI', 'Fast Loading', 'SEO Ready'],
          bgGradient: 'from-blue-50 to-purple-50',
          darkBgGradient: 'from-blue-900 to-purple-900'
        };
    }
  };

  const preview = getPreviewData();

  // Get theme colors based on the selected design theme
  const getThemeColors = () => {
    const themes = {
      modern: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' },
      elegant: { primary: '#1F2937', secondary: '#D97706', accent: '#DC2626' },
      creative: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#F59E0B' },
      tech: { primary: '#06B6D4', secondary: '#8B5CF6', accent: '#10B981' }
    };
    return themes[theme] || themes.modern;
  };

  const themeColors = getThemeColors();
  const isDarkTheme = theme === 'tech';

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview Your {template.charAt(0).toUpperCase() + template.slice(1).replace('-', ' ')} Website
        </h2>
        <p className="text-gray-600">
          This preview shows how your {preview.deploymentType === 'ecommerce' ? 'e-commerce' : 'business'} website will look with the selected configuration.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 text-sm font-medium">Deployment Info:</div>
            <div className="text-blue-700 text-sm">
              Uses {preview.pathType} • Type: {preview.deploymentType}
            </div>
          </div>
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
        <div className="aspect-video bg-gradient-to-br overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`h-full flex flex-col bg-gradient-to-br ${
              isDarkTheme ? preview.darkBgGradient : preview.bgGradient
            }`}
          >
            {/* Header */}
            <div className={`px-8 py-4 border-b ${
              isDarkTheme 
                ? 'border-gray-700 bg-gray-800/90 backdrop-blur' 
                : 'border-gray-200 bg-white/90 backdrop-blur'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {businessName?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div>
                    <span className={`font-bold text-lg ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`}>
                      {businessName}
                    </span>
                    <div className={`text-xs ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </div>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-6">
                  {preview.sections.slice(0, 4).map((section, index) => (
                    <span 
                      key={section}
                      className={`text-sm font-medium transition-colors hover:opacity-80 ${
                        index === 0 
                          ? isDarkTheme ? 'text-white' : 'text-gray-900'
                          : isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                      }`}
                      style={index === 0 ? { color: themeColors.primary } : {}}
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
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  {preview.hero}
                </h1>
                <p className={`text-lg mb-8 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {preview.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    className="px-6 py-3 text-white rounded-lg font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    {preview.cta}
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg font-medium border-2 transition-all hover:scale-105 ${
                      isDarkTheme 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Features Bar */}
            <div className={`px-8 py-4 border-t ${
              isDarkTheme 
                ? 'border-gray-700 bg-gray-800/90' 
                : 'border-gray-200 bg-white/90'
            }`}>
              <div className="flex flex-wrap gap-2 justify-center">
                {preview.features.slice(0, 4).map((feature, index) => (
                  <span
                    key={feature}
                    className="px-3 py-1 text-xs rounded-full font-medium"
                    style={{ 
                      backgroundColor: Object.values(themeColors)[index % 3] + '20',
                      color: Object.values(themeColors)[index % 3]
                    }}
                  >
                    ✓ {feature}
                  </span>
                ))}
                {preview.features.length > 4 && (
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    isDarkTheme 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    +{preview.features.length - 4} more features
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Template:</span>
            <span className="capitalize">{template.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Theme:</span>
            <span className="capitalize">{theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Industry:</span>
            <span className="capitalize">{industry}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Features:</span>
            <span>{features.length} selected</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Deployment:</span>
            <span className="capitalize">{preview.deploymentType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Template Path:</span>
            <span className="text-xs">{preview.pathType}</span>
          </div>
        </div>

        {/* Template Features */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-700 mb-2">Template Features:</h4>
          <div className="flex flex-wrap gap-2">
            {preview.features.map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {feature}
              </span>
            ))}
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
          disabled={!businessName || !template}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate {template.charAt(0).toUpperCase() + template.slice(1).replace('-', ' ')} Site</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}