// Template Path Manager - Maps project types to template files
// File: lib/generator/TemplatePathManager.js

export class TemplatePathManager {
    constructor() {
        this.templatePaths = {
            base: this.getBaseTemplatePaths(),
            ecommerce: this.getEcommerceTemplatePaths(),
            webapp: this.getWebAppTemplatePaths(),
            ngo: this.getNgoTemplatePaths()
        };
    }

    getTemplatePaths(projectType) {
        const paths = this.templatePaths[projectType];
        if (!paths) {
            console.warn(`⚠️ Unknown project type: ${projectType}, using base templates`);
            return this.templatePaths.base;
        }
        return paths;
    }

    getBaseTemplatePaths() {
        return {
            // Core Next.js files
            'next.config.mjs': 'base/next.config.mjs.template',
            'tailwind.config.js': 'base/tailwind.config.js.template',
            'postcss.config.cjs': 'base/postcss.config.cjs.template',
            'jsconfig.json': 'base/jsconfig.json.template',
            'package.json': 'base/package.json.template',
            '.gitignore': 'base/.gitignore.template',
            'README.md': 'base/README.md.template',

            // App structure
            'app/layout.js': 'base/app/layout.js.template',
            'app/globals.css': 'base/app/globals.css.template',
            'app/page.js': 'base/app/page.js.template',

            // Components
            'components/Header.js': 'base/components/Header.js.template',
            'components/Footer.js': 'base/components/Footer.js.template',
            'components/Hero.js': 'base/components/Hero.js.template',
            'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
            'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

            // Pages (conditional based on enabled pages)
            'app/about/page.js': 'base/app/about/page.js.template',
            'app/contact/page.js': 'base/app/contact/page.js.template'
        };
    }

    getEcommerceTemplatePaths() {
        return {
            // Include all base templates
            ...this.getBaseTemplatePaths(),

            // Override with ecommerce-specific templates
            'app/layout.js': 'ecommerce/app/layout.js.template',
            'app/page.js': 'ecommerce/app/page.js.template',
            'components/Header.js': 'ecommerce/components/Header.js.template',

            // Ecommerce-specific files
            'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
            'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
            'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
            'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',

            // Ecommerce components
            'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
            'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
            'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',

            // Ecommerce utilities
            'lib/cart.js': 'ecommerce/lib/cart.js.template',
            'lib/products.js': 'ecommerce/lib/products.js.template',
            'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',

            // Environment template
            '.env.local.example': 'ecommerce/config/.env.template'
        };
    }

    getWebAppTemplatePaths() {
        return {
            // Include all base templates
            ...this.getBaseTemplatePaths(),

            // WebApp-specific overrides
            'app/layout.js': 'webapp/app/layout.js.template',
            'app/page.js': 'webapp/app/page.js.template',

            // WebApp-specific pages
            'app/dashboard/page.js': 'webapp/app/dashboard/page.js.template',
            'app/login/page.js': 'webapp/app/login/page.js.template',
            'app/register/page.js': 'webapp/app/register/page.js.template',

            // WebApp components
            'components/Sidebar.jsx': 'webapp/components/Sidebar.jsx.template',
            'components/Dashboard.jsx': 'webapp/components/Dashboard.jsx.template',
            'components/AuthForm.jsx': 'webapp/components/AuthForm.jsx.template',

            // WebApp utilities
            'lib/auth.js': 'webapp/lib/auth.js.template',
            'lib/api.js': 'webapp/lib/api.js.template',

            // Environment template
            '.env.local.example': 'webapp/config/.env.template'
        };
    }

    getNgoTemplatePaths() {
        return {
            // Include all base templates
            ...this.getBaseTemplatePaths(),

            // NGO-specific overrides
            'app/page.js': 'ngo/app/page.js.template',
            'components/Header.js': 'ngo/components/Header.js.template',

            // NGO-specific pages
            'app/donate/page.js': 'ngo/app/donate/page.js.template',
            'app/volunteer/page.js': 'ngo/app/volunteer/page.js.template',
            'app/events/page.js': 'ngo/app/events/page.js.template',

            // NGO components
            'components/DonationForm.jsx': 'ngo/components/DonationForm.jsx.template',
            'components/VolunteerForm.jsx': 'ngo/components/VolunteerForm.jsx.template',
            'components/EventCard.jsx': 'ngo/components/EventCard.jsx.template',

            // NGO utilities
            'lib/donations.js': 'ngo/lib/donations.js.template',
            'lib/events.js': 'ngo/lib/events.js.template'
        };
    }

    getSupportedProjectTypes() {
        return Object.keys(this.templatePaths);
    }

    // In TemplatePathManager.js - modify this method to accept the config structure
    getConditionalPaths(config) {
        const projectType = config.template; // Use 'template' field from your config
        const basePaths = this.getTemplatePaths(projectType);
        const conditionalPaths = {};

        // Only include page templates for enabled pages
        if (config.pages) {
            Object.entries(config.pages).forEach(([pageKey, pageConfig]) => {
                if (pageConfig.enabled && pageKey !== 'home') {
                    const templatePath = `${projectType}/app/${pageKey}/page.js.template`;
                    const outputPath = `app/${pageKey}/page.js`;

                    if (this.templateExists(templatePath)) {
                        conditionalPaths[outputPath] = templatePath;
                    } else {
                        conditionalPaths[outputPath] = `base/app/${pageKey}/page.js.template`;
                    }
                }
            });
        }

        return { ...basePaths, ...conditionalPaths };
    }
    templateExists(templatePath) {
        // In a real implementation, you'd check if the file exists
        // For now, we'll assume certain templates exist
        const knownTemplates = [
            'base/app/about/page.js.template',
            'base/app/contact/page.js.template',
            'ecommerce/app/shop/page.js.template',
            'ecommerce/app/cart/page.js.template',
            'webapp/app/dashboard/page.js.template',
            'ngo/app/donate/page.js.template'
        ];

        return knownTemplates.includes(templatePath);
    }

    // Get template path with fallback logic
    getTemplateWithFallback(primaryPath, fallbackPath) {
        return this.templateExists(primaryPath) ? primaryPath : fallbackPath;
    }
}

export default TemplatePathManager;