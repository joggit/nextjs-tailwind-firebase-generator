// Enhanced TemplatePathGenerator with Nested Menu Support and Customization
// File: lib/generator/TemplatePathGenerator.js

import { TemplateLoader } from './TemplateLoader.js';

class TemplatePathGenerator {
  constructor() {
    this.templateLoader = new TemplateLoader();
    this.supportedTemplates = ['modern', 'base', 'ecommerce'];
    this.supportedThemes = ['modern', 'elegant', 'creative', 'tech', 'minimal', 'corporate'];
  }

  /**
   * Generate project with enhanced path-based template loading
   */
  async generateProject(config) {
    console.log(`🔧 Generating project: ${config.businessName}`);
    console.log(`📊 Project type: ${config.projectType || 'base'}`);
    console.log(`🎨 Design theme: ${config.design?.theme || 'modern'}`);

    // Debug configuration
    this.debugConfiguration(config);

    // Validate configuration
    this.validateConfig(config);

    // Generate page files from both config.pages AND nested menu items
    const pageFiles = this.generateAllPageFiles(config);

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
      console.log(`📄 Generated ${Object.keys(pageFiles).length} page files`);

      project.files = {
        ...files,
        ...pageFiles
      };

      // Debug generated files
      this.debugGeneratedFiles(project.files);

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
   * Debug configuration to understand structure
   */
  debugConfiguration(config) {
    console.log('🔍 DEBUG: Configuration Analysis');
    console.log('Pages config type:', Array.isArray(config.pages) ? 'Array' : typeof config.pages);
    console.log('Pages config:', config.pages);
    console.log('Header menu items:', config.headerData?.menuItems?.length || 0);
    
    if (config.headerData?.menuItems) {
      config.headerData.menuItems.forEach((item, index) => {
        console.log(`  Menu ${index + 1}: "${item.name}" -> ${item.link} (children: ${item.children?.length || 0})`);
        if (item.children) {
          item.children.forEach((child, childIndex) => {
            console.log(`    Child ${childIndex + 1}: "${child.name}" -> ${child.link}`);
          });
        }
      });
    }
  }

  /**
   * Debug generated files structure
   */
  debugGeneratedFiles(files) {
    console.log('🔍 DEBUG: Generated Files Structure');
    const pageFiles = Object.keys(files).filter(path => path.startsWith('app/') && path.endsWith('/page.js'));
    console.log(`📄 Page files (${pageFiles.length}):`);
    pageFiles.forEach(path => {
      console.log(`  ${path}`);
    });
    
    const componentFiles = Object.keys(files).filter(path => path.startsWith('components/'));
    console.log(`🧩 Component files (${componentFiles.length}):`);
    componentFiles.forEach(path => {
      console.log(`  ${path}`);
    });
  }

  /**
   * Generate ALL page files from config.pages AND nested menu items
   */
  generateAllPageFiles(config) {
    const pageFiles = {};

    // Generate pages from config.pages (handle both array and object formats)
    if (config.pages) {
      if (Array.isArray(config.pages)) {
        // Handle array format: [{id: 'home', name: 'Home', ...}, ...]
        config.pages.forEach((pageData) => {
          if (pageData.enabled === false) return;
          
          const pageId = pageData.id || pageData.name?.toLowerCase() || 'page';
          const pagePath = pageId === 'home' ? 'app/page.js' : `app/${pageId}/page.js`;
          pageFiles[pagePath] = this.generatePageTemplate(pageId, pageData, config);
          
          console.log(`📄 Generated config page: ${pagePath} for "${pageData.name}"`);
        });
      } else {
        // Handle object format: {home: {name: 'Home', ...}, about: {...}}
        Object.entries(config.pages).forEach(([pageId, pageData]) => {
          if (pageData.enabled === false) return;

          const pagePath = pageId === 'home' ? 'app/page.js' : `app/${pageId}/page.js`;
          pageFiles[pagePath] = this.generatePageTemplate(pageId, pageData, config);
          
          console.log(`📄 Generated config page: ${pagePath} for "${pageData.name}"`);
        });
      }
    }

    // Generate pages from navigation menu structure
    const navigationPages = this.generateNavigationPages(config);
    Object.assign(pageFiles, navigationPages);

    return pageFiles;
  }

  /**
   * Generate pages from navigation menu items and their nested children
   */
  generateNavigationPages(config) {
    const pageFiles = {};
    const menuItems = config.headerData?.menuItems || [];
    const generatedPaths = new Set(); // Track generated paths to avoid duplicates

    console.log(`🔍 Processing ${menuItems.length} menu items for page generation`);

    menuItems.forEach((menuItem, index) => {
      console.log(`🔍 Processing menu item ${index + 1}: "${menuItem.name}" with link "${menuItem.link}"`);
      
      // Skip if this is just a link to an existing page or external link
      if (this.isExternalLink(menuItem.link) || this.isHomePage(menuItem.link)) {
        console.log(`⏭️ Skipping "${menuItem.name}" - external or home link`);
        return;
      }

      // Generate page for the main menu item (only if it's not a pure dropdown container)
      const mainPagePath = this.getPagePath(menuItem.link);
      if (mainPagePath && !generatedPaths.has(mainPagePath)) {
        const pageData = {
          name: menuItem.name,
          title: menuItem.name,
          subtitle: `Learn more about our ${menuItem.name.toLowerCase()} services`,
          type: menuItem.type || 'page',
          menuItem: menuItem
        };
        
        pageFiles[mainPagePath] = this.generatePageTemplate(
          this.getPageId(menuItem.link), 
          pageData, 
          config
        );
        
        generatedPaths.add(mainPagePath);
        console.log(`📄 Generated main page: ${mainPagePath} for "${menuItem.name}"`);
      }

      // Process nested children (this handles array items 1-4 and beyond)
      if (menuItem.children && menuItem.children.length > 0) {
        console.log(`🔍 Processing ${menuItem.children.length} child items for "${menuItem.name}"`);
        
        menuItem.children.forEach((childItem, childIndex) => {
          console.log(`   🔍 Processing child ${childIndex + 1}: "${childItem.name}" with link "${childItem.link}"`);
          
          if (this.isExternalLink(childItem.link)) {
            console.log(`   ⏭️ Skipping child "${childItem.name}" - external link`);
            return;
          }

          const childPagePath = this.getPagePath(childItem.link);
          if (childPagePath && !generatedPaths.has(childPagePath)) {
            const childPageData = {
              name: childItem.name,
              title: childItem.name,
              subtitle: childItem.description || `Comprehensive ${childItem.name.toLowerCase()} solutions`,
              type: 'nested-page',
              parentItem: menuItem,
              menuItem: childItem,
              breadcrumb: [menuItem.name, childItem.name]
            };

            pageFiles[childPagePath] = this.generateNestedPageTemplate(
              this.getPageId(childItem.link),
              childPageData,
              config
            );

            generatedPaths.add(childPagePath);
            console.log(`   📄 Generated nested page: ${childPagePath} for "${childItem.name}" (child ${childIndex + 1} of "${menuItem.name}")`);
          } else {
            console.log(`   ⏭️ Skipping child "${childItem.name}" - path already exists or invalid`);
          }
        });
      }
    });

    console.log(`✅ Generated ${Object.keys(pageFiles).length} navigation-based pages`);
    console.log(`📋 Generated page paths:`, Object.keys(pageFiles));
    return pageFiles;
  }

  /**
   * Generate the page path from a link
   */
  getPagePath(link) {
    if (!link || this.isExternalLink(link) || link === '/') {
      return null;
    }

    // Remove leading slash and convert to page path
    let cleanLink = link.startsWith('/') ? link.slice(1) : link;
    
    // Remove trailing slash if present
    cleanLink = cleanLink.endsWith('/') ? cleanLink.slice(0, -1) : cleanLink;
    
    // If empty after cleaning, return null
    if (!cleanLink) {
      return null;
    }
    
    // Handle nested paths (e.g., services/consulting -> app/services/consulting/page.js)
    const pagePath = `app/${cleanLink}/page.js`;
    
    console.log(`🔄 Converting link "${link}" to page path: ${pagePath}`);
    return pagePath;
  }

  /**
   * Get page ID from link
   */
  getPageId(link) {
    if (!link || link === '/') return 'home';
    
    let cleanLink = link.startsWith('/') ? link.slice(1) : link;
    cleanLink = cleanLink.endsWith('/') ? cleanLink.slice(0, -1) : cleanLink;
    
    if (!cleanLink) return 'home';
    
    // For nested paths, use the last segment as ID
    if (cleanLink.includes('/')) {
      const segments = cleanLink.split('/');
      const pageId = segments[segments.length - 1];
      console.log(`🔄 Converting nested link "${link}" to page ID: ${pageId}`);
      return pageId;
    }
    
    console.log(`🔄 Converting link "${link}" to page ID: ${cleanLink}`);
    return cleanLink;
  }

  /**
   * Check if link is external
   */
  isExternalLink(link) {
    return link && (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:'));
  }

  /**
   * Check if link is home page
   */
  isHomePage(link) {
    return !link || link === '/' || link === '#';
  }

  /**
   * Generate enhanced page template with nested support
   */
  generatePageTemplate(pageId, pageData, config) {
    const isNested = pageData.type === 'nested-page';
    const breadcrumbHTML = isNested && pageData.breadcrumb ? `
        {/* Breadcrumb */}
        <nav className="py-4 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li><a href="/" className="text-blue-600 hover:text-blue-800">Home</a></li>
              ${pageData.breadcrumb.map((crumb, index) => `
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                ${index === pageData.breadcrumb.length - 1 
                  ? `<span className="text-gray-600">${crumb}</span>`
                  : `<span className="text-gray-600">${crumb}</span>`
                }
              </li>`).join('')}
            </ol>
          </div>
        </nav>` : '';

    return `

import Header from '@/components/Header'
import Footer from '@/components/Footer'
${pageId === 'home' ? "import Hero from '@/components/Hero'" : ''}

export const metadata = {
  title: '${pageData.title || pageData.name} | ${config.businessName || 'Your Business'}',
  description: '${pageData.subtitle || `Learn more about ${pageData.name} services at ${config.businessName || 'Your Business'}`}',
}

export default function ${this.capitalize(pageId)}Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        ${pageId === 'home' ? '<Hero />' : ''}
        ${breadcrumbHTML}
        
        {/* Page Header */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ${pageData.title || pageData.name}
            </h1>
            ${pageData.subtitle ? `
            <p className="text-xl text-gray-600 leading-relaxed">
              ${pageData.subtitle}
            </p>` : ''}
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose max-w-none">
              ${this.generatePageContent(pageData, config)}
            </div>
          </div>
        </section>

        ${this.generatePageSections(pageData.sections || [])}
        
        ${isNested ? this.generateRelatedPagesSection(pageData, config) : ''}
      </main>
      
      <Footer />
    </div>
  )
}`;
  }

  /**
   * Generate nested page template with enhanced features
   */
  generateNestedPageTemplate(pageId, pageData, config) {
    return this.generatePageTemplate(pageId, pageData, config);
  }

  /**
   * Generate page content based on page data
   */
  generatePageContent(pageData, config) {
    const defaultContent = {
      'about': `
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About ${config.businessName || 'Our Company'}</h2>
              <p className="text-gray-600 mb-6">
                ${config.businessDescription || `We are a leading ${config.industry || 'business'} company dedicated to providing exceptional services to our clients.`}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                To deliver innovative solutions that drive success for our clients while maintaining the highest standards of quality and professionalism.
              </p>`,
      
      'services': `
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-gray-600 mb-6">
                We offer comprehensive ${config.industry || 'business'} services designed to meet your unique needs and drive your success.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Consulting</h3>
                  <p className="text-gray-600">Expert consultation to help you make informed decisions and achieve your goals.</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Support</h3>
                  <p className="text-gray-600">Comprehensive support services to keep your operations running smoothly.</p>
                </div>
              </div>`,
      
      'contact': `
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Ready to get started? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 mr-3">📧</span>
                      ${config.footerData?.email || `contact@${(config.businessName || 'company').toLowerCase().replace(/\s+/g, '')}.com`}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 mr-3">📞</span>
                      ${config.footerData?.phone || '(555) 123-4567'}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 mr-3">📍</span>
                      ${config.footerData?.address || '123 Business Street, City, State 12345'}
                    </p>
                  </div>
                </div>
                <div>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>`
    };

    // If it's a nested page, generate content based on the menu item
    if (pageData.type === 'nested-page' && pageData.menuItem) {
      return `
              <h2 className="text-2xl font-bold text-gray-900 mb-4">${pageData.title}</h2>
              <p className="text-gray-600 mb-6">
                ${pageData.menuItem.description || `Comprehensive ${pageData.title.toLowerCase()} services tailored to your specific needs.`}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What We Offer</h3>
              <p className="text-gray-600 mb-6">
                Our ${pageData.title.toLowerCase()} services are designed to deliver exceptional results and drive your business forward.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready to Get Started?</h4>
                <p className="text-blue-700 mb-4">Contact us today to learn more about our ${pageData.title.toLowerCase()} services.</p>
                <a href="/contact" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Get In Touch
                  <span className="ml-2">→</span>
                </a>
              </div>`;
    }

    return defaultContent[pageData.name?.toLowerCase()] || `
              <h2 className="text-2xl font-bold text-gray-900 mb-4">${pageData.title || pageData.name}</h2>
              <p className="text-gray-600 mb-6">
                Welcome to our ${pageData.title?.toLowerCase() || pageData.name?.toLowerCase()} page. We're here to help you with all your ${config.industry || 'business'} needs.
              </p>`;
  }

  /**
   * Generate related pages section for nested pages
   */
  generateRelatedPagesSection(pageData, config) {
    if (!pageData.parentItem?.children) return '';

    const siblingPages = pageData.parentItem.children.filter(child => 
      child.name !== pageData.name && !this.isExternalLink(child.link)
    );

    if (siblingPages.length === 0) return '';

    return `
        {/* Related Pages */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-${Math.min(siblingPages.length, 3)} gap-6">
              ${siblingPages.map(sibling => `
              <a href="${sibling.link}" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">${sibling.name}</h3>
                <p className="text-gray-600 text-sm">${sibling.description || `Learn more about our ${sibling.name.toLowerCase()} services`}</p>
                <span className="inline-flex items-center text-blue-600 text-sm mt-3">
                  Learn More <span className="ml-1">→</span>
                </span>
              </a>`).join('')}
            </div>
          </div>
        </section>`;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

      // App files - only include layout and globals, pages are generated dynamically
      'app/layout.js': 'base/app/layout.js.template',
      'app/globals.css': 'base/app/globals.css.template',

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
      'package.json': 'ecommerce/config/package.json.template',
      'components/Header.js': 'ecommerce/components/Header.js.template',

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
   * Generate page sections from config
   */
  generatePageSections(sections) {
    if (!sections || sections.length === 0) return '';
    
    return sections.map(section => `
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
            <p className="text-gray-600">${section.content}</p>
          </div>
        </section>
        `).join('\n');
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