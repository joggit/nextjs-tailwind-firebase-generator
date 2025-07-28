import React from 'react'
import {
    Menu,
    Search,
    ShoppingCart,
    User,
    Bell,
    Heart,
    Settings,
    Phone,
    Mail,
    MapPin,
    Github,
    Twitter,
    Facebook,
    Instagram,
    Star,
    Play,
    Download,
    ExternalLink
} from 'lucide-react'

const WebsitePreview = ({ config, currentStep = 1, previewMode = 'full', selectedPage = 'home' }) => {
    // Get current colors with fallbacks
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

    // Animation settings
    const animationSpeed = config.animations?.transition || '300ms'
    const hoverEffects = config.animations?.hoverEffects || 'moderate'
    const animationsEnabled = config.animations?.enabled !== false

    // Get current page data
    const currentPageId = selectedPage || config?.selectedPage || 'home'
    const currentPage = config?.pages?.[currentPageId] || config?.currentPageData || {}
    const currentPageBlocks = config?.blocks?.[currentPageId] || {}
    const pageBlocks = currentPage.blocks || []

    console.log('WebsitePreview Debug:', {
        currentPageId,
        currentPage,
        currentPageBlocks,
        pageBlocks,
        configBlocks: config?.blocks
    }) // Add this for debugging


    // Get navigation items based on config or template
    const getNavigationItems = () => {
        if (config.header?.menuItems?.length > 0) {
            // Check if it's the new format with objects or old format with strings
            if (typeof config.header.menuItems[0] === 'object') {
                return config.header.menuItems // Already in the right format from PagesContentStep
            } else {
                return config.header.menuItems.map(item => item.label || item)
            }
        }

        const template = config.template || 'modern'
        switch (template) {
            case 'ecommerce':
                return ['Shop', 'Categories', 'Deals', 'About', 'Contact']
            case 'saas':
                return ['Features', 'Pricing', 'Resources', 'Support', 'Contact']
            case 'blog':
                return ['Posts', 'Categories', 'About', 'Archive', 'Contact']
            case 'portfolio':
                return ['Work', 'About', 'Skills', 'Experience', 'Contact']
            case 'crm':
                return ['Dashboard', 'Contacts', 'Deals', 'Reports', 'Settings']
            default:
                return ['Home', 'About', 'Services', 'Portfolio', 'Contact']
        }
    }

    // Get header action icons based on template
    const getHeaderIcons = () => {
        if (config.header?.actionIcons?.length > 0) {
            return config.header.actionIcons.map(icon => ({
                ...icon,
                icon: getIconComponent(icon.icon)
            }))
        }

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
            case 'crm':
                return [
                    { icon: Bell, label: 'Notifications', badge: '12' },
                    { icon: Search, label: 'Search', badge: null },
                    { icon: User, label: 'Profile', badge: null }
                ]
            default:
                return [
                    { icon: User, label: 'Login', badge: null }
                ]
        }
    }

    // Helper function to get icon component from string
    const getIconComponent = (iconName) => {
        const iconMap = {
            'Search': Search,
            'ShoppingCart': ShoppingCart,
            'User': User,
            'Bell': Bell,
            'Heart': Heart,
            'Settings': Settings,
            'Phone': Phone,
            'Mail': Mail
        }
        return iconMap[iconName] || User
    }

    const navigationItems = getNavigationItems()
    const headerIcons = getHeaderIcons()

    // Get shadow class
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

    // Get header layout classes
    const getHeaderLayoutClasses = () => {
        const layout = config.header?.layout || 'left-aligned'
        switch (layout) {
            case 'centered':
                return 'justify-center'
            case 'split':
                return 'justify-between'
            case 'stacked':
                return 'flex-col space-y-3'
            default:
                return 'justify-between'
        }
    }

    // Get footer sections
    const getFooterSections = () => {
        if (config.footer?.sections) {
            return config.footer.sections
        }

        const layout = config.footer?.layout || 'simple'
        const template = config.template || 'modern'

        switch (layout) {
            case 'simple':
                return {
                    main: {
                        title: 'Links',
                        links: [
                            { label: 'Privacy Policy', link: '/privacy' },
                            { label: 'Terms of Service', link: '/terms' }
                        ]
                    }
                }
            case 'three-column':
                return {
                    company: {
                        title: 'Company',
                        links: [
                            { label: 'About Us', link: '/about' },
                            { label: 'Careers', link: '/careers' },
                            { label: 'Contact', link: '/contact' }
                        ]
                    },
                    products: {
                        title: template === 'ecommerce' ? 'Shop' : 'Products',
                        links: [
                            { label: 'Features', link: '/features' },
                            { label: 'Pricing', link: '/pricing' },
                            { label: 'Support', link: '/support' }
                        ]
                    },
                    legal: {
                        title: 'Legal',
                        links: [
                            { label: 'Privacy Policy', link: '/privacy' },
                            { label: 'Terms of Service', link: '/terms' }
                        ]
                    }
                }
            case 'four-column':
                return {
                    company: {
                        title: 'Company',
                        links: [
                            { label: 'About Us', link: '/about' },
                            { label: 'Careers', link: '/careers' }
                        ]
                    },
                    products: {
                        title: 'Products',
                        links: [
                            { label: 'Features', link: '/features' },
                            { label: 'Pricing', link: '/pricing' }
                        ]
                    },
                    support: {
                        title: 'Support',
                        links: [
                            { label: 'Help Center', link: '/help' },
                            { label: 'Contact Us', link: '/contact' }
                        ]
                    },
                    legal: {
                        title: 'Legal',
                        links: [
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
    const footerLayout = config.footer?.layout || 'simple'

    // Process template placeholders
    const processPlaceholder = (text) => {
        if (!text) return ''
        return text
            .replace(/\{\{businessName\}\}/g, config.businessName || config.projectName || 'Your Business')
            .replace(/\{\{industry\}\}/g, config.industry || 'business')
    }

    // Render individual blocks based on type
    const renderBlock = (blockType, blockData, index) => {
        switch (blockType) {
            case 'hero':
                return (
                    <div
                        key={`${blockType}-${index}`}
                        className="px-6 py-12 text-center transition-all duration-500"
                        style={{
                            background: config.graphics?.heroImage
                                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.graphics.heroImage})`
                                : `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            fontFamily: currentFont
                        }}
                    >
                        <h1
                            className="text-2xl md:text-4xl font-bold mb-4 transition-all duration-500"
                            style={{
                                fontFamily: currentFont,
                                color: config.graphics?.heroImage ? '#FFFFFF' : currentColors.text
                            }}
                        >
                            {processPlaceholder(blockData.title) || `Welcome to ${config.businessName || config.projectName}`}
                        </h1>
                        <p
                            className="text-base md:text-lg mb-8 max-w-2xl mx-auto transition-all duration-500"
                            style={{
                                fontFamily: currentFont,
                                color: config.graphics?.heroImage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
                                fontSize: `calc(${currentFontSize} + 2px)`
                            }}
                        >
                            {processPlaceholder(blockData.subtitle) || config.description || `Professional ${config.industry || 'business'} solutions`}
                        </p>
                        {blockData.buttonText && (
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <button
                                    className={`px-6 py-3 font-semibold transition-all ${animationsEnabled ? (
                                        hoverEffects === 'none' ? '' :
                                            hoverEffects === 'subtle' ? 'hover:scale-105' :
                                                hoverEffects === 'moderate' ? 'hover:scale-110 hover:shadow-lg' :
                                                    'hover:scale-115 hover:shadow-xl'
                                    ) : ''
                                        }`}
                                    style={{
                                        backgroundColor: config.graphics?.heroImage ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
                                        color: currentColors.primary,
                                        fontFamily: currentFont,
                                        borderRadius: buttonRadius,
                                        transitionDuration: animationsEnabled ? animationSpeed : '0ms'
                                    }}
                                >
                                    {blockData.buttonText}
                                </button>
                            </div>
                        )}
                    </div>
                )

            case 'features':
                const features = blockData.items || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-white transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Our Features'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features.map((feature, featureIndex) => (
                                <div
                                    key={featureIndex}
                                    className={`p-6 rounded-lg border transition-all ${getShadowClass(cardShadow)} ${animationsEnabled ? (
                                        hoverEffects === 'none' ? '' :
                                            hoverEffects === 'subtle' ? 'hover:scale-105 hover:shadow-md' :
                                                hoverEffects === 'moderate' ? 'hover:scale-105 hover:shadow-lg' :
                                                    'hover:scale-110 hover:shadow-xl hover:-rotate-1'
                                    ) : ''
                                        }`}
                                    style={{
                                        borderColor: currentColors.primary + '20',
                                        fontFamily: currentFont,
                                        transitionDuration: animationsEnabled ? animationSpeed : '0ms'
                                    }}
                                >
                                    <div className="flex items-center mb-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-all duration-500 mr-4"
                                            style={{ backgroundColor: currentColors.primary }}
                                        >
                                            {feature.icon || (featureIndex + 1)}
                                        </div>
                                        <h3
                                            className="font-semibold text-lg transition-all duration-500"
                                            style={{
                                                color: currentColors.primary,
                                                fontFamily: currentFont
                                            }}
                                        >
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p
                                        className="text-gray-600 transition-all duration-500"
                                        style={{
                                            fontFamily: currentFont,
                                            fontSize: currentFontSize
                                        }}
                                    >
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'team':
                const members = blockData.members || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-gray-50 transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Meet Our Team'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {members.map((member, memberIndex) => (
                                <div key={memberIndex} className="bg-white p-6 rounded-lg shadow-sm text-center">
                                    {member.image && (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                                        />
                                    )}
                                    <h3 className="text-xl font-semibold mb-1" style={{ color: currentColors.primary }}>
                                        {member.name}
                                    </h3>
                                    <p className="text-blue-600 mb-3 font-medium">{member.role}</p>
                                    <p className="text-gray-600 text-sm">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'testimonials':
                const testimonials = blockData.testimonials || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-white transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'What Our Clients Say'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, testimonialIndex) => (
                                <div key={testimonialIndex} className="bg-gray-50 p-6 rounded-lg">
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, starIndex) => (
                                            <Star
                                                key={starIndex}
                                                className={`w-4 h-4 ${starIndex < (testimonial.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                                    <div className="flex items-center">
                                        {testimonial.image && (
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-10 h-10 rounded-full mr-3 object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-600">{testimonial.company}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'stats':
                const stats = blockData.stats || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8" style={{ backgroundColor: currentColors.primary, fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white" style={{ fontFamily: currentFont }}>
                                {blockData.title || 'Our Impact'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {stats.map((stat, statIndex) => (
                                <div key={statIndex} className="text-center text-white">
                                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-white/80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'services':
                const services = blockData.services || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-white transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Our Services'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.map((service, serviceIndex) => (
                                <div key={serviceIndex} className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: currentColors.primary }}>
                                        {service.name}
                                    </h3>
                                    <p className="text-gray-700 mb-4">{service.description}</p>
                                    {service.price && (
                                        <p className="text-lg font-bold" style={{ color: currentColors.secondary }}>
                                            Starting at {service.price}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'contactInfo':
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-gray-50 transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Get In Touch'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {blockData.address && (
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: currentColors.primary }} />
                                    <h3 className="font-semibold mb-2">Address</h3>
                                    <p className="text-gray-600 text-sm">{blockData.address}</p>
                                </div>
                            )}
                            {blockData.phone && (
                                <div className="text-center">
                                    <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: currentColors.primary }} />
                                    <h3 className="font-semibold mb-2">Phone</h3>
                                    <p className="text-gray-600 text-sm">{blockData.phone}</p>
                                </div>
                            )}
                            {blockData.email && (
                                <div className="text-center">
                                    <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: currentColors.primary }} />
                                    <h3 className="font-semibold mb-2">Email</h3>
                                    <p className="text-gray-600 text-sm">{blockData.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 'gallery':
                const images = blockData.images || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-white transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Gallery'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className={`grid gap-4 ${blockData.layout === 'masonry' ? 'columns-1 md:columns-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                            {images.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative group overflow-hidden rounded-lg">
                                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                                        {image.url ? (
                                            <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400">Image {imageIndex + 1}</span>
                                        )}
                                    </div>
                                    {image.title && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                                            <h4 className="font-semibold">{image.title}</h4>
                                            {image.description && (
                                                <p className="text-sm text-white/80">{image.description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'pricing':
                const plans = blockData.plans || []
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-gray-50 transition-all duration-500" style={{ fontFamily: currentFont }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: currentColors.primary, fontFamily: currentFont }}>
                                {blockData.title || 'Our Pricing'}
                            </h2>
                            {blockData.subtitle && (
                                <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: currentFont }}>
                                    {blockData.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {plans.map((plan, planIndex) => (
                                <div
                                    key={planIndex}
                                    className={`bg-white rounded-lg p-6 border-2 ${plan.recommended ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
                                >
                                    {plan.recommended && (
                                        <div className="text-center mb-4">
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Recommended
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <div className="text-3xl font-bold mb-1" style={{ color: currentColors.primary }}>
                                            {plan.price}
                                        </div>
                                        <div className="text-gray-600 text-sm">{plan.period}</div>
                                    </div>
                                    {plan.features && (
                                        <div className="mb-6">
                                            {plan.features.split(',').map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center mb-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-3">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                    <span className="text-gray-700 text-sm">{feature.trim()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        className="w-full py-2 px-4 rounded-lg font-semibold transition-colors"
                                        style={{
                                            backgroundColor: plan.recommended ? currentColors.primary : 'transparent',
                                            color: plan.recommended ? '#FFFFFF' : currentColors.primary,
                                            border: `2px solid ${currentColors.primary}`
                                        }}
                                    >
                                        {plan.ctaText || 'Get Started'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            default:
                return (
                    <div key={`${blockType}-${index}`} className="px-6 py-8 bg-gray-100 text-center">
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            {blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block
                        </h3>
                        <p className="text-sm text-gray-500">
                            Block content will appear here when configured
                        </p>
                    </div>
                )
        }
    }

    // Render page content based on selected page and its blocks
    const renderPageContent = () => {
        if (pageBlocks.length === 0) {
            return (
                <div className="px-6 py-20 text-center bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: currentFont }}>
                        {currentPage.title || 'Page'} Content
                    </h2>
                    <p className="text-gray-600" style={{ fontFamily: currentFont }}>
                        No blocks have been added to this page yet.
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        Page ID: {currentPageId} | Blocks available: {Object.keys(currentPageBlocks).length}
                    </div>
                </div>
            )
        }

        return (
            <main className="flex-grow">
                {pageBlocks.map((blockId, index) => {
                    const blockData = currentPageBlocks[blockId] || {}
                    console.log(`Rendering block ${blockId}:`, blockData) // Debug log
                    return renderBlock(blockId, blockData, index)
                })}
            </main>
        )
    }

    // Get step name
    const getStepName = (step) => {
        switch (step) {
            case 1: return 'Basic Info & Theme'
            case 2: return 'Header & Footer'
            case 3: return 'Pages & Content'
            case 4: return 'Final Review'
            default: return 'Configuration'
        }
    }

    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Website Preview</h3>
                <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                        {currentPage.title || selectedPage}
                    </div>
                    <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                        Step {currentStep} - {getStepName(currentStep)}
                    </div>
                </div>
            </div>

            {/* Full Website Preview */}
            <div className="bg-white rounded-lg shadow-lg border overflow-hidden min-h-screen flex flex-col">
                {/* Header Preview */}
                <div
                    className={`flex items-center px-6 py-3 border-b transition-all duration-500 flex-shrink-0 ${getHeaderLayoutClasses()}`}
                    style={{
                        backgroundColor: currentColors.primary,
                        fontFamily: currentFont,
                        fontSize: currentFontSize
                    }}
                >
                    {/* Logo Section */}
                    {config.header?.layout !== 'centered' && (
                        <div className="flex items-center space-x-3">
                            {config.graphics?.currentLogo ? (
                                <img
                                    src={config.graphics.currentLogo}
                                    alt="Logo"
                                    className="w-8 h-8 object-contain"
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    {(config.projectName || config.businessName)?.[0]?.toUpperCase() || 'L'}
                                </div>
                            )}
                            <span
                                className="font-bold transition-all duration-500"
                                style={{
                                    fontFamily: currentFont,
                                    color: currentColors.text
                                }}
                            >
                                {config.projectName || config.businessName || 'Your Project'}
                            </span>
                        </div>
                    )}

                    {/* Navigation */}
                    {config.header?.layout !== 'stacked' && config.header?.layout !== 'centered' && (
                        <>
                            <nav className="hidden lg:flex space-x-6 text-sm mx-auto">
                                {navigationItems.slice(0, 5).map((item, index) => {
                                    const isObject = typeof item === 'object'
                                    const label = isObject ? item.label : item
                                    const link = isObject ? item.link : `/${item.toLowerCase()}`
                                    const active = isObject ? item.active : false

                                    return (
                                        <span
                                            key={index}
                                            onClick={() => {
                                                if (config.header?.onNavClick) {
                                                    config.header.onNavClick(link)
                                                }
                                            }}
                                            className={`cursor-pointer transition-all duration-200 ${active
                                                ? 'opacity-100 font-semibold'
                                                : 'opacity-75 hover:opacity-100'
                                                }`}
                                            style={{
                                                fontFamily: currentFont,
                                                color: currentColors.text,
                                                textDecoration: active ? 'underline' : 'none',
                                                textUnderlineOffset: '4px'
                                            }}
                                        >
                                            {label}
                                        </span>
                                    )
                                })}
                            </nav>

                            {/* Header Icons */}
                            <div className="flex items-center space-x-2">
                                {headerIcons.slice(0, 3).map((iconItem, index) => {
                                    const IconComponent = iconItem.icon
                                    return (
                                        <button
                                            key={index}
                                            className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                                            style={{
                                                color: currentColors.text,
                                                backgroundColor: 'rgba(255,255,255,0.1)'
                                            }}
                                            title={iconItem.label}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            {iconItem.badge && (
                                                <span
                                                    className="absolute -top-1 -right-1 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]"
                                                    style={{ backgroundColor: currentColors.secondary }}
                                                >
                                                    {iconItem.badge}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}

                                <button
                                    className="lg:hidden p-2 rounded-lg transition-all duration-300"
                                    style={{
                                        color: currentColors.text,
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Menu className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Page Content */}
                {renderPageContent()}

                {/* Footer Preview */}
                <div
                    className="px-6 py-6 bg-gray-900 text-white transition-all duration-500 flex-shrink-0"
                    style={{ fontFamily: currentFont }}
                >
                    {footerLayout === 'simple' ? (
                        <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-4 sm:space-y-0">
                            <span>
                                {config.footer?.copyright || `© ${new Date().getFullYear()} ${config.projectName || config.businessName || 'Your Company'}. All rights reserved.`}
                            </span>
                            <div className="flex space-x-6">
                                {footerSections.main?.links?.slice(0, 3).map((link, index) => (
                                    <span key={index} className="text-gray-300 hover:text-white cursor-pointer transition-colors">
                                        {link.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className={`grid grid-cols-2 ${footerLayout === 'four-column' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                                {Object.entries(footerSections).map(([sectionKey, section]) => (
                                    <div key={sectionKey}>
                                        <h4 className="font-semibold mb-3 text-sm">{section.title}</h4>
                                        <div className="space-y-2 text-xs text-gray-300">
                                            {section.links?.slice(0, 4).map((link, index) => (
                                                <div key={index} className="hover:text-white cursor-pointer transition-colors">
                                                    {link.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Social Media Section */}
                                {config.footer?.showSocial !== false && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-sm">Follow Us</h4>
                                        <div className="flex space-x-3">
                                            {[Facebook, Twitter, Instagram].map((Icon, index) => (
                                                <button
                                                    key={index}
                                                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                                                    style={{ color: currentColors.text }}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Copyright */}
                            <div className="pt-6 border-t border-gray-700 text-xs text-center text-gray-400">
                                {config.footer?.copyright || `© ${new Date().getFullYear()} ${config.projectName || config.businessName || 'Your Company'}. All rights reserved.`}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Configuration Summary */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-600 bg-white p-3 rounded border space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Page: <strong>{currentPage.title || selectedPage}</strong></span>
                    <span>Blocks: <strong>{pageBlocks.length}</strong></span>
                    <span>Template: <strong>{config.template || 'Modern'}</strong></span>
                    <span>Font: <strong>{currentFont.split(',')[0]}</strong></span>
                    {config.industry && <span>Industry: <strong>{config.industry}</strong></span>}
                </div>
                <div className="flex items-center space-x-2">
                    <span>Colors:</span>
                    <div
                        className="w-3 h-3 rounded border transition-all duration-500"
                        style={{ backgroundColor: currentColors.primary }}
                        title="Primary Color"
                    ></div>
                    <div
                        className="w-3 h-3 rounded border transition-all duration-500"
                        style={{ backgroundColor: currentColors.secondary }}
                        title="Secondary Color"
                    ></div>
                    <div
                        className="w-3 h-3 rounded border transition-all duration-500"
                        style={{ backgroundColor: currentColors.accent }}
                        title="Accent Color"
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default WebsitePreview