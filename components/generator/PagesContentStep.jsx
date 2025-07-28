'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    ArrowRight,
    ArrowLeft,
    FileText,
    Eye,
    EyeOff,
    Edit3,
    Trash2,
    Monitor,
    Smartphone,
    Tablet,
    Plus,
    Search,
    Filter,
    Layers,
    Globe,
    Settings,
    Save,
    X,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Wand2,
    AlertTriangle,
    Copy,
    ArrowUp,
    ArrowDown,
    Users,
    Star,
    BarChart3,
    MapPin,
    Clock,
    Award,
    Briefcase,
    Mail,
    Image,
    Grid,
    List,
    PlayCircle
} from 'lucide-react'
import WebsitePreview from './WebsitePreview'

// Page type configurations
const PAGE_TYPES = {
    home: { icon: Eye, label: 'Home Page', color: 'blue' },
    about: { icon: FileText, label: 'About Us', color: 'green' },
    services: { icon: Settings, label: 'Services', color: 'purple' },
    contact: { icon: Edit3, label: 'Contact', color: 'orange' },
    shop: { icon: Plus, label: 'Shop', color: 'red' }
}

// Available block types that can be added to pages
const BLOCK_LIBRARY = {
    hero: {
        name: 'Hero Section',
        description: 'Main banner with headline and call-to-action',
        icon: PlayCircle,
        color: 'blue',
        category: 'marketing',
        allowedPages: ['home', 'about', 'services', 'contact', 'shop'],
        fields: {
            title: { type: 'text', label: 'Main Headline', placeholder: 'Welcome to {{businessName}}' },
            subtitle: { type: 'textarea', label: 'Subtitle', placeholder: 'Your trusted partner for {{industry}} solutions' },
            buttonText: { type: 'text', label: 'Button Text', placeholder: 'Get Started' },
            buttonLink: { type: 'text', label: 'Button Link', placeholder: '/contact' },
            backgroundType: {
                type: 'select',
                label: 'Background Type',
                options: ['gradient', 'image', 'video', 'solid']
            },
            backgroundImage: { type: 'text', label: 'Background Image URL', placeholder: '/hero-bg.jpg' }
        }
    },
    features: {
        name: 'Features Section',
        description: 'Highlight key features and benefits',
        icon: Star,
        color: 'green',
        category: 'marketing',
        allowedPages: ['home', 'about', 'services'],
        fields: {
            title: { type: 'text', label: 'Section Title', placeholder: 'Why Choose Us' },
            subtitle: { type: 'text', label: 'Section Subtitle', placeholder: 'What makes us different' },
            items: {
                type: 'list', label: 'Features', itemFields: {
                    title: { type: 'text', label: 'Feature Title' },
                    description: { type: 'textarea', label: 'Feature Description' },
                    icon: { type: 'text', label: 'Icon Name (Lucide)' }
                }
            }
        }
    },
    team: {
        name: 'Team Section',
        description: 'Showcase team members and their roles',
        icon: Users,
        color: 'purple',
        category: 'content',
        allowedPages: ['about', 'home'],
        fields: {
            title: { type: 'text', label: 'Section Title', placeholder: 'Meet Our Team' },
            subtitle: { type: 'text', label: 'Section Subtitle', placeholder: 'The people behind our success' },
            members: {
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
    },
    testimonials: {
        name: 'Testimonials',
        description: 'Customer reviews and feedback',
        icon: Award,
        color: 'yellow',
        category: 'marketing',
        allowedPages: ['home', 'about', 'services'],
        fields: {
            title: { type: 'text', label: 'Section Title', placeholder: 'What Our Clients Say' },
            subtitle: { type: 'text', label: 'Section Subtitle', placeholder: 'Real feedback from real customers' },
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
    contactInfo: {
        name: 'Contact Information',
        description: 'Business contact details and hours',
        icon: Mail,
        color: 'red',
        category: 'content',
        allowedPages: ['contact', 'about'],
        fields: {
            title: { type: 'text', label: 'Section Title', placeholder: 'Get In Touch' },
            address: { type: 'textarea', label: 'Physical Address' },
            phone: { type: 'text', label: 'Phone Number' },
            email: { type: 'text', label: 'Email Address' },
            businessHours: { type: 'textarea', label: 'Business Hours' },
            mapUrl: { type: 'text', label: 'Google Maps URL' }
        }
    }
}

export default function PagesContentStep({ config, onChange, onNext, onPrev }) {
    const [mode, setMode] = useState('preview') // 'preview', 'edit', 'blocks'
    const [selectedPage, setSelectedPage] = useState('home')
    const [selectedBlock, setSelectedBlock] = useState(null)
    const [previewDevice, setPreviewDevice] = useState('desktop')
    const [pageSearch, setPageSearch] = useState('')
    const [blockSearch, setBlockSearch] = useState('')
    const [showAllPages, setShowAllPages] = useState(false)
    const [expandedSections, setExpandedSections] = useState({ hero: true })
    const [isInitialized, setIsInitialized] = useState(false)
    const [blockFilter, setBlockFilter] = useState('all') // 'all', 'marketing', 'content'

    // Initialize page structures from header menu items and existing config
    const initializePages = useCallback(() => {
        if (isInitialized) return

        const headerMenuItems = config?.header?.menuItems || []
        const existingPages = config?.pages || {}
        const pages = {}

        // Generate page ID from menu item
        const generatePageId = (item) => {
            if (item.link && item.link !== '/') {
                return item.link.replace(/^\//, '').toLowerCase() || 'page'
            }
            if (item.label) {
                return item.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
            return 'page'
        }

        // Always ensure home page exists
        pages.home = {
            id: 'home',
            title: 'Home',
            path: '/',
            enabled: true,
            required: true,
            blocks: existingPages.home?.blocks || ['hero', 'features'],
            ...existingPages.home
        }

        // Add pages from header menu
        headerMenuItems.forEach((item, index) => {
            if (item && item.link !== '/') {
                const pageId = generatePageId(item)
                pages[pageId] = {
                    id: pageId,
                    title: item.label || `Page ${index + 1}`,
                    path: item.link || `/${pageId}`,
                    enabled: existingPages[pageId]?.enabled !== false,
                    required: false,
                    blocks: existingPages[pageId]?.blocks || [],
                    ...existingPages[pageId]
                }
            }
        })

        // Initialize blocks structure for each page
        const blocks = { ...config.blocks }
        Object.keys(pages).forEach(pageId => {
            if (!blocks[pageId]) {
                blocks[pageId] = {}
            }
        })

        onChange({
            ...config,
            pages,
            blocks
        })

        setIsInitialized(true)
    }, [config, onChange, isInitialized])

    useEffect(() => {
        initializePages()
    }, [initializePages])

    // Get filtered pages based on search and visibility settings
    const getFilteredPages = useCallback(() => {
        const pages = config?.pages || {}
        return Object.entries(pages).filter(([pageId, page]) => {
            if (pageSearch) {
                const searchMatch =
                    page.title.toLowerCase().includes(pageSearch.toLowerCase()) ||
                    page.path.toLowerCase().includes(pageSearch.toLowerCase())
                if (!searchMatch) return false
            }

            if (!showAllPages && !page.enabled) return false
            return true
        })
    }, [config?.pages, pageSearch, showAllPages])

    // Get enabled pages for navigation
    const getEnabledPages = useCallback(() => {
        const pages = config?.pages || {}
        return Object.entries(pages).filter(([key, page]) => page.enabled)
    }, [config?.pages])

    // Get available blocks for current page
    const getAvailableBlocks = useCallback(() => {
        return Object.entries(BLOCK_LIBRARY).filter(([blockId, blockConfig]) => {
            // Filter by page compatibility
            if (!blockConfig.allowedPages.includes(selectedPage)) return false

            // Filter by search
            if (blockSearch) {
                const searchMatch =
                    blockConfig.name.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    blockConfig.description.toLowerCase().includes(blockSearch.toLowerCase())
                if (!searchMatch) return false
            }

            // Filter by category
            if (blockFilter !== 'all' && blockConfig.category !== blockFilter) return false

            return true
        })
    }, [selectedPage, blockSearch, blockFilter])

    // Get current page blocks in order
    const getCurrentPageBlocks = useCallback(() => {
        const page = config?.pages?.[selectedPage]
        const pageBlocks = config?.blocks?.[selectedPage] || {}

        if (!page?.blocks) return []

        return page.blocks.map(blockId => ({
            id: blockId,
            type: blockId,
            name: BLOCK_LIBRARY[blockId]?.name || blockId,
            config: BLOCK_LIBRARY[blockId],
            data: pageBlocks[blockId] || {}
        })).filter(block => block.config) // Only include blocks that exist in library
    }, [config?.pages, config?.blocks, selectedPage])

    // FIXED: Create preview config with proper data structure and real-time updates
    const getPreviewConfig = useCallback(() => {
        const enabledPages = getEnabledPages()
        const navItems = enabledPages.map(([pageId, page]) => ({
            label: page.title,
            link: page.path,
            active: pageId === selectedPage
        }))

        // Get the current page and its blocks
        const currentPageData = config?.pages?.[selectedPage]
        const currentPageBlocks = config?.blocks?.[selectedPage] || {}

        console.log('🔄 Preview Config Update:', {
            selectedPage,
            currentPageData,
            currentPageBlocks,
            blocksKeys: Object.keys(currentPageBlocks),
            blockValues: currentPageBlocks
        })

        return {
            ...config,
            // FIXED: Pass the selected page info properly
            selectedPage: selectedPage,
            currentPageData: currentPageData,

            // FIXED: Update header with navigation and click handler
            header: {
                ...config.header,
                menuItems: navItems,
                previewMode: true,
                onNavClick: (pageLink) => {
                    const targetPage = enabledPages.find(([_, pageInfo]) => pageInfo.path === pageLink)
                    if (targetPage) {
                        setSelectedPage(targetPage[0])
                    }
                }
            },

            // FIXED: Ensure blocks are properly structured and include all current data
            blocks: {
                ...config.blocks,
                // Make sure current page blocks are available with latest data
                [selectedPage]: currentPageBlocks
            },

            // FIXED: Add pages info so WebsitePreview can access it properly
            pages: {
                ...config.pages,
                [selectedPage]: {
                    ...currentPageData,
                    blocks: currentPageData?.blocks || []
                }
            }
        }
    }, [config, selectedPage, getEnabledPages])

    // FIXED: Memoize preview config to ensure it updates when dependencies change
    const previewConfig = useMemo(() => {
        return getPreviewConfig()
    }, [getPreviewConfig])

    // Page management functions
    const updatePageConfig = useCallback((pageId, field, value) => {
        const updatedPages = { ...config.pages }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            [field]: value
        }

        onChange({
            ...config,
            pages: updatedPages
        })
    }, [config, onChange])

    // FIXED: Enhanced updatePageContent with better logging and immediate preview updates
    const updatePageContent = useCallback((pageId, blockId, field, value) => {
        console.log('🔄 updatePageContent called:', {
            pageId,
            blockId,
            field,
            value,
            currentBlocks: config.blocks?.[pageId]?.[blockId]
        })

        const updatedBlocks = { ...config.blocks }
        if (!updatedBlocks[pageId]) {
            updatedBlocks[pageId] = {}
        }
        if (!updatedBlocks[pageId][blockId]) {
            updatedBlocks[pageId][blockId] = {}
        }

        updatedBlocks[pageId][blockId][field] = value

        console.log('✅ Updated block data:', updatedBlocks[pageId][blockId])

        onChange({
            ...config,
            blocks: updatedBlocks
        })
    }, [config, onChange])

    // Block management functions
    const addBlockToPage = useCallback((pageId, blockType) => {
        const page = config?.pages?.[pageId]
        if (!page) return

        const blockConfig = BLOCK_LIBRARY[blockType]
        if (!blockConfig) return

        // Generate unique block ID if block already exists
        let blockId = blockType
        let counter = 1
        while (page.blocks.includes(blockId)) {
            blockId = `${blockType}_${counter}`
            counter++
        }

        // Add block to page blocks list
        const updatedPages = { ...config.pages }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            blocks: [...page.blocks, blockId]
        }

        // Initialize block data with defaults
        const updatedBlocks = { ...config.blocks }
        if (!updatedBlocks[pageId]) {
            updatedBlocks[pageId] = {}
        }

        const defaultData = {}
        Object.entries(blockConfig.fields).forEach(([fieldKey, fieldConfig]) => {
            if (fieldConfig.type === 'list') {
                defaultData[fieldKey] = []
            } else if (fieldConfig.type === 'boolean') {
                defaultData[fieldKey] = false
            } else {
                defaultData[fieldKey] = ''
            }
        })

        updatedBlocks[pageId][blockId] = defaultData

        onChange({
            ...config,
            pages: updatedPages,
            blocks: updatedBlocks
        })

        console.log(`✅ Added block "${blockType}" to page "${pageId}"`)
    }, [config, onChange])

    const removeBlockFromPage = useCallback((pageId, blockId) => {
        if (!confirm(`Are you sure you want to remove this block? This action cannot be undone.`)) {
            return
        }

        const page = config?.pages?.[pageId]
        if (!page) return

        // Remove from page blocks list
        const updatedPages = { ...config.pages }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            blocks: page.blocks.filter(id => id !== blockId)
        }

        // Remove block data
        const updatedBlocks = { ...config.blocks }
        if (updatedBlocks[pageId]) {
            delete updatedBlocks[pageId][blockId]
        }

        onChange({
            ...config,
            pages: updatedPages,
            blocks: updatedBlocks
        })

        console.log(`🗑️ Removed block "${blockId}" from page "${pageId}"`)
    }, [config, onChange])

    const duplicateBlock = useCallback((pageId, blockId) => {
        const page = config?.pages?.[pageId]
        const blockData = config?.blocks?.[pageId]?.[blockId]

        if (!page || !blockData) return

        // Generate new block ID
        let newBlockId = `${blockId}_copy`
        let counter = 1
        while (page.blocks.includes(newBlockId)) {
            newBlockId = `${blockId}_copy_${counter}`
            counter++
        }

        // Add to blocks list
        const updatedPages = { ...config.pages }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            blocks: [...page.blocks, newBlockId]
        }

        // Copy block data
        const updatedBlocks = { ...config.blocks }
        updatedBlocks[pageId][newBlockId] = { ...blockData }

        onChange({
            ...config,
            pages: updatedPages,
            blocks: updatedBlocks
        })

        console.log(`📋 Duplicated block "${blockId}" as "${newBlockId}"`)
    }, [config, onChange])

    const moveBlock = useCallback((pageId, blockId, direction) => {
        const page = config?.pages?.[pageId]
        if (!page) return

        const currentIndex = page.blocks.indexOf(blockId)
        if (currentIndex === -1) return

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= page.blocks.length) return

        const newBlocks = [...page.blocks]
        newBlocks[currentIndex] = newBlocks[newIndex]
        newBlocks[newIndex] = blockId

        const updatedPages = { ...config.pages }
        updatedPages[pageId] = {
            ...updatedPages[pageId],
            blocks: newBlocks
        }

        onChange({
            ...config,
            pages: updatedPages
        })

        console.log(`🔄 Moved block "${blockId}" ${direction}`)
    }, [config, onChange])

    const togglePage = useCallback((pageId) => {
        const page = config?.pages?.[pageId]
        if (page && !page.required) {
            updatePageConfig(pageId, 'enabled', !page.enabled)
        }
    }, [config?.pages, updatePageConfig])

    const deletePage = useCallback((pageId) => {
        const page = config?.pages?.[pageId]
        if (!page || page.required) return

        if (!confirm(`Are you sure you want to delete the "${page.title}" page?`)) {
            return
        }

        const updatedPages = { ...config.pages }
        delete updatedPages[pageId]

        const updatedBlocks = { ...config.blocks }
        delete updatedBlocks[pageId]

        const updatedHeader = { ...config.header }
        if (updatedHeader.menuItems) {
            updatedHeader.menuItems = updatedHeader.menuItems.filter(item => {
                const itemPageId = item.link && item.link !== '/'
                    ? item.link.replace(/^\//, '').toLowerCase()
                    : item.label?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                return itemPageId !== pageId
            })
        }

        const remainingPages = Object.keys(updatedPages)
        const newSelectedPage = selectedPage === pageId
            ? (remainingPages.length > 0 ? remainingPages[0] : 'home')
            : selectedPage

        setSelectedPage(newSelectedPage)

        onChange({
            ...config,
            pages: updatedPages,
            blocks: updatedBlocks,
            header: updatedHeader
        })
    }, [config, selectedPage, onChange])

    // Template processing helper
    const processPlaceholder = useCallback((placeholder) => {
        if (!placeholder) return ''
        return placeholder
            .replace(/\{\{businessName\}\}/g, config.businessName || config.projectName || 'Your Business')
            .replace(/\{\{industry\}\}/g, config.industry || 'business')
    }, [config.businessName, config.projectName, config.industry])

    // FIXED: Enhanced field rendering with immediate updates
    const renderField = useCallback((pageId, blockId, fieldKey, fieldConfig) => {
        const currentValue = config?.blocks?.[pageId]?.[blockId]?.[fieldKey] || (fieldConfig.type === 'list' ? [] : '')

        console.log('🎨 renderField:', {
            pageId,
            blockId,
            fieldKey,
            currentValue,
            fieldType: fieldConfig.type
        })

        switch (fieldConfig.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => {
                            console.log('📝 Text field change:', e.target.value)
                            updatePageContent(pageId, blockId, fieldKey, e.target.value)
                        }}
                        placeholder={processPlaceholder(fieldConfig.placeholder)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        value={currentValue}
                        onChange={(e) => {
                            console.log('📝 Textarea field change:', e.target.value)
                            updatePageContent(pageId, blockId, fieldKey, e.target.value)
                        }}
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
                        onChange={(e) => updatePageContent(pageId, blockId, fieldKey, e.target.value)}
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
                            onChange={(e) => updatePageContent(pageId, blockId, fieldKey, e.target.checked)}
                            className="mr-2 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{fieldConfig.label}</span>
                    </label>
                )

            case 'select':
                return (
                    <select
                        value={currentValue}
                        onChange={(e) => updatePageContent(pageId, blockId, fieldKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {fieldConfig.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )

            case 'list':
                const listItems = Array.isArray(currentValue) ? currentValue : []
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{fieldConfig.label}</span>
                            <button
                                onClick={() => {
                                    const newItem = {}
                                    Object.keys(fieldConfig.itemFields).forEach(key => {
                                        newItem[key] = fieldConfig.itemFields[key].type === 'boolean' ? false : ''
                                    })
                                    console.log('➕ Adding new list item:', newItem)
                                    updatePageContent(pageId, blockId, fieldKey, [...listItems, newItem])
                                }}
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
                                        Item {itemIndex + 1}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newList = listItems.filter((_, index) => index !== itemIndex)
                                            console.log('🗑️ Removing list item:', itemIndex)
                                            updatePageContent(pageId, blockId, fieldKey, newList)
                                        }}
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
                                                onChange={(e) => {
                                                    const newList = [...listItems]
                                                    newList[itemIndex] = { ...newList[itemIndex], [itemFieldKey]: e.target.value }
                                                    console.log('📝 List item field change:', { itemIndex, itemFieldKey, value: e.target.value })
                                                    updatePageContent(pageId, blockId, fieldKey, newList)
                                                }}
                                                placeholder={itemFieldConfig.placeholder}
                                                rows={2}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                            />
                                        ) : itemFieldConfig.type === 'boolean' ? (
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item[itemFieldKey] || false}
                                                    onChange={(e) => {
                                                        const newList = [...listItems]
                                                        newList[itemIndex] = { ...newList[itemIndex], [itemFieldKey]: e.target.checked }
                                                        updatePageContent(pageId, blockId, fieldKey, newList)
                                                    }}
                                                    className="mr-2 rounded border-gray-300"
                                                />
                                                <span className="text-xs text-gray-700">{itemFieldConfig.label}</span>
                                            </label>
                                        ) : itemFieldConfig.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={item[itemFieldKey] || ''}
                                                onChange={(e) => {
                                                    const newList = [...listItems]
                                                    newList[itemIndex] = { ...newList[itemIndex], [itemFieldKey]: e.target.value }
                                                    updatePageContent(pageId, blockId, fieldKey, newList)
                                                }}
                                                placeholder={itemFieldConfig.placeholder}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={item[itemFieldKey] || ''}
                                                onChange={(e) => {
                                                    const newList = [...listItems]
                                                    newList[itemIndex] = { ...newList[itemIndex], [itemFieldKey]: e.target.value }
                                                    console.log('📝 List item text change:', { itemIndex, itemFieldKey, value: e.target.value })
                                                    updatePageContent(pageId, blockId, fieldKey, newList)
                                                }}
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
    }, [config?.blocks, updatePageContent, processPlaceholder])

    // Check if configuration is complete
    const isComplete = useCallback(() => {
        const enabledPages = getEnabledPages()
        return enabledPages.length > 0 && enabledPages.some(([key, page]) => {
            const pageBlocks = config?.blocks?.[key] || {}
            return Object.keys(pageBlocks).length > 0
        })
    }, [getEnabledPages, config?.blocks])

    const getPreviewClasses = () => {
        switch (previewDevice) {
            case 'mobile':
                return 'max-w-sm mx-auto'
            case 'tablet':
                return 'max-w-2xl mx-auto'
            default:
                return 'w-full'
        }
    }

    // Show loading if not initialized
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Initializing page configurations...</div>
            </div>
        )
    }

    const pages = config?.pages || {}
    const filteredPages = getFilteredPages()
    const currentPage = pages[selectedPage]
    const currentPageBlocks = getCurrentPageBlocks()
    const availableBlocks = getAvailableBlocks()

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Pages & Content Management
                        </h2>
                        <p className="text-gray-600">
                            Build, preview, and manage your pages with live updates
                        </p>
                    </div>

                    {/* Mode Toggle and Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setMode('preview')}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${mode === 'preview'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Eye className="w-4 h-4" />
                                <span>Preview</span>
                            </button>
                            <button
                                onClick={() => setMode('blocks')}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${mode === 'blocks'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                                <span>Blocks</span>
                            </button>
                            <button
                                onClick={() => setMode('edit')}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${mode === 'edit'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        </div>

                        {/* Device Switcher (Preview Mode Only) */}
                        {mode === 'preview' && (
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[
                                    { id: 'desktop', icon: Monitor, title: 'Desktop view' },
                                    { id: 'tablet', icon: Tablet, title: 'Tablet view' },
                                    { id: 'mobile', icon: Smartphone, title: 'Mobile view' }
                                ].map(({ id, icon: Icon, title }) => (
                                    <button
                                        key={id}
                                        onClick={() => setPreviewDevice(id)}
                                        className={`p-2 rounded-md transition-colors ${previewDevice === id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        title={title}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Page Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Layers className="w-5 h-5 mr-2 text-blue-600" />
                                Pages
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {getEnabledPages().length} active
                            </span>
                        </div>

                        {/* Search and Filters */}
                        <div className="space-y-3 mb-4">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search pages..."
                                    value={pageSearch}
                                    onChange={(e) => setPageSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={() => setShowAllPages(!showAllPages)}
                                className={`flex items-center space-x-2 text-sm px-3 py-1.5 rounded-md transition-colors ${showAllPages
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-3 h-3" />
                                <span>{showAllPages ? 'Show active only' : 'Show all pages'}</span>
                            </button>
                        </div>

                        {/* Page List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredPages.map(([pageId, pageInfo]) => {
                                const isEnabled = pageInfo.enabled
                                const isSelected = selectedPage === pageId
                                const blockCount = pageInfo.blocks?.length || 0
                                const PageIcon = PAGE_TYPES[pageId]?.icon || FileText

                                return (
                                    <div
                                        key={pageId}
                                        className={`group p-3 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : isEnabled
                                                ? 'border-green-200 bg-green-50 hover:border-green-300'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedPage(pageId)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {/* Enable/Disable Toggle */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (!pageInfo.required) {
                                                            togglePage(pageId)
                                                        }
                                                    }}
                                                    disabled={pageInfo.required}
                                                    className={`flex-shrink-0 p-1 rounded transition-colors ${pageInfo.required
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'cursor-pointer hover:bg-white/50'
                                                        }`}
                                                    title={pageInfo.required ? 'Required page' : isEnabled ? 'Disable page' : 'Enable page'}
                                                >
                                                    {isEnabled ? (
                                                        <Eye className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>

                                                {/* Page Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <PageIcon className="w-4 h-4 text-gray-600" />
                                                        <h4 className={`font-medium truncate ${isEnabled ? 'text-gray-900' : 'text-gray-500'
                                                            }`}>
                                                            {pageInfo.title}
                                                            {pageInfo.required && <span className="text-red-500 ml-1">*</span>}
                                                        </h4>
                                                        {isSelected && (
                                                            <Edit3 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                                        <span>{pageInfo.path}</span>
                                                        <span>{blockCount} blocks</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {mode === 'preview' ? (
                        /* Preview Mode */
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-green-600" />
                                    Live Website Preview
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                        <span className="font-medium">Viewing:</span> {currentPage?.title || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg capitalize">
                                        {previewDevice} view
                                    </div>
                                </div>
                            </div>

                            <div className={`transition-all duration-300 ${getPreviewClasses()}`}>
                                <WebsitePreview
                                    config={previewConfig}
                                    currentStep={3}
                                    selectedPage={selectedPage}
                                />
                            </div>

                            {/* Preview Actions */}
                            <div className="mt-6 flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setMode('blocks')}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Grid className="w-4 h-4" />
                                    <span>Manage Blocks</span>
                                </button>
                                <button
                                    onClick={() => setMode('edit')}
                                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit Content</span>
                                </button>
                            </div>
                        </div>
                    ) : mode === 'blocks' ? (
                        /* Block Management Mode */
                        <div className="space-y-6">
                            {/* Current Page Blocks */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Grid className="w-5 h-5 mr-2 text-blue-600" />
                                        {currentPage?.title} Blocks ({currentPageBlocks.length})
                                    </h3>
                                    <button
                                        onClick={() => setMode('preview')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                </div>

                                {currentPageBlocks.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentPageBlocks.map((block, index) => {
                                            const BlockIcon = block.config?.icon || FileText
                                            const hasContent = Object.values(block.data).some(value =>
                                                value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0))
                                            )

                                            return (
                                                <div key={block.id} className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-8 h-8 rounded-lg bg-${block.config?.color}-100 flex items-center justify-center`}>
                                                                <BlockIcon className={`w-5 h-5 text-${block.config?.color}-600`} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{block.name}</h4>
                                                                <p className="text-sm text-gray-600">{block.config?.description}</p>
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${hasContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {hasContent ? 'Has Content' : 'Empty'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">#{index + 1}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Block Actions */}
                                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => moveBlock(selectedPage, block.id, 'up')}
                                                                disabled={index === 0}
                                                                className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                                                                title="Move up"
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveBlock(selectedPage, block.id, 'down')}
                                                                disabled={index === currentPageBlocks.length - 1}
                                                                className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                                                                title="Move down"
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBlock(block.id)
                                                                    setMode('edit')
                                                                }}
                                                                className="p-1 text-gray-500 hover:text-green-600"
                                                                title="Edit block"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => duplicateBlock(selectedPage, block.id)}
                                                                className="p-1 text-gray-500 hover:text-blue-600"
                                                                title="Duplicate block"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeBlockFromPage(selectedPage, block.id)}
                                                                className="p-1 text-gray-500 hover:text-red-600"
                                                                title="Remove block"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Grid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">No blocks yet</h4>
                                        <p className="text-gray-600 mb-4">Add blocks from the library below to get started</p>
                                    </div>
                                )}
                            </div>

                            {/* Block Library */}
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Block Library</h3>
                                    <div className="flex items-center space-x-3">
                                        {/* Block Search */}
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                            <input
                                                type="text"
                                                placeholder="Search blocks..."
                                                value={blockSearch}
                                                onChange={(e) => setBlockSearch(e.target.value)}
                                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Category Filter */}
                                        <select
                                            value={blockFilter}
                                            onChange={(e) => setBlockFilter(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="content">Content</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableBlocks.map(([blockId, blockConfig]) => {
                                        const BlockIcon = blockConfig.icon
                                        const isAlreadyAdded = currentPageBlocks.some(block => block.type === blockId)

                                        return (
                                            <div key={blockId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg bg-${blockConfig.color}-100 flex items-center justify-center flex-shrink-0`}>
                                                            <BlockIcon className={`w-5 h-5 text-${blockConfig.color}-600`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900">{blockConfig.name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{blockConfig.description}</p>
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <span className={`text-xs px-2 py-1 rounded-full bg-${blockConfig.color}-100 text-${blockConfig.color}-700`}>
                                                                    {blockConfig.category}
                                                                </span>
                                                                {isAlreadyAdded && (
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                                        Added
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => addBlockToPage(selectedPage, blockId)}
                                                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        <span>Add</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {availableBlocks.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p>No blocks found matching your criteria</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode */
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                        <Edit3 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">
                                            Edit {currentPage?.title} Content
                                        </h4>
                                        <p className="text-sm text-gray-600">Configure block content and settings - changes update live in preview</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setMode('blocks')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Grid className="w-4 h-4" />
                                        <span>Manage Blocks</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('preview')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                </div>
                            </div>

                            {/* Block Editor Content */}
                            {currentPageBlocks.length > 0 ? (
                                <div className="space-y-6">
                                    {currentPageBlocks.map((block) => {
                                        const isExpanded = selectedBlock === block.id || expandedSections[block.id]
                                        const BlockIcon = block.config?.icon || FileText

                                        return (
                                            <div key={block.id} className="border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBlock(block.id)
                                                        setExpandedSections(prev => ({
                                                            ...prev,
                                                            [block.id]: !prev[block.id]
                                                        }))
                                                    }}
                                                    className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${isExpanded
                                                        ? 'hover:bg-blue-50 bg-blue-25'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-lg bg-${block.config?.color}-100 flex items-center justify-center`}>
                                                            <BlockIcon className={`w-5 h-5 text-${block.config?.color}-600`} />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{block.name}</span>
                                                            <p className="text-sm text-gray-600">{block.config?.description}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'
                                                        }`} />
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                                                        {Object.entries(block.config?.fields || {}).map(([fieldKey, fieldConfig]) => (
                                                            <div key={fieldKey}>
                                                                {fieldConfig.type !== 'boolean' && (
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        {fieldConfig.label}
                                                                    </label>
                                                                )}
                                                                {renderField(selectedPage, block.id, fieldKey, fieldConfig)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No blocks to edit</h4>
                                    <p className="text-gray-600 mb-4">Add some blocks to this page first</p>
                                    <button
                                        onClick={() => setMode('blocks')}
                                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Blocks</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary and Navigation */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Project Summary</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {[
                            {
                                label: 'Total Pages',
                                value: `${Object.keys(pages).length} created`,
                                sublabel: `${getEnabledPages().length} enabled`
                            },
                            {
                                label: 'Content Blocks',
                                value: Object.values(pages).reduce((total, page) =>
                                    total + (page.blocks?.length || 0), 0),
                                sublabel: 'across all pages'
                            },
                            {
                                label: 'Current Mode',
                                value: mode === 'preview' ? 'Preview' : mode === 'blocks' ? 'Block Management' : 'Content Editing',
                                sublabel: `${currentPage?.title || 'None'} page`
                            },
                            {
                                label: 'Template',
                                value: config.template || 'Modern',
                                sublabel: 'design system'
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-lg font-bold text-gray-900">{item.value}</div>
                                <div className="text-gray-600">{item.label}</div>
                                {item.sublabel && (
                                    <div className="text-xs text-gray-500 mt-1">{item.sublabel}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t">
                    <button
                        onClick={onPrev}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous Step</span>
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!isComplete()}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Next: Final Review</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}