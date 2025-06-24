// Enhanced TemplateGenerator.js
import { loadEcommerceTemplates, loadBaseTemplates } from './TemplatePaths.js'

class TemplateGenerator {

  async generateProject(config) {
    console.log(`🚀 Generating project: ${config.businessName}`);
    console.log(`🎨 Design theme: ${config.design?.theme || 'modern'}`);
    console.log(`📊 Project type: ${config.projectType || 'base'}`);
    console.log(`🎭 Hero style: ${config.design?.heroStyle || 'centered'}`);
    console.log(`🧭 Header style: ${config.headerData?.style || 'solid'}`);

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
        customization: {
          hero: !!config.design?.heroData?.[0]?.headline,
          header: !!config.headerData?.menuItems?.length,
          footer: !!config.footerData?.socialLinks
        },
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now(),
        version: '2.1'
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
      project.generationMetadata.customizationApplied = {
        heroCustomizations: this.getHeroCustomizations(config),
        headerCustomizations: this.getHeaderCustomizations(config),
        footerCustomizations: this.getFooterCustomizations(config)
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

  async prepareTemplateConfig(config) {
    console.log('🔧 Preparing enhanced template configuration...');

    // Extract hero data
    const heroData = config.design?.heroData?.[0] || {};
    const headerData = config.headerData || {};
    const footerData = config.footerData || {};

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
      
      // Navigation Menu (formatted for templates)
      navigationItems: (headerData.menuItems || []).map(item => ({
        name: item.name,
        link: item.link,
        isActive: item.link === '/' // Mark home as active by default
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
      
      // Page configuration
      pages: config.pages || [],
      features: config.features || []
    };

    console.log('🎨 Template config summary:', {
      businessName: templateConfig.businessName,
      heroHeadline: templateConfig.heroHeadline.substring(0, 50) + '...',
      navigationItems: templateConfig.navigationItems.length,
      socialLinks: templateConfig.socialMediaLinks.length,
      theme: templateConfig.design.theme,
      headerStyle: templateConfig.headerStyle,
      footerStyle: templateConfig.footerStyle
    });

    return templateConfig;
  }

  getThemeClasses(theme) {
    const themeMap = {
      modern: {
        primary: 'text-blue-600',
        secondary: 'text-purple-600',
        accent: 'text-green-600',
        background: 'bg-white',
        surface: 'bg-gray-50'
      },
      elegant: {
        primary: 'text-gray-800',
        secondary: 'text-amber-600',
        accent: 'text-red-600',
        background: 'bg-amber-50',
        surface: 'bg-white'
      },
      creative: {
        primary: 'text-pink-600',
        secondary: 'text-purple-600',
        accent: 'text-yellow-500',
        background: 'bg-gray-50',
        surface: 'bg-white'
      },
      tech: {
        primary: 'text-cyan-500',
        secondary: 'text-purple-500',
        accent: 'text-green-500',
        background: 'bg-slate-900',
        surface: 'bg-slate-800'
      }
    };
    
    return themeMap[theme] || themeMap.modern;
  }

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
      }
    };
  }

  getHeaderCustomizations(config) {
    const headerData = config.headerData || {};
    return {
      style: headerData.style || 'solid',
      logoType: headerData.logoType || 'text',
      hasCustomLogo: !!headerData.logoText,
      menuItemsCount: headerData.menuItems?.length || 0,
      hasCTA: headerData.showCta !== false,
      ctaText: headerData.ctaText || 'Get Started'
    };
  }

  getFooterCustomizations(config) {
    const footerData = config.footerData || {};
    const socialLinksCount = Object.values(footerData.socialLinks || {}).filter(url => url && url.trim()).length;
    
    return {
      style: footerData.style || 'multiColumn',
      hasCompanyInfo: !!(footerData.companyName || footerData.companyDescription),
      hasContactInfo: !!(footerData.email || footerData.phone || footerData.address),
      hasNewsletter: footerData.showNewsletter !== false,
      socialLinksCount: socialLinksCount,
      hasSocialLinks: socialLinksCount > 0
    };
  }

  /**
   * Get available design themes
   */
  getAvailableThemes() {
    return ['modern', 'elegant', 'creative', 'tech'];
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(themeName) {
    const themes = {
      modern: {
        name: 'Modern',
        description: 'Clean, professional design with bold typography',
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981'
        }
      },
      elegant: {
        name: 'Elegant',
        description: 'Sophisticated design with refined typography',
        colors: {
          primary: '#1F2937',
          secondary: '#D97706',
          accent: '#DC2626'
        }
      },
      creative: {
        name: 'Creative',
        description: 'Vibrant and playful with unique elements',
        colors: {
          primary: '#EC4899',
          secondary: '#8B5CF6',
          accent: '#F59E0B'
        }
      },
      tech: {
        name: 'Tech',
        description: 'Futuristic design with neon accents',
        colors: {
          primary: '#06B6D4',
          secondary: '#8B5CF6',
          accent: '#10B981'
        }
      }
    };
    
    return themes[themeName] || themes.modern;
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

    // Validate hero data
    if (config.design?.heroData?.[0]) {
      const heroData = config.design.heroData[0];
      if (heroData.backgroundType === 'image' && !heroData.backgroundImage) {
        console.warn('⚠️ Hero background type is "image" but no background image provided');
      }
      if (heroData.backgroundType === 'video' && !heroData.backgroundVideo) {
        console.warn('⚠️ Hero background type is "video" but no background video provided');
      }
    }

    // Validate header data
    if (config.headerData?.logoType === 'image' && !config.headerData.logoImage) {
      console.warn('⚠️ Header logo type is "image" but no logo image provided');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

export default TemplateGenerator; 