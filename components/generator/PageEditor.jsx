'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  X, 
  FileText, 
  Home, 
  Info, 
  Briefcase, 
  Mail,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  Eye
} from 'lucide-react'

const PAGE_TYPES = {
  home: { icon: Home, label: 'Home Page', color: 'blue' },
  about: { icon: Info, label: 'About Us', color: 'green' },
  services: { icon: Briefcase, label: 'Services', color: 'purple' },
  contact: { icon: Mail, label: 'Contact', color: 'orange' },
  custom: { icon: FileText, label: 'Custom Page', color: 'gray' }
}

const CONTENT_TEMPLATES = {
  home: {
    title: 'Welcome to {{businessName}}',
    subtitle: 'Your trusted partner for {{industry}} solutions',
    sections: [
      { type: 'hero', title: 'Hero Section', content: '' },
      { type: 'features', title: 'Key Features', content: '' },
      { type: 'testimonials', title: 'What Our Clients Say', content: '' }
    ]
  },
  about: {
    title: 'About {{businessName}}',
    subtitle: 'Learn more about our company and mission',
    sections: [
      { type: 'story', title: 'Our Story', content: '' },
      { type: 'mission', title: 'Our Mission', content: '' },
      { type: 'team', title: 'Meet the Team', content: '' }
    ]
  },
  services: {
    title: 'Our Services',
    subtitle: 'Professional {{industry}} services tailored to your needs',
    sections: [
      { type: 'overview', title: 'Service Overview', content: '' },
      { type: 'offerings', title: 'What We Offer', content: '' },
      { type: 'process', title: 'Our Process', content: '' }
    ]
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'Get in touch with our team',
    sections: [
      { type: 'info', title: 'Contact Information', content: '' },
      { type: 'form', title: 'Contact Form', content: '' },
      { type: 'location', title: 'Our Location', content: '' }
    ]
  }
}

function PageEditor({ config, onChange }) {
  const [selectedPage, setSelectedPage] = useState('home')
  const [editingSection, setEditingSection] = useState(null)

  // Initialize pages on mount
  useEffect(() => {
    if (!config.pages) {
      const initialPages = {
        home: { ...CONTENT_TEMPLATES.home, enabled: true },
        about: { ...CONTENT_TEMPLATES.about, enabled: true },
        services: { ...CONTENT_TEMPLATES.services, enabled: true },
        contact: { ...CONTENT_TEMPLATES.contact, enabled: true }
      }
      onChange({ ...config, pages: initialPages })
    }
  }, [])

  // Auto-create pages for menu items
  useEffect(() => {
    if (!config.pages || !config.headerData?.menuItems) return

    const menuPages = []
    const extractMenuPages = (items) => {
      items?.forEach(item => {
        if (item.link && item.link !== '/' && !item.link.startsWith('http')) {
          const pageId = item.link.replace('/', '') || item.name.toLowerCase().replace(/\s+/g, '-')
          menuPages.push({ id: pageId, name: item.name })
        }
        if (item.children) {
          extractMenuPages(item.children)
        }
      })
    }
    
    extractMenuPages(config.headerData.menuItems)
    
    // Check if any menu pages need to be created
    const newPages = { ...config.pages }
    let hasNewPages = false
    
    menuPages.forEach(page => {
      if (!newPages[page.id]) {
        newPages[page.id] = {
          title: page.name,
          subtitle: '',
          sections: [{
            type: 'content',
            title: 'Main Content',
            content: ''
          }],
          enabled: true,
          type: 'custom'
        }
        hasNewPages = true
      }
    })
    
    if (hasNewPages) {
      onChange({ ...config, pages: newPages })
    }
  }, [config.headerData?.menuItems])

  // Get all available pages (default + menu items)
  const getAllPages = () => {
    const defaultPages = Object.keys(CONTENT_TEMPLATES)
    const menuPages = []
    
    // Extract pages from menu items
    const extractMenuPages = (items) => {
      items?.forEach(item => {
        if (item.link && item.link !== '/' && !item.link.startsWith('http')) {
          const pageName = item.link.replace('/', '') || item.name.toLowerCase().replace(/\s+/g, '-')
          menuPages.push({
            id: pageName,
            name: item.name,
            link: item.link,
            type: 'custom'
          })
        }
        if (item.children) {
          extractMenuPages(item.children)
        }
      })
    }
    
    extractMenuPages(config.headerData?.menuItems || [])
    
    return { defaultPages, menuPages }
  }

  const updatePageContent = (pageId, field, value) => {
    const newPages = {
      ...config.pages,
      [pageId]: {
        ...config.pages[pageId],
        [field]: value
      }
    }
    onChange({ ...config, pages: newPages })
  }

  const updatePageSection = (pageId, sectionIndex, field, value) => {
    const page = config.pages[pageId]
    const newSections = [...(page.sections || [])]
    newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value }
    
    updatePageContent(pageId, 'sections', newSections)
  }

  const addPageSection = (pageId) => {
    const page = config.pages[pageId]
    const newSections = [...(page.sections || []), {
      type: 'custom',
      title: 'New Section',
      content: ''
    }]
    updatePageContent(pageId, 'sections', newSections)
  }

  const removePageSection = (pageId, sectionIndex) => {
    const page = config.pages[pageId]
    const newSections = page.sections.filter((_, i) => i !== sectionIndex)
    updatePageContent(pageId, 'sections', newSections)
  }

  const createCustomPage = (pageData) => {
    const pageId = pageData.name.toLowerCase().replace(/\s+/g, '-')
    const newPages = {
      ...config.pages,
      [pageId]: {
        title: pageData.name,
        subtitle: pageData.description || '',
        sections: [{
          type: 'content',
          title: 'Main Content',
          content: ''
        }],
        enabled: true,
        type: 'custom'
      }
    }
    onChange({ ...config, pages: newPages })
    return pageId
  }

  const processTemplate = (template, replacements) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return replacements[key] || match
    })
  }

  const { defaultPages, menuPages } = getAllPages()

  const renderPageSelector = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Select Page to Edit</h4>
      
      {/* Default Pages */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">Main Pages</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {defaultPages.map(pageId => {
            const pageType = PAGE_TYPES[pageId]
            const Icon = pageType.icon
            return (
              <button
                key={pageId}
                onClick={() => setSelectedPage(pageId)}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  selectedPage === pageId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 text-${pageType.color}-600 mb-2`} />
                <div className="text-sm font-medium">{pageType.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Menu Pages */}
      {menuPages.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Menu Pages</h5>
          <div className="space-y-2">
            {menuPages.map(page => {
              const pageId = page.id
              const pageExists = config.pages && config.pages[pageId]
              
              return (
                <button
                  key={pageId}
                  onClick={() => setSelectedPage(pageId)}
                  disabled={!pageExists}
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                    selectedPage === pageId
                      ? 'border-blue-500 bg-blue-50'
                      : pageExists 
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">{page.name}</div>
                      <div className="text-xs text-gray-500">
                        {page.link} {!pageExists && '(Creating...)'}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderPageEditor = () => {
    if (!config.pages) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Initializing pages...</div>
        </div>
      )
    }

    const page = config.pages[selectedPage]
    if (!page) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Select a page to edit</div>
        </div>
      )
    }

    const pageType = PAGE_TYPES[page.type] || PAGE_TYPES.custom
    const Icon = pageType.icon

    const replacements = {
      businessName: config.businessName || 'Your Business',
      industry: config.industry || 'business'
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 text-${pageType.color}-600`} />
          <div>
            <h4 className="text-lg font-medium text-gray-900">{pageType.label}</h4>
            <p className="text-sm text-gray-600">Edit content for this page</p>
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
            <input
              type="text"
              value={page.title || ''}
              onChange={(e) => updatePageContent(selectedPage, 'title', e.target.value)}
              placeholder={processTemplate(CONTENT_TEMPLATES[selectedPage]?.title || 'Page Title', replacements)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Subtitle</label>
            <input
              type="text"
              value={page.subtitle || ''}
              onChange={(e) => updatePageContent(selectedPage, 'subtitle', e.target.value)}
              placeholder={processTemplate(CONTENT_TEMPLATES[selectedPage]?.subtitle || 'Page subtitle', replacements)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Page Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-md font-medium text-gray-900">Page Sections</h5>
            <button
              onClick={() => addPageSection(selectedPage)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-4">
            {(page.sections || []).map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => updatePageSection(selectedPage, index, 'title', e.target.value)}
                    className="font-medium text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none"
                    placeholder="Section Title"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingSection(editingSection === index ? null : index)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {editingSection === index ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removePageSection(selectedPage, index)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingSection === index ? (
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => updatePageSection(selectedPage, index, 'content', e.target.value)}
                    placeholder="Enter section content..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    className="min-h-16 p-3 bg-gray-50 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setEditingSection(index)}
                  >
                    {section.content || 'Click to edit content...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Page Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h5 className="text-md font-medium text-gray-900">Page Settings</h5>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={page.enabled !== false}
                onChange={(e) => updatePageContent(selectedPage, 'enabled', e.target.checked)}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Enable this page</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={page.showInMenu || false}
                onChange={(e) => updatePageContent(selectedPage, 'showInMenu', e.target.checked)}
                className="mr-2 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show in navigation menu</span>
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Edit Page Content</h3>
        <p className="text-gray-600 mb-6">Customize the content for your website pages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          {renderPageSelector()}
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-2">
          {renderPageEditor()}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">Pages Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Pages:</span>
            <div className="font-medium">{Object.keys(config.pages || {}).length}</div>
          </div>
          <div>
            <span className="text-gray-600">Enabled:</span>
            <div className="font-medium text-green-600">
              {Object.values(config.pages || {}).filter(p => p.enabled !== false).length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">In Menu:</span>
            <div className="font-medium text-blue-600">
              {Object.values(config.pages || {}).filter(p => p.showInMenu).length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Custom Pages:</span>
            <div className="font-medium text-purple-600">
              {Object.values(config.pages || {}).filter(p => p.type === 'custom').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageEditor