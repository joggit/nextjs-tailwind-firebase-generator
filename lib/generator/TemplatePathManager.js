// Template Path Manager for form-based project generation
// File: lib/generator/TemplatePathManager.js

export class TemplatePathManager {
    constructor() {
        this.templatePaths = {
            base: this.getBaseTemplatePaths(),
            ecommerce: this.getEcommerceTemplatePaths(),
            webapp: this.getWebappTemplatePaths(),
            ngo: this.getNgoTemplatePaths()
        };
    }

    getTemplatePaths(projectType) {
        const paths = this.templatePaths[projectType] || this.templatePaths.base;
        console.log(`📂 Using template paths for: ${projectType}`);
        return paths;
    }

    getBaseTemplatePaths() {
        return {
            // Core Next.js files
            'package.json': 'base/package.json.template',
            'next.config.mjs': 'base/next.config.mjs.template',
            'tailwind.config.js': 'base/tailwind.config.js.template',
            'postcss.config.cjs': 'base/postcss.config.cjs.template',
            'jsconfig.json': 'base/jsconfig.json.template',
            '.gitignore': 'base/.gitignore.template',

            // App structure
            'app/layout.js': 'base/app/layout.js.template',
            'app/globals.css': 'base/app/globals.css.template',
            'app/page.js': 'base/app/page.js.template',

            // Generated pages
            'app/about/page.js': 'base/app/about/page.js.template',
            'app/contact/page.js': 'base/app/contact/page.js.template',

            // Components
            'components/Header.js': 'base/components/Header.js.template',
            'components/Footer.js': 'base/components/Footer.js.template',
            'components/Hero.js': 'base/components/Hero.js.template',
            'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
            'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

            // Documentation
            'README.md': 'base/README.md.template'
        };
    }

    getEcommerceTemplatePaths() {
        return {
            // Inherit base templates
            ...this.getBaseTemplatePaths(),

            // Override with ecommerce-specific templates
            'app/page.js': 'ecommerce/app/page.js.template',
            'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
            'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
            'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
            'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',

            // Ecommerce components
            'components/Header.js': 'ecommerce/components/Header.js.template',
            'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
            'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',
            'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',

            // Ecommerce utilities
            'lib/cart.js': 'ecommerce/lib/cart.js.template',
            'lib/products.js': 'ecommerce/lib/products.js.template',
            'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template'
        };
    }

    getWebappTemplatePaths() {
        return {
            // Inherit base templates
            ...this.getBaseTemplatePaths(),

            // Override with webapp-specific templates
            'app/page.js': 'webapp/app/page.js.template',
            'app/dashboard/page.js': 'webapp/app/dashboard/page.js.template',
            'app/auth/login/page.js': 'webapp/app/auth/login/page.js.template',
            'app/auth/register/page.js': 'webapp/app/auth/register/page.js.template',

            // Webapp components
            'components/Header.js': 'webapp/components/Header.js.template',
            'components/Sidebar.jsx': 'webapp/components/Sidebar.jsx.template',
            'components/Dashboard.jsx': 'webapp/components/Dashboard.jsx.template',
            'components/AuthForm.jsx': 'webapp/components/AuthForm.jsx.template',

            // Webapp utilities
            'lib/auth.js': 'webapp/lib/auth.js.template',
            'lib/api.js': 'webapp/lib/api.js.template'
        };
    }

    getNgoTemplatePaths() {
        return {
            // Inherit base templates
            ...this.getBaseTemplatePaths(),

            // Override with NGO-specific templates
            'app/page.js': 'ngo/app/page.js.template',
            'app/donate/page.js': 'ngo/app/donate/page.js.template',
            'app/volunteer/page.js': 'ngo/app/volunteer/page.js.template',
            'app/programs/page.js': 'ngo/app/programs/page.js.template',

            // NGO components
            'components/Header.js': 'ngo/components/Header.js.template',
            'components/DonationForm.jsx': 'ngo/components/DonationForm.jsx.template',
            'components/VolunteerSignup.jsx': 'ngo/components/VolunteerSignup.jsx.template',
            'components/ProgramCard.jsx': 'ngo/components/ProgramCard.jsx.template',

            // NGO utilities
            'lib/donations.js': 'ngo/lib/donations.js.template',
            'lib/volunteers.js': 'ngo/lib/volunteers.js.template'
        };
    }

    getSupportedProjectTypes() {
        return Object.keys(this.templatePaths);
    }

    addCustomTemplatePath(projectType, outputPath, templatePath) {
        if (!this.templatePaths[projectType]) {
            this.templatePaths[projectType] = {};
        }
        this.templatePaths[projectType][outputPath] = templatePath;
    }

    getTemplatePathsForPages(projectType, enabledPages) {
        const basePaths = this.getTemplatePaths(projectType);
        const filteredPaths = {};

        // Always include core files
        const coreFiles = [
            'package.json', 'next.config.mjs', 'tailwind.config.js',
            'postcss.config.cjs', 'jsconfig.json', '.gitignore',
            'app/layout.js', 'app/globals.css'
        ];

        coreFiles.forEach(file => {
            if (basePaths[file]) {
                filteredPaths[file] = basePaths[file];
            }
        });

        // Always include components
        Object.keys(basePaths).forEach(path => {
            if (path.startsWith('components/') || path.startsWith('lib/')) {
                filteredPaths[path] = basePaths[path];
            }
        });

        // Include pages based on enabled pages
        enabledPages.forEach(page => {
            const pagePath = page.path === '/' ? 'app/page.js' : `app${page.path}/page.js`;
            if (basePaths[pagePath]) {
                filteredPaths[pagePath] = basePaths[pagePath];
            }
        });

        // Include README
        if (basePaths['README.md']) {
            filteredPaths['README.md'] = basePaths['README.md'];
        }

        return filteredPaths;
    }
}

export default TemplatePathManager;