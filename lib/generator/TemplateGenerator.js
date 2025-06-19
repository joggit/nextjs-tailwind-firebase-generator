
import { loadEcommerceTemplates, loadBaseTemplates } from './TemplatePaths.js'

class TemplateGenerator {

  async generateProject(config) {
    console.log(`🚀 Generating ecommerce project: ${config.businessName}`);
    console.log(`📊 Ecommerce config:`, {
      business: config.businessName,
      industry: config.industry,
      enableCheckout: config.enableCheckout,
      enableUserAccounts: config.enableUserAccounts,
      enableWishlist: config.enableWishlist,
      
    });
    
    const project = {
      id: `ecommerce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: 'ecommerce',
      config,
      files: {},
      generationMetadata: {
        projectType: 'ecommerce',
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now(),
      
      }
    };

    try {
      console.log('📁 Loading and processing template files...');
      
      // Prepare enhanced template configuration
      const templateConfig = await this.prepareTemplateConfig(config);
      console.log('✅ Template configuration prepared');
      
      // Load base templates (Next.js, React, components, etc.)
      const baseFiles = await loadBaseTemplates(templateConfig);
      console.log(`✅ Loaded ${Object.keys(baseFiles).length} base templates`);
      
      // Load ecommerce templates (shop, cart, products, etc.)
      const ecommerceFiles = await loadEcommerceTemplates(templateConfig);
      console.log(`✅ Loaded ${Object.keys(ecommerceFiles).length} ecommerce templates`);
      
     
      // Generate ecommerce-specific components
      const ecommerceComponents = await this.generateEcommerceComponents(templateConfig);
      console.log(`✅ Generated ${Object.keys(ecommerceComponents).length} ecommerce components`);
      
      // Generate sample data and configurations
      const dataFiles = await this.generateSampleData(templateConfig);
      console.log(`✅ Generated ${Object.keys(dataFiles).length} data files`);
      
      // Combine all files
      project.files = {
        ...baseFiles,
        ...ecommerceFiles,
        ...ecommerceComponents,
        ...dataFiles
      };
      
      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      project.generationMetadata.ecommerceFeatures = {
        checkout: templateConfig.enableCheckout,
        userAccounts: templateConfig.enableUserAccounts,
        wishlist: templateConfig.enableWishlist,
        analytics: templateConfig.enableAnalytics,
       
      };
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Ecommerce project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);
      
      return project;

    } catch (error) {
      console.error('❌ Error generating ecommerce project:', error);
      throw new Error(`Ecommerce project generation failed: ${error.message}`);
    }
  }

  async prepareTemplateConfig(config) {
    console.log('🔧 Preparing enhanced template configuration...');
    
    // Base template configuration
    const templateConfig = {
      // Business Information
      businessName: config.businessName || 'Your Store',
      businessNameSlug: (config.businessName || 'your-store').toLowerCase().replace(/\s+/g, '-'),
      industry: config.industry || 'retail',
      businessType: config.businessType || 'ecommerce',
      targetAudience: config.targetAudience || 'customers',
      businessDescription: config.businessDescription || 'Quality products online',
      
      // Feature Flags
      enableCheckout: config.enableCheckout !== false,
      enableUserAccounts: config.enableUserAccounts !== false,
      enableWishlist: config.enableWishlist !== false,
      enableAnalytics: config.enableAnalytics !== false,
      enableSearch: config.enableSearch !== false,
      enableReviews: config.enableReviews !== false,
      
      // Styling and Branding
      primaryColor: config.primaryColor || '#3B82F6',
      secondaryColor: config.secondaryColor || '#8B5CF6',
      accentColor: config.accentColor || '#10B981',
      
      // Technical Configuration
      currentYear: new Date().getFullYear(),
      projectId: config.projectId || `ecommerce_${Date.now()}`,
      
      // URLs and Contact
      websiteUrl: config.websiteUrl || 'https://yourstore.com',
      supportEmail: config.supportEmail || `support@${(config.businessName || 'yourstore').toLowerCase().replace(/\s+/g, '')}.com`,
      
      // Social Media
      socialLinks: config.socialLinks || [],
      
      // Payment and Shipping
      acceptedPayments: config.acceptedPayments || ['credit-card', 'paypal'],
      shippingMethods: config.shippingMethods || ['standard', 'express'],
      
      // SEO
      metaTitle: config.metaTitle || `${config.businessName || 'Your Store'} - Quality Products Online`,
      metaDescription: config.metaDescription || `Shop quality products at ${config.businessName || 'Your Store'}. Fast shipping, great prices, excellent customer service.`
    };

    // // Generate sample products if not provided
    // if (!templateConfig.sampleProducts) {
    //   templateConfig.sampleProducts = this.generateSampleProducts(templateConfig);
    // }

    return templateConfig;
  }

  async generateEcommerceComponents(templateConfig) {
    console.log('🛒 Generating ecommerce-specific components...');
    
    const components = {};

    // Cart Management Components
    // components['components/ecommerce/CartIcon.jsx'] = this.generateCartIcon(templateConfig);
    // components['components/ecommerce/CartDropdown.jsx'] = this.generateCartDropdown(templateConfig);
    // components['components/ecommerce/CartSummary.jsx'] = this.generateCartSummary(templateConfig);
    
    // Product Components
    // components['components/ecommerce/ProductCard.jsx'] = this.generateProductCard(templateConfig);
    // components['components/ecommerce/ProductGrid.jsx'] = this.generateProductGrid(templateConfig);
    // components['components/ecommerce/ProductQuickView.jsx'] = this.generateProductQuickView(templateConfig);
    // components['components/ecommerce/PriceDisplay.jsx'] = this.generatePriceDisplay(templateConfig);
    
    // Navigation and Search
    // components['components/ecommerce/CategoryFilter.jsx'] = this.generateCategoryFilter(templateConfig);
    // components['components/ecommerce/ProductSearch.jsx'] = this.generateProductSearch(templateConfig);
    // components['components/ecommerce/Breadcrumbs.jsx'] = this.generateBreadcrumbs(templateConfig);
    
    // User Experience Components
    if (templateConfig.enableWishlist) {
      // components['components/ecommerce/WishlistButton.jsx'] = this.generateWishlistButton(templateConfig);
      // components['components/ecommerce/WishlistDropdown.jsx'] = this.generateWishlistDropdown(templateConfig);
    }
    
    if (templateConfig.enableReviews) {
      // components['components/ecommerce/ProductReviews.jsx'] = this.generateProductReviews(templateConfig);
      // components['components/ecommerce/ReviewForm.jsx'] = this.generateReviewForm(templateConfig);
    }

    // Enhanced Header with Ecommerce Features
    // components['components/Header.js'] = this.generateEcommerceHeader(templateConfig);

    return components;
  }

  async generateSampleData(templateConfig) {
    console.log('📦 Generating sample data and configurations...');
    
    const dataFiles = {};

    // Sample products data
    // dataFiles['data/products.js'] = this.generateProductsData(templateConfig);
    
    // Sample categories data
    // dataFiles['data/categories.js'] = this.generateCategoriesData(templateConfig);
    
    // Store configuration
    // dataFiles['lib/store-config.js'] = this.generateStoreConfig(templateConfig);
    
    // Sample customer data (for development)
    // dataFiles['data/sample-customers.js'] = this.generateSampleCustomers(templateConfig);
    
    // Shipping and tax configuration
    // dataFiles['lib/shipping-config.js'] = this.generateShippingConfig(templateConfig);

    return dataFiles;
  }

  // Component generators

  // Override parent methods to include ecommerce-specific package.json
  generatePackageJson(config) {
    return JSON.stringify({
      name: config.businessNameSlug || (config.businessName || config.name).toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0', 
        'react-dom': '^18.0.0',
        'lucide-react': '^0.300.0',
        firebase: '^10.7.0',
        openai: '^4.20.0',
        stripe: '^14.0.0',
        '@stripe/stripe-js': '^2.0.0',
        uuid: '^9.0.0',
        'react-hot-toast': '^2.4.0'
      },
      devDependencies: {
        tailwindcss: '^3.3.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }
}

export default TemplateGenerator;