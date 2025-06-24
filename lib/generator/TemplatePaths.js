// Enhanced TemplatePaths.js
import { TemplateLoader } from './TemplateLoader.js';

const templateLoader = new TemplateLoader();

export const ECOMMERCE_TEMPLATE_PATHS = {
  // Core ecommerce files
  'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
  'lib/cart.js': 'ecommerce/lib/cart.js.template',
  'lib/products.js': 'ecommerce/lib/products.js.template',

  // Ecommerce pages
  'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
  'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
  'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
  'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',
  'app/layout.js': 'ecommerce/app/layout.js.template',
  'app/page.js': 'ecommerce/app/page.js.template',

  // Ecommerce components
  'components/Header.js': 'ecommerce/components/Header.js.template',
  'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
  'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
  'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',

  // Configuration files
  'package.json': 'ecommerce/config/package.json.template',
  '.env.local.example': 'ecommerce/config/.env.template',
  'tailwind.config.js': 'ecommerce/config/tailwind.config.js.template',
};

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

  // Base components
  'components/Header.js': 'base/components/Header.js.template',
  'components/Footer.js': 'base/components/Footer.js.template',
  'components/Hero.js': 'base/components/Hero.js.template',
  'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
  'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

  // Base configuration
  '.gitignore': 'base/.gitignore.template',
  'README.md': 'base/README.md.template'
};

/**
 * Load ecommerce templates with enhanced config
 */
export async function loadEcommerceTemplates(config) {
  console.log('📁 Loading ecommerce templates with enhanced customization...');

  const enhancedConfig = prepareEnhancedConfig(config, 'ecommerce');
  
  console.log('🛍️ Ecommerce config prepared:', {
    businessName: enhancedConfig.businessName,
    headerStyle: enhancedConfig.headerStyle,
    footerStyle: enhancedConfig.footerStyle,
    heroHeadline: enhancedConfig.heroHeadline?.substring(0, 40) + '...',
    navigationItems: enhancedConfig.navigationItems?.length || 0
  });

  return await templateLoader.loadTemplates(ECOMMERCE_TEMPLATE_PATHS, enhancedConfig);
}

/**
 * Load base templates with enhanced config
 */
export async function loadBaseTemplates(config) {
  console.log('📁 Loading base templates with enhanced customization...');

  const enhancedConfig = prepareEnhancedConfig(config, 'base');
  
  console.log('🏠 Base config prepared:', {
    businessName: enhancedConfig.businessName,
    headerStyle: enhancedConfig.headerStyle,
    footerStyle: enhancedConfig.footerStyle,
    heroHeadline: enhancedConfig.heroHeadline?.substring(0, 40) + '...',
    navigationItems: enhancedConfig.navigationItems?.length || 0,
    socialLinks: enhancedConfig.socialMediaLinks?.length || 0
  });

  return await templateLoader.loadTemplates(BASE_TEMPLATE_PATHS, enhancedConfig);
}

/**
 * Prepare enhanced configuration for template processing
 */
function prepareEnhancedConfig(config, projectType) {
  // Base configuration
  const enhancedConfig = {
    // Core business info
    businessName: config.businessName || 'Your Business',
    businessNameSlug: config.businessNameSlug || 'your-business',
    industry: config.industry || 'business',
    businessType: config.businessType || 'company',
    targetAudience: config.targetAudience || 'customers',
    businessDescription: config.businessDescription || 'Professional services',
    
    // Design and theme
    designTheme: config.design?.theme || 'modern',
    themeClasses: config.themeClasses || {},
    
    // Hero section
    heroType: config.heroType || 'centered',
    heroHeadline: config.heroHeadline || `Welcome to ${config.businessName || 'Your Business'}`,
    heroDescription: config.heroDescription || config.businessDescription || 'Professional services',
    heroCTAPrimary: config.heroCTAPrimary || 'Get Started',
    heroCTAPrimaryLink: config.heroCTAPrimaryLink || '/contact',
    heroCTASecondary: config.heroCTASecondary || 'Learn More',
    heroCTASecondaryLink: config.heroCTASecondaryLink || '/about',
    heroBackgroundType: config.heroBackgroundType || 'gradient',
    heroBackgroundImage: config.heroBackgroundImage || '',
    heroBackgroundVideo: config.heroBackgroundVideo || '',
    
    // Header section
    headerStyle: config.headerStyle || 'solid',
    logoType: config.logoType || 'text',
    logoText: config.logoText || config.businessName || 'Your Business',
    logoImage: config.logoImage || '',
    showHeaderCTA: config.showHeaderCTA !== false,
    headerCTAText: config.headerCTAText || 'Get Started',
    headerCTALink: config.headerCTALink || '/contact',
    
    // Footer section
    footerStyle: config.footerStyle || 'multiColumn',
    companyName: config.companyName || config.businessName || 'Your Company',
    companyDescription: config.companyDescription || config.businessDescription || 'Professional services',
    contactEmail: config.contactEmail || `contact@${(config.businessName || 'yourcompany').toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: config.contactPhone || '(555) 123-4567',
    contactAddress: config.contactAddress || '123 Business St, City, State 12345',
    showNewsletter: config.showNewsletter !== false,
    newsletterTitle: config.newsletterTitle || 'Stay Updated',
    
    // Technical
    currentYear: config.currentYear || new Date().getFullYear(),
    projectId: config.projectId || `project_${Date.now()}`,
    enableAnalytics: config.enableAnalytics !== false,
    enableSEO: config.enableSEO !== false,
    isResponsive: true,
    
    // Project type specific
    projectType: projectType,
    isEcommerce: projectType === 'ecommerce',
    isBase: projectType === 'base'
  };

  // Process navigation items
  if (config.navigationItems && Array.isArray(config.navigationItems)) {
    enhancedConfig.navigationItems = config.navigationItems;
    enhancedConfig.navigationMenu = config.navigationItems.map(item => 
      `<a href="${item.link}" className="hover:text-primary transition-colors">${item.name}</a>`
    ).join('\n          ');
    
    // Mobile navigation
    enhancedConfig.mobileNavigationMenu = config.navigationItems.map(item => 
      `<a href="${item.link}" className="block px-3 py-2 hover:bg-gray-50 rounded-lg">${item.name}</a>`
    ).join('\n            ');
  } else {
    // Default navigation
    enhancedConfig.navigationItems = [
      { name: 'Home', link: '/', isActive: true },
      { name: 'About', link: '/about', isActive: false },
      { name: 'Services', link: '/services', isActive: false },
      { name: 'Contact', link: '/contact', isActive: false }
    ];
    enhancedConfig.navigationMenu = enhancedConfig.navigationItems.map(item => 
      `<a href="${item.link}" className="hover:text-primary transition-colors">${item.name}</a>`
    ).join('\n          ');
    enhancedConfig.mobileNavigationMenu = enhancedConfig.navigationItems.map(item => 
      `<a href="${item.link}" className="block px-3 py-2 hover:bg-gray-50 rounded-lg">${item.name}</a>`
    ).join('\n            ');
  }

  // Process social media links
  if (config.socialMediaLinks && Array.isArray(config.socialMediaLinks)) {
    enhancedConfig.socialMediaLinks = config.socialMediaLinks;
    enhancedConfig.socialMediaHTML = config.socialMediaLinks.map(social => 
      `<a href="${social.url}" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
        <span className="sr-only">${social.name}</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <!-- ${social.platform} icon -->
        </svg>
      </a>`
    ).join('\n        ');
    enhancedConfig.hasSocialLinks = config.socialMediaLinks.length > 0;
  } else {
    enhancedConfig.socialMediaLinks = [];
    enhancedConfig.socialMediaHTML = '';
    enhancedConfig.hasSocialLinks = false;
  }

  // Add conditional flags for templates
  enhancedConfig.hasCustomHero = !!(config.heroHeadline && config.heroHeadline !== `Welcome to ${config.businessName || 'Your Business'}`);
  enhancedConfig.hasCustomNavigation = config.navigationItems && config.navigationItems.length > 0;
  enhancedConfig.hasContactInfo = !!(config.contactEmail || config.contactPhone || config.contactAddress);
  enhancedConfig.hasCompanyInfo = !!(config.companyName || config.companyDescription);

  // Theme-specific enhancements
  if (config.design?.theme) {
    enhancedConfig.isDarkTheme = config.design.theme === 'tech';
    enhancedConfig.isLightTheme = ['modern', 'elegant', 'creative'].includes(config.design.theme);
    enhancedConfig.themePrefix = config.design.theme;
  }

  // Header style specific classes
  const headerStyleClasses = {
    solid: 'bg-white shadow-sm',
    transparent: 'bg-transparent',
    sticky: 'bg-white/95 backdrop-blur-sm sticky top-0',
    centered: 'bg-white text-center',
    leftAligned: 'bg-white'
  };
  enhancedConfig.headerClasses = headerStyleClasses[config.headerStyle] || headerStyleClasses.solid;

  // Footer style specific classes
  const footerStyleClasses = {
    simple: 'py-8',
    multiColumn: 'py-12',
    newsletter: 'py-16',
    contactFocused: 'py-12'
  };
  enhancedConfig.footerClasses = footerStyleClasses[config.footerStyle] || footerStyleClasses.multiColumn;

  console.log('🔧 Enhanced config prepared with customizations:', {
    hasCustomHero: enhancedConfig.hasCustomHero,
    hasCustomNavigation: enhancedConfig.hasCustomNavigation,
    hasSocialLinks: enhancedConfig.hasSocialLinks,
    hasContactInfo: enhancedConfig.hasContactInfo,
    headerStyle: enhancedConfig.headerStyle,
    footerStyle: enhancedConfig.footerStyle
  });

  return enhancedConfig;
}

/**
 * Get available design themes
 */
export function getAvailableThemes() {
  return ['modern', 'elegant', 'creative', 'tech'];
}

/**
 * Get theme configuration
 */
export function getThemeConfig(themeName) {
  const themes = {
    modern: {
      name: 'Modern',
      description: 'Clean, professional design with bold typography',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    },
    elegant: {
      name: 'Elegant', 
      description: 'Sophisticated design with refined typography',
      colors: {
        primary: '#1F2937',
        secondary: '#D97706',
        accent: '#DC2626'
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Source Serif Pro'
      }
    },
    creative: {
      name: 'Creative',
      description: 'Vibrant and playful with unique elements',
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#F59E0B'
      },
      fonts: {
        heading: 'Poppins',
        body: 'Inter'
      }
    },
    tech: {
      name: 'Tech',
      description: 'Futuristic design with neon accents',
      colors: {
        primary: '#06B6D4',
        secondary: '#8B5CF6',
        accent: '#10B981'
      },
      fonts: {
        heading: 'JetBrains Mono',
        body: 'Inter'
      }
    }
  };
  
  return themes[themeName] || themes.modern;
}

export { templateLoader };