// Enhanced TemplatePaths.js
import { TemplateLoader } from './TemplateLoader.js';

const templateLoader = new TemplateLoader();

export const BASE_TEMPLATE_PATHS = {
  // Base Next.js files
  'next.config.mjs': 'base/next.config.mjs.template',
  'tailwind.config.js': 'base/tailwind.config.js.template',
  'postcss.config.cjs': 'base/postcss.config.cjs.template',
  'jsconfig.json': 'base/jsconfig.json.template',
  'package.json': 'base/package.json.template',

  // Base app files
  'app/layout.js': 'base/app/layout.js.template',
  'app/globals.css': 'base/app/globals.css.template',
  'app/page.js': 'base/app/page.js.template',

  // Page templates
  'app/about/page.js': 'base/app/about/page.js.template',
  'app/services/page.js': 'base/app/services/page.js.template',
  'app/contact/page.js': 'base/app/contact/page.js.template',

  // Design-aware components
  'components/Header.js': 'base/components/Header.js.template',
  'components/Footer.js': 'base/components/Footer.js.template',
  'components/Hero.jsx': 'base/components/Hero.jsx.template',
  'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
  'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

  // Base configuration
  '.gitignore': 'base/.gitignore.template',
  'README.md': 'base/README.md.template'
};

export const ECOMMERCE_TEMPLATE_PATHS = {
  // Include all base templates first
  ...BASE_TEMPLATE_PATHS,
  
  // Override with ecommerce-specific templates
  'app/layout.js': 'ecommerce/app/layout.js.template',
  'app/page.js': 'ecommerce/app/page.js.template',
  'components/Header.js': 'ecommerce/components/Header.js.template',
  
  // Ecommerce-specific files
  'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
  'lib/cart.js': 'ecommerce/lib/cart.js.template',
  'lib/products.js': 'ecommerce/lib/products.js.template',

  // Ecommerce pages
  'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
  'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
  'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
  'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',

  // Ecommerce components
  'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
  'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
  'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',

  // Configuration overrides
  'package.json': 'ecommerce/config/package.json.template',
  '.env.local.example': 'ecommerce/config/.env.template',
  'tailwind.config.js': 'ecommerce/config/tailwind.config.js.template'
};

/**
 * Load base templates with design configuration
 */
export async function loadBaseTemplates(config) {
  console.log('📁 Loading base templates with design system...');

  const templateConfig = {
    // Business info
    businessName: config.businessName || 'Your Business',
    industry: config.industry || 'business',
    businessType: config.businessType || 'company',
    targetAudience: config.targetAudience || 'customers',
    businessDescription: config.businessDescription || 'Professional services',
    
    // Design configuration - this gets processed by TemplateLoader
    design: {
      theme: config.design?.theme || 'modern',
      layout: config.design?.layout || 'standard',
      heroStyle: config.design?.heroStyle || 'centered'
    },
    
    // Meta
    currentYear: new Date().getFullYear()
  };

  console.log('🎨 Design config:', templateConfig.design);

  return await templateLoader.loadTemplates(BASE_TEMPLATE_PATHS, templateConfig);
}

/**
 * Load ecommerce templates with design configuration
 */
export async function loadEcommerceTemplates(config) {
  console.log('📁 Loading ecommerce templates with design system...');

  const templateConfig = {
    // Business info
    businessName: config.businessName || 'Your Store',
    industry: config.industry || 'retail',
    businessType: config.businessType || 'ecommerce',
    targetAudience: config.targetAudience || 'customers',
    businessDescription: config.businessDescription || 'Quality products online',
    
    // Ecommerce features
    enableCheckout: config.enableCheckout !== false,
    enableUserAccounts: config.enableUserAccounts !== false,
    enableWishlist: config.enableWishlist !== false,
    
    // Design configuration
    design: {
      theme: config.design?.theme || 'modern',
      layout: config.design?.layout || 'standard',
      heroStyle: config.design?.heroStyle || 'centered'
    },
    
    // Meta
    currentYear: new Date().getFullYear()
  };

  console.log('🎨 Ecommerce design config:', templateConfig.design);

  return await templateLoader.loadTemplates(ECOMMERCE_TEMPLATE_PATHS, templateConfig);
}

/**
 * Get available design themes
 */
export function getAvailableThemes() {
  return templateLoader.getAvailableThemes();
}

/**
 * Get theme configuration
 */
export function getThemeConfig(themeName) {
  return templateLoader.getThemeConfig(themeName);
}

export { templateLoader };