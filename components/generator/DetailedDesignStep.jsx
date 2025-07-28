// Detailed Design Step Component - Header & Footer Focus
// File: components/generator/DetailedDesignStep.jsx

'use client'

import { useState } from 'react'
import {
    ArrowRight,
    ArrowLeft,
    Menu,
    Layout,
    Plus,
    X,
    Move,
    Settings,
    Eye,
    ShoppingCart,
    User,
    Search,
    Bell,
    Github,
    Twitter,
    LinkedIn,
    Facebook,
    Instagram,
    Mail,
    Phone,
    MapPin
} from 'lucide-react'
import WebsitePreview from './WebsitePreview'

const HEADER_LAYOUTS = [
    {
        id: 'centered',
        name: 'Centered Logo',
        description: 'Logo in center, nav items on sides',
        preview: 'Logo centered with navigation spread'
    },
    {
        id: 'left-aligned',
        name: 'Left Aligned',
        description: 'Logo left, navigation right',
        preview: 'Traditional left-right layout'
    },
    {
        id: 'split',
        name: 'Split Navigation',
        description: 'Logo center, nav items split left/right',
        preview: 'Navigation items around logo'
    },
    {
        id: 'stacked',
        name: 'Stacked',
        description: 'Logo top, navigation below',
        preview: 'Two-row header layout'
    }
]

const FOOTER_LAYOUTS = [
    {
        id: 'simple',
        name: 'Simple',
        description: 'Single row with copyright and links',
        columns: 1
    },
    {
        id: 'three-column',
        name: 'Three Column',
        description: 'Company info, links, contact',
        columns: 3
    },
    {
        id: 'four-column',
        name: 'Four Column',
        description: 'Company, products, support, legal',
        columns: 4
    },
    {
        id: 'newsletter',
        name: 'Newsletter',
        description: 'Includes newsletter signup section',
        columns: 3,
        hasNewsletter: true
    }
]

export default function DetailedDesignStep({ config, onChange, onNext, onPrev }) {
    const [selectedHeaderLayout, setSelectedHeaderLayout] = useState(config.header?.layout || 'left-aligned')
    const [selectedFooterLayout, setSelectedFooterLayout] = useState(config.footer?.layout || 'simple')

    // Get navigation items from step 1 config
    const getDefaultMenuItems = () => {
        const template = config.template || 'modern'
        switch (template) {
            case 'ecommerce':
                return [
                    { label: 'Shop', link: '/shop', icon: 'ShoppingCart' },
                    { label: 'Categories', link: '/categories', icon: null },
                    { label: 'Deals', link: '/deals', icon: null },
                    { label: 'About', link: '/about', icon: null }
                ]
            case 'saas':
                return [
                    { label: 'Features', link: '/features', icon: null },
                    { label: 'Pricing', link: '/pricing', icon: null },
                    { label: 'Resources', link: '/resources', icon: null },
                    { label: 'Contact', link: '/contact', icon: null }
                ]
            case 'blog':
                return [
                    { label: 'Posts', link: '/posts', icon: null },
                    { label: 'Categories', link: '/categories', icon: null },
                    { label: 'About', link: '/about', icon: null },
                    { label: 'Contact', link: '/contact', icon: null }
                ]
            case 'portfolio':
                return [
                    { label: 'Work', link: '/work', icon: null },
                    { label: 'About', link: '/about', icon: null },
                    { label: 'Skills', link: '/skills', icon: null },
                    { label: 'Contact', link: '/contact', icon: null }
                ]
            default:
                return [
                    { label: 'Home', link: '/', icon: null },
                    { label: 'About', link: '/about', icon: null },
                    { label: 'Services', link: '/services', icon: null },
                    { label: 'Contact', link: '/contact', icon: null }
                ]
        }
    }

    const getDefaultActionIcons = () => {
        const template = config.template || 'modern'
        switch (template) {
            case 'ecommerce':
                return [
                    { icon: 'Search', label: 'Search', badge: null },
                    { icon: 'User', label: 'Account', badge: null },
                    { icon: 'ShoppingCart', label: 'Cart', badge: '0' }
                ]
            case 'saas':
                return [
                    { icon: 'Bell', label: 'Notifications', badge: null },
                    { icon: 'User', label: 'Profile', badge: null }
                ]
            default:
                return [
                    { icon: 'User', label: 'Login', badge: null }
                ]
        }
    }

    const menuItems = config.header?.menuItems || getDefaultMenuItems()
    const actionIcons = config.header?.actionIcons || getDefaultActionIcons()

    const updateHeader = (field, value) => {
        onChange({
            ...config,
            header: {
                ...config.header,
                [field]: value
            }
        })
    }

    const updateFooter = (field, value) => {
        onChange({
            ...config,
            footer: {
                ...config.footer,
                [field]: value
            }
        })
    }

    const updateMenuItem = (index, field, value) => {
        const updatedItems = [...menuItems]
        updatedItems[index] = { ...updatedItems[index], [field]: value }
        updateHeader('menuItems', updatedItems)
    }

    const addMenuItem = () => {
        const newItem = { label: 'New Page', link: '/new-page', icon: null }
        updateHeader('menuItems', [...menuItems, newItem])
    }

    const removeMenuItem = (index) => {
        const updatedItems = menuItems.filter((_, i) => i !== index)
        updateHeader('menuItems', updatedItems)
    }

    const updateFooterSection = (sectionKey, field, value) => {
        onChange({
            ...config,
            footer: {
                ...config.footer,
                sections: {
                    ...config.footer?.sections,
                    [sectionKey]: {
                        ...config.footer?.sections?.[sectionKey],
                        [field]: value
                    }
                }
            }
        })
    }

    const addFooterLink = (sectionKey) => {
        const currentLinks = config.footer?.sections?.[sectionKey]?.links || []
        const newLink = { label: 'New Link', link: '/new-page' }
        updateFooterSection(sectionKey, 'links', [...currentLinks, newLink])
    }

    const updateFooterLink = (sectionKey, linkIndex, field, value) => {
        const currentLinks = config.footer?.sections?.[sectionKey]?.links || []
        const updatedLinks = [...currentLinks]
        updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], [field]: value }
        updateFooterSection(sectionKey, 'links', updatedLinks)
    }

    const removeFooterLink = (sectionKey, linkIndex) => {
        const currentLinks = config.footer?.sections?.[sectionKey]?.links || []
        const updatedLinks = currentLinks.filter((_, i) => i !== linkIndex)
        updateFooterSection(sectionKey, 'links', updatedLinks)
    }

    const getFooterSections = () => {
        const layout = FOOTER_LAYOUTS.find(l => l.id === selectedFooterLayout)
        if (!layout) return {}

        switch (selectedFooterLayout) {
            case 'simple':
                return {
                    main: {
                        title: 'Links',
                        links: config.footer?.sections?.main?.links || [
                            { label: 'Privacy Policy', link: '/privacy' },
                            { label: 'Terms of Service', link: '/terms' }
                        ]
                    }
                }
            case 'three-column':
                return {
                    company: {
                        title: 'Company',
                        links: config.footer?.sections?.company?.links || [
                            { label: 'About Us', link: '/about' },
                            { label: 'Careers', link: '/careers' },
                            { label: 'Contact', link: '/contact' }
                        ]
                    },
                    products: {
                        title: config.template === 'ecommerce' ? 'Shop' : 'Products',
                        links: config.footer?.sections?.products?.links || [
                            { label: 'Features', link: '/features' },
                            { label: 'Pricing', link: '/pricing' },
                            { label: 'Support', link: '/support' }
                        ]
                    },
                    legal: {
                        title: 'Legal',
                        links: config.footer?.sections?.legal?.links || [
                            { label: 'Privacy Policy', link: '/privacy' },
                            { label: 'Terms of Service', link: '/terms' }
                        ]
                    }
                }
            case 'four-column':
                return {
                    company: {
                        title: 'Company',
                        links: config.footer?.sections?.company?.links || [
                            { label: 'About Us', link: '/about' },
                            { label: 'Careers', link: '/careers' }
                        ]
                    },
                    products: {
                        title: 'Products',
                        links: config.footer?.sections?.products?.links || [
                            { label: 'Features', link: '/features' },
                            { label: 'Pricing', link: '/pricing' }
                        ]
                    },
                    support: {
                        title: 'Support',
                        links: config.footer?.sections?.support?.links || [
                            { label: 'Help Center', link: '/help' },
                            { label: 'Contact Us', link: '/contact' }
                        ]
                    },
                    legal: {
                        title: 'Legal',
                        links: config.footer?.sections?.legal?.links || [
                            { label: 'Privacy', link: '/privacy' },
                            { label: 'Terms', link: '/terms' }
                        ]
                    }
                }
            default:
                return {}
        }
    }

    const footerSections = getFooterSections()

    const isComplete = () => {
        return menuItems.length > 0 && selectedHeaderLayout && selectedFooterLayout
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Header & Footer Design
                </h2>
                <p className="text-gray-600">
                    Configure your website's navigation and footer layout
                </p>
            </div>

            <div className="space-y-8">
                {/* Header Configuration */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Layout className="w-5 h-5 mr-2 text-blue-600" />
                        Header Configuration
                    </h3>

                    {/* Header Layout Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Header Layout
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {HEADER_LAYOUTS.map((layout) => (
                                <button
                                    key={layout.id}
                                    onClick={() => {
                                        setSelectedHeaderLayout(layout.id)
                                        updateHeader('layout', layout.id)
                                    }}
                                    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${selectedHeaderLayout === layout.id
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <h4 className="font-semibold text-gray-900 mb-1">{layout.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{layout.description}</p>
                                    <div className="text-xs text-gray-500">{layout.preview}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Items Configuration */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Navigation Menu Items</h4>
                            <button
                                onClick={addMenuItem}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {menuItems.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Move className="w-4 h-4 text-gray-400 cursor-move" />
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                                            placeholder="Menu Label"
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                                            placeholder="/page-url"
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <select
                                            value={item.icon || ''}
                                            onChange={(e) => updateMenuItem(index, 'icon', e.target.value || null)}
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">No Icon</option>
                                            <option value="Home">Home</option>
                                            <option value="ShoppingCart">Shopping</option>
                                            <option value="User">User</option>
                                            <option value="Mail">Contact</option>
                                            <option value="Settings">Settings</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => removeMenuItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Header Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.header?.sticky !== false}
                                    onChange={(e) => updateHeader('sticky', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Sticky header (stays at top when scrolling)</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.header?.showSearch !== false}
                                    onChange={(e) => updateHeader('showSearch', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Show search functionality</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.header?.transparentOnTop !== false}
                                    onChange={(e) => updateHeader('transparentOnTop', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Transparent header on homepage</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.header?.showCTA !== false}
                                    onChange={(e) => updateHeader('showCTA', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Show call-to-action button</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Configuration */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Layout className="w-5 h-5 mr-2 text-purple-600" />
                        Footer Configuration
                    </h3>

                    {/* Footer Layout Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Footer Layout
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FOOTER_LAYOUTS.map((layout) => (
                                <button
                                    key={layout.id}
                                    onClick={() => {
                                        setSelectedFooterLayout(layout.id)
                                        updateFooter('layout', layout.id)
                                    }}
                                    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${selectedFooterLayout === layout.id
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <h4 className="font-semibold text-gray-900 mb-1">{layout.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{layout.description}</p>
                                    <div className="text-xs text-gray-500">
                                        {layout.columns} {layout.columns === 1 ? 'column' : 'columns'}
                                        {layout.hasNewsletter && ' • Newsletter signup'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Sections Configuration */}
                    {selectedFooterLayout !== 'simple' && (
                        <div className="space-y-6">
                            <h4 className="font-medium text-gray-900">Footer Sections</h4>
                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(footerSections).map(([sectionKey, section]) => (
                                    <div key={sectionKey} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateFooterSection(sectionKey, 'title', e.target.value)}
                                                className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                                            />
                                            <button
                                                onClick={() => addFooterLink(sectionKey)}
                                                className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(section.links || []).map((link, linkIndex) => (
                                                <div key={linkIndex} className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={link.label}
                                                        onChange={(e) => updateFooterLink(sectionKey, linkIndex, 'label', e.target.value)}
                                                        placeholder="Link Label"
                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={link.link}
                                                        onChange={(e) => updateFooterLink(sectionKey, linkIndex, 'link', e.target.value)}
                                                        placeholder="/url"
                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        onClick={() => removeFooterLink(sectionKey, linkIndex)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Copyright Text
                            </label>
                            <input
                                type="text"
                                value={config.footer?.copyright || `© ${new Date().getFullYear()} ${config.projectName || 'Your Company'}. All rights reserved.`}
                                onChange={(e) => updateFooter('copyright', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.footer?.showSocial !== false}
                                    onChange={(e) => updateFooter('showSocial', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Show social media links</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.footer?.showNewsletter && selectedFooterLayout === 'newsletter'}
                                    onChange={(e) => updateFooter('showNewsletter', e.target.checked)}
                                    disabled={selectedFooterLayout !== 'newsletter'}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Show newsletter signup</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="p-6 bg-gray-50 rounded-lg">
                    <WebsitePreview config={config} currentStep={2} />

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
                        <span>Next: Pages & Content</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}