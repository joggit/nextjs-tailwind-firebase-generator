// Unified Template Path System
// File: lib/generator/TemplatePaths.js

import { TemplateLoader } from './TemplateLoader.js';

const templateLoader = new TemplateLoader();

/**
 * Base template paths - used as foundation for all project types
 */
export const BASE_TEMPLATE_PATHS = {
  // Core Next.js configuration
  'next.config.mjs': 'base/next.config.mjs.template',
  'tailwind.config.js': 'base/tailwind.config.js.template',
  'postcss.config.cjs': 'base/postcss.config.cjs.template',
  'jsconfig.json': 'base/jsconfig.json.template',
  'package.json': 'base/package.json.template',
  '.gitignore': 'base/.gitignore.template',
  'README.md': 'base/README.md.template',
  '.env.production.example': 'base/.env.production.example.template',

  // Core app structure
  'app/layout.js': 'base/app/layout.js.template',
  'app/page.js': 'base/app/page.js.template',
  'app/globals.css': 'base/app/globals.css.template',

  // Essential pages
  'app/about/page.js': 'base/app/about/page.js.template',
  'app/contact/page.js': 'base/app/contact/page.js.template',
  // 'app/services/page.js': 'base/app/services/page.js.template',

  // Core components
  'components/Header.js': 'base/components/Header.js.template',
  'components/Footer.js': 'base/components/Footer.js.template',
  'components/Hero.js': 'base/components/Hero.js.template',

  // UI components
  'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
  'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',
  'components/ui/Input.jsx': 'base/components/ui/Input.jsx.template',
  'components/ui/Loading.jsx': 'base/components/ui/Loading.jsx.template'
};

/**
 * Project-specific template overrides
 * Only define files that are different from base templates
 */
export const PROJECT_OVERRIDES = {
  ecommerce: {
    // Override package.json for ecommerce dependencies
    'package.json': 'ecommerce/config/package.json.template',
    
    // Override layout for ecommerce-specific features
    'app/layout.js': 'ecommerce/app/layout.js.template',
    'app/page.js': 'ecommerce/app/page.js.template',
    
    // Override header for shopping cart, search, etc.
    'components/Header.js': 'ecommerce/components/Header.js.template',
    
    // Ecommerce-specific pages
    'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
    'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
    'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
    'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',
    
    // Ecommerce-specific components
    'components/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
    'components/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
    'components/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',
    
    // Ecommerce services
    'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
    'lib/cart.js': 'ecommerce/lib/cart.js.template',
    'lib/products.js': 'ecommerce/lib/products.js.template',
    
    // Environment template
    '.env.local.example': 'ecommerce/config/.env.template'
  },

  ngo: {
    // Override package.json for NGO-specific dependencies
    'package.json': 'ngo/config/package.json.template',
    
    // Override layout and main page for NGO branding
    'app/layout.js': 'ngo/app/layout.js.template',
    // 'app/page.js': 'ngo/app/page.js.template',
    
    // Override components for NGO-specific design
    'components/Header.js': 'ngo/components/Header.js.template',
    'components/Footer.js': 'ngo/components/Footer.js.template',
    'components/Hero.js': 'ngo/components/Hero.js.template',
    
    // Override about page for mission/vision focus
    // 'app/about/page.js': 'ngo/app/about/page.js.template',
    
    // NGO-specific pages
    // 'app/donate/page.js': 'ngo/app/donate/page.js.template',
    'app/volunteer/page.js': 'ngo/app/volunteer/page.js.template',
    // 'app/programs/page.js': 'ngo/app/programs/page.js.template',
    // 'app/impact/page.js': 'ngo/app/impact/page.js.template',
    'app/news/page.js': 'ngo/app/news/page.js.template',
    // 'app/get-involved/page.js': 'ngo/app/get-involved/page.js.template',
    
    // NGO-specific components
    'components/DonationWidget.jsx': 'ngo/components/DonationWidget.jsx.template',
    'components/VolunteerSignup.jsx': 'ngo/components/VolunteerSignup.jsx.template',
    'components/ImpactStats.jsx': 'ngo/components/ImpactStats.jsx.template',
    'components/ProgramCard.jsx': 'ngo/components/ProgramCard.jsx.template',
    'components/NewsletterSignup.jsx': 'ngo/components/NewsletterSignup.jsx.template',
    
    // NGO services
    'lib/donation-service.js': 'ngo/lib/donation-service.js.template',
    'lib/volunteer-service.js': 'ngo/lib/volunteer-service.js.template',
    
    // '.env.local.example': 'ngo/config/.env.template',
    'README.md': 'ngo/README.md.template'
  },

  webapp: {
    // Override package.json for webapp dependencies (auth, db, etc.)
    'package.json': 'webapp/config/package.json.template',
    
    // Override layout for app shell design
    'app/layout.js': 'webapp/app/layout.js.template',
    'app/page.js': 'webapp/app/page.js.template',
    'app/globals.css': 'webapp/app/globals.css.template',
    
    // Override header for app navigation
    'components/Header.js': 'webapp/components/Header.js.template',
    
    // Override services page for features page
    'app/services/page.js': 'webapp/app/features/page.js.template',
    
    // Webapp-specific pages
    'app/dashboard/page.js': 'webapp/app/dashboard/page.js.template',
    'app/users/page.js': 'webapp/app/users/page.js.template',
    'app/users/[id]/page.js': 'webapp/app/users/[id]/page.js.template',
    'app/analytics/page.js': 'webapp/app/analytics/page.js.template',
    'app/settings/page.js': 'webapp/app/settings/page.js.template',
    'app/profile/page.js': 'webapp/app/profile/page.js.template',
    
    // Auth pages
    'app/auth/login/page.js': 'webapp/app/auth/login/page.js.template',
    'app/auth/register/page.js': 'webapp/app/auth/register/page.js.template',
    
    // API routes
    'app/api/auth/route.js': 'webapp/app/api/auth/route.js.template',
    'app/api/users/route.js': 'webapp/app/api/users/route.js.template',
    
    // Webapp-specific components
    'components/Sidebar.jsx': 'webapp/components/Sidebar.jsx.template',
    'components/Navigation.jsx': 'webapp/components/Navigation.jsx.template',
    'components/Dashboard/StatsCard.jsx': 'webapp/components/Dashboard/StatsCard.jsx.template',
    'components/Tables/UserTable.jsx': 'webapp/components/Tables/UserTable.jsx.template',
    'components/Forms/LoginForm.jsx': 'webapp/components/Forms/LoginForm.jsx.template',
    
    // Override UI components for app-specific styling
    'components/ui/Input.jsx': 'webapp/components/ui/Input.jsx.template',
    'components/ui/Modal.jsx': 'webapp/components/ui/Modal.jsx.template',
    
    // Webapp services
    'lib/auth-service.js': 'webapp/lib/auth-service.js.template',
    'lib/api-client.js': 'webapp/lib/api-client.js.template',
    'lib/database.js': 'webapp/lib/database.js.template',
    
    'middleware.js': 'webapp/middleware.js.template',
    '.env.local.example': 'webapp/config/.env.template',
    'README.md': 'webapp/README.md.template'
  }
};

/**
 * Main Template Path Manager
 */
export class TemplatePathManager {
  constructor() {
    this.templateLoader = templateLoader;
    this.supportedTypes = ['base', 'ecommerce', 'ngo', 'webapp'];
  }

  /**
   * Get merged template paths for a project type
   * Base paths + project-specific overrides
   */
  getTemplatePaths(projectType = 'base') {
    const basePaths = { ...BASE_TEMPLATE_PATHS };
    const overrides = PROJECT_OVERRIDES[projectType] || {};
    
    // Merge base paths with project-specific overrides
    const mergedPaths = { ...basePaths, ...overrides };
    
    console.log(`📁 Template paths for ${projectType}:`, {
      basePaths: Object.keys(basePaths).length,
      overrides: Object.keys(overrides).length,
      total: Object.keys(mergedPaths).length
    });
    
    return mergedPaths;
  }

  /**
   * Add dynamic page paths based on navigation structure
   */
  addDynamicPagePaths(templatePaths, config) {
    const menuItems = config.headerData?.menuItems || [];
    const projectType = config.projectType || 'base';
    const addedPaths = {};

    menuItems.forEach((menuItem) => {
      // Process main menu items
      if (!this.isExternalLink(menuItem.link) && !this.isHomePage(menuItem.link)) {
        const pagePath = this.getPagePath(menuItem.link);
        const pageId = this.getPageId(menuItem.link);
        
        if (pagePath && !templatePaths[pagePath]) {
          const templatePath = this.findBestTemplatePath(pageId, projectType);
          addedPaths[pagePath] = templatePath;
          console.log(`➕ Added dynamic page: ${pagePath} -> ${templatePath}`);
        }
      }

      // Process nested menu items
      if (menuItem.children && menuItem.children.length > 0) {
        menuItem.children.forEach((childItem) => {
          if (!this.isExternalLink(childItem.link)) {
            const pagePath = this.getPagePath(childItem.link);
            const pageId = this.getPageId(childItem.link);
            
            if (pagePath && !templatePaths[pagePath]) {
              const templatePath = this.findBestTemplatePath(pageId, projectType);
              addedPaths[pagePath] = templatePath;
              console.log(`➕ Added nested page: ${pagePath} -> ${templatePath}`);
            }
          }
        });
      }
    });

    return { ...templatePaths, ...addedPaths };
  }

  /**
   * Find the best template path for a page
   */
  findBestTemplatePath(pageId, projectType) {
    // Special page mappings
    const specialPages = {
      'about': 'app/about/page.js',
      'contact': 'app/contact/page.js',
      'services': 'app/services/page.js',
      'shop': 'app/shop/page.js',
      'cart': 'app/cart/page.js',
      'donate': 'app/donate/page.js',
      'volunteer': 'app/volunteer/page.js',
      'dashboard': 'app/dashboard/page.js',
      'login': 'app/auth/login/page.js'
    };

    // Check if this page already has a template in our paths
    const allPaths = this.getTemplatePaths(projectType);
    const specialPagePath = specialPages[pageId];
    
    if (specialPagePath && allPaths[specialPagePath]) {
      return allPaths[specialPagePath];
    }

    // Fall back to a generic page template
    const genericTemplates = {
      'webapp': 'webapp/app/generic/page.js.template',
      'ngo': 'ngo/app/generic/page.js.template',
      'ecommerce': 'ecommerce/app/generic/page.js.template',
      'base': 'base/app/generic/page.js.template'
    };

    return genericTemplates[projectType] || genericTemplates.base;
  }

  /**
   * Load all templates for a project type with enhanced configuration
   */
  async loadProjectTemplates(config) {
    const projectType = config.projectType || 'base';
    console.log(`🔧 Loading templates for ${projectType} project: ${config.businessName || config.organizationName || config.appName}`);

    // Get base template paths + overrides
    let templatePaths = this.getTemplatePaths(projectType);

    // Add dynamic pages from navigation
    templatePaths = this.addDynamicPagePaths(templatePaths, config);

    // Prepare template configuration
    const templateConfig = this.prepareTemplateConfig(config);

    // Load all templates
    const files = await this.templateLoader.loadTemplates(templatePaths, templateConfig);

    console.log(`✅ Loaded ${Object.keys(files).length} template files for ${projectType}`);
    return files;
  }

  /**
   * Prepare comprehensive template configuration
   */
  prepareTemplateConfig(config) {
    const projectType = config.projectType || 'base';
    const heroData = config.design?.heroData?.[0] || {};
    const headerData = config.headerData || {};
    const footerData = config.footerData || {};

    const templateConfig = {
      // Core identifiers
      businessName: config.businessName || config.organizationName || config.appName || 'Your Business',
      organizationName: config.organizationName || config.businessName || 'Your Organization',
      appName: config.appName || config.businessName || 'Your App',
      
      // Business details
      industry: config.industry || config.causeArea || 'business',
      businessType: config.businessType || (projectType === 'ngo' ? 'organization' : 'company'),
      targetAudience: config.targetAudience || config.targetBeneficiaries || 'customers',
      businessDescription: config.businessDescription || config.mission || config.appDescription || 'Professional services',

      // Design configuration
      designTheme: config.design?.theme || 'modern',
      designLayout: config.design?.layout || 'standard',
      designHeroStyle: config.design?.heroStyle || 'centered',

      // Hero section
      heroHeadline: heroData.headline || this.getDefaultHeroHeadline(config),
      heroDescription: heroData.description || this.getDefaultHeroDescription(config),
      heroCTAPrimary: heroData.ctaPrimary?.text || this.getDefaultPrimaryCTA(config),
      heroCTAPrimaryLink: heroData.ctaPrimary?.href || this.getDefaultPrimaryCTALink(config),
      heroCTASecondary: heroData.ctaSecondary?.text || 'Learn More',
      heroCTASecondaryLink: heroData.ctaSecondary?.href || '/about',

      // Header configuration
      logoText: headerData.logoText || config.businessName || config.organizationName || config.appName || 'Your Business',
      headerCTAText: headerData.ctaText || this.getDefaultHeaderCTA(config),
      headerCTALink: headerData.ctaLink || this.getDefaultHeaderCTALink(config),

      // Navigation
      navigationItems: this.processNavigationItems(headerData.menuItems || []),

      // Footer configuration
      companyName: footerData.companyName || config.businessName || config.organizationName || config.appName || 'Your Company',
      companyDescription: footerData.companyDescription || config.businessDescription || config.mission || config.appDescription || 'Professional services',
      contactEmail: footerData.email || this.getDefaultEmail(config),
      contactPhone: footerData.phone || '(555) 123-4567',
      contactAddress: footerData.address || '123 Business St, City, State 12345',

      // Social media
      socialMediaLinks: this.processSocialLinks(footerData.socialLinks || {}),

      // Technical
      currentYear: new Date().getFullYear(),
      projectType: projectType,

      // Project type flags
      isBase: projectType === 'base',
      isEcommerce: projectType === 'ecommerce',
      isNgo: projectType === 'ngo',
      isWebapp: projectType === 'webapp',

      // Project-specific config
      ...this.getProjectSpecificConfig(config)
    };

    console.log('✅ Template config prepared:', {
      businessName: templateConfig.businessName,
      projectType: templateConfig.projectType,
      navigationItems: templateConfig.navigationItems.length,
      socialLinks: templateConfig.socialMediaLinks.length
    });

    return templateConfig;
  }

  // Helper methods
  processNavigationItems(menuItems) {
    return menuItems.map(item => ({
      name: item.name,
      link: item.link,
      hasChildren: item.children && item.children.length > 0,
      children: (item.children || []).map(child => ({
        name: child.name,
        link: child.link,
        description: child.description || ''
      }))
    }));
  }

  processSocialLinks(socialLinks) {
    return Object.entries(socialLinks)
      .filter(([platform, url]) => url && url.trim())
      .map(([platform, url]) => ({
        platform: platform,
        url: url.trim(),
        name: platform.charAt(0).toUpperCase() + platform.slice(1)
      }));
  }

  getProjectSpecificConfig(config) {
    const projectType = config.projectType || 'base';
    
    if (projectType === 'ngo') {
      return {
        mission: config.mission || 'Making a positive impact in our community',
        vision: config.vision || 'Creating a better world for everyone',
        causeArea: config.causeArea || 'Community Development',
        enableDonations: config.enableDonations !== false,
        enableVolunteering: config.enableVolunteering !== false
      };
    }
    
    if (projectType === 'webapp') {
      return {
        enableAuth: config.enableAuth !== false,
        authProvider: config.authProvider || 'custom',
        enableDashboard: config.enableDashboard !== false
      };
    }
    
    if (projectType === 'ecommerce') {
      return {
        enablePayments: config.enablePayments !== false,
        paymentProvider: config.paymentProvider || 'stripe',
        enableCart: config.enableCart !== false
      };
    }
    
    return {};
  }

  // Default content generators
  getDefaultHeroHeadline(config) {
    const name = config.businessName || config.organizationName || config.appName || 'Your Business';
    const projectType = config.projectType || 'base';
    
    const headlines = {
      base: `Welcome to ${name}`,
      ecommerce: `Shop with Confidence at ${name}`,
      ngo: `Creating Positive Change Together`,
      webapp: `Welcome to ${name}`
    };
    
    return headlines[projectType] || headlines.base;
  }

  getDefaultHeroDescription(config) {
    const projectType = config.projectType || 'base';
    const industry = config.industry || config.causeArea || 'business';
    
    const descriptions = {
      base: `Professional ${industry} services for your success`,
      ecommerce: `Discover amazing products with fast shipping and excellent customer service`,
      ngo: `Join us in making a positive impact through meaningful programs and initiatives`,
      webapp: `Powerful tools and insights to help you achieve your goals`
    };
    
    return descriptions[projectType] || descriptions.base;
  }

  getDefaultPrimaryCTA(config) {
    const projectType = config.projectType || 'base';
    const ctas = {
      base: 'Get Started',
      ecommerce: 'Shop Now',
      ngo: 'Donate Now',
      webapp: 'Sign Up'
    };
    return ctas[projectType] || ctas.base;
  }

  getDefaultPrimaryCTALink(config) {
    const projectType = config.projectType || 'base';
    const links = {
      base: '/contact',
      ecommerce: '/shop',
      ngo: '/donate',
      webapp: '/auth/register'
    };
    return links[projectType] || links.base;
  }

  getDefaultHeaderCTA(config) {
    const projectType = config.projectType || 'base';
    const ctas = {
      base: 'Contact Us',
      ecommerce: 'Shop Now',
      ngo: 'Donate',
      webapp: 'Sign In'
    };
    return ctas[projectType] || ctas.base;
  }

  getDefaultHeaderCTALink(config) {
    const projectType = config.projectType || 'base';
    const links = {
      base: '/contact',
      ecommerce: '/shop',
      ngo: '/donate',
      webapp: '/auth/login'
    };
    return links[projectType] || links.base;
  }

  getDefaultEmail(config) {
    const name = config.businessName || config.organizationName || config.appName || 'yourcompany';
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const projectType = config.projectType || 'base';
    
    const prefixes = {
      base: 'contact',
      ecommerce: 'support',
      ngo: 'info',
      webapp: 'support'
    };
    
    const prefix = prefixes[projectType] || prefixes.base;
    return `${prefix}@${cleanName}.com`;
  }

  // Utility methods
  getPagePath(link) {
    if (!link || this.isExternalLink(link) || link === '/') return null;
    let cleanLink = link.startsWith('/') ? link.slice(1) : link;
    cleanLink = cleanLink.endsWith('/') ? cleanLink.slice(0, -1) : cleanLink;
    if (!cleanLink) return null;
    return `app/${cleanLink}/page.js`;
  }

  getPageId(link) {
    if (!link || link === '/') return 'home';
    let cleanLink = link.startsWith('/') ? link.slice(1) : link;
    cleanLink = cleanLink.endsWith('/') ? cleanLink.slice(0, -1) : cleanLink;
    if (!cleanLink) return 'home';
    if (cleanLink.includes('/')) {
      const segments = cleanLink.split('/');
      return segments[segments.length - 1];
    }
    return cleanLink;
  }

  isExternalLink(link) {
    return link && (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:'));
  }

  isHomePage(link) {
    return !link || link === '/' || link === '#';
  }

  /**
   * Get available project types
   */
  getSupportedTypes() {
    return this.supportedTypes;
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.businessName && !config.organizationName && !config.appName && !config.name) {
      errors.push('Business/Organization/App name is required');
    }

    if (config.projectType && !this.supportedTypes.includes(config.projectType)) {
      errors.push(`Invalid project type '${config.projectType}'. Supported: ${this.supportedTypes.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

// Create singleton instance
const templatePathManager = new TemplatePathManager();

/**
 * Convenience functions for backwards compatibility
 */
export async function loadBaseTemplates(config) {
  console.log('📁 Loading base templates...');
  config.projectType = 'base';
  return await templatePathManager.loadProjectTemplates(config);
}

export async function loadEcommerceTemplates(config) {
  console.log('📁 Loading ecommerce templates...');
  config.projectType = 'ecommerce';
  return await templatePathManager.loadProjectTemplates(config);
}

export async function loadNgoTemplates(config) {
  console.log('📁 Loading NGO templates...');
  config.projectType = 'ngo';
  return await templatePathManager.loadProjectTemplates(config);
}

export async function loadWebappTemplates(config) {
  console.log('📁 Loading webapp templates...');
  config.projectType = 'webapp';
  return await templatePathManager.loadProjectTemplates(config);
}

export { templatePathManager, templateLoader };