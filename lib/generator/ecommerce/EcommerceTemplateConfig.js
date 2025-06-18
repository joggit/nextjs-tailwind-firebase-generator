import { TemplateLoader } from '../TemplateLoader.js';

const templateLoader = new TemplateLoader();

export const ECOMMERCE_TEMPLATE_PATHS = {
  // Core ecommerce files
  'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
  'lib/ecommerce/cart.js': 'ecommerce/lib/cart.js.template',
  'lib/ecommerce/products.js': 'ecommerce/lib/products.js.template',
  
  // Ecommerce pages
  'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
  'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
  'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
  'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',
  
  // Ecommerce components
  'components/ecommerce/ProductCard.jsx': 'ecommerce/components/ecommerce/ProductCard.jsx.template',
  'components/ecommerce/AddToCartButton.jsx': 'ecommerce/components/ecommerce/AddToCartButton.jsx.template',
  'components/ecommerce/ShoppingCart.jsx': 'ecommerce/components/ecommerce/ShoppingCart.jsx.template',
  
  // Configuration files
  'package.json': 'ecommerce/config/package.json.template',
  '.env.local.example': 'ecommerce/config/.env.local.example.template'
};

export const BASE_TEMPLATE_PATHS = {
  // Base Next.js files
  'next.config.mjs': 'base/next.config.mjs.template',
  'tailwind.config.js': 'base/tailwind.config.js.template',
  'postcss.config.js': 'base/postcss.config.js.template',
  'jsconfig.json': 'base/jsconfig.json.template',
  
  // Base app files
  'app/layout.js': 'base/app/layout.js.template',
  'app/globals.css': 'base/app/globals.css.template',
  
  // Base components
  'components/Header.js': 'base/components/Header.js.template',
  'components/Footer.js': 'base/components/Footer.js.template',
  'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
  'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',
  
  // Base configuration
  '.gitignore': 'base/.gitignore.template',
  'README.md': 'base/README.md.template'
};

/**
 * Load ecommerce templates with config
 */
export async function loadEcommerceTemplates(config) {
  console.log('📁 Loading ecommerce templates...');
  
  const templateConfig = {
    businessName: config.businessName || 'Your Store',
    industry: config.industry || 'retail',
    businessType: config.businessType || 'ecommerce',
    targetAudience: config.targetAudience || 'customers',
    businessDescription: config.businessDescription || 'Quality products online',
    enableCheckout: config.enableCheckout !== false,
    enableUserAccounts: config.enableUserAccounts !== false,
    enableWishlist: config.enableWishlist !== false,
    currentYear: new Date().getFullYear()
  };

  return await templateLoader.loadTemplates(ECOMMERCE_TEMPLATE_PATHS, templateConfig);
}

/**
 * Load base templates with config
 */
export async function loadBaseTemplates(config) {
  console.log('📁 Loading base templates...');
  
  const templateConfig = {
    businessName: config.businessName || 'Your Business',
    industry: config.industry || 'business',
    businessType: config.businessType || 'company',
    targetAudience: config.targetAudience || 'customers',
    businessDescription: config.businessDescription || 'Professional services',
    currentYear: new Date().getFullYear()
  };

  return await templateLoader.loadTemplates(BASE_TEMPLATE_PATHS, templateConfig);
}

export { templateLoader };