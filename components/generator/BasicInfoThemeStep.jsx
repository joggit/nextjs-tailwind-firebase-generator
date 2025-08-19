'use client'

import { useState, useEffect } from 'react'
import {
    ArrowRight,
    Palette,
    Type,
    Layout,
    Zap,
    Loader,
    ShoppingCart,
    User,
    Search,
    Bell,
    Settings,
    Mail,
    Github,
    Twitter,
    Phone,
    Menu,
    Heart,
    Square,
    MousePointer,
    Image
} from 'lucide-react'
import HeroImageGenerator from './HeroImageGenerator'
import LogoGenerator from './LogoGenerator'
import WebsitePreview from './WebsitePreview'


// Color Palette Options
const COLOR_PALETTES = {
    ocean: {
        name: 'Ocean',
        description: 'Cool blues and teals',
        primaryColor: '#0EA5E9',
        secondaryColor: '#06B6D4',
        accentColor: '#3B82F6',
        neutralColor: '#64748B',
        preview: 'bg-gradient-to-r from-sky-500 to-cyan-500'
    },
    sunset: {
        name: 'Sunset',
        description: 'Warm oranges and pinks',
        primaryColor: '#F97316',
        secondaryColor: '#EC4899',
        accentColor: '#F59E0B',
        neutralColor: '#78716C',
        preview: 'bg-gradient-to-r from-orange-500 to-pink-500'
    },
    forest: {
        name: 'Forest',
        description: 'Natural greens and browns',
        primaryColor: '#059669',
        secondaryColor: '#65A30D',
        accentColor: '#84CC16',
        neutralColor: '#6B7280',
        preview: 'bg-gradient-to-r from-emerald-600 to-lime-600'
    },
    royal: {
        name: 'Royal',
        description: 'Deep purples and golds',
        primaryColor: '#7C3AED',
        secondaryColor: '#A855F7',
        accentColor: '#F59E0B',
        neutralColor: '#6B7280',
        preview: 'bg-gradient-to-r from-violet-600 to-purple-500'
    },
    corporate: {
        name: 'Corporate',
        description: 'Professional blues and grays',
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
        accentColor: '#60A5FA',
        neutralColor: '#64748B',
        preview: 'bg-gradient-to-r from-blue-800 to-blue-600'
    },
    minimal: {
        name: 'Minimal',
        description: 'Clean grays and blacks',
        primaryColor: '#374151',
        secondaryColor: '#6B7280',
        accentColor: '#9CA3AF',
        neutralColor: '#D1D5DB',
        preview: 'bg-gradient-to-r from-gray-700 to-gray-500'
    },
    vibrant: {
        name: 'Vibrant',
        description: 'Bold and energetic colors',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B',
        accentColor: '#EF4444',
        neutralColor: '#78716C',
        preview: 'bg-gradient-to-r from-red-600 to-amber-500'
    },
    tech: {
        name: 'Tech',
        description: 'Modern cyan and emerald',
        primaryColor: '#06B6D4',
        secondaryColor: '#10B981',
        accentColor: '#14B8A6',
        neutralColor: '#6B7280',
        preview: 'bg-gradient-to-r from-cyan-500 to-emerald-500'
    },
    custom: {
        name: 'Custom',
        description: 'Create your own palette',
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        preview: 'bg-gradient-to-r from-blue-500 to-purple-600'
    }
}

const FONT_OPTIONS = [
    { name: 'Inter', value: 'Inter, sans-serif', type: 'Sans-serif', googleFont: 'Inter:wght@400;500;600;700' },
    { name: 'Poppins', value: 'Poppins, sans-serif', type: 'Sans-serif', googleFont: 'Poppins:wght@400;500;600;700' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', type: 'Serif', googleFont: 'Playfair+Display:wght@400;500;600;700' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace', type: 'Monospace', googleFont: 'JetBrains+Mono:wght@400;500;600;700' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', type: 'Sans-serif', googleFont: 'Open+Sans:wght@400;500;600;700' },
    { name: 'Roboto', value: 'Roboto, sans-serif', type: 'Sans-serif', googleFont: 'Roboto:wght@400;500;700' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif', type: 'Sans-serif', googleFont: 'Montserrat:wght@400;500;600;700' }
]

const LAYOUT_OPTIONS = [
    {
        id: 'fixed',
        name: 'Fixed Header',
        description: 'Header stays at top when scrolling',
        icon: '📌'
    },
    {
        id: 'static',
        name: 'Static Header',
        description: 'Header scrolls with content',
        icon: '📄'
    },
    {
        id: 'floating',
        name: 'Floating Header',
        description: 'Header appears on scroll up',
        icon: '🎈'
    }
]

const BUTTON_STYLES = [
    { id: 'rounded', name: 'Rounded', value: '0.375rem' },
    { id: 'pill', name: 'Pill', value: '9999px' },
    { id: 'square', name: 'Square', value: '0px' },
    { id: 'slightly', name: 'Slightly Rounded', value: '0.25rem' }
]

const CARD_SHADOWS = [
    { id: 'none', name: 'None', value: 'none' },
    { id: 'sm', name: 'Small', value: 'sm' },
    { id: 'md', name: 'Medium', value: 'md' },
    { id: 'lg', name: 'Large', value: 'lg' },
    { id: 'xl', name: 'Extra Large', value: 'xl' }
]

const ANIMATION_SPEEDS = [
    { id: 'slow', name: 'Slow', value: '500ms', description: 'Gentle, relaxed feel' },
    { id: 'normal', name: 'Normal', value: '300ms', description: 'Balanced and smooth' },
    { id: 'fast', name: 'Fast', value: '150ms', description: 'Snappy and responsive' },
    { id: 'instant', name: 'Instant', value: '0ms', description: 'No animations' }
]

const HOVER_EFFECTS = [
    { id: 'subtle', name: 'Subtle', description: 'Gentle scale and shadow' },
    { id: 'moderate', name: 'Moderate', description: 'Noticeable scale and glow' },
    { id: 'dramatic', name: 'Dramatic', description: 'Bold transforms and effects' },
    { id: 'none', name: 'None', description: 'No hover effects' }
]

const SCROLL_EFFECTS = [
    { id: 'fadeIn', name: 'Fade In', description: 'Elements fade in as they appear' },
    { id: 'slideUp', name: 'Slide Up', description: 'Elements slide up from bottom' },
    { id: 'slideLeft', name: 'Slide Left', description: 'Elements slide in from right' },
    { id: 'scale', name: 'Scale', description: 'Elements scale up as they appear' },
    { id: 'none', name: 'None', description: 'No scroll animations' }
]

export default function BasicInfoThemeStep({ config, onChange, onNext }) {
    const [selectedPalette, setSelectedPalette] = useState('corporate')
    const [customColors, setCustomColors] = useState(false)
    const [logoLoading, setLogoLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('colors')
    const [graphicsSubTab, setGraphicsSubTab] = useState('logo')

    // Load Google Fonts dynamically
    useEffect(() => {
        const currentFont = config.theme?.fontFamily || 'Inter, sans-serif'
        const fontOption = FONT_OPTIONS.find(f => f.value === currentFont)

        if (fontOption && fontOption.googleFont) {
            loadGoogleFont(fontOption.googleFont)
        }
    }, [config.theme?.fontFamily])

    const handleLogoGenerated = (logos) => {
        onChange({
            ...config,
            graphics: {
                ...config.graphics,
                logos: logos,
                currentLogo: logos.primary?.url
            },
            header: {
                ...config.header,
                logo: logos.primary?.url
            }
        })
    }

    const handleHeroImageGenerated = (imageData) => {
        onChange({
            ...config,
            graphics: {
                ...config.graphics,
                heroImage: imageData.url,
                heroImageData: imageData
            }
        })
    }

    const loadGoogleFont = (fontFamily) => {
        // Remove existing font link if any
        const existingLink = document.querySelector('link[data-font-loader]')
        if (existingLink) {
            existingLink.remove()
        }

        // Add new font link
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`
        link.rel = 'stylesheet'
        link.setAttribute('data-font-loader', 'true')
        document.head.appendChild(link)
    }

    // Get current colors directly from config with proper fallbacks
    const getCurrentColors = () => {
        return {
            primary: config.theme?.primaryColor || '#1E40AF',
            secondary: config.theme?.secondaryColor || '#3B82F6',
            accent: config.theme?.accentColor || '#10B981',
            neutral: config.theme?.neutralColor || '#64748B',
            text: '#FFFFFF'
        }
    }

    const currentColors = getCurrentColors()
    const currentFont = config.theme?.fontFamily || 'Inter, sans-serif'
    const currentFontSize = config.theme?.typography?.baseFontSize || '16px'
    const buttonRadius = config.components?.button?.borderRadius || '0.5rem'
    const cardShadow = config.components?.card?.shadow || 'md'

    // Animation & Effects
    const animationSpeed = config.animations?.transition || '300ms'
    const hoverEffects = config.animations?.hoverEffects ?
        (config.animations.hoverEffects === true ? 'moderate' : config.animations.hoverEffects) : 'moderate'
    const scrollReveal = config.animations?.scrollReveal || 'fadeIn'
    const animationsEnabled = config.animations?.enabled !== false

    // Update selected palette when config changes
    useEffect(() => {
        const matchingPalette = Object.entries(COLOR_PALETTES).find(([key, palette]) =>
            palette.primaryColor === currentColors.primary &&
            palette.secondaryColor === currentColors.secondary
        )

        if (matchingPalette) {
            setSelectedPalette(matchingPalette[0])
            setCustomColors(false)
        } else {
            setSelectedPalette('custom')
            setCustomColors(true)
        }
    }, [currentColors.primary, currentColors.secondary])

    // Function to get navigation items based on project type/template
    const getNavigationItems = () => {
        const template = config.template || 'modern'
        const industry = config.industry

        switch (template) {
            case 'ecommerce':
                return ['Shop', 'Categories', 'Deals', 'About']
            case 'saas':
                return ['Features', 'Pricing', 'Resources', 'Contact']
            case 'marketing':
                return ['Campaigns', 'Analytics', 'SEO', 'Contact']
            case 'ngo':
                return ['Mission', 'Programs', 'Get Involved', 'Contact']
            default:
                if (industry === 'healthcare') return ['Services', 'Doctors', 'Appointments', 'Contact']
                if (industry === 'education') return ['Courses', 'Programs', 'Faculty', 'Admissions']
                if (industry === 'finance') return ['Services', 'Investments', 'Resources', 'Contact']
                return ['Home', 'About', 'Services', 'Contact']
        }
    }

    // Function to get header icons based on project type
    const getHeaderIcons = () => {
        const template = config.template || 'modern'

        switch (template) {
            case 'ecommerce':
                return [
                    { icon: Search, label: 'Search', badge: null },
                    { icon: Heart, label: 'Wishlist', badge: '2' },
                    { icon: ShoppingCart, label: 'Cart', badge: '3' },
                    { icon: User, label: 'Account', badge: null }
                ]
            case 'saas':
                return [
                    { icon: Bell, label: 'Notifications', badge: '5' },
                    { icon: Settings, label: 'Settings', badge: null },
                    { icon: User, label: 'Profile', badge: null }
                ]
            default:
                return [
                    { icon: User, label: 'Login', badge: null }
                ]
        }
    }

    const navigationItems = getNavigationItems()
    const headerIcons = getHeaderIcons()

    const updateBasicInfo = (field, value) => {
        const newConfig = {
            ...config,
            [field]: value
        }

        // Sync projectName and businessName
        if (field === 'projectName') {
            newConfig.businessName = value
        }
        if (field === 'description') {
            newConfig.businessDescription = value
        }

        onChange(newConfig)
    }

    const updateTheme = (field, value) => {
        const newConfig = {
            ...config,
            theme: {
                ...config.theme,
                [field]: value
            }
        }

        // Update components when colors change
        if (field === 'primaryColor') {
            newConfig.components = {
                ...config.components,
                navbar: {
                    ...config.components?.navbar,
                    backgroundColor: value
                },
                button: {
                    ...config.components?.button,
                    primaryColor: value
                }
            }
        }

        if (field === 'secondaryColor') {
            newConfig.components = {
                ...newConfig.components,
                button: {
                    ...newConfig.components?.button,
                    secondaryColor: value
                }
            }
        }

        onChange(newConfig)
    }

    const updateComponents = (componentType, field, value) => {
        onChange({
            ...config,
            components: {
                ...config.components,
                [componentType]: {
                    ...config.components?.[componentType],
                    [field]: value
                }
            }
        })
    }

    const updateThemeLayout = (field, value) => {
        onChange({
            ...config,
            theme: {
                ...config.theme,
                layout: {
                    ...config.theme?.layout,
                    [field]: value
                }
            }
        })
    }

    const updateTypography = (field, value) => {
        onChange({
            ...config,
            theme: {
                ...config.theme,
                typography: {
                    ...config.theme?.typography,
                    [field]: value
                }
            }
        })
    }

    const updateAnimations = (field, value) => {
        onChange({
            ...config,
            animations: {
                ...config.animations,
                [field]: value
            }
        })
    }

    // Apply color palette function
    const applyColorPalette = (paletteKey) => {
        setSelectedPalette(paletteKey)

        if (paletteKey !== 'custom') {
            const palette = COLOR_PALETTES[paletteKey]

            const newConfig = {
                ...config,
                theme: {
                    ...config.theme,
                    primaryColor: palette.primaryColor,
                    secondaryColor: palette.secondaryColor,
                    accentColor: palette.accentColor,
                    neutralColor: palette.neutralColor
                },
                components: {
                    ...config.components,
                    navbar: {
                        ...config.components?.navbar,
                        backgroundColor: palette.primaryColor,
                        textColor: '#FFFFFF',
                        hoverColor: palette.secondaryColor
                    },
                    button: {
                        ...config.components?.button,
                        primaryColor: palette.primaryColor,
                        secondaryColor: palette.secondaryColor,
                        textColor: '#FFFFFF',
                        borderRadius: config.components?.button?.borderRadius || '0.5rem'
                    },
                    card: {
                        ...config.components?.card,
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        shadow: config.components?.card?.shadow || 'md'
                    }
                }
            }

            onChange(newConfig)
            setCustomColors(false)
        } else {
            setCustomColors(true)
        }
    }

    const isComplete = () => {
        return config.projectName &&
            config.description &&
            config.theme?.primaryColor &&
            config.theme?.secondaryColor &&
            config.theme?.fontFamily
    }

    // Get shadow class name for preview
    const getShadowClass = (shadow) => {
        const shadowMap = {
            'none': '',
            'sm': 'shadow-sm',
            'md': 'shadow-md',
            'lg': 'shadow-lg',
            'xl': 'shadow-xl'
        }
        return shadowMap[shadow] || 'shadow-md'
    }

    const tabs = [
        { id: 'colors', name: 'Colors & Palette', icon: Palette },
        { id: 'typography', name: 'Typography', icon: Type },
        { id: 'components', name: 'Components', icon: Square },
        { id: 'graphics', name: 'Graphics', icon: Image },
        { id: 'effects', name: 'Effects & Animations', icon: Zap },
        { id: 'layout', name: 'Layout', icon: Layout }
    ]

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Basic Project Information & Design
                </h2>
                <p className="text-gray-600">
                    Let's start with the basics and choose your design system
                </p>
            </div>

            <div className="space-y-8">
                {/* Basic Project Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                        Project Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={config.projectName || ''}
                                onChange={(e) => updateBasicInfo('projectName', e.target.value)}
                                placeholder="My Awesome Project"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Type
                            </label>
                            <select
                                value={config.template || ''}
                                onChange={(e) => updateBasicInfo('template', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select project type...</option>
                                <option value="modern">Modern Website</option>
                                <option value="ecommerce">E-commerce Store</option>
                                <option value="web">Web Platform</option>
                                <option value="ngo">NGO Site</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industry/Category
                            </label>
                            <select
                                value={config.industry || ''}
                                onChange={(e) => updateBasicInfo('industry', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select industry...</option>
                                <option value="technology">Technology</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="finance">Finance</option>
                                <option value="education">Education</option>
                                <option value="retail">Retail/E-commerce</option>
                                <option value="consulting">Consulting</option>
                                <option value="nonprofit">Non-profit</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Audience
                            </label>
                            <select
                                value={config.targetAudience || ''}
                                onChange={(e) => updateBasicInfo('targetAudience', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select audience...</option>
                                <option value="consumers">Consumers/General Public</option>
                                <option value="businesses">Businesses/B2B</option>
                                <option value="professionals">Professionals</option>
                                <option value="students">Students/Education</option>
                                <option value="developers">Developers/Technical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Description *
                        </label>
                        <textarea
                            value={config.description || ''}
                            onChange={(e) => updateBasicInfo('description', e.target.value)}
                            placeholder="Describe what your project does and who it's for..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Design System Tabs */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Design System Configuration
                    </h3>

                    {/* Tab Navigation */}
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
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-96">
                        {activeTab === 'colors' && (
                            <div className="space-y-6">
                                <h4 className="font-medium text-gray-900">Choose Your Color Palette</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                                        <button
                                            key={key}
                                            onClick={() => applyColorPalette(key)}
                                            className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${selectedPalette === key
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="w-full h-16 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 flex">
                                                    <div className="flex-1" style={{ backgroundColor: palette.primaryColor }}></div>
                                                    <div className="flex-1" style={{ backgroundColor: palette.secondaryColor }}></div>
                                                    <div className="flex-1" style={{ backgroundColor: palette.accentColor }}></div>
                                                    <div className="flex-1" style={{ backgroundColor: palette.neutralColor }}></div>
                                                </div>
                                                <span className="relative text-white font-bold text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                                                    {palette.name}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{palette.name}</h4>
                                            <p className="text-sm text-gray-600">{palette.description}</p>
                                        </button>
                                    ))}
                                </div>

                                {(selectedPalette === 'custom' || customColors) && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-4">Custom Colors</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Primary Color
                                                </label>
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        value={currentColors.primary}
                                                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={currentColors.primary}
                                                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Secondary Color
                                                </label>
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        value={currentColors.secondary}
                                                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={currentColors.secondary}
                                                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'typography' && (
                            <div className="space-y-6">
                                <h4 className="font-medium text-gray-900">Typography Settings</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Font Family
                                        </label>
                                        <select
                                            value={currentFont}
                                            onChange={(e) => updateTheme('fontFamily', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {FONT_OPTIONS.map((font) => (
                                                <option key={font.value} value={font.value}>
                                                    {font.name} - {font.type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Base Font Size
                                        </label>
                                        <select
                                            value={currentFontSize}
                                            onChange={(e) => updateTypography('baseFontSize', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="14px">Small (14px)</option>
                                            <option value="16px">Medium (16px)</option>
                                            <option value="18px">Large (18px)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Font Preview */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Font Preview</h4>
                                    <div className="space-y-4" style={{ fontFamily: currentFont }}>
                                        <div>
                                            <p className="text-sm text-gray-600">Heading 1</p>
                                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: currentFont }}>
                                                The Quick Brown Fox Jumps Over
                                            </h1>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Heading 2</p>
                                            <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: currentFont }}>
                                                Welcome to Your Amazing Project
                                            </h2>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Body Text</p>
                                            <p className="text-gray-700" style={{ fontFamily: currentFont, fontSize: currentFontSize }}>
                                                This is how your body text will appear throughout your website. It should be easy to read and comfortable for your users.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Small Text</p>
                                            <p className="text-sm text-gray-600" style={{ fontFamily: currentFont }}>
                                                Small text for captions, labels, and secondary information.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'components' && (
                            <div className="space-y-6">
                                <h4 className="font-medium text-gray-900">Component Styling</h4>

                                {/* Button Styling */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <MousePointer className="w-4 h-4 mr-2" />
                                        Button Style
                                    </h5>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Border Radius
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {BUTTON_STYLES.map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => updateComponents('button', 'borderRadius', style.value)}
                                                        className={`p-2 border-2 rounded text-center text-sm transition-all ${buttonRadius === style.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div
                                                            className="w-full h-8 bg-blue-500 mb-1 flex items-center justify-center text-white text-xs font-medium"
                                                            style={{ borderRadius: style.value }}
                                                        >
                                                            Button
                                                        </div>
                                                        {style.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Button Preview */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                className="px-4 py-2 text-white font-medium transition-all duration-300 hover:scale-105"
                                                style={{
                                                    backgroundColor: currentColors.primary,
                                                    borderRadius: buttonRadius,
                                                    fontFamily: currentFont
                                                }}
                                            >
                                                Primary Button
                                            </button>
                                            <button
                                                className="px-4 py-2 font-medium border-2 transition-all duration-300 hover:scale-105"
                                                style={{
                                                    borderColor: currentColors.primary,
                                                    color: currentColors.primary,
                                                    borderRadius: buttonRadius,
                                                    fontFamily: currentFont,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                Secondary Button
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Styling */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <Square className="w-4 h-4 mr-2" />
                                        Card Style
                                    </h5>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Shadow Style
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                                {CARD_SHADOWS.map((shadow) => (
                                                    <button
                                                        key={shadow.id}
                                                        onClick={() => updateComponents('card', 'shadow', shadow.value)}
                                                        className={`p-3 border-2 rounded text-center text-sm transition-all ${cardShadow === shadow.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className={`w-full h-12 bg-white rounded border ${getShadowClass(shadow.value)} mb-1`}></div>
                                                        {shadow.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Preview */}
                                        <div className={`p-4 bg-white rounded-lg border ${getShadowClass(cardShadow)} max-w-sm`}>
                                            <h6 className="font-semibold mb-2" style={{ fontFamily: currentFont, color: currentColors.primary }}>
                                                Sample Card
                                            </h6>
                                            <p className="text-gray-600 text-sm mb-3" style={{ fontFamily: currentFont }}>
                                                This is how your cards will appear with the selected shadow style.
                                            </p>
                                            <button
                                                className="px-3 py-1 text-sm text-white font-medium rounded"
                                                style={{
                                                    backgroundColor: currentColors.primary,
                                                    borderRadius: buttonRadius,
                                                    fontFamily: currentFont
                                                }}
                                            >
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'effects' && (
                            <div className="space-y-6">
                                <h4 className="font-medium text-gray-900">Animation & Effects Settings</h4>

                                {/* Animation Speed */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Animation Speed
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {ANIMATION_SPEEDS.map((speed) => (
                                            <button
                                                key={speed.id}
                                                onClick={() => updateAnimations('transition', speed.value)}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${animationSpeed === speed.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{speed.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">{speed.value}</div>
                                                <div className="text-xs text-gray-500 mt-1">{speed.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Effects */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <MousePointer className="w-4 h-4 mr-2" />
                                        Hover Effects
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {HOVER_EFFECTS.map((effect) => (
                                            <button
                                                key={effect.id}
                                                onClick={() => updateAnimations('hoverEffects', effect.id)}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${hoverEffects === effect.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{effect.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{effect.description}</div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Hover Preview */}
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Hover Preview:</p>
                                        <div className="flex space-x-3">
                                            <button
                                                className={`px-4 py-2 bg-white border-2 rounded-lg transition-all ${hoverEffects === 'none' ? '' :
                                                    hoverEffects === 'subtle' ? 'hover:scale-105 hover:shadow-md' :
                                                        hoverEffects === 'moderate' ? 'hover:scale-110 hover:shadow-lg hover:bg-blue-50' :
                                                            'hover:scale-115 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                                                    }`}
                                                style={{
                                                    transitionDuration: animationSpeed,
                                                    borderColor: currentColors.primary
                                                }}
                                            >
                                                Hover me!
                                            </button>
                                            <div
                                                className={`w-16 h-10 rounded-lg transition-all ${hoverEffects === 'none' ? '' :
                                                    hoverEffects === 'subtle' ? 'hover:scale-105 hover:shadow-md' :
                                                        hoverEffects === 'moderate' ? 'hover:scale-110 hover:shadow-lg' :
                                                            'hover:scale-115 hover:shadow-xl hover:rotate-3'
                                                    }`}
                                                style={{
                                                    backgroundColor: currentColors.primary,
                                                    transitionDuration: animationSpeed
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scroll Reveal */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <Layout className="w-4 h-4 mr-2" />
                                        Scroll Reveal Animations
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                        {SCROLL_EFFECTS.map((effect) => (
                                            <button
                                                key={effect.id}
                                                onClick={() => updateAnimations('scrollReveal', effect.id)}
                                                className={`p-3 border-2 rounded-lg text-left transition-all ${scrollReveal === effect.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{effect.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{effect.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Global Animation Toggle */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4">Global Settings</h5>

                                    <div className="space-y-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={animationsEnabled}
                                                onChange={(e) => updateAnimations('enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Enable animations and transitions
                                            </span>
                                        </label>

                                        <div className="text-xs text-gray-500">
                                            {animationsEnabled
                                                ? "Animations enhance user experience but can be disabled for accessibility or performance."
                                                : "Animations are disabled. This improves accessibility and performance."
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Effects Preview */}
                                <div className="p-4 bg-white border rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-4">Animation Preview</h5>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['Card 1', 'Card 2', 'Card 3'].map((title, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border transition-all ${animationsEnabled ? (
                                                    hoverEffects === 'none' ? '' :
                                                        hoverEffects === 'subtle' ? 'hover:scale-105 hover:shadow-md' :
                                                            hoverEffects === 'moderate' ? 'hover:scale-110 hover:shadow-lg' :
                                                                'hover:scale-115 hover:shadow-xl hover:rotate-1'
                                                ) : ''
                                                    }`}
                                                style={{
                                                    transitionDuration: animationsEnabled ? animationSpeed : '0ms',
                                                    animationDelay: `${index * 100}ms`
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded mb-2"
                                                    style={{ backgroundColor: currentColors.primary }}
                                                ></div>
                                                <h6 className="font-medium text-gray-900 mb-1">{title}</h6>
                                                <p className="text-sm text-gray-600">
                                                    {scrollReveal !== 'none' && animationsEnabled
                                                        ? `Will ${scrollReveal} when scrolled into view`
                                                        : 'Static content display'
                                                    }
                                                </p>
                                                <button
                                                    className={`mt-2 px-3 py-1 text-sm text-white rounded transition-all ${animationsEnabled ? (
                                                        hoverEffects === 'none' ? '' :
                                                            hoverEffects === 'subtle' ? 'hover:scale-105' :
                                                                hoverEffects === 'moderate' ? 'hover:scale-110' :
                                                                    'hover:scale-115 hover:shadow-md'
                                                    ) : ''
                                                        }`}
                                                    style={{
                                                        backgroundColor: currentColors.primary,
                                                        borderRadius: buttonRadius,
                                                        transitionDuration: animationsEnabled ? animationSpeed : '0ms'
                                                    }}
                                                >
                                                    Test Button
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 text-xs text-gray-500 text-center">
                                        Current settings: {animationSpeed} speed, {hoverEffects} hover, {scrollReveal} scroll reveal
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'layout' && (
                            <div className="space-y-6">
                                <h4 className="font-medium text-gray-900">Layout Preferences</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {LAYOUT_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => updateThemeLayout('header', option.id)}
                                            className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${config.theme?.layout?.header === option.id
                                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'graphics' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">Graphics & Visual Assets</h4>

                                    {/* Sub-tabs */}
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setGraphicsSubTab('logo')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${graphicsSubTab === 'logo'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                        >
                                            Logo
                                        </button>
                                        <button
                                            onClick={() => setGraphicsSubTab('hero')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${graphicsSubTab === 'hero'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                        >
                                            Hero Image
                                        </button>
                                    </div>
                                </div>

                                {/* Logo Generator */}
                                {graphicsSubTab === 'logo' && (
                                    <LogoGenerator
                                        businessName={config.projectName || config.businessName}
                                        industry={config.industry}
                                        onLogoGenerated={handleLogoGenerated}
                                    />
                                )}

                                {/* Hero Image Generator */}
                                {graphicsSubTab === 'hero' && (
                                    <HeroImageGenerator
                                        businessContext={{
                                            businessName: config.projectName || config.businessName,
                                            industry: config.industry,
                                            businessDescription: config.description
                                        }}
                                        currentImageUrl={config.graphics?.heroImage}
                                        onImageGenerated={handleHeroImageGenerated}
                                        onError={(error) => console.error('Image generation error:', error)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>

                    {/* Full Website Preview */}
                    <WebsitePreview config={config} currentStep={1} />

                    {/* Style Information */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span>Font: {currentFont.split(',')[0]}</span>
                            <span>Size: {currentFontSize}</span>
                            <span>Button: {BUTTON_STYLES.find(s => s.value === buttonRadius)?.name || 'Custom'}</span>
                            <span>Card: {CARD_SHADOWS.find(s => s.value === cardShadow)?.name || 'Custom'} shadow</span>
                            <span>Animations: {animationsEnabled ? `${animationSpeed} ${hoverEffects}` : 'Disabled'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Colors:</span>
                            <div
                                className="w-4 h-4 rounded border transition-all duration-500"
                                style={{ backgroundColor: currentColors.primary }}
                                title="Primary Color"
                            ></div>
                            <div
                                className="w-4 h-4 rounded border transition-all duration-500"
                                style={{ backgroundColor: currentColors.secondary }}
                                title="Secondary Color"
                            ></div>
                            <span className="ml-2">
                                {selectedPalette === 'custom' ? 'Custom' : COLOR_PALETTES[selectedPalette]?.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end pt-6 border-t">
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