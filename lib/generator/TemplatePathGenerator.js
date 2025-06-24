// Enhanced TemplatePathGenerator with Nested Menu Support and Customization
// File: lib/generator/TemplatePathGenerator.js

import { TemplateLoader } from './TemplateLoader.js';

class TemplatePathGenerator {
  constructor() {
    this.templateLoader = new TemplateLoader();
    this.supportedTemplates = ['modern','base', 'ecommerce'];
    this.supportedThemes = ['modern', 'elegant', 'creative', 'tech', 'minimal', 'corporate'];
  }

  /**
   * Generate project with enhanced path-based template loading
   */
  async generateProject(config) {
    console.log(`🔧 Generating project: ${config.businessName}`);
    console.log(`📊 Project type: ${config.projectType || 'base'}`);
    console.log(`🎨 Design theme: ${config.design?.theme || 'modern'}`);

    // Validate configuration
    this.validateConfig(config);

    const project = {
      id: `${config.projectType || 'base'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: config.projectType || 'base',
      config,
      files: {},
      generationMetadata: {
        projectType: config.projectType || 'base',
        designTheme: config.design?.theme || 'modern',
        heroStyle: config.design?.heroStyle || 'centered',
        headerStyle: config.headerData?.style || 'solid',
        footerStyle: config.footerData?.style || 'multiColumn',
        navigationComplexity: this.analyzeNavigationComplexity(config.headerData?.menuItems || []),
        customization: {
          hero: this.hasHeroCustomization(config),
          header: this.hasHeaderCustomization(config),
          footer: this.hasFooterCustomization(config),
          nestedMenus: this.hasNestedMenus(config.headerData?.menuItems || [])
        },
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now(),
        version: '2.2'
      }
    };

    try {
      console.log('📁 Loading and processing template files...');

      // Prepare enhanced template configuration
      const templateConfig = await this.prepareTemplateConfig(config);
      console.log('✅ Enhanced template configuration prepared');

      // Load templates based on project type with path-based loading
      const templatePaths = this.getTemplatePaths(config.projectType);
      const files = await this.templateLoader.loadTemplates(templatePaths, templateConfig);
      
      console.log(`✅ Loaded ${Object.keys(files).length} template files`);

      project.files = files;

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      project.generationMetadata.customizationApplied = {
        heroCustomizations: this.getHeroCustomizations(config),
        headerCustomizations: this.getHeaderCustomizations(config),
        footerCustomizations: this.getFooterCustomizations(config),
        navigationCustomizations: this.getNavigationCustomizations(config)
      };
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);
      console.log(`🎨 Applied customizations:`, project.generationMetadata.customizationApplied);

      return project;

    } catch (error) {
      console.error('❌ Error generating project:', error);
      throw new Error(`Project generation failed: ${error.message}`);
    }
  }

  /**
   * Get template paths based on project type
   */
  getTemplatePaths(projectType) {
    const basePaths = {
      // Core Next.js files
      'next.config.mjs': 'base/next.config.mjs.template',
      'tailwind.config.js': 'base/tailwind.config.js.template',
      'postcss.config.cjs': 'base/postcss.config.cjs.template',
      'jsconfig.json': 'base/jsconfig.json.template',
      'package.json': 'base/package.json.template',
      '.gitignore': 'base/.gitignore.template',

      // App files
      'app/layout.js': 'base/app/layout.js.template',
      'app/globals.css': 'base/app/globals.css.template',
      'app/page.js': 'base/app/page.js.template',
      'app/about/page.js': 'base/app/about/page.js.template',
      'app/contact/page.js': 'base/app/contact/page.js.template',
      'app/services/page.js': 'base/app/services/page.js.template',

      //If services has children, create a folder for it
      'app/services/consulting/page.js': 'base/app/services/consulting/page.js.template',
      'app/services/support/page.js': 'base/app/services/support/page.js.template',

      // Enhanced components with customization support
      'components/Header.js': 'base/components/Header.js.template',
      'components/Footer.js': 'base/components/Footer.js.template',
      'components/Hero.js': 'base/components/Hero.js.template',
      'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
      'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

      // README with project info
      'README.md': 'base/README.md.template'
    };

    const ecommercePaths = {
      ...basePaths,
      // Override some base files for ecommerce
      'app/layout.js': 'ecommerce/app/layout.js.template',
      'app/page.js': 'ecommerce/app/page.js.template',
      'package.json': 'ecommerce/config/package.json.template',
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

      // Ecommerce services
      'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
      'lib/cart.js': 'ecommerce/lib/cart.js.template',
      'lib/products.js': 'ecommerce/lib/products.js.template',

      // Environment template
      '.env.local.example': 'ecommerce/config/.env.template'
    };

    return projectType === 'ecommerce' ? ecommercePaths : basePaths;
  }

  /**
   * Prepare enhanced template configuration with all customization data
   */
  async prepareTemplateConfig(config) {
    console.log('🔧 Preparing enhanced template configuration...');

    // Extract customization data
    const heroData = config.design?.heroData?.[0] || {};
    const headerData = config.headerData || {};
    const footerData = config.footerData || {};

    // Analyze navigation structure
    const navigationAnalysis = this.analyzeNavigationStructure(headerData.menuItems || []);

    const templateConfig = {
      // Business Information
      businessName: config.businessName || 'Your Business',
      businessNameSlug: (config.businessName || 'your-business').toLowerCase().replace(/\s+/g, '-'),
      industry: config.industry || 'business',
      businessType: config.businessType || 'company',
      targetAudience: config.targetAudience || 'customers',
      businessDescription: config.businessDescription || 'Professional services',

      // Design Configuration
      design: {
        theme: config.design?.theme || 'modern',
        layout: config.design?.layout || 'standard',
        heroStyle: config.design?.heroStyle || 'centered'
      },

      // Hero Section Variables (flattened for easy template access)
      heroType: heroData.type || 'centered',
      heroHeadline: heroData.headline || `Welcome to ${config.businessName || 'Your Business'}`,
      heroDescription: heroData.description || config.businessDescription || `Professional ${config.industry || 'business'} services for ${config.targetAudience || 'your success'}`,
      heroCTAPrimary: heroData.ctaPrimary?.text || 'Get Started',
      heroCTAPrimaryLink: heroData.ctaPrimary?.href || '/contact',
      heroCTASecondary: heroData.ctaSecondary?.text || 'Learn More',
      heroCTASecondaryLink: heroData.ctaSecondary?.href || '/about',
      heroBackgroundType: heroData.backgroundType || 'gradient',
      heroBackgroundImage: heroData.backgroundImage || '',
      heroBackgroundVideo: heroData.backgroundVideo || '',

      // Header Section Variables
      headerStyle: headerData.style || 'solid',
      logoType: headerData.logoType || 'text',
      logoText: headerData.logoText || config.businessName || 'Your Business',
      logoImage: headerData.logoImage || '',
      showHeaderCTA: headerData.showCta !== false,
      headerCTAText: headerData.ctaText || 'Get Started',
      headerCTALink: headerData.ctaLink || '/contact',

      // Enhanced Navigation with Nested Menu Support
      navigationItems: this.processNavigationItems(headerData.menuItems || []),
      navigationMetadata: navigationAnalysis,
      hasNestedMenus: navigationAnalysis.hasNestedMenus,
      dropdownMenusCount: navigationAnalysis.dropdownCount,
      
      // Navigation JSON for complex template processing
      navigationItemsJSON: JSON.stringify(this.processNavigationItems(headerData.menuItems || [])),
      
      // Flattened navigation for simple template access
      simpleNavigationItems: (headerData.menuItems || []).map(item => ({
        name: item.name,
        link: item.link,
        isActive: item.link === '/'
      })),

      // Footer Section Variables
      footerStyle: footerData.style || 'multiColumn',
      companyName: footerData.companyName || config.businessName || 'Your Company',
      companyDescription: footerData.companyDescription || config.businessDescription || `Professional ${config.industry || 'business'} services`,
      contactEmail: footerData.email || `contact@${(config.businessName || 'yourcompany').toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: footerData.phone || '(555) 123-4567',
      contactAddress: footerData.address || '123 Business St, City, State 12345',
      showNewsletter: footerData.showNewsletter !== false,
      newsletterTitle: footerData.newsletterTitle || 'Stay Updated',

      // Social Media Links (filtered to only include non-empty ones)
      socialMediaLinks: Object.entries(footerData.socialLinks || {})
        .filter(([platform, url]) => url && url.trim())
        .map(([platform, url]) => ({
          platform: platform,
          url: url.trim(),
          name: platform.charAt(0).toUpperCase() + platform.slice(1)
        })),

      // Theme-specific styling classes
      themeClasses: this.getThemeClasses(config.design?.theme || 'modern'),

      // Technical Configuration
      currentYear: new Date().getFullYear(),
      projectId: config.projectId || `project_${Date.now()}`,

      // Feature flags
      enableAnalytics: config.enableAnalytics !== false,
      enableSEO: config.enableSEO !== false,
      isResponsive: true,
      enableEcommerce: config.projectType === 'ecommerce',

      // Page configuration
      pages: config.pages || [],
      features: config.features || [],

      // Template processing helpers
      isBase: config.projectType !== 'ecommerce',
      isEcommerce: config.projectType === 'ecommerce'
    };

    console.log('🎨 Enhanced template config summary:', {
      businessName: templateConfig.businessName,
      projectType: config.projectType,
      heroHeadline: templateConfig.heroHeadline.substring(0, 50) + '...',
      navigationItems: templateConfig.navigationItems.length,
      hasNestedMenus: templateConfig.hasNestedMenus,
      dropdownMenus: templateConfig.dropdownMenusCount,
      socialLinks: templateConfig.socialMediaLinks.length,
      theme: templateConfig.design.theme,
      headerStyle: templateConfig.headerStyle,
      footerStyle: templateConfig.footerStyle
    });

    return templateConfig;
  }

  /**
   * Process navigation items with nested menu support
   */
  processNavigationItems(menuItems) {
    return menuItems.map(item => ({
      name: item.name,
      link: item.link,
      type: item.type || 'link',
      isActive: item.link === '/', // Mark home as active by default
      hasChildren: item.children && item.children.length > 0,
      isDropdown: item.type === 'dropdown',
      children: (item.children || []).map(child => ({
        name: child.name,
        link: child.link,
        description: child.description || ''
      })),
      childCount: item.children?.length || 0
    }));
  }

  /**
   * Analyze navigation structure for complexity and features
   */
  analyzeNavigationStructure(menuItems) {
    const totalItems = menuItems.length;
    const dropdownMenus = menuItems.filter(item => 
      item.type === 'dropdown' || (item.children && item.children.length > 0)
    );
    const nestedItems = menuItems.reduce((sum, item) => sum + (item.children?.length || 0), 0);
    const maxDepth = Math.max(1, ...menuItems.map(item => item.children?.length ? 2 : 1));

    return {
      totalItems,
      dropdownCount: dropdownMenus.length,
      nestedItems,
      maxDepth,
      hasNestedMenus: nestedItems > 0,
      complexity: nestedItems > 0 ? 'complex' : 'simple',
      supportsMobile: true,
      supportsDropdown: true,
      structure: menuItems.map(item => ({
        name: item.name,
        type: item.type || 'link',
        childCount: item.children?.length || 0
      }))
    };
  }

  /**
   * Analyze navigation complexity for metadata
   */
  analyzeNavigationComplexity(menuItems) {
    const analysis = this.analyzeNavigationStructure(menuItems);
    if (analysis.hasNestedMenus && analysis.dropdownCount > 1) return 'complex';
    if (analysis.hasNestedMenus || analysis.dropdownCount > 0) return 'moderate';
    return 'simple';
  }

  /**
   * Check if configuration has hero customization
   */
  hasHeroCustomization(config) {
    const heroData = config.design?.heroData?.[0];
    return !!(heroData?.headline || heroData?.description || heroData?.backgroundImage || heroData?.backgroundVideo);
  }

  /**
   * Check if configuration has header customization
   */
  hasHeaderCustomization(config) {
    const headerData = config.headerData;
    return !!(headerData?.logoText || headerData?.menuItems?.length || headerData?.ctaText);
  }

  /**
   * Check if configuration has footer customization
   */
  hasFooterCustomization(config) {
    const footerData = config.footerData;
    const hasSocialLinks = Object.values(footerData?.socialLinks || {}).some(url => url && url.trim());
    return !!(footerData?.companyDescription || footerData?.email || hasSocialLinks);
  }

  /**
   * Check if navigation has nested menus
   */
  hasNestedMenus(menuItems) {
    return menuItems.some(item => item.children && item.children.length > 0);
  }

  /**
   * Get theme-specific CSS classes
   */
  getThemeClasses(theme) {
    const themeMap = {
      modern: {
        primary: 'text-blue-600',
        secondary: 'text-purple-600',
        accent: 'text-green-600',
        background: 'bg-white',
        surface: 'bg-gray-50',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600'
      },
      elegant: {
        primary: 'text-gray-800',
        secondary: 'text-amber-600',
        accent: 'text-red-600',
        background: 'bg-amber-50',
        surface: 'bg-white',
        gradient: 'bg-gradient-to-r from-gray-800 to-amber-600'
      },
      creative: {
        primary: 'text-pink-600',
        secondary: 'text-purple-600',
        accent: 'text-yellow-500',
        background: 'bg-gray-50',
        surface: 'bg-white',
        gradient: 'bg-gradient-to-r from-pink-600 to-purple-600'
      },
      tech: {
        primary: 'text-cyan-500',
        secondary: 'text-purple-500',
        accent: 'text-green-500',
        background: 'bg-slate-900',
        surface: 'bg-slate-800',
        gradient: 'bg-gradient-to-r from-cyan-500 to-purple-500'
      },
      minimal: {
        primary: 'text-black',
        secondary: 'text-gray-600',
        accent: 'text-gray-800',
        background: 'bg-white',
        surface: 'bg-gray-50',
        gradient: 'bg-gradient-to-r from-black to-gray-600'
      },
      corporate: {
        primary: 'text-blue-700',
        secondary: 'text-green-600',
        accent: 'text-red-600',
        background: 'bg-gray-50',
        surface: 'bg-white',
        gradient: 'bg-gradient-to-r from-blue-700 to-green-600'
      }
    };

    return themeMap[theme] || themeMap.modern;
  }

  /**
   * Get detailed hero customizations
   */
  getHeroCustomizations(config) {
    const heroData = config.design?.heroData?.[0] || {};
    return {
      hasCustomHeadline: !!heroData.headline,
      hasCustomDescription: !!heroData.description,
      backgroundType: heroData.backgroundType || 'gradient',
      hasCustomBackground: !!(heroData.backgroundImage || heroData.backgroundVideo),
      ctaButtons: {
        primary: heroData.ctaPrimary?.text || 'Get Started',
        secondary: heroData.ctaSecondary?.text || 'Learn More'
      },
      heroStyle: config.design?.heroStyle || 'centered'
    };
  }

  /**
   * Get detailed header customizations
   */
  getHeaderCustomizations(config) {
    const headerData = config.headerData || {};
    const menuAnalysis = this.analyzeNavigationStructure(headerData.menuItems || []);
    
    return {
      style: headerData.style || 'solid',
      logoType: headerData.logoType || 'text',
      hasCustomLogo: !!headerData.logoText,
      menuItemsCount: headerData.menuItems?.length || 0,
      hasCTA: headerData.showCta !== false,
      ctaText: headerData.ctaText || 'Get Started',
      hasNestedMenus: menuAnalysis.hasNestedMenus,
      navigationComplexity: menuAnalysis.complexity,
      dropdownMenus: menuAnalysis.dropdownCount,
      nestedItems: menuAnalysis.nestedItems,
      maxDepth: menuAnalysis.maxDepth,
      mobileResponsive: true,
      dropdownSupport: menuAnalysis.dropdownCount > 0,
      menuStructure: menuAnalysis.structure
    };
  }

  /**
   * Get detailed footer customizations
   */
  getFooterCustomizations(config) {
    const footerData = config.footerData || {};
    const socialLinksCount = Object.values(footerData.socialLinks || {}).filter(url => url && url.trim()).length;

    return {
      style: footerData.style || 'multiColumn',
      hasCompanyInfo: !!(footerData.companyName || footerData.companyDescription),
      hasContactInfo: !!(footerData.email || footerData.phone || footerData.address),
      hasNewsletter: footerData.showNewsletter !== false,
      socialLinksCount: socialLinksCount,
      hasSocialLinks: socialLinksCount > 0,
      newsletterTitle: footerData.newsletterTitle || 'Stay Updated'
    };
  }

  /**
   * Get detailed navigation customizations
   */
  getNavigationCustomizations(config) {
    const menuItems = config.headerData?.menuItems || [];
    const analysis = this.analyzeNavigationStructure(menuItems);

    return {
      totalItems: analysis.totalItems,
      dropdownMenus: analysis.dropdownCount,
      nestedItems: analysis.nestedItems,
      maxDepth: analysis.maxDepth,
      hasNestedMenus: analysis.hasNestedMenus,
      complexity: analysis.complexity,
      mobileResponsive: true,
      dropdownSupport: true,
      structure: menuItems.map(item => ({
        name: item.name,
        type: item.type || 'link',
        hasChildren: item.children && item.children.length > 0,
        childCount: item.children?.length || 0
      }))
    };
  }

  /**
   * Validate project configuration
   */
  validateConfig(config) {
    const errors = [];

    // Basic validation
    if (!config.businessName && !config.name) {
      errors.push('Business name is required');
    }

    // Template validation
    if (config.projectType && !this.supportedTemplates.includes(config.projectType)) {
      errors.push(`Invalid project type '${config.projectType}'. Supported: ${this.supportedTemplates.join(', ')}`);
    }

    // Theme validation
    if (config.design?.theme && !this.supportedThemes.includes(config.design.theme)) {
      errors.push(`Invalid theme '${config.design.theme}'. Available: ${this.supportedThemes.join(', ')}`);
    }

    // Hero validation
    if (config.design?.heroData?.[0]) {
      const heroData = config.design.heroData[0];
      if (heroData.backgroundType === 'image' && !heroData.backgroundImage) {
        console.warn('⚠️ Hero background type is "image" but no background image provided');
      }
      if (heroData.backgroundType === 'video' && !heroData.backgroundVideo) {
        console.warn('⚠️ Hero background type is "video" but no background video provided');
      }
    }

    // Header validation
    if (config.headerData?.logoType === 'image' && !config.headerData.logoImage) {
      console.warn('⚠️ Header logo type is "image" but no logo image provided');
    }

    // Navigation validation
    if (config.headerData?.menuItems) {
      config.headerData.menuItems.forEach((item, index) => {
        if (!item.name || !item.link) {
          console.warn(`⚠️ Menu item ${index + 1} is missing name or link`);
        }
        if (item.type === 'dropdown' && (!item.children || item.children.length === 0)) {
          console.warn(`⚠️ Dropdown menu item "${item.name}" has no children`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Get available design themes
   */
  getAvailableThemes() {
    return this.supportedThemes;
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(themeName) {
    const themes = {
      modern: {
        name: 'Modern',
        description: 'Clean, professional design with bold typography',
        colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' }
      },
      elegant: {
        name: 'Elegant',
        description: 'Sophisticated design with refined typography',
        colors: { primary: '#1F2937', secondary: '#D97706', accent: '#DC2626' }
      },
      creative: {
        name: 'Creative',
        description: 'Vibrant and playful with unique elements',
        colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#F59E0B' }
      },
      tech: {
        name: 'Tech',
        description: 'Futuristic design with neon accents',
        colors: { primary: '#06B6D4', secondary: '#8B5CF6', accent: '#10B981' }
      },
      minimal: {
        name: 'Minimal',
        description: 'Ultra-clean design with maximum whitespace',
        colors: { primary: '#000000', secondary: '#4B5563', accent: '#6B7280' }
      },
      corporate: {
        name: 'Corporate',
        description: 'Professional business design',
        colors: { primary: '#1E40AF', secondary: '#059669', accent: '#DC2626' }
      }
    };

    return themes[themeName] || themes.modern;
  }

  /**
   * Get supported project types
   */
  getSupportedTemplates() {
    return this.supportedTemplates;
  }
}

export default TemplatePathGenerator;