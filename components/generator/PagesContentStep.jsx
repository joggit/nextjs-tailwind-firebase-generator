'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, FileText, Plus, X, Eye, EyeOff, Settings, Zap, Palette, Code, Edit3, Trash2 } from 'lucide-react'

// UI Components available for pages
const UI_COMPONENTS = {
    buttons: {
        primary: {
            name: 'Primary Button',
            description: 'Main call-to-action button',
            props: ['text', 'link', 'size', 'icon'],
            preview: 'bg-blue-600 text-white px-4 py-2 rounded-lg'
        },
        secondary: {
            name: 'Secondary Button',
            description: 'Secondary action button',
            props: ['text', 'link', 'variant'],
            preview: 'bg-gray-200 text-gray-800 px-4 py-2 rounded-lg'
        },
        ghost: {
            name: 'Ghost Button',
            description: 'Subtle button with minimal styling',
            props: ['text', 'link'],
            preview: 'text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg'
        }
    },
    cards: {
        feature: {
            name: 'Feature Card',
            description: 'Highlight key features or services',
            props: ['title', 'description', 'icon', 'image'],
            preview: 'bg-white border rounded-lg p-6 shadow-sm'
        },
        testimonial: {
            name: 'Testimonial Card',
            description: 'Customer review or testimonial',
            props: ['quote', 'author', 'role', 'image'],
            preview: 'bg-gray-50 border-l-4 border-blue-500 p-6'
        },
        pricing: {
            name: 'Pricing Card',
            description: 'Service or product pricing',
            props: ['plan', 'price', 'features', 'popular'],
            preview: 'bg-white border-2 rounded-xl p-6 shadow-lg'
        },
        product: {
            name: 'Product Card',
            description: 'Product showcase with image and details',
            props: ['name', 'price', 'image', 'description'],
            preview: 'bg-white rounded-lg overflow-hidden shadow-md'
        }
    },
    forms: {
        contact: {
            name: 'Contact Form',
            description: 'Basic contact form with validation',
            props: ['fields', 'submitText', 'action'],
            preview: 'bg-white border rounded-lg p-6'
        },
        newsletter: {
            name: 'Newsletter Signup',
            description: 'Email subscription form',
            props: ['title', 'placeholder', 'buttonText'],
            preview: 'bg-blue-50 rounded-lg p-4'
        },
        search: {
            name: 'Search Form',
            description: 'Search input with filters',
            props: ['placeholder', 'filters'],
            preview: 'bg-white border rounded-lg p-3'
        }
    },
    layout: {
        grid: {
            name: 'Grid Layout',
            description: 'Responsive grid container',
            props: ['columns', 'gap', 'responsive'],
            preview: 'grid grid-cols-3 gap-6'
        },
        hero: {
            name: 'Hero Section',
            description: 'Large banner section',
            props: ['background', 'alignment', 'overlay'],
            preview: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20'
        },
        sidebar: {
            name: 'Sidebar Layout',
            description: 'Content with sidebar',
            props: ['position', 'width', 'sticky'],
            preview: 'flex gap-8'
        }
    }
}

// Content blocks organized by category
const CONTENT_BLOCKS = {
    marketing: {
        hero: {
            name: 'Hero Section',
            description: 'Main banner with headline and call-to-action',
            fields: ['title', 'subtitle', 'buttonText', 'buttonLink', 'backgroundImage'],
            components: ['buttons.primary', 'layout.hero']
        },
        features: {
            name: 'Features Grid',
            description: 'Highlight key features or benefits',
            fields: ['items'],
            components: ['cards.feature', 'layout.grid']
        },
        testimonials: {
            name: 'Testimonials',
            description: 'Customer reviews and social proof',
            fields: ['reviews'],
            components: ['cards.testimonial', 'layout.grid']
        },
        cta: {
            name: 'Call to Action',
            description: 'Conversion-focused section',
            fields: ['title', 'description', 'buttonText'],
            components: ['buttons.primary', 'buttons.secondary']
        }
    },
    ecommerce: {
        productGrid: {
            name: 'Product Grid',
            description: 'Display featured or category products',
            fields: ['title', 'products', 'columns'],
            components: ['cards.product', 'layout.grid']
        },
        categories: {
            name: 'Product Categories',
            description: 'Browse products by category',
            fields: ['categoryList'],
            components: ['cards.feature', 'buttons.ghost']
        },
        pricing: {
            name: 'Pricing Table',
            description: 'Service or product pricing plans',
            fields: ['plans'],
            components: ['cards.pricing', 'buttons.primary']
        }
    },
    common: {
        about: {
            name: 'About Section',
            description: 'Tell your story and mission',
            fields: ['title', 'content', 'image'],
            components: ['cards.feature']
        },
        contact: {
            name: 'Contact Section',
            description: 'Contact information and form',
            fields: ['title', 'address', 'phone', 'email'],
            components: ['forms.contact']
        },
        team: {
            name: 'Team Section',
            description: 'Introduce your team members',
            fields: ['members'],
            components: ['cards.feature', 'layout.grid']
        },
        services: {
            name: 'Services List',
            description: 'List your services or offerings',
            fields: ['services'],
            components: ['cards.feature', 'layout.grid']
        }
    }
}

export default function PagesContentStep({ config, onChange, onNext, onPrev }) {
    const [selectedPage, setSelectedPage] = useState(null)
    const [activeTab, setActiveTab] = useState('blocks') // 'blocks' or 'components'

    // Generate pages from header menu items
    const getPagesFromMenu = () => {
        // Get menu items from header configuration
        const headerMenuItems = config?.header?.menuItems || []
        const existingPages = config?.pages || {}

        console.log('Debug - Header menu items:', {
            fullConfig: config,
            hasHeader: !!config?.header,
            hasMenuItems: !!config?.header?.menuItems,
            menuItemsLength: headerMenuItems.length,
            menuItems: headerMenuItems,
            existingPages: existingPages
        })

        const pages = {}

        // Generate page ID from label or link
        const generatePageId = (item) => {
            if (item.link && item.link !== '/') {
                // Remove leading slash and convert to lowercase
                return item.link.replace(/^\//, '').toLowerCase() || 'page'
            }
            if (item.label) {
                // Convert label to lowercase, replace spaces with hyphens
                return item.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
            return 'page'
        }

        // Start with existing pages configuration
        Object.keys(existingPages).forEach(pageId => {
            pages[pageId] = {
                id: pageId,
                ...existingPages[pageId]
            }
        })

        // Always ensure home page exists
        const homeItem = headerMenuItems.find(item => item.link === '/' || item.label.toLowerCase() === 'home')
        if (!pages.home) {
            pages.home = {
                id: 'home',
                title: homeItem?.label || 'Home',
                path: '/',
                enabled: true,
                required: true,
                description: 'Your main landing page',
                blocks: ['hero', 'features'],
                components: {},
                content: {}
            }
        } else {
            // Ensure home page is marked as required
            pages.home.required = true
            pages.home.id = 'home'
            if (!pages.home.path) pages.home.path = '/'
        }

        // Add/update pages from header menu items
        headerMenuItems.forEach((item, index) => {
            console.log('Processing menu item:', item)

            if (item && item.link !== '/') { // Skip home page as it's already handled
                const pageId = generatePageId(item)

                // Merge with existing page config if it exists
                pages[pageId] = {
                    id: pageId,
                    title: item.label || `Page ${index + 1}`,
                    path: item.link || `/${pageId}`,
                    enabled: true,
                    required: false,
                    description: `${item.label} page`,
                    blocks: [],
                    components: {},
                    content: {},
                    // Preserve existing configuration
                    ...pages[pageId]
                }
            }
        })

        console.log('Generated pages:', pages)

        // Set default selected page if none selected
        if (!selectedPage && Object.keys(pages).length > 0) {
            setSelectedPage(Object.keys(pages)[0])
        }

        return pages
    }

    // Initialize pages from menu
    const pages = getPagesFromMenu()

    // Update effect to set selected page when pages change
    useEffect(() => {
        if (!selectedPage && Object.keys(pages).length > 0) {
            setSelectedPage(Object.keys(pages)[0])
        }
    }, [Object.keys(pages).length])

    const updatePageConfig = (pageId, field, value) => {
        const updatedPages = { ...config.pages }
        if (!updatedPages[pageId]) {
            updatedPages[pageId] = { ...pages[pageId] }
        }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            [field]: value
        }

        onChange({
            ...config,
            pages: updatedPages
        })
    }

    const updatePageContent = (pageId, blockId, field, value) => {
        const updatedPages = { ...config.pages }
        if (!updatedPages[pageId]) {
            updatedPages[pageId] = { ...pages[pageId] }
        }

        if (!updatedPages[pageId].content) {
            updatedPages[pageId].content = {}
        }

        if (!updatedPages[pageId].content[blockId]) {
            updatedPages[pageId].content[blockId] = {}
        }

        updatedPages[pageId].content[blockId][field] = value

        onChange({
            ...config,
            pages: updatedPages
        })
    }

    const togglePage = (pageId) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        if (!page.required) {
            updatePageConfig(pageId, 'enabled', !page.enabled)
        }
    }

    // NEW: Delete page functionality
    const deletePage = (pageId) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }

        // Don't allow deleting required pages
        if (page.required) {
            return
        }

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete the "${page.title}" page? This action cannot be undone.`)) {
            return
        }

        // Remove from config.pages
        const updatedPages = { ...config.pages }
        delete updatedPages[pageId]

        // Also remove from header menu items
        const updatedHeader = { ...config.header }
        if (updatedHeader.menuItems) {
            updatedHeader.menuItems = updatedHeader.menuItems.filter(item => {
                const itemPageId = item.link && item.link !== '/'
                    ? item.link.replace(/^\//, '').toLowerCase()
                    : item.label?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                return itemPageId !== pageId
            })
        }

        // If the deleted page was selected, select another page
        const remainingPages = Object.keys(updatedPages)
        const newSelectedPage = selectedPage === pageId
            ? (remainingPages.length > 0 ? remainingPages[0] : 'home')
            : selectedPage

        setSelectedPage(newSelectedPage)

        // Update config
        onChange({
            ...config,
            pages: updatedPages,
            header: updatedHeader
        })
    }

    const addBlockToPage = (pageId, blockId) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        const currentBlocks = page.blocks || []
        if (!currentBlocks.includes(blockId)) {
            updatePageConfig(pageId, 'blocks', [...currentBlocks, blockId])
        }
    }

    const removeBlockFromPage = (pageId, blockId) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        const currentBlocks = page.blocks || []
        updatePageConfig(pageId, 'blocks', currentBlocks.filter(b => b !== blockId))
    }

    const addComponentToPage = (pageId, componentType, componentId) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        const currentComponents = page.components || {}
        const componentKey = `${componentType}_${componentId}_${Date.now()}`

        updatePageConfig(pageId, 'components', {
            ...currentComponents,
            [componentKey]: {
                type: `${componentType}.${componentId}`,
                props: {}
            }
        })
    }

    const removeComponentFromPage = (pageId, componentKey) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        const currentComponents = { ...page.components }
        delete currentComponents[componentKey]
        updatePageConfig(pageId, 'components', currentComponents)
    }

    const updateComponentProp = (pageId, componentKey, prop, value) => {
        const page = { ...pages[pageId], ...config.pages?.[pageId] }
        const updatedComponents = { ...page.components }

        if (!updatedComponents[componentKey].props) {
            updatedComponents[componentKey].props = {}
        }

        updatedComponents[componentKey].props[prop] = value
        updatePageConfig(pageId, 'components', updatedComponents)
    }

    const getCurrentPageConfig = () => {
        if (!selectedPage) return null
        return { ...pages[selectedPage], ...config.pages?.[selectedPage] }
    }

    const getAvailableBlocks = () => {
        const projectType = config?.projectType || config?.businessType || 'marketing'
        const blocks = { ...CONTENT_BLOCKS.common }

        if (CONTENT_BLOCKS[projectType]) {
            Object.assign(blocks, CONTENT_BLOCKS[projectType])
        }

        return blocks
    }

    const getEnabledPages = () => {
        return Object.entries(pages)
            .filter(([key, page]) => {
                const pageConfig = { ...page, ...config.pages?.[key] }
                return pageConfig.enabled
            })
    }

    const isComplete = () => {
        const enabledPages = getEnabledPages()
        return enabledPages.length > 0 && enabledPages.some(([key, page]) => {
            const pageConfig = { ...page, ...config.pages?.[key] }
            return (pageConfig.blocks && pageConfig.blocks.length > 0) ||
                (pageConfig.components && Object.keys(pageConfig.components).length > 0)
        })
    }

    const currentPage = getCurrentPageConfig()
    const availableBlocks = getAvailableBlocks()

    // Show error if no pages found
    if (Object.keys(pages).length <= 1) { // Only home page
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Header Menu Items Found</h3>
                    <p className="text-gray-600 mb-4">
                        This step needs menu items from your header configuration to create editable pages.
                    </p>
                    <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-2">Looking for:</div>
                        <code>config.header.menuItems = [</code><br />
                        <code>&nbsp;&nbsp;{`{ label: 'Home', link: '/' },`}</code><br />
                        <code>&nbsp;&nbsp;{`{ label: 'About', link: '/about' },`}</code><br />
                        <code>&nbsp;&nbsp;{`{ label: 'Services', link: '/services' },`}</code><br />
                        <code>&nbsp;&nbsp;{`{ label: 'Contact', link: '/contact' }`}</code><br />
                        <code>]</code>
                    </div>
                    <button
                        onClick={onPrev}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back to Header Configuration
                    </button>
                </div>
            </div>
        )
    }

    if (!selectedPage || !currentPage) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Pages...</h3>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Pages & Content Configuration
                </h2>
                <p className="text-gray-600">
                    Configure your pages with content blocks and UI components
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Page Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Pages ({getEnabledPages().length} enabled)
                    </h3>

                    <div className="space-y-2">
                        {Object.entries(pages).map(([pageId, pageInfo]) => {
                            const pageConfig = { ...pageInfo, ...config.pages?.[pageId] }
                            const isEnabled = pageConfig.enabled
                            const isSelected = selectedPage === pageId
                            const blockCount = (pageConfig.blocks || []).length
                            const componentCount = Object.keys(pageConfig.components || {}).length

                            return (
                                <div
                                    key={pageId}
                                    className={`p-3 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : isEnabled
                                            ? 'border-green-200 bg-green-50 hover:border-green-300'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedPage(pageId)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            {/* Enable/Disable Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (!pageInfo.required) {
                                                        togglePage(pageId)
                                                    }
                                                }}
                                                disabled={pageInfo.required}
                                                className={`p-1 rounded ${pageInfo.required
                                                    ? 'cursor-not-allowed opacity-50'
                                                    : 'cursor-pointer'
                                                    }`}
                                                title={pageInfo.required ? 'Required page cannot be disabled' : isEnabled ? 'Disable page' : 'Enable page'}
                                            >
                                                {isEnabled ? (
                                                    <Eye className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                                        {pageConfig.title}
                                                        {pageInfo.required && <span className="text-red-500 ml-1">*</span>}
                                                    </h4>
                                                    {isSelected && (
                                                        <Edit3 className="w-3 h-3 text-blue-600" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{pageInfo.description}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>{blockCount} blocks</span>
                                                    <span>{componentCount} components</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Button - NEW */}
                                        {!pageInfo.required && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deletePage(pageId)
                                                }}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete page"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {isEnabled && (blockCount > 0 || componentCount > 0) && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {(pageConfig.blocks || []).slice(0, 2).map((blockId) => (
                                                <span key={blockId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                    {availableBlocks[blockId]?.name || blockId}
                                                </span>
                                            ))}
                                            {Object.entries(pageConfig.components || {}).slice(0, 1).map(([key, comp]) => (
                                                <span key={key} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                    {comp.type}
                                                </span>
                                            ))}
                                            {(blockCount + componentCount > 3) && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    +{blockCount + componentCount - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Rest of the component remains the same... */}
                {/* Page Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Configure: {currentPage.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('blocks')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === 'blocks'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Zap className="w-4 h-4 mr-1 inline" />
                                    Blocks
                                </button>
                                <button
                                    onClick={() => setActiveTab('components')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === 'components'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Code className="w-4 h-4 mr-1 inline" />
                                    Components
                                </button>
                            </div>
                        </div>
                    </div>

                    {currentPage.enabled ? (
                        <>
                            {/* Page Settings */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Page Title
                                        </label>
                                        <input
                                            type="text"
                                            value={currentPage.title}
                                            onChange={(e) => updatePageConfig(selectedPage, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL Path
                                        </label>
                                        <input
                                            type="text"
                                            value={currentPage.path}
                                            onChange={(e) => updatePageConfig(selectedPage, 'path', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={currentPage.description}
                                        onChange={(e) => updatePageConfig(selectedPage, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Content Blocks Tab */}
                            {activeTab === 'blocks' && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Content Blocks</h4>

                                    {/* Selected Blocks */}
                                    <div className="space-y-3 mb-6">
                                        {(currentPage.blocks || []).map((blockId) => {
                                            const block = availableBlocks[blockId]
                                            if (!block) return null

                                            return (
                                                <div key={blockId} className="flex items-start justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">{block.name}</h5>
                                                        <p className="text-sm text-gray-600 mb-3">{block.description}</p>

                                                        {/* Block Content Fields */}
                                                        <div className="space-y-2">
                                                            {block.fields.map((field) => (
                                                                <div key={field}>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                                                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Enter ${field}`}
                                                                        value={currentPage.content?.[blockId]?.[field] || ''}
                                                                        onChange={(e) => updatePageContent(selectedPage, blockId, field, e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Associated Components */}
                                                        {block.components && (
                                                            <div className="mt-3">
                                                                <span className="text-xs text-gray-500">Uses components:</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {block.components.map((comp) => (
                                                                        <span key={comp} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                                            {comp}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => removeBlockFromPage(selectedPage, blockId)}
                                                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        })}

                                        {(currentPage.blocks || []).length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 mb-3">No content blocks added yet</p>
                                                <p className="text-sm text-gray-400">Choose from available blocks below</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Blocks */}
                                    <div>
                                        <h5 className="font-medium text-gray-900 mb-3">Available Blocks</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {Object.entries(availableBlocks).map(([blockId, block]) => {
                                                const isAdded = (currentPage.blocks || []).includes(blockId)

                                                return (
                                                    <button
                                                        key={blockId}
                                                        onClick={() => !isAdded && addBlockToPage(selectedPage, blockId)}
                                                        disabled={isAdded}
                                                        className={`p-3 border-2 rounded-lg text-left transition-all ${isAdded
                                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h6 className="font-medium">{block.name}</h6>
                                                                <p className="text-xs text-gray-600 mt-1">{block.description}</p>
                                                                {block.components && (
                                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                                        {block.components.slice(0, 2).map((comp) => (
                                                                            <span key={comp} className="px-1 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                                                                                {comp.split('.')[1]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isAdded ? (
                                                                <X className="w-4 h-4 text-gray-400" />
                                                            ) : (
                                                                <Plus className="w-4 h-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Components Tab */}
                            {activeTab === 'components' && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">UI Components</h4>

                                    {/* Selected Components */}
                                    <div className="space-y-3 mb-6">
                                        {Object.entries(currentPage.components || {}).map(([componentKey, component]) => {
                                            const [category, componentId] = component.type.split('.')
                                            const componentDef = UI_COMPONENTS[category]?.[componentId]
                                            if (!componentDef) return null

                                            return (
                                                <div key={componentKey} className="flex items-start justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">{componentDef.name}</h5>
                                                        <p className="text-sm text-gray-600 mb-3">{componentDef.description}</p>

                                                        {/* Component Preview */}
                                                        <div className={`mb-3 p-2 rounded text-xs ${componentDef.preview}`}>
                                                            Preview: {componentDef.name}
                                                        </div>

                                                        {/* Component Props */}
                                                        <div className="space-y-2">
                                                            {componentDef.props.map((prop) => (
                                                                <div key={prop}>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                                                                        {prop.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Enter ${prop}`}
                                                                        value={component.props?.[prop] || ''}
                                                                        onChange={(e) => updateComponentProp(selectedPage, componentKey, prop, e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => removeComponentFromPage(selectedPage, componentKey)}
                                                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        })}

                                        {Object.keys(currentPage.components || {}).length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 mb-3">No UI components added yet</p>
                                                <p className="text-sm text-gray-400">Choose from available components below</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Components */}
                                    <div>
                                        <h5 className="font-medium text-gray-900 mb-3">Available Components</h5>
                                        {Object.entries(UI_COMPONENTS).map(([category, components]) => (
                                            <div key={category} className="mb-6">
                                                <h6 className="font-medium text-gray-700 mb-2 capitalize flex items-center">
                                                    <Palette className="w-4 h-4 mr-2" />
                                                    {category}
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(components).map(([componentId, componentDef]) => (
                                                        <button
                                                            key={componentId}
                                                            onClick={() => addComponentToPage(selectedPage, category, componentId)}
                                                            className="p-3 border-2 border-gray-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h6 className="font-medium">{componentDef.name}</h6>
                                                                    <p className="text-xs text-gray-600 mt-1">{componentDef.description}</p>
                                                                    <div className={`mt-2 p-1 rounded text-xs ${componentDef.preview}`}>
                                                                        Preview
                                                                    </div>
                                                                </div>
                                                                <Plus className="w-4 h-4 text-purple-600 ml-2" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <EyeOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Page Disabled</h4>
                            <p className="text-gray-600 mb-4">
                                This page is currently disabled and won't be included in your website.
                            </p>
                            <button
                                onClick={() => togglePage(selectedPage)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Enable Page
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Project Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Pages:</span>
                        <span className="ml-2 font-medium">{getEnabledPages().length} enabled</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Content Blocks:</span>
                        <span className="ml-2 font-medium">
                            {getEnabledPages().reduce((total, [key, page]) => {
                                const pageConfig = { ...page, ...config.pages?.[key] }
                                return total + (pageConfig.blocks?.length || 0)
                            }, 0)} total
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">UI Components:</span>
                        <span className="ml-2 font-medium">
                            {getEnabledPages().reduce((total, [key, page]) => {
                                const pageConfig = { ...page, ...config.pages?.[key] }
                                return total + Object.keys(pageConfig.components || {}).length
                            }, 0)} total
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Project Type:</span>
                        <span className="ml-2 font-medium capitalize">{config.projectType || config.businessType || 'Marketing'}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
                <button
                    onClick={onPrev}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                </button>
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