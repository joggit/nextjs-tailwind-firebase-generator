// Basic Info & Theme Step Component
// File: components/generator/BasicInfoThemeStep.jsx

'use client'

import { useState } from 'react'
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
    Heart
} from 'lucide-react'

// Predefined theme options
const THEME_PRESETS = {
    corporate: {
        name: 'Corporate',
        description: 'Professional business theme',
        primaryColor: '#1E40AF',
        secondaryColor: '#FBBF24',
        fontFamily: 'Inter, sans-serif',
        preview: 'bg-gradient-to-r from-blue-700 to-amber-400'
    },
    creative: {
        name: 'Creative',
        description: 'Vibrant and artistic theme',
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        fontFamily: 'Poppins, sans-serif',
        preview: 'bg-gradient-to-r from-pink-500 to-purple-600'
    },
    minimal: {
        name: 'Minimal',
        description: 'Clean and simple theme',
        primaryColor: '#374151',
        secondaryColor: '#6B7280',
        fontFamily: 'Inter, sans-serif',
        preview: 'bg-gradient-to-r from-gray-700 to-gray-500'
    },
    tech: {
        name: 'Tech',
        description: 'Modern technology theme',
        primaryColor: '#06B6D4',
        secondaryColor: '#10B981',
        fontFamily: 'JetBrains Mono, monospace',
        preview: 'bg-gradient-to-r from-cyan-500 to-emerald-500'
    },
    custom: {
        name: 'Custom',
        description: 'Create your own theme',
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        fontFamily: 'Inter, sans-serif',
        preview: 'bg-gradient-to-r from-blue-500 to-purple-600'
    }
}

const FONT_OPTIONS = [
    { name: 'Inter', value: 'Inter, sans-serif', type: 'Sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif', type: 'Sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', type: 'Serif' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace', type: 'Monospace' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', type: 'Sans-serif' }
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

export default function BasicInfoThemeStep({ config, onChange, onNext }) {
    const [selectedThemePreset, setSelectedThemePreset] = useState('corporate')
    const [customColors, setCustomColors] = useState(false)
    const [logoLoading, setLogoLoading] = useState(false)

    // Function to get navigation items based on project type/template
    const getNavigationItems = () => {
        const template = config.template || 'modern'
        const industry = config.industry

        switch (template) {
            case 'ecommerce':
                return ['Shop', 'Categories', 'Deals', 'About']
            case 'saas':
                return ['Features', 'Pricing', 'Resources', 'Contact']
            case 'blog':
                return ['Posts', 'Categories', 'About', 'Contact']
            case 'portfolio':
                return ['Work', 'About', 'Skills', 'Contact']
            case 'crm':
                return ['Dashboard', 'Contacts', 'Reports', 'Settings']
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
        const industry = config.industry

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
            case 'blog':
                return [
                    { icon: Search, label: 'Search', badge: null },
                    { icon: User, label: 'Profile', badge: null }
                ]
            case 'portfolio':
                return [
                    { icon: Github, label: 'GitHub', badge: null },
                    { icon: LinkedIn, label: 'LinkedIn', badge: null },
                    { icon: Mail, label: 'Contact', badge: null }
                ]
            case 'crm':
                return [
                    { icon: Bell, label: 'Alerts', badge: '12' },
                    { icon: Settings, label: 'Settings', badge: null },
                    { icon: User, label: 'Profile', badge: null }
                ]
            default:
                if (industry === 'healthcare') {
                    return [
                        { icon: Phone, label: 'Emergency', badge: null },
                        { icon: User, label: 'Patient Portal', badge: null }
                    ]
                }
                if (industry === 'education') {
                    return [
                        { icon: Bell, label: 'Announcements', badge: '3' },
                        { icon: User, label: 'Student Portal', badge: null }
                    ]
                }
                if (industry === 'finance') {
                    return [
                        { icon: Bell, label: 'Alerts', badge: '2' },
                        { icon: User, label: 'Account', badge: null }
                    ]
                }
                return [
                    { icon: User, label: 'Login', badge: null }
                ]
        }
    }

    const navigationItems = getNavigationItems()
    const headerIcons = getHeaderIcons()

    const updateBasicInfo = (field, value) => {
        onChange({
            ...config,
            [field]: value,
            // Sync with backwards compatibility fields
            ...(field === 'projectName' && { businessName: value }),
            ...(field === 'description' && { businessDescription: value })
        })
    }

    const updateTheme = (field, value) => {
        onChange({
            ...config,
            theme: {
                ...config.theme,
                [field]: value
            }
        })
    }

    const updateThemeLayout = (field, value) => {
        onChange({
            ...config,
            theme: {
                ...config.theme,
                layout: {
                    ...config.theme.layout,
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
                    ...config.theme.typography,
                    [field]: value
                }
            }
        })
    }

    const applyThemePreset = (presetKey) => {
        setSelectedThemePreset(presetKey)
        if (presetKey !== 'custom') {
            const preset = THEME_PRESETS[presetKey]
            updateTheme('primaryColor', preset.primaryColor)
            updateTheme('secondaryColor', preset.secondaryColor)
            updateTheme('fontFamily', preset.fontFamily)
            setCustomColors(false)
        } else {
            setCustomColors(true)
        }
    }

    const generateLogo = async () => {
        if (!config.projectName) {
            alert('Please enter a project name first')
            return
        }

        setLogoLoading(true)

        try {
            console.log('🎨 Starting logo generation for:', config.projectName)

            const response = await fetch('/api/generate-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: config.projectName,
                    industry: config.industry || 'technology',
                    style: selectedThemePreset === 'custom' ? 'modern' : selectedThemePreset,
                    logoType: 'combination',
                    colors: `using ${config.theme?.primaryColor || '#3B82F6'} and ${config.theme?.secondaryColor || '#8B5CF6'}`
                })
            })

            const data = await response.json()
            console.log('📨 Logo API response:', data)

            if (data.success && data.logos) {
                const updatedConfig = {
                    ...config,
                    generatedLogo: {
                        primaryUrl: data.logos.primary.url,
                        simplifiedUrl: data.logos.simplified.url,
                        metadata: data.metadata
                    }
                }
                console.log('✅ Storing logo in config:', updatedConfig.generatedLogo)
                onChange(updatedConfig)
            } else {
                console.error('❌ Logo generation failed:', data.error)
                alert('Logo generation failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('❌ Logo generation error:', error)
            alert('Failed to generate logo. Please try again.')
        } finally {
            setLogoLoading(false)
        }
    }

    const isComplete = () => {
        return config.projectName &&
            config.description &&
            config.theme?.primaryColor &&
            config.theme?.secondaryColor &&
            config.theme?.fontFamily
    }
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Basic Project Information & Theme
                </h2>
                <p className="text-gray-600">
                    Let's start with the basics and choose your visual theme
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
                                <option value="saas">SaaS Platform</option>
                                <option value="blog">Blog/Content Site</option>
                                <option value="portfolio">Portfolio Site</option>
                                <option value="crm">CRM System</option>
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

                {/* Theme Selection */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-purple-600" />
                        Choose Your Theme
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => applyThemePreset(key)}
                                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${selectedThemePreset === key
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-full h-16 ${preset.preview} rounded-lg mb-3 flex items-center justify-center`}>
                                    <span className="text-white font-bold text-sm">{preset.name}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">{preset.name}</h4>
                                <p className="text-sm text-gray-600">{preset.description}</p>
                            </button>
                        ))}
                    </div>

                    {(selectedThemePreset === 'custom' || customColors) && (
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
                                            value={config.theme?.primaryColor || '#3B82F6'}
                                            onChange={(e) => updateTheme('primaryColor', e.target.value)}
                                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={config.theme?.primaryColor || '#3B82F6'}
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
                                            value={config.theme?.secondaryColor || '#8B5CF6'}
                                            onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={config.theme?.secondaryColor || '#8B5CF6'}
                                            onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Typography */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Type className="w-5 h-5 mr-2 text-green-600" />
                        Typography
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Font Family
                            </label>
                            <select
                                value={config.theme?.fontFamily || 'Inter, sans-serif'}
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
                                value={config.theme?.typography?.baseFontSize || '16px'}
                                onChange={(e) => updateTypography('baseFontSize', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="14px">Small (14px)</option>
                                <option value="16px">Medium (16px)</option>
                                <option value="18px">Large (18px)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logo Generation */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        Logo Generation
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-4">Generate a logo for your project</h4>

                        {config.generatedLogo && !logoLoading && (
                            <div className="mb-4 p-3 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={config.generatedLogo.simplifiedUrl}
                                        alt="Generated Logo"
                                        className="w-12 h-12 object-contain border rounded"
                                        onError={(e) => {
                                            console.error('❌ Logo image failed to load:', e.target.src)
                                            e.target.style.display = 'none'
                                        }}
                                        onLoad={() => {
                                            console.log('✅ Logo image loaded successfully')
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-green-700">Logo generated successfully!</p>
                                        <p className="text-xs text-gray-500">Click generate again for a new design</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={generateLogo}
                                disabled={logoLoading || !config.projectName}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {logoLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        {config.generatedLogo ? 'Regenerate Logo' : 'Generate Logo'}
                                    </>
                                )}
                            </button>

                            {logoLoading && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Creating your logo with AI... This may take 30-60 seconds
                                </div>
                            )}

                            {!logoLoading && !config.generatedLogo && (
                                <span className="text-sm text-gray-600">Generate a custom logo for your project</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Layout Options */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Layout className="w-5 h-5 mr-2 text-orange-600" />
                        Layout Preferences
                    </h3>

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

                {/* Enhanced Preview */}
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>

                    {/* Enhanced Header Preview */}
                    <div className="bg-white rounded-lg shadow-sm border mb-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b">

                            {/* Left side - Logo and Brand */}
                            <div className="flex items-center space-x-3">
                                {logoLoading ? (
                                    <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-200">
                                        <Loader className="w-4 h-4 animate-spin text-gray-500" />
                                    </div>
                                ) : config.generatedLogo ? (
                                    <img
                                        src={config.generatedLogo.simplifiedUrl}
                                        alt="Logo"
                                        className="w-8 h-8 object-contain"
                                        onError={(e) => {
                                            console.error('❌ Preview logo failed to load:', e.target.src)
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: config.theme?.primaryColor || '#3B82F6' }}
                                    >
                                        {config.projectName?.[0]?.toUpperCase() || 'L'}
                                    </div>
                                )}

                                <span
                                    className="font-bold text-gray-900"
                                    style={{ fontFamily: config.theme?.fontFamily || 'Inter, sans-serif' }}
                                >
                                    {config.projectName || 'Your Project'}
                                </span>
                            </div>

                            {/* Center - Navigation */}
                            <nav className="hidden lg:flex space-x-6 text-sm text-gray-600">
                                {navigationItems.map((item, index) => (
                                    <span
                                        key={index}
                                        className="hover:text-gray-900 cursor-pointer transition-colors"
                                        style={{ fontFamily: config.theme?.fontFamily || 'Inter, sans-serif' }}
                                    >
                                        {item}
                                    </span>
                                ))}
                            </nav>

                            {/* Right side - Action Icons */}
                            <div className="flex items-center space-x-3">
                                {headerIcons.map((iconItem, index) => {
                                    const IconComponent = iconItem.icon
                                    return (
                                        <button
                                            key={index}
                                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            title={iconItem.label}
                                        >
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                            {iconItem.badge && (
                                                <span
                                                    className="absolute -top-1 -right-1 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold"
                                                    style={{ backgroundColor: config.theme?.primaryColor || '#3B82F6' }}
                                                >
                                                    {iconItem.badge}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}

                                {/* Mobile menu button */}
                                <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Menu className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation (collapsed) */}
                        <div className="lg:hidden bg-gray-50 px-6 py-2">
                            <div className="flex space-x-4 text-sm text-gray-600 overflow-x-auto">
                                {navigationItems.slice(0, 4).map((item, index) => (
                                    <span key={index} className="whitespace-nowrap">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Project Type Indicator */}
                    {config.template && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-blue-800">
                                    Preview for: {config.template === 'modern' ? 'Modern Website' :
                                        config.template === 'ecommerce' ? 'E-commerce Store' :
                                            config.template === 'saas' ? 'SaaS Platform' :
                                                config.template === 'blog' ? 'Blog/Content Site' :
                                                    config.template === 'portfolio' ? 'Portfolio Site' :
                                                        config.template === 'crm' ? 'CRM System' : 'Website'}
                                </span>
                                <span className="text-blue-600">
                                    {headerIcons.length} action icons • {navigationItems.length} nav items
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Existing gradient preview */}
                    <div
                        className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${config.theme?.primaryColor || '#3B82F6'}, ${config.theme?.secondaryColor || '#8B5CF6'})`,
                            fontFamily: config.theme?.fontFamily || 'Inter, sans-serif'
                        }}
                    >
                        <div className="text-center text-white">
                            <h4 className="text-xl font-bold mb-2">
                                {config.projectName || 'Your Project'}
                            </h4>
                            <p className="text-sm opacity-90">
                                {config.description || 'Your project description here'}
                            </p>
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
                        <span>Next: Design Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}