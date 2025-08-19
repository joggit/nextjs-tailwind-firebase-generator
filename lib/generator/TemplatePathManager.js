// lib/generator/TemplatePathManager.js
export default class TemplatePathManager {
    constructor() {
        this.basePaths = this.getBasePaths();
        this.templateSpecificPaths = {
            modern: this.getModernPaths(),
            ecommerce: this.getEcommercePaths(),
            saas: this.getSaasPaths(),
            blog: this.getBlogPaths(),
            portfolio: this.getPortfolioPaths(),
            crm: this.getCrmPaths(),
            ngo: this.getNgoPaths()
        };
    }

    /**
     * Get all template paths based on configuration
     */
    getConditionalPaths(config) {
        console.log('🔄 Building template paths for:', {
            template: config.template,
            businessName: config.businessName,
            enabledPages: Object.keys(config.pages || {}).filter(key => config.pages[key]?.enabled !== false)
        });

        // Start with base paths (always included)
        const paths = { ...this.basePaths };

        // Add core component paths
        Object.assign(paths, this.getCoreComponentPaths(config));

        // Add page paths based on configuration
        Object.assign(paths, this.getPagePaths(config));

        // Add template-specific paths
        const templatePaths = this.getTemplateSpecificPaths(config.template || 'modern');
        Object.assign(paths, templatePaths);

        // Add conditional feature paths
        Object.assign(paths, this.getFeaturePaths(config));

        console.log('✅ Generated paths:', Object.keys(paths));
        return paths;
    }

    /**
     * Base paths that are always included
     */
    getBasePaths() {
        return {
            // Configuration files
            'package.json': 'base/package.json.template',
            'tailwind.config.js': 'base/tailwind.config.js.template',
            'postcss.config.cjs': 'base/postcss.config.cjs.template',
            'next.config.mjs': 'base/next.config.mjs.template',
            'jsconfig.json': 'base/jsconfig.json.template',
            '.gitignore': 'base/.gitignore.template',

            // Core app files
            'app/layout.js': 'base/app/layout.js.template',
            'app/globals.css': 'base/app/globals.css.template',

            // Essential components
            'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
            'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',
            'components/ui/Input.jsx': 'base/components/ui/Input.jsx.template',
            'components/ui/Loading.jsx': 'base/components/ui/Loading.jsx.template'
        };
    }

    /**
     * Core component paths
     */
    getCoreComponentPaths(config) {
        const paths = {
            'components/Header.js': 'base/components/Header.js.template',
            'components/Footer.js': 'base/components/Footer.js.template'
        };

        // Add Hero component if any page uses it
        const hasHeroBlock = this.configHasBlock(config, 'hero');
        if (hasHeroBlock) {
            paths['components/Hero.js'] = 'base/components/Hero.js.template';
        }

        return paths;
    }

    /**
     * Page paths based on configuration
     */
    getPagePaths(config) {
        const paths = {};

        // Home page (always included)
        paths['app/page.js'] = 'base/app/page.js.template';

        // About page
        if (config.pages?.about?.enabled !== false) {
            paths['app/about/page.js'] = 'base/app/about/page.js.template';
        }

        // Contact page
        if (config.pages?.contact?.enabled !== false) {
            paths['app/contact/page.js'] = 'base/app/contact/page.js.template';
        }

        // Services page
        if (config.pages?.services?.enabled === true) {
            paths['app/services/page.js'] = 'base/app/services/page.js.template';
        }

        // Portfolio page
        if (config.pages?.portfolio?.enabled === true) {
            paths['app/portfolio/page.js'] = 'base/app/portfolio/page.js.template';
        }

        // Blog pages
        if (config.pages?.blog?.enabled === true) {
            paths['app/blog/page.js'] = 'base/app/blog/page.js.template';
            paths['app/blog/[slug]/page.js'] = 'base/app/blog/[slug]/page.js.template';
        }

        return paths;
    }

    /**
     * Template-specific paths
     */
    getTemplateSpecificPaths(template) {
        return this.templateSpecificPaths[template] || {};
    }

    /**
     * Modern template paths
     */
    getModernPaths() {
        return {
            // Modern-specific components
            'components/Features.js': 'base/components/Features.js.template',
            'components/Testimonials.js': 'base/components/Testimonials.js.template'
        };
    }

    /**
     * E-commerce template paths
     */
    getEcommercePaths() {
        return {
            // E-commerce core files
            'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
            'lib/cart.js': 'ecommerce/lib/cart.js.template',
            'lib/products.js': 'ecommerce/lib/products.js.template',

            // E-commerce pages
            'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
            'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
            'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
            'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',

            // E-commerce components
            'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
            'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
            'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',
            'components/CategoryFilter.jsx': 'ecommerce/components/CategoryFilter.jsx.template',

            // Override header for e-commerce
            'components/Header.js': 'ecommerce/components/Header.js.template'
        };
    }

    /**
     * SaaS template paths
     */
    getSaasPaths() {
        return {
            // SaaS-specific pages
            'app/pricing/page.js': 'saas/app/pricing/page.js.template',
            'app/features/page.js': 'saas/app/features/page.js.template',
            'app/dashboard/page.js': 'saas/app/dashboard/page.js.template',

            // SaaS components
            'components/PricingTable.jsx': 'saas/components/PricingTable.jsx.template',
            'components/FeatureList.jsx': 'saas/components/FeatureList.jsx.template',
            'components/Dashboard.jsx': 'saas/components/Dashboard.jsx.template'
        };
    }

    /**
     * Blog template paths
     */
    getBlogPaths() {
        return {
            // Blog pages
            'app/blog/page.js': 'blog/app/blog/page.js.template',
            'app/blog/[slug]/page.js': 'blog/app/blog/[slug]/page.js.template',
            'app/blog/category/[category]/page.js': 'blog/app/blog/category/[category]/page.js.template',

            // Blog components
            'components/BlogPost.jsx': 'blog/components/BlogPost.jsx.template',
            'components/BlogList.jsx': 'blog/components/BlogList.jsx.template',
            'components/BlogSidebar.jsx': 'blog/components/BlogSidebar.jsx.template',

            // Blog utilities
            'lib/blog.js': 'blog/lib/blog.js.template'
        };
    }

    /**
     * Portfolio template paths
     */
    getPortfolioPaths() {
        return {
            // Portfolio pages
            'app/portfolio/page.js': 'portfolio/app/portfolio/page.js.template',
            'app/portfolio/[slug]/page.js': 'portfolio/app/portfolio/[slug]/page.js.template',

            // Portfolio components
            'components/ProjectCard.jsx': 'portfolio/components/ProjectCard.jsx.template',
            'components/ProjectGallery.jsx': 'portfolio/components/ProjectGallery.jsx.template',
            'components/SkillsSection.jsx': 'portfolio/components/SkillsSection.jsx.template'
        };
    }

    /**
     * CRM template paths
     */
    getCrmPaths() {
        return {
            // CRM pages
            'app/dashboard/page.js': 'crm/app/dashboard/page.js.template',
            'app/contacts/page.js': 'crm/app/contacts/page.js.template',
            'app/deals/page.js': 'crm/app/deals/page.js.template',
            'app/reports/page.js': 'crm/app/reports/page.js.template',

            // CRM components
            'components/Dashboard.jsx': 'crm/components/Dashboard.jsx.template',
            'components/ContactList.jsx': 'crm/components/ContactList.jsx.template',
            'components/DealsPipeline.jsx': 'crm/components/DealsPipeline.jsx.template'
        };
    }
    /**
     * NGO template paths
     */
    getNgoPaths() {
        return {
            // NGO pages
            'app/home/page.js': 'ngo/app/home/page.js.template',
            'app/about/page.js': 'ngo/app/about/page.js.template',
            'app/donate/page.js': 'ngo/app/donate/page.js.template',
            'app/events/page.js': 'ngo/app/events/page.js.template',

            // NGO components
            'components/DonationForm.jsx': 'ngo/components/DonationForm.jsx.template',
            'components/EventList.jsx': 'ngo/components/EventList.jsx.template',
            'components/VolunteerForm.jsx': 'ngo/components/VolunteerForm.jsx.template',
            'components/Header.js': 'ngo/components/Header.js.template',
            'components/NGOFooter.jsx': 'ngo/components/NGOFooter.jsx.template',
            // NGO utilities
            'lib/ngo.js': 'ngo/lib/ngo.js.template',
            'lib/donation.js': 'ngo/lib/donation.js.template',
            'lib/event.js': 'ngo/lib/event.js.template',
            'lib/volunteer.js': 'ngo/lib/volunteer.js.template',
        };
    }

    /**
     * Feature-based paths
     */
    getFeaturePaths(config) {
        const paths = {};

        // Authentication features
        if (config.features?.includes('Authentication')) {
            paths['app/login/page.js'] = 'features/auth/login/page.js.template';
            paths['app/register/page.js'] = 'features/auth/register/page.js.template';
            paths['components/AuthForm.jsx'] = 'features/auth/components/AuthForm.jsx.template';
            paths['lib/auth.js'] = 'features/auth/lib/auth.js.template';
        }

        // User Profiles
        if (config.features?.includes('User Profiles')) {
            paths['app/profile/page.js'] = 'features/profile/page.js.template';
            paths['components/ProfileForm.jsx'] = 'features/profile/components/ProfileForm.jsx.template';
        }

        // Admin Dashboard
        if (config.features?.includes('Admin Dashboard')) {
            paths['app/admin/page.js'] = 'features/admin/page.js.template';
            paths['app/admin/users/page.js'] = 'features/admin/users/page.js.template';
            paths['components/AdminSidebar.jsx'] = 'features/admin/components/AdminSidebar.jsx.template';
        }

        // Email Integration
        if (config.features?.includes('Email Integration')) {
            paths['lib/email.js'] = 'features/email/lib/email.js.template';
            paths['components/EmailTemplate.jsx'] = 'features/email/components/EmailTemplate.jsx.template';
        }

        // Payment Processing
        if (config.features?.includes('Payment Processing')) {
            paths['lib/payments.js'] = 'features/payments/lib/payments.js.template';
            paths['components/PaymentForm.jsx'] = 'features/payments/components/PaymentForm.jsx.template';
            paths['app/checkout/success/page.js'] = 'features/payments/checkout/success/page.js.template';
        }

        // File Upload
        if (config.features?.includes('File Upload')) {
            paths['components/FileUpload.jsx'] = 'features/upload/components/FileUpload.jsx.template';
            paths['lib/upload.js'] = 'features/upload/lib/upload.js.template';
        }

        // Real-time Chat
        if (config.features?.includes('Real-time Chat')) {
            paths['components/Chat.jsx'] = 'features/chat/components/Chat.jsx.template';
            paths['lib/socket.js'] = 'features/chat/lib/socket.js.template';
        }

        // Analytics
        if (config.features?.includes('Analytics') || config.enableAnalytics) {
            paths['lib/analytics.js'] = 'features/analytics/lib/analytics.js.template';
            paths['components/Analytics.jsx'] = 'features/analytics/components/Analytics.jsx.template';
        }

        return paths;
    }

    /**
     * Helper method to check if config has a specific block
     */
    configHasBlock(config, blockType) {
        if (!config.pages) return false;

        return Object.values(config.pages).some(page => {
            if (!page.enabled || !page.blocks) return false;
            return page.blocks.includes(blockType);
        });
    }

    /**
     * Get all available template types
     */
    getAvailableTemplates() {
        return Object.keys(this.templateSpecificPaths);
    }

    /**
     * Get template-specific requirements
     */
    getTemplateRequirements(template) {
        switch (template) {
            case 'ecommerce':
                return {
                    requiredFeatures: ['Shopping Cart', 'Product Catalog', 'Payment Processing'],
                    recommendedPages: ['shop', 'cart', 'checkout'],
                    requiredEnvVars: ['STRIPE_PUBLIC_KEY', 'STRIPE_SECRET_KEY']
                };

            case 'web':
                return {
                    requiredFeatures: ['Authentication', 'User Profiles', 'Subscription Billing'],
                    recommendedPages: ['pricing', 'dashboard', 'features'],
                    requiredEnvVars: ['STRIPE_PUBLIC_KEY', 'DATABASE_URL']
                };

            case 'blog':
                return {
                    requiredFeatures: ['Content Management', 'SEO Tools'],
                    recommendedPages: ['blog'],
                    requiredEnvVars: ['CMS_API_KEY']
                };

            case 'crm':
                return {
                    requiredFeatures: ['Authentication', 'Database Integration'],
                    recommendedPages: ['dashboard', 'contacts', 'deals'],
                    requiredEnvVars: ['DATABASE_URL', 'AUTH_SECRET']
                };
            case 'NGO':
                return {
                    requiredFeatures: ['Donation Management', 'Event Management'],
                    recommendedPages: ['home', 'about', 'donate', 'events'],
                    requiredEnvVars: ['PAYPAL_CLIENT_ID', 'PAYPAL_SECRET']
                };

            default:
                return {
                    requiredFeatures: [],
                    recommendedPages: ['home', 'about', 'contact'],
                    requiredEnvVars: []
                };
        }
    }

    /**
     * Validate configuration against template requirements
     */
    validateConfiguration(config) {
        const template = config.template || 'modern';
        const requirements = this.getTemplateRequirements(template);
        const warnings = [];
        const errors = [];

        // Check required features
        requirements.requiredFeatures.forEach(feature => {
            if (!config.features?.includes(feature)) {
                warnings.push(`Template '${template}' recommends the '${feature}' feature`);
            }
        });

        // Check recommended pages
        requirements.recommendedPages.forEach(page => {
            if (!config.pages?.[page]?.enabled) {
                warnings.push(`Template '${template}' recommends enabling the '${page}' page`);
            }
        });

        // Check for required configuration
        if (template === 'ecommerce' && !config.components?.cart) {
            errors.push('E-commerce template requires cart configuration');
        }

        if (template === 'saas' && !config.blocks?.pricing) {
            warnings.push('SaaS template recommends pricing block configuration');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get debugging information
     */
    getDebugInfo(config) {
        const template = config.template || 'modern';
        const paths = this.getConditionalPaths(config);
        const validation = this.validateConfiguration(config);

        return {
            template,
            totalPaths: Object.keys(paths).length,
            pathsByType: {
                pages: Object.keys(paths).filter(p => p.startsWith('app/') && p.endsWith('/page.js')).length,
                components: Object.keys(paths).filter(p => p.startsWith('components/')).length,
                lib: Object.keys(paths).filter(p => p.startsWith('lib/')).length,
                config: Object.keys(paths).filter(p => p.includes('config') || p.includes('.json')).length
            },
            validation,
            enabledPages: Object.keys(config.pages || {}).filter(key => config.pages[key]?.enabled !== false),
            features: config.features || [],
            hasBlocks: Object.keys(config.blocks || {}).length > 0
        };
    }

    /**
     * Log debugging information
     */
    logDebugInfo(config) {
        const debug = this.getDebugInfo(config);
        console.log('🔍 TemplatePathManager Debug Info:');
        console.log('  Template:', debug.template);
        console.log('  Total Paths:', debug.totalPaths);
        console.log('  Path Breakdown:', debug.pathsByType);
        console.log('  Enabled Pages:', debug.enabledPages);
        console.log('  Features:', debug.features);
        console.log('  Validation Errors:', debug.validation.errors);
        console.log('  Validation Warnings:', debug.validation.warnings);
    }
}