'use client'

import { useState } from 'react'
import {
    ArrowRight,
    ArrowLeft,
    Palette,
    Layout,
    Navigation,
    Plus,
    Trash2,
    Move,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Type,
    Zap,
    Settings
} from 'lucide-react'

const DEFAULT_PAGES = [
    { id: 'home', title: 'Home', url: '/', type: 'home', enabled: true, sections: ['hero', 'features', 'testimonials'] },
    { id: 'about', title: 'About Us', url: '/about', type: 'about', enabled: true, sections: ['story', 'team', 'values'] },
    { id: 'services', title: 'Services', url: '/services', type: 'services', enabled: true, sections: ['services-list', 'pricing', 'cta'] },
    { id: 'contact', title: 'Contact', url: '/contact', type: 'contact', enabled: true, sections: ['contact-form', 'info', 'map'] }
]

const DEFAULT_DESIGN = {
    colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        neutral: '#6B7280',
        background: '#FFFFFF',
        surface: '#F9FAFB'
    },
    typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: '600',
        bodyWeight: '400'
    },
    layout: {
        type: 'standard',
        spacing: 'comfortable',
        borderRadius: '0.5rem',
        shadowStyle: 'modern'
    },
    components: {
        buttonStyle: 'modern',
        cardStyle: 'elevated',
        inputStyle: 'outlined'
    },
    effects: {
        animations: true,
        transitions: true,
        hover: true
    }
}

const DEFAULT_HEADER = {
    style: 'modern',
    logo: 'text',
    menuItems: [
        { id: 'home', label: 'Home', url: '/', type: 'internal', enabled: true },
        { id: 'about', label: 'About', url: '/about', type: 'internal', enabled: true },
        {
            id: 'services',
            label: 'Services',
            url: '/services',
            type: 'dropdown',
            enabled: true,
            children: [
                { id: 'service1', label: 'Consulting', url: '/services/consulting', type: 'internal' },
                { id: 'service2', label: 'Development', url: '/services/development', type: 'internal' }
            ]
        },
        { id: 'contact', label: 'Contact', url: '/contact', type: 'internal', enabled: true }
    ]
}

const DEFAULT_FOOTER = {
    style: 'modern',
    columns: 3,
    showSocial: true,
    showNewsletter: true
}

function DesignCustomizationStep({ config, onChange, onNext, onPrev }) {
    const [activeTab, setActiveTab] = useState('design')

    // Initialize data if not present
    const design = config.design || DEFAULT_DESIGN
    const pages = config.pages || DEFAULT_PAGES
    const headerData = config.headerData || DEFAULT_HEADER
    const footerData = config.footerData || DEFAULT_FOOTER

    const updateConfig = (updates) => {
        onChange({ ...config, ...updates })
    }

    const updateDesign = (designUpdates) => {
        updateConfig({ design: { ...design, ...designUpdates } })
    }

    const updatePages = (newPages) => {
        updateConfig({ pages: newPages })
    }

    const updateHeader = (headerUpdates) => {
        updateConfig({ headerData: { ...headerData, ...headerUpdates } })
    }

    const updateFooter = (footerUpdates) => {
        updateConfig({ footerData: { ...footerData, ...footerUpdates } })
    }

    const tabs = [
        { id: 'design', label: 'Design System', icon: Palette },
        { id: 'pages', label: 'Pages', icon: Layout },
        { id: 'navigation', label: 'Navigation', icon: Navigation }
    ]

    const isComplete = () => {
        return !!(
            design.colors &&
            design.typography &&
            design.layout &&
            headerData.style &&
            footerData.style &&
            pages.length > 0
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Design System & Content Configuration
                </h2>
                <p className="text-gray-600">
                    Customize your design system, pages, and navigation structure
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
                {activeTab === 'design' && (
                    <DesignSystemTab
                        design={design}
                        onUpdate={updateDesign}
                    />
                )}

                {activeTab === 'pages' && (
                    <PagesEditorTab
                        pages={pages}
                        onUpdate={updatePages}
                        businessName={config.businessName}
                    />
                )}

                {activeTab === 'navigation' && (
                    <NavigationTab
                        headerData={headerData}
                        footerData={footerData}
                        pages={pages}
                        onUpdateHeader={updateHeader}
                        onUpdateFooter={updateFooter}
                    />
                )}
            </div>

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
                        Configuration {isComplete() ? 'Complete' : 'In Progress'}
                    </div>
                    <div className="flex space-x-1">
                        {tabs.map((tab) => {
                            let isCompleted = false
                            if (tab.id === 'design') isCompleted = !!(design.colors && design.typography)
                            if (tab.id === 'pages') isCompleted = pages.length > 0
                            if (tab.id === 'navigation') isCompleted = !!(headerData.style && footerData.style)

                            return (
                                <div
                                    key={tab.id}
                                    className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
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

// Design System Tab Component
function DesignSystemTab({ design, onUpdate }) {
    const [activeSection, setActiveSection] = useState('colors')

    const sections = [
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'typography', label: 'Typography', icon: Type },
        { id: 'layout', label: 'Layout', icon: Layout },
        { id: 'components', label: 'Components', icon: Zap },
        { id: 'effects', label: 'Effects', icon: Settings }
    ]

    return (
        <div className="space-y-6">
            {/* Section Navigation */}
            <div className="flex space-x-4 overflow-x-auto">
                {sections.map((section) => {
                    const Icon = section.icon
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap ${activeSection === section.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{section.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Section Content */}
            {activeSection === 'colors' && (
                <ColorsSection colors={design.colors} onUpdate={(colors) => onUpdate({ colors })} />
            )}

            {activeSection === 'typography' && (
                <TypographySection typography={design.typography} onUpdate={(typography) => onUpdate({ typography })} />
            )}

            {activeSection === 'layout' && (
                <LayoutSection layout={design.layout} onUpdate={(layout) => onUpdate({ layout })} />
            )}

            {activeSection === 'components' && (
                <ComponentsSection components={design.components} onUpdate={(components) => onUpdate({ components })} />
            )}

            {activeSection === 'effects' && (
                <EffectsSection effects={design.effects} onUpdate={(effects) => onUpdate({ effects })} />
            )}
        </div>
    )
}

// Colors Section
function ColorsSection({ colors, onUpdate }) {
    const colorFields = [
        { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary Color', description: 'Supporting brand color' },
        { key: 'accent', label: 'Accent Color', description: 'Highlight color' },
        { key: 'neutral', label: 'Neutral Color', description: 'Text and border color' },
        { key: 'background', label: 'Background Color', description: 'Page background' },
        { key: 'surface', label: 'Surface Color', description: 'Card and component backgrounds' }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {colorFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                            </label>
                            <p className="text-xs text-gray-500">{field.description}</p>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    value={colors[field.key]}
                                    onChange={(e) => onUpdate({ ...colors, [field.key]: e.target.value })}
                                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={colors[field.key]}
                                    onChange={(e) => onUpdate({ ...colors, [field.key]: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Preview */}
            <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Color Preview</h4>
                <div className="flex space-x-3">
                    {Object.entries(colors).map(([key, color]) => (
                        <div key={key} className="text-center">
                            <div
                                className="w-12 h-12 rounded-lg border border-gray-200 mb-2"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-600 capitalize">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Typography Section
function TypographySection({ typography, onUpdate }) {
    const fonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
        'Source Sans Pro', 'Nunito', 'Work Sans', 'Playfair Display',
        'Merriweather', 'Crimson Text', 'Georgia', 'Times New Roman'
    ]

    const weights = ['300', '400', '500', '600', '700', '800']

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography System</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Font
                        </label>
                        <select
                            value={typography.headingFont}
                            onChange={(e) => onUpdate({ ...typography, headingFont: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fonts.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Body Font
                        </label>
                        <select
                            value={typography.bodyFont}
                            onChange={(e) => onUpdate({ ...typography, bodyFont: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fonts.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Weight
                        </label>
                        <select
                            value={typography.headingWeight}
                            onChange={(e) => onUpdate({ ...typography, headingWeight: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {weights.map(weight => (
                                <option key={weight} value={weight}>{weight}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Body Weight
                        </label>
                        <select
                            value={typography.bodyWeight}
                            onChange={(e) => onUpdate({ ...typography, bodyWeight: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {weights.map(weight => (
                                <option key={weight} value={weight}>{weight}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Typography Preview */}
            <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Typography Preview</h4>
                <div className="space-y-4">
                    <div>
                        <h1
                            style={{
                                fontFamily: typography.headingFont,
                                fontWeight: typography.headingWeight
                            }}
                            className="text-3xl"
                        >
                            This is a Heading
                        </h1>
                    </div>
                    <div>
                        <p
                            style={{
                                fontFamily: typography.bodyFont,
                                fontWeight: typography.bodyWeight
                            }}
                            className="text-base"
                        >
                            This is body text that shows how your content will look with the selected typography settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Layout Section
function LayoutSection({ layout, onUpdate }) {
    const layoutTypes = [
        { value: 'standard', label: 'Standard', description: 'Traditional header, content, footer' },
        { value: 'sidebar', label: 'Sidebar', description: 'Side navigation layout' },
        { value: 'centered', label: 'Centered', description: 'Centered content layout' },
        { value: 'magazine', label: 'Magazine', description: 'Multi-column content layout' }
    ]

    const spacingOptions = ['tight', 'comfortable', 'spacious']
    const radiusOptions = ['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem']
    const shadowOptions = ['none', 'minimal', 'modern', 'dramatic']

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Configuration</h3>

                {/* Layout Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Layout Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {layoutTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => onUpdate({ ...layout, type: type.value })}
                                className={`p-4 border-2 rounded-lg text-left transition-colors ${layout.type === type.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <h4 className="font-medium text-gray-900">{type.label}</h4>
                                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Other Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                        <select
                            value={layout.spacing}
                            onChange={(e) => onUpdate({ ...layout, spacing: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {spacingOptions.map(option => (
                                <option key={option} value={option} className="capitalize">{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                        <select
                            value={layout.borderRadius}
                            onChange={(e) => onUpdate({ ...layout, borderRadius: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {radiusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shadow Style</label>
                        <select
                            value={layout.shadowStyle}
                            onChange={(e) => onUpdate({ ...layout, shadowStyle: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {shadowOptions.map(option => (
                                <option key={option} value={option} className="capitalize">{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Components Section
function ComponentsSection({ components, onUpdate }) {
    const componentOptions = {
        buttonStyle: ['modern', 'classic', 'minimal', 'bold'],
        cardStyle: ['flat', 'elevated', 'outlined', 'filled'],
        inputStyle: ['outlined', 'filled', 'underlined', 'minimal']
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Styles</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(componentOptions).map(([key, options]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                {key.replace('Style', ' Style')}
                            </label>
                            <select
                                value={components[key]}
                                onChange={(e) => onUpdate({ ...components, [key]: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {options.map(option => (
                                    <option key={option} value={option} className="capitalize">{option}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Effects Section
function EffectsSection({ effects, onUpdate }) {
    const effectOptions = [
        { key: 'animations', label: 'Animations', description: 'Enable CSS animations' },
        { key: 'transitions', label: 'Transitions', description: 'Smooth transitions between states' },
        { key: 'hover', label: 'Hover Effects', description: 'Interactive hover states' }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Effects</h3>

                <div className="space-y-4">
                    {effectOptions.map((effect) => (
                        <div key={effect.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900">{effect.label}</h4>
                                <p className="text-sm text-gray-600">{effect.description}</p>
                            </div>
                            <button
                                onClick={() => onUpdate({ ...effects, [effect.key]: !effects[effect.key] })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${effects[effect.key] ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${effects[effect.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Pages Editor Tab Component
function PagesEditorTab({ pages, onUpdate, businessName }) {
    const [editingPage, setEditingPage] = useState(null)

    const availableSections = {
        hero: 'Hero Section',
        features: 'Features',
        services: 'Services List',
        testimonials: 'Testimonials',
        team: 'Team',
        story: 'Our Story',
        values: 'Values',
        'contact-form': 'Contact Form',
        info: 'Contact Info',
        map: 'Map',
        pricing: 'Pricing',
        cta: 'Call to Action',
        gallery: 'Gallery',
        blog: 'Blog Posts',
        faq: 'FAQ'
    }

    const addPage = () => {
        const newPage = {
            id: `page_${Date.now()}`,
            title: 'New Page',
            url: '/new-page',
            type: 'custom',
            enabled: true,
            sections: ['hero']
        }
        onUpdate([...pages, newPage])
    }

    const updatePage = (pageId, updates) => {
        const updatedPages = pages.map(page =>
            page.id === pageId ? { ...page, ...updates } : page
        )
        onUpdate(updatedPages)
    }

    const deletePage = (pageId) => {
        if (pages.length <= 1) return // Keep at least one page
        onUpdate(pages.filter(page => page.id !== pageId))
    }

    const togglePageEnabled = (pageId) => {
        updatePage(pageId, { enabled: !pages.find(p => p.id === pageId)?.enabled })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pages Editor</h3>
                    <p className="text-sm text-gray-600">Customize page titles, URLs, and sections</p>
                </div>
                <button
                    onClick={addPage}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Page</span>
                </button>
            </div>

            <div className="space-y-4">
                {pages.map((page) => (
                    <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => togglePageEnabled(page.id)}
                                    className={`p-1 rounded ${page.enabled ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    {page.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <div>
                                    <h4 className="font-medium text-gray-900">{page.title}</h4>
                                    <p className="text-sm text-gray-500">{page.url}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${page.type === 'home' ? 'bg-blue-100 text-blue-800' :
                                        page.type === 'custom' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {page.type}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setEditingPage(editingPage === page.id ? null : page.id)}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                {page.type === 'custom' && (
                                    <button
                                        onClick={() => deletePage(page.id)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {editingPage === page.id && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                                        <input
                                            type="text"
                                            value={page.title}
                                            onChange={(e) => updatePage(page.id, { title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Page URL</label>
                                        <input
                                            type="text"
                                            value={page.url}
                                            onChange={(e) => updatePage(page.id, { url: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="/page-url"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Sections</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {Object.entries(availableSections).map(([key, label]) => (
                                            <label key={key} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={page.sections.includes(key)}
                                                    onChange={(e) => {
                                                        const sections = e.target.checked
                                                            ? [...page.sections, key]
                                                            : page.sections.filter(s => s !== key)
                                                        updatePage(page.id, { sections })
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <strong>Selected sections:</strong> {page.sections.map(s => availableSections[s]).join(', ')}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Navigation Tab Component
function NavigationTab({ headerData, footerData, pages, onUpdateHeader, onUpdateFooter }) {
    const [editingItem, setEditingItem] = useState(null)

    const addMenuItem = () => {
        const newItem = {
            id: `menu_${Date.now()}`,
            label: 'New Item',
            url: '/new-item',
            type: 'internal',
            enabled: true
        }
        onUpdateHeader({
            menuItems: [...headerData.menuItems, newItem]
        })
    }

    const updateMenuItem = (itemId, updates) => {
        const updatedItems = headerData.menuItems.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        )
        onUpdateHeader({ menuItems: updatedItems })
    }

    const deleteMenuItem = (itemId) => {
        onUpdateHeader({
            menuItems: headerData.menuItems.filter(item => item.id !== itemId)
        })
    }

    const addDropdownItem = (parentId) => {
        const newSubItem = {
            id: `submenu_${Date.now()}`,
            label: 'New Subitem',
            url: '/new-subitem',
            type: 'internal'
        }

        const updatedItems = headerData.menuItems.map(item => {
            if (item.id === parentId) {
                return {
                    ...item,
                    type: 'dropdown',
                    children: [...(item.children || []), newSubItem]
                }
            }
            return item
        })

        onUpdateHeader({ menuItems: updatedItems })
    }

    const updateDropdownItem = (parentId, childId, updates) => {
        const updatedItems = headerData.menuItems.map(item => {
            if (item.id === parentId && item.children) {
                return {
                    ...item,
                    children: item.children.map(child =>
                        child.id === childId ? { ...child, ...updates } : child
                    )
                }
            }
            return item
        })
        onUpdateHeader({ menuItems: updatedItems })
    }

    const deleteDropdownItem = (parentId, childId) => {
        const updatedItems = headerData.menuItems.map(item => {
            if (item.id === parentId && item.children) {
                const newChildren = item.children.filter(child => child.id !== childId)
                return {
                    ...item,
                    children: newChildren,
                    type: newChildren.length === 0 ? 'internal' : 'dropdown'
                }
            }
            return item
        })
        onUpdateHeader({ menuItems: updatedItems })
    }

    return (
        <div className="space-y-8">
            {/* Header Navigation */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Header Navigation</h3>
                        <p className="text-sm text-gray-600">Configure your main navigation menu</p>
                    </div>
                    <button
                        onClick={addMenuItem}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Menu Item</span>
                    </button>
                </div>

                {/* Header Style */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                    <select
                        value={headerData.style}
                        onChange={(e) => onUpdateHeader({ style: e.target.value })}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                        <option value="bold">Bold</option>
                    </select>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                    {headerData.menuItems.map((item, index) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Move className="w-4 h-4 text-gray-400 cursor-move" />
                                    <button
                                        onClick={() => updateMenuItem(item.id, { enabled: !item.enabled })}
                                        className={`p-1 rounded ${item.enabled ? 'text-green-600' : 'text-gray-400'}`}
                                    >
                                        {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                                        <p className="text-sm text-gray-500">{item.url}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'dropdown' ? 'bg-purple-100 text-purple-800' :
                                            item.type === 'external' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.type}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {item.type !== 'dropdown' && (
                                        <button
                                            onClick={() => addDropdownItem(item.id)}
                                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                                            title="Add dropdown"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMenuItem(item.id)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {editingItem === item.id && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={(e) => updateMenuItem(item.id, { label: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                                            <input
                                                type="text"
                                                value={item.url}
                                                onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                            <select
                                                value={item.type}
                                                onChange={(e) => updateMenuItem(item.id, { type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="internal">Internal</option>
                                                <option value="external">External</option>
                                                <option value="dropdown">Dropdown</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dropdown Items */}
                            {item.type === 'dropdown' && item.children && (
                                <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-2">
                                    {item.children.map((child) => (
                                        <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={child.label}
                                                    onChange={(e) => updateDropdownItem(item.id, child.id, { label: e.target.value })}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    type="text"
                                                    value={child.url}
                                                    onChange={(e) => updateDropdownItem(item.id, child.id, { url: e.target.value })}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="URL"
                                                />
                                            </div>
                                            <button
                                                onClick={() => deleteDropdownItem(item.id, child.id)}
                                                className="ml-3 p-1 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addDropdownItem(item.id)}
                                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Dropdown Item</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Configuration */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Footer Configuration</h3>
                    <p className="text-sm text-gray-600">Configure your footer layout and content</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Style</label>
                        <select
                            value={footerData.style}
                            onChange={(e) => onUpdateFooter({ style: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                        <select
                            value={footerData.columns}
                            onChange={(e) => onUpdateFooter({ columns: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={footerData.showSocial}
                                onChange={(e) => onUpdateFooter({ showSocial: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show Social Links</span>
                        </label>
                    </div>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={footerData.showNewsletter}
                                onChange={(e) => onUpdateFooter({ showNewsletter: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show Newsletter</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DesignCustomizationStep