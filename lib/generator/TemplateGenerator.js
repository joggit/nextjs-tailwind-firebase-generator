// Updated Template Generator with Design System Integration
// File: lib/generator/TemplateGenerator.js

import { DesignTemplateProcessor } from './DesignTemplateProcessor.js';
import { loadEcommerceTemplates, loadBaseTemplates } from './TemplatePaths.js';

class TemplateGenerator {
  constructor() {
    this.templateProcessor = new DesignTemplateProcessor();
  }

  async generateProject(config) {
    console.log(`🚀 Generating project: ${config.businessName}`);
    console.log(`🎨 Design config:`, {
      theme: config.design?.theme || 'modern',
      layout: config.design?.layout || 'standard',
      heroStyle: config.design?.heroStyle || 'centered'
    });

    const project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: config.projectType || 'website',
      config,
      files: {},
      generationMetadata: {
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now(),
        designEnhanced: true
      }
    };

    try {
      console.log('📁 Loading and processing template files...');

      // Prepare enhanced template configuration
      const templateConfig = await this.prepareTemplateConfig(config);
      console.log('✅ Template configuration prepared');

      // Load base templates
      const baseFiles = await this.loadDesignAwareBaseTemplates(templateConfig);
      console.log(`✅ Loaded ${Object.keys(baseFiles).length} base templates`);

      // Load ecommerce templates if needed
      const ecommerceFiles = config.projectType === 'ecommerce' 
        ? await this.loadDesignAwareEcommerceTemplates(templateConfig)
        : {};
      
      if (config.projectType === 'ecommerce') {
        console.log(`✅ Loaded ${Object.keys(ecommerceFiles).length} ecommerce templates`);
      }

      // Combine all files
      project.files = {
        ...baseFiles,
        ...ecommerceFiles,
      };

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      project.generationMetadata.designSystem = {
        theme: templateConfig.design?.theme || 'modern',
        layout: templateConfig.design?.layout || 'standard',
        heroStyle: templateConfig.design?.heroStyle || 'centered'
      };
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);

      return project;

    } catch (error) {
      console.error('❌ Error generating project:', error);
      throw new Error(`Project generation failed: ${error.message}`);
    }
  }

  async prepareTemplateConfig(config) {
    console.log('🔧 Preparing enhanced template configuration...');

    // Ensure design config exists
    const designConfig = config.design || {
      theme: 'modern',
      layout: 'standard',
      heroStyle: 'centered',
      graphics: 'illustrations'
    };

    const templateConfig = {
      // Business Information
      businessName: config.businessName || config.name || 'Your Business',
      businessNameSlug: (config.businessName || config.name || 'your-business').toLowerCase().replace(/\s+/g, '-'),
      industry: config.industry || 'business',
      businessType: config.businessType || 'company',
      targetAudience: config.targetAudience || 'customers',
      businessDescription: config.businessDescription || `Professional ${config.industry || 'business'} services`,

      // Design Configuration
      design: designConfig,

      // Feature Flags (for ecommerce)
      enableCheckout: config.enableCheckout !== false,
      enableUserAccounts: config.enableUserAccounts !== false,
      enableWishlist: config.enableWishlist !== false,
      enableAnalytics: config.enableAnalytics !== false,
      enableSearch: config.enableSearch !== false,
      enableReviews: config.enableReviews !== false,

      // Technical Configuration
      currentYear: new Date().getFullYear(),
      projectId: config.projectId || `project_${Date.now()}`,

      // URLs and Contact
      websiteUrl: config.websiteUrl || 'https://yourwebsite.com',
      supportEmail: config.supportEmail || `contact@${(config.businessName || 'business').toLowerCase().replace(/\s+/g, '')}.com`,

      // SEO
      metaTitle: config.metaTitle || `${config.businessName || 'Your Business'} - Professional Services`,
      metaDescription: config.metaDescription || `${config.businessName || 'Your Business'} provides professional ${config.industry || 'business'} services.`
    };

    return templateConfig;
  }

  /**
   * Load base templates with design system processing
   */
  async loadDesignAwareBaseTemplates(config) {
    try {
      // Define the base template files we want to process with design system
      const baseTemplatePaths = {
        // App files
        'app/layout.js': 'base/app/layout.js.template',
        'app/globals.css': 'base/app/globals.css.template',
        'app/page.js': 'base/app/page.js.template',

        // Components with design system
        'components/Header.js': 'base/components/Header.js.template',
        'components/Footer.js': 'base/components/Footer.js.template',
        'components/Hero.js': 'base/components/Hero.jsx.template',
        'components/Contact.jsx': 'base/components/Contact.jsx.template',
        'components/Testimonials.jsx': 'base/components/Testimonials.jsx.template',
        'components/ui/Button.jsx': 'base/components/ui/Button.jsx.template',
        'components/ui/Card.jsx': 'base/components/ui/Card.jsx.template',

        // Configuration files
        'next.config.mjs': 'base/next.config.mjs.template',
        'tailwind.config.js': 'base/tailwind.config.js.template',
        'postcss.config.cjs': 'base/postcss.config.cjs.template',
        'package.json': 'base/package.json.template',
        'jsconfig.json': 'base/jsconfig.json.template',
        '.gitignore': 'base/.gitignore.template',
        'README.md': 'base/README.md.template'
      };

      const processedFiles = {};

      // Process each template with design system variables
      for (const [outputPath, templatePath] of Object.entries(baseTemplatePaths)) {
        try {
          const processedContent = await this.templateProcessor.loadDesignTemplate(templatePath, config);
          processedFiles[outputPath] = processedContent;
        } catch (error) {
          console.warn(`⚠️ Failed to process template ${templatePath}:`, error.message);
          // Use fallback processing
          try {
            const fallbackContent = await this.templateProcessor.loadTemplate(templatePath, config);
            processedFiles[outputPath] = fallbackContent;
          } catch (fallbackError) {
            console.error(`❌ Fallback processing failed for ${templatePath}:`, fallbackError.message);
            // Skip this file rather than failing the entire generation
          }
        }
      }

      return processedFiles;
    } catch (error) {
      console.error('❌ Failed to load design-aware base templates:', error);
      throw error;
    }
  }

  /**
   * Load ecommerce templates with design system processing
   */
  async loadDesignAwareEcommerceTemplates(config) {
    try {
      // Define ecommerce template files
      const ecommerceTemplatePaths = {
        // Ecommerce pages
        'app/shop/page.js': 'ecommerce/app/shop/page.js.template',
        'app/cart/page.js': 'ecommerce/app/cart/page.js.template',
        'app/checkout/page.js': 'ecommerce/app/checkout/page.js.template',
        'app/product/[id]/page.js': 'ecommerce/app/product/[id]/page.js.template',

        // Ecommerce components
        'components/ecommerce/ProductCard.jsx': 'ecommerce/components/ProductCard.jsx.template',
        'components/ecommerce/AddToCartButton.jsx': 'ecommerce/components/AddToCartButton.jsx.template',
        'components/ecommerce/ShoppingCart.jsx': 'ecommerce/components/ShoppingCart.jsx.template',

        // Ecommerce services
        'lib/firebase-service.js': 'ecommerce/lib/firebase-service.js.template',
        'lib/cart.js': 'ecommerce/lib/cart.js.template',
        'lib/products.js': 'ecommerce/lib/products.js.template',

        // Configuration overrides for ecommerce
        '.env.local.example': 'ecommerce/config/.env.template'
      };

      const processedFiles = {};

      // Process each ecommerce template
      for (const [outputPath, templatePath] of Object.entries(ecommerceTemplatePaths)) {
        try {
          const processedContent = await this.templateProcessor.loadDesignTemplate(templatePath, config);
          processedFiles[outputPath] = processedContent;
        } catch (error) {
          console.warn(`⚠️ Failed to process ecommerce template ${templatePath}:`, error.message);
          // Use fallback processing
          try {
            const fallbackContent = await this.templateProcessor.loadTemplate(templatePath, config);
            processedFiles[outputPath] = fallbackContent;
          } catch (fallbackError) {
            console.error(`❌ Fallback processing failed for ${templatePath}:`, fallbackError.message);
          }
        }
      }

      return processedFiles;
    } catch (error) {
      console.error('❌ Failed to load design-aware ecommerce templates:', error);
      throw error;
    }
  }
}

export default TemplateGenerator;