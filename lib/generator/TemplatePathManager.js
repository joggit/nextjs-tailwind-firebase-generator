// Template Path Manager - Path Resolution
// File: lib/generator/TemplatePathManager.js

export class TemplatePathManager {
    constructor() {
        this.basePaths = {
            // Core files
            'next.config.mjs': 'base/next.config.mjs.template',
            'tailwind.config.js': 'base/tailwind.config.js.template',
            'postcss.config.cjs': 'base/postcss.config.cjs.template',
            'jsconfig.json': 'base/jsconfig.json.template',
            'package.json': 'base/package.json.template',
            '.gitignore': 'base/.gitignore.template',
            'README.md': 'base/README.md.template',

            // App files
            'app/layout.js': 'base/app/layout.js.template',
            'app/globals.css': 'base/app/globals.css.template',
            'app/page.js': 'base/app/page.js.template',

            // Components
            'components/Header.js': 'base/components/Header.js.template',
            'components/Footer.js': 'base/components/Footer.js.template',
            'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
            'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template'
        };

        this.ecommercePaths = {
            ...this.basePaths,
            // Override specific files for ecommerce
            'app/page.js': 'ecommerce/app/page.js.template',
            'package.json': 'ecommerce/config/package.json.template',
            'tailwind.config.js': 'ecommerce/config/tailwind.config.js.template',

            // Ecommerce-specific files
            'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
            'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
            'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
            'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',
            'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
            'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
            'components/Header.js': 'ecommerce/components/Header.js.template',
            'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',
            'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
            'lib/cart.js': 'ecommerce/lib/cart.js.template',
            'lib/products.js': 'ecommerce/lib/products.js.template'
        };

        this.ngoPaths = {
            ...this.basePaths,
            // NGO-specific overrides
            // 'app/page.js': 'ngo/app/page.js.template',
            'components/Header.js': 'ngo/components/Header.js.template'
        };

        this.webappPaths = {
            ...this.basePaths,
            // Web app-specific overrides
            'app/page.js': 'webapp/app/page.js.template',
            'components/Header.js': 'webapp/components/Header.js.template'
        };
    }

    getTemplatePaths(projectType) {
        switch (projectType) {
            case 'ecommerce':
                return this.ecommercePaths;
            case 'ngo':
                return this.ngoPaths;
            case 'webapp':
                return this.webappPaths;
            case 'base':
            default:
                return this.basePaths;
        }
    }

    getSupportedProjectTypes() {
        return ['base', 'ecommerce', 'ngo', 'webapp'];
    }

    getRequiredFiles(projectType) {
        const paths = this.getTemplatePaths(projectType);
        return Object.keys(paths);
    }

    getTemplateFile(projectType, outputPath) {
        const paths = this.getTemplatePaths(projectType);
        return paths[outputPath];
    }
}

export default TemplatePathManager;