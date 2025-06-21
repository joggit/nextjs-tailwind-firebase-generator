// Enhanced TemplateGenerator.js
import { loadEcommerceTemplates, loadBaseTemplates, getAvailableThemes, getThemeConfig } from './TemplatePaths.js'

class TemplateGenerator {

  async generateProject(config) {
    console.log(`🚀 Generating project: ${config.businessName}`);
    console.log(`🎨 Design theme: ${config.design?.theme || 'modern'}`);
    console.log(`📊 Project type: ${config.projectType || 'base'}`);

    const project = {
      id: `${config.projectType || 'base'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: config.projectType || 'base',
      config,
      files: {},
      generationMetadata: {
        projectType: config.projectType || 'base',
        designTheme: config.design?.theme || 'modern',
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now(),
        version: '2.0'
      }
    };

    try {
      console.log('📁 Loading and processing template files...');

      // Prepare enhanced template configuration
      const templateConfig = await this.prepareTemplateConfig(config);
      console.log('✅ Template configuration prepared');

      // Load templates based on project type
      let files = {};
      
      if (config.projectType === 'ecommerce') {
        files = await loadEcommerceTemplates(templateConfig);
        console.log(`✅ Loaded ${Object.keys(files).length} ecommerce templates`);
      } else {
        files = await loadBaseTemplates(templateConfig);
        console.log(`✅ Loaded ${Object.keys(files).length} base templates`);
      }

      project.files = files;

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      project.generationMetadata.designSystem = {
        theme: templateConfig.design.theme,
        layout: templateConfig.design.layout,
        heroStyle: templateConfig.design.heroStyle,
        themeConfig: getThemeConfig(templateConfig.design.theme)
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
    console.log('🔧 Preparing template configuration...');

    // Validate design theme
    const availableThemes = getAvailableThemes();
    const selectedTheme = config.design?.theme || 'modern';
    
    if (!availableThemes.includes(selectedTheme)) {
      console.warn(`⚠️ Theme '${selectedTheme}' not found, using 'modern'`);
      config.design = { ...config.design, theme: 'modern' };
    }

    // Base template configuration
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

      // Feature Flags (for ecommerce)
      enableCheckout: config.enableCheckout !== false,
      enableUserAccounts: config.enableUserAccounts !== false,
      enableWishlist: config.enableWishlist !== false,
      enableAnalytics: config.enableAnalytics !== false,

      // Technical Configuration
      currentYear: new Date().getFullYear(),
      projectId: config.projectId || `project_${Date.now()}`,

      // URLs and Contact
      websiteUrl: config.websiteUrl || 'https://yourwebsite.com',
      supportEmail: config.supportEmail || `support@${(config.businessName || 'yourcompany').toLowerCase().replace(/\s+/g, '')}.com`,

      // SEO
      metaTitle: config.metaTitle || `${config.businessName || 'Your Business'} - Professional Services`,
      metaDescription: config.metaDescription || `${config.businessName || 'Your Business'} delivers exceptional ${config.industry || 'business'} services.`
    };

    console.log('✅ Template config prepared:', {
      businessName: templateConfig.businessName,
      theme: templateConfig.design.theme,
      layout: templateConfig.design.layout,
      industry: templateConfig.industry
    });

    return templateConfig;
  }

  /**
   * Get available design themes
   */
  getAvailableThemes() {
    return getAvailableThemes();
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(themeName) {
    return getThemeConfig(themeName);
  }

  /**
   * Validate project configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.businessName && !config.name) {
      errors.push('Business name is required');
    }

    if (config.design?.theme) {
      const availableThemes = this.getAvailableThemes();
      if (!availableThemes.includes(config.design.theme)) {
        errors.push(`Invalid theme '${config.design.theme}'. Available: ${availableThemes.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

export default TemplateGenerator;