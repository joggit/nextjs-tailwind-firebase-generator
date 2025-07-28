// Updated PageEditor with integrated DALL-E 3 Hero Image Generator
// File: components/generator/PageEditor.jsx

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  X,
  FileText,
  Home,
  Info,
  Briefcase,
  Mail,
  Users,
  Award,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle,
  Edit3,
  Save,
  Eye,
  ChevronDown,
  ChevronRight,
  Image,
  Settings,
  Wand2,
  AlertTriangle
} from 'lucide-react'
import HeroImageGenerator from './HeroImageGenerator'

const PAGE_TYPES = {
  home: { icon: Home, label: 'Home Page', color: 'blue' },
  about: { icon: Info, label: 'About Us', color: 'green' },
  services: { icon: Briefcase, label: 'Services', color: 'purple' },
  contact: { icon: Mail, label: 'Contact', color: 'orange' },
  custom: { icon: FileText, label: 'Custom Page', color: 'gray' }
}

// Enhanced configuration templates with DALL-E 3 integration
const DETAILED_PAGE_CONFIGS = {
  home: {
    sections: {
      hero: {
        title: 'Hero Section',
        fields: {
          heroTitle: { type: 'text', label: 'Main Headline', placeholder: 'Welcome to {{businessName}}' },
          heroSubtitle: { type: 'textarea', label: 'Subtitle', placeholder: 'Your trusted partner for {{industry}} solutions' },
          heroImage: {
            type: 'text',
            label: 'Hero Image URL',
            placeholder: '/hero-image.jpg',
            enhancedField: 'heroImageGenerator' // Special field for AI generation
          },
          ctaText: { type: 'text', label: 'Call-to-Action Button', placeholder: 'Get Started' },
          ctaLink: { type: 'text', label: 'CTA Link', placeholder: '/contact' },
          backgroundType: {
            type: 'select',
            label: 'Background Type',
            options: ['gradient', 'image', 'video', 'solid', 'ai-generated']
          },
          showStats: { type: 'boolean', label: 'Show Statistics' }
        }
      },
      features: {
        title: 'Features Section',
        fields: {
          showFeatures: { type: 'boolean', label: 'Show Features Section' },
          featuresTitle: { type: 'text', label: 'Section Title', placeholder: 'Why Choose Us' },
          featuresSubtitle: { type: 'text', label: 'Section Subtitle', placeholder: 'What makes us different' },
          features: {
            type: 'list', label: 'Features', itemFields: {
              title: { type: 'text', label: 'Feature Title' },
              description: { type: 'textarea', label: 'Feature Description' },
              icon: { type: 'text', label: 'Icon Name (Lucide)' }
            }
          }
        }
      },
      testimonials: {
        title: 'Testimonials Section',
        fields: {
          showTestimonials: { type: 'boolean', label: 'Show Testimonials' },
          testimonialsTitle: { type: 'text', label: 'Section Title', placeholder: 'What Our Clients Say' },
          testimonials: {
            type: 'list', label: 'Testimonials', itemFields: {
              name: { type: 'text', label: 'Client Name' },
              company: { type: 'text', label: 'Company' },
              content: { type: 'textarea', label: 'Testimonial Content' },
              rating: { type: 'number', label: 'Rating (1-5)' },
              image: { type: 'text', label: 'Client Photo URL' }
            }
          }
        }
      },
      stats: {
        title: 'Statistics Section',
        fields: {
          showStats: { type: 'boolean', label: 'Show Statistics' },
          statsTitle: { type: 'text', label: 'Section Title', placeholder: 'Our Impact' },
          stats: {
            type: 'list', label: 'Statistics', itemFields: {
              value: { type: 'text', label: 'Statistic Value', placeholder: '500+' },
              label: { type: 'text', label: 'Statistic Label', placeholder: 'Happy Clients' },
              icon: { type: 'text', label: 'Icon Name' }
            }
          }
        }
      }
    }
  },
  about: {
    sections: {
      hero: {
        title: 'About Hero Section',
        fields: {
          heroTitle: { type: 'text', label: 'Page Title', placeholder: 'About {{businessName}}' },
          heroSubtitle: { type: 'textarea', label: 'Page Subtitle', placeholder: 'Learn about our mission and values' },
          heroImage: {
            type: 'text',
            label: 'Hero Image URL',
            enhancedField: 'heroImageGenerator'
          }
        }
      },
      story: {
        title: 'Company Story',
        fields: {
          showStory: { type: 'boolean', label: 'Show Company Story' },
          storyTitle: { type: 'text', label: 'Section Title', placeholder: 'Our Story' },
          foundedYear: { type: 'number', label: 'Founded Year' },
          founderName: { type: 'text', label: 'Founder Name' },
          companyStory: { type: 'textarea', label: 'Company Story', rows: 6 },
          storyImage: { type: 'text', label: 'Story Image URL' }
        }
      },
      mission: {
        title: 'Mission & Vision',
        fields: {
          showMission: { type: 'boolean', label: 'Show Mission & Vision' },
          mission: { type: 'textarea', label: 'Mission Statement', rows: 4 },
          vision: { type: 'textarea', label: 'Vision Statement', rows: 4 },
          values: {
            type: 'list', label: 'Company Values', itemFields: {
              title: { type: 'text', label: 'Value Title' },
              description: { type: 'textarea', label: 'Value Description' },
              icon: { type: 'text', label: 'Icon Name' }
            }
          }
        }
      },
      team: {
        title: 'Team Section',
        fields: {
          showTeam: { type: 'boolean', label: 'Show Team Section' },
          teamTitle: { type: 'text', label: 'Section Title', placeholder: 'Meet Our Team' },
          teamMembers: {
            type: 'list', label: 'Team Members', itemFields: {
              name: { type: 'text', label: 'Name' },
              role: { type: 'text', label: 'Job Title' },
              bio: { type: 'textarea', label: 'Bio' },
              image: { type: 'text', label: 'Photo URL' },
              linkedin: { type: 'text', label: 'LinkedIn URL' },
              email: { type: 'text', label: 'Email' }
            }
          }
        }
      }
    }
  },
  services: {
    sections: {
      hero: {
        title: 'Services Hero',
        fields: {
          heroTitle: { type: 'text', label: 'Page Title', placeholder: 'Our Services' },
          heroSubtitle: { type: 'textarea', label: 'Page Subtitle' },
          heroImage: {
            type: 'text',
            label: 'Hero Image URL',
            enhancedField: 'heroImageGenerator'
          }
        }
      },
      services: {
        title: 'Services List',
        fields: {
          services: {
            type: 'list', label: 'Services', itemFields: {
              name: { type: 'text', label: 'Service Name' },
              description: { type: 'textarea', label: 'Service Description' },
              features: { type: 'text', label: 'Key Features (comma-separated)' },
              price: { type: 'text', label: 'Starting Price' },
              duration: { type: 'text', label: 'Typical Duration' },
              icon: { type: 'text', label: 'Icon Name' },
              image: { type: 'text', label: 'Service Image URL' }
            }
          }
        }
      },
      process: {
        title: 'Our Process',
        fields: {
          showProcess: { type: 'boolean', label: 'Show Process Section' },
          processTitle: { type: 'text', label: 'Section Title', placeholder: 'How We Work' },
          processSteps: {
            type: 'list', label: 'Process Steps', itemFields: {
              step: { type: 'number', label: 'Step Number' },
              title: { type: 'text', label: 'Step Title' },
              description: { type: 'textarea', label: 'Step Description' },
              icon: { type: 'text', label: 'Icon Name' }
            }
          }
        }
      },
      pricing: {
        title: 'Pricing Section',
        fields: {
          showPricing: { type: 'boolean', label: 'Show Pricing' },
          pricingTitle: { type: 'text', label: 'Section Title', placeholder: 'Our Pricing' },
          pricingPlans: {
            type: 'list', label: 'Pricing Plans', itemFields: {
              name: { type: 'text', label: 'Plan Name' },
              price: { type: 'text', label: 'Price' },
              period: { type: 'text', label: 'Billing Period' },
              features: { type: 'text', label: 'Features (comma-separated)' },
              recommended: { type: 'boolean', label: 'Recommended Plan' },
              ctaText: { type: 'text', label: 'Button Text' }
            }
          }
        }
      }
    }
  },
  contact: {
    sections: {
      hero: {
        title: 'Contact Hero',
        fields: {
          heroTitle: { type: 'text', label: 'Page Title', placeholder: 'Contact Us' },
          heroSubtitle: { type: 'textarea', label: 'Page Subtitle' },
          heroImage: {
            type: 'text',
            label: 'Hero Image URL',
            enhancedField: 'heroImageGenerator'
          }
        }
      },
      contactInfo: {
        title: 'Contact Information',
        fields: {
          address: { type: 'textarea', label: 'Physical Address' },
          phone: { type: 'text', label: 'Phone Number' },
          email: { type: 'text', label: 'Email Address' },
          businessHours: { type: 'textarea', label: 'Business Hours' },
          emergencyContact: { type: 'text', label: 'Emergency Contact' }
        }
      },
      locations: {
        title: 'Office Locations',
        fields: {
          showLocations: { type: 'boolean', label: 'Show Multiple Locations' },
          locations: {
            type: 'list', label: 'Locations', itemFields: {
              name: { type: 'text', label: 'Location Name' },
              address: { type: 'textarea', label: 'Address' },
              phone: { type: 'text', label: 'Phone' },
              email: { type: 'text', label: 'Email' },
              hours: { type: 'textarea', label: 'Hours' },
              mapUrl: { type: 'text', label: 'Google Maps URL' }
            }
          }
        }
      },
      form: {
        title: 'Contact Form',
        fields: {
          showForm: { type: 'boolean', label: 'Show Contact Form' },
          formTitle: { type: 'text', label: 'Form Title', placeholder: 'Get In Touch' },
          formFields: {
            type: 'list', label: 'Form Fields', itemFields: {
              name: { type: 'text', label: 'Field Name' },
              type: { type: 'select', label: 'Field Type', options: ['text', 'email', 'phone', 'textarea', 'select'] },
              label: { type: 'text', label: 'Field Label' },
              required: { type: 'boolean', label: 'Required Field' },
              placeholder: { type: 'text', label: 'Placeholder Text' }
            }
          }
        }
      }
    }
  }
}

function PageEditor({ config, onChange }) {
  const [selectedPage, setSelectedPage] = useState('home')
  const [expandedSections, setExpandedSections] = useState({
    hero: true // Expand hero section by default
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState({})
  const [imageGenerationError, setImageGenerationError] = useState(null)

  // Initialize BOTH data structures to ensure alignment
  const initializePageStructures = useCallback(() => {
    if (isInitialized) return

    console.log('Initializing page data structures...')

    // Initialize simplified pages structure for compatibility
    const initialPages = {}

    // Initialize detailed pages structure for advanced configuration
    const initialDetailedPages = {}

    Object.keys(DETAILED_PAGE_CONFIGS).forEach(pageType => {
      // Simple page structure (for DesignSelector compatibility)
      initialPages[pageType] = {
        id: pageType,
        name: PAGE_TYPES[pageType].label,
        type: pageType,
        enabled: true,
        config: {}
      }

      // Detailed page structure (for PageEditor)
      initialDetailedPages[pageType] = {
        enabled: true,
        sections: {}
      }

      // Initialize each section with default values
      Object.keys(DETAILED_PAGE_CONFIGS[pageType].sections).forEach(sectionKey => {
        const sectionConfig = DETAILED_PAGE_CONFIGS[pageType].sections[sectionKey]
        const sectionData = {}

        Object.entries(sectionConfig.fields).forEach(([fieldKey, fieldConfig]) => {
          if (fieldConfig.type === 'boolean') {
            sectionData[fieldKey] = fieldKey.startsWith('show') ? true : false
          } else if (fieldConfig.type === 'list') {
            sectionData[fieldKey] = []
          } else if (fieldConfig.type === 'number') {
            sectionData[fieldKey] = ''
          } else {
            sectionData[fieldKey] = ''
          }
        })

        initialDetailedPages[pageType].sections[sectionKey] = sectionData
      })
    })

    // Update both structures
    setTimeout(() => {
      onChange({
        ...config,
        pages: { ...config.pages, ...initialPages },
        detailedPages: { ...config.detailedPages, ...initialDetailedPages }
      })
      setIsInitialized(true)
    }, 0)
  }, [config, onChange, isInitialized])

  // Sync simple pages structure when detailed pages change
  const syncPageStructures = useCallback((newDetailedPages) => {
    const newPages = {}

    Object.keys(newDetailedPages).forEach(pageType => {
      newPages[pageType] = {
        id: pageType,
        name: PAGE_TYPES[pageType]?.label || pageType,
        type: pageType,
        enabled: newDetailedPages[pageType].enabled !== false,
        config: {
          hasContent: Object.values(newDetailedPages[pageType].sections || {}).some(section =>
            Object.values(section).some(value =>
              value && (typeof value !== 'object' || Array.isArray(value) && value.length > 0)
            )
          )
        }
      }
    })

    return newPages
  }, [])

  // Run initialization effect
  useEffect(() => {
    initializePageStructures()
  }, [initializePageStructures])

  // Auto-expand hero section when page changes
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      hero: true
    }))
  }, [selectedPage])

  const updatePageData = useCallback((pageType, sectionKey, fieldKey, value) => {
    if (!config.detailedPages) return

    const newDetailedPages = {
      ...config.detailedPages,
      [pageType]: {
        ...config.detailedPages[pageType],
        sections: {
          ...config.detailedPages[pageType].sections,
          [sectionKey]: {
            ...config.detailedPages[pageType].sections[sectionKey],
            [fieldKey]: value
          }
        }
      }
    }

    // Sync both structures
    const newPages = syncPageStructures(newDetailedPages)

    onChange({
      ...config,
      detailedPages: newDetailedPages,
      pages: { ...config.pages, ...newPages }
    })
  }, [config, onChange, syncPageStructures])

  const togglePageEnabled = useCallback((pageType) => {
    if (!config.detailedPages) return

    const newDetailedPages = {
      ...config.detailedPages,
      [pageType]: {
        ...config.detailedPages[pageType],
        enabled: !config.detailedPages[pageType].enabled
      }
    }

    // Sync both structures
    const newPages = syncPageStructures(newDetailedPages)

    onChange({
      ...config,
      detailedPages: newDetailedPages,
      pages: { ...config.pages, ...newPages }
    })
  }, [config, onChange, syncPageStructures])

  const addListItem = useCallback((pageType, sectionKey, fieldKey) => {
    if (!config.detailedPages) return

    const fieldConfig = DETAILED_PAGE_CONFIGS[pageType].sections[sectionKey].fields[fieldKey]
    const newItem = {}

    Object.entries(fieldConfig.itemFields).forEach(([itemFieldKey, itemFieldConfig]) => {
      if (itemFieldConfig.type === 'boolean') {
        newItem[itemFieldKey] = false
      } else if (itemFieldConfig.type === 'number') {
        newItem[itemFieldKey] = ''
      } else {
        newItem[itemFieldKey] = ''
      }
    })

    const currentList = config.detailedPages[pageType].sections[sectionKey][fieldKey] || []
    updatePageData(pageType, sectionKey, fieldKey, [...currentList, newItem])
  }, [config.detailedPages, updatePageData])

  const updateListItem = useCallback((pageType, sectionKey, fieldKey, itemIndex, itemFieldKey, value) => {
    if (!config.detailedPages) return

    const currentList = config.detailedPages[pageType].sections[sectionKey][fieldKey] || []
    const newList = [...currentList]
    newList[itemIndex] = { ...newList[itemIndex], [itemFieldKey]: value }
    updatePageData(pageType, sectionKey, fieldKey, newList)
  }, [config.detailedPages, updatePageData])

  const removeListItem = useCallback((pageType, sectionKey, fieldKey, itemIndex) => {
    if (!config.detailedPages) return

    const currentList = config.detailedPages[pageType].sections[sectionKey][fieldKey] || []
    const newList = currentList.filter((_, index) => index !== itemIndex)
    updatePageData(pageType, sectionKey, fieldKey, newList)
  }, [config.detailedPages, updatePageData])

  const toggleSection = useCallback((sectionKey) => {
    console.log(`Toggling section: ${sectionKey}`)
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }
      console.log(`Expanded sections:`, newState)
      return newState
    })
  }, [])

  const toggleImageGenerator = useCallback((pageType, sectionKey, fieldKey) => {
    const key = `${pageType}-${sectionKey}-${fieldKey}`
    setShowImageGenerator(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const handleImageGenerated = useCallback((pageType, sectionKey, fieldKey, imageData) => {
    // Update the hero image URL with the generated image
    updatePageData(pageType, sectionKey, fieldKey, imageData.url)

    // Also update background type to indicate AI-generated image
    if (fieldKey === 'heroImage') {
      updatePageData(pageType, sectionKey, 'backgroundType', 'ai-generated')
    }

    // Clear any previous errors
    setImageGenerationError(null)

    console.log('✅ Hero image updated in page configuration:', imageData.url)
  }, [updatePageData])

  const handleImageGenerationError = useCallback((error) => {
    setImageGenerationError(error)
    console.error('❌ Image generation error:', error)
  }, [])

  const processPlaceholder = useCallback((placeholder) => {
    if (!placeholder) return ''
    return placeholder
      .replace(/\{\{businessName\}\}/g, config.businessName || 'Your Business')
      .replace(/\{\{industry\}\}/g, config.industry || 'business')
  }, [config.businessName, config.industry])

  const renderField = useCallback((pageType, sectionKey, fieldKey, fieldConfig) => {
    if (!config.detailedPages) return null

    const currentValue = config.detailedPages?.[pageType]?.sections?.[sectionKey]?.[fieldKey] || ''
    const generatorKey = `${pageType}-${sectionKey}-${fieldKey}`
    const showGenerator = showImageGenerator[generatorKey]

    // Special handling for enhanced fields (like heroImage with AI generation)
    if (fieldConfig.enhancedField === 'heroImageGenerator') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{fieldConfig.label}</label>
            <button
              onClick={() => toggleImageGenerator(pageType, sectionKey, fieldKey)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>{showGenerator ? 'Hide' : 'AI Generate'}</span>
            </button>
          </div>

          <input
            type="text"
            value={currentValue}
            onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.value)}
            placeholder={processPlaceholder(fieldConfig.placeholder)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          {showGenerator && (
            <HeroImageGenerator
              businessContext={{
                businessName: config.businessName,
                name: config.name,
                industry: config.industry,
                businessDescription: config.businessDescription
              }}
              currentImageUrl={currentValue}
              onImageGenerated={(imageData) => handleImageGenerated(pageType, sectionKey, fieldKey, imageData)}
              onError={handleImageGenerationError}
              className="mt-4"
            />
          )}

          {currentValue && (
            <div className="relative">
              <img
                src={currentValue}
                alt="Current hero image"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Current Image
              </div>
            </div>
          )}
        </div>
      )
    }

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.value)}
            placeholder={processPlaceholder(fieldConfig.placeholder)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.value)}
            placeholder={processPlaceholder(fieldConfig.placeholder)}
            rows={fieldConfig.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{fieldConfig.label}</span>
          </label>
        )

      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => updatePageData(pageType, sectionKey, fieldKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'list':
        const listItems = currentValue || []
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{fieldConfig.label}</span>
              <button
                onClick={() => addListItem(pageType, sectionKey, fieldKey)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {listItems.map((item, itemIndex) => (
              <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {fieldConfig.label.slice(0, -1)} {itemIndex + 1}
                  </span>
                  <button
                    onClick={() => removeListItem(pageType, sectionKey, fieldKey, itemIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {Object.entries(fieldConfig.itemFields).map(([itemFieldKey, itemFieldConfig]) => (
                  <div key={itemFieldKey}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {itemFieldConfig.label}
                    </label>
                    {itemFieldConfig.type === 'textarea' ? (
                      <textarea
                        value={item[itemFieldKey] || ''}
                        onChange={(e) => updateListItem(pageType, sectionKey, fieldKey, itemIndex, itemFieldKey, e.target.value)}
                        placeholder={itemFieldConfig.placeholder}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    ) : itemFieldConfig.type === 'boolean' ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item[itemFieldKey] || false}
                          onChange={(e) => updateListItem(pageType, sectionKey, fieldKey, itemIndex, itemFieldKey, e.target.checked)}
                          className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-xs text-gray-700">{itemFieldConfig.label}</span>
                      </label>
                    ) : itemFieldConfig.type === 'select' ? (
                      <select
                        value={item[itemFieldKey] || ''}
                        onChange={(e) => updateListItem(pageType, sectionKey, fieldKey, itemIndex, itemFieldKey, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {itemFieldConfig.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={itemFieldConfig.type === 'number' ? 'number' : 'text'}
                        value={item[itemFieldKey] || ''}
                        onChange={(e) => updateListItem(pageType, sectionKey, fieldKey, itemIndex, itemFieldKey, e.target.value)}
                        placeholder={itemFieldConfig.placeholder}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )

      default:
        return <div className="text-gray-500 text-sm">Unsupported field type</div>
    }
  }, [config.detailedPages, updatePageData, processPlaceholder, addListItem, updateListItem, removeListItem, showImageGenerator, toggleImageGenerator, handleImageGenerated, handleImageGenerationError, config.businessName, config.name, config.industry, config.businessDescription])

  const renderPageEditor = useCallback(() => {
    if (!config.detailedPages || !isInitialized) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Initializing detailed page configurations...</div>
        </div>
      )
    }

    const pageConfig = DETAILED_PAGE_CONFIGS[selectedPage]
    if (!pageConfig) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Page configuration not found</div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-${PAGE_TYPES[selectedPage].color}-100 flex items-center justify-center`}>
              {(() => {
                const IconComponent = PAGE_TYPES[selectedPage].icon
                return <IconComponent className={`w-5 h-5 text-${PAGE_TYPES[selectedPage].color}-600`} />
              })()}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">{PAGE_TYPES[selectedPage].label}</h4>
              <p className="text-sm text-gray-600">Configure detailed content and settings</p>
            </div>
          </div>

          {/* Page Enable/Disable Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.detailedPages[selectedPage]?.enabled !== false}
                onChange={() => togglePageEnabled(selectedPage)}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Enable Page</span>
            </label>
          </div>
        </div>

        {/* Image Generation Error Alert */}
        {imageGenerationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="font-medium text-red-800">Image Generation Failed</h4>
                <p className="text-red-700 text-sm mt-1">{imageGenerationError}</p>
              </div>
            </div>
            <button
              onClick={() => setImageGenerationError(null)}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Sections */}
        <div className="space-y-4">
          {Object.entries(pageConfig.sections).map(([sectionKey, sectionConfig]) => {
            const isExpanded = expandedSections[sectionKey]
            const hasImageGenerator = Object.values(sectionConfig.fields).some(field =>
              field.enhancedField === 'heroImageGenerator'
            )

            return (
              <div key={sectionKey} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${isExpanded
                      ? 'hover:bg-blue-50 bg-blue-25'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{sectionConfig.title}</span>
                    {hasImageGenerator && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full">
                        <Wand2 className="w-3 h-3" />
                        <span>AI Enhanced</span>
                      </div>
                    )}
                    {isExpanded && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                    {Object.entries(sectionConfig.fields).length > 0 ? (
                      Object.entries(sectionConfig.fields).map(([fieldKey, fieldConfig]) => (
                        <div key={fieldKey}>
                          {fieldConfig.type !== 'boolean' && !fieldConfig.enhancedField && (
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {fieldConfig.label}
                            </label>
                          )}
                          {renderField(selectedPage, sectionKey, fieldKey, fieldConfig)}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm py-4">
                        No fields configured for this section
                      </div>
                    )}
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <strong>Debug:</strong> Section "{sectionKey}" - {Object.keys(sectionConfig.fields).length} fields
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }, [config.detailedPages, isInitialized, selectedPage, expandedSections, toggleSection, renderField, togglePageEnabled, imageGenerationError])

  const configurationSummary = useMemo(() => {
    if (!config.detailedPages) return []

    return Object.entries(PAGE_TYPES).map(([pageId, pageType]) => {
      const pageData = config.detailedPages?.[pageId]
      const sectionsCount = pageData ? Object.keys(pageData.sections || {}).length : 0
      const contentCount = pageData ? Object.values(pageData.sections || {}).reduce((count, section) => {
        return count + Object.values(section).filter(value =>
          value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0))
        ).length
      }, 0) : 0

      return {
        pageId,
        pageType,
        sectionsCount,
        contentCount,
        enabled: pageData?.enabled !== false
      }
    })
  }, [config.detailedPages])

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Page Configuration</h3>
        <p className="text-gray-600 mb-6">Configure detailed content with AI-powered image generation for hero sections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Select Page</h4>
            {Object.entries(PAGE_TYPES).map(([pageId, pageType]) => {
              const IconComponent = pageType.icon
              const pageData = configurationSummary.find(p => p.pageId === pageId)
              const hasAIFeatures = DETAILED_PAGE_CONFIGS[pageId]?.sections?.hero?.fields?.heroImage?.enhancedField === 'heroImageGenerator'

              return (
                <button
                  key={pageId}
                  onClick={() => setSelectedPage(pageId)}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${selectedPage === pageId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 text-${pageType.color}-600`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{pageType.label}</div>
                        <div className="flex items-center space-x-1">
                          {hasAIFeatures && <Wand2 className="w-3 h-3 text-purple-600" />}
                          {pageData?.enabled && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {pageData?.contentCount || 0} configured fields
                        {hasAIFeatures && <span className="text-purple-600 ml-1">• AI Enhanced</span>}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-3">
          {renderPageEditor()}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h5 className="font-medium text-gray-900 mb-4">Configuration Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {configurationSummary.map(({ pageId, pageType, sectionsCount, contentCount, enabled }) => (
            <div key={pageId}>
              <span className="text-gray-600">{pageType.label}:</span>
              <div className={`font-medium ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {contentCount} fields configured
              </div>
            </div>
          ))}
        </div>

        {/* Data Structure Debug Info (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h6 className="text-xs font-medium text-gray-700 mb-2">Data Structure Status:</h6>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Simple Pages: {config.pages ? Object.keys(config.pages).length : 0} pages</div>
              <div>Detailed Pages: {config.detailedPages ? Object.keys(config.detailedPages).length : 0} pages</div>
              <div>Enabled Pages: {config.pages ? Object.values(config.pages).filter(p => p.enabled).length : 0}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageEditor