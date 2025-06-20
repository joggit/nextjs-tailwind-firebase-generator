
import { loadEcommerceTemplates, loadBaseTemplates } from './TemplatePaths.js'

class TemplateGenerator {

  async generateProject(config) {
    console.log(`Config received:`, config);
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

      // Combine all files
      project.files = {
        ...baseFiles,
        ...(config.projectType === 'ecommerce' ? ecommerceFiles : {}),
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

    return templateConfig;
  }
}

export default TemplateGenerator;