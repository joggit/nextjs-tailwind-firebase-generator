// Simplified Template Generator using Unified Path System
// File: lib/generator/TemplateGenerator.js

import { templatePathManager } from './TemplatePaths.js';

class TemplatePathGenerator {
  constructor() {
    this.templatePathManager = templatePathManager;
    this.supportedTypes = ['base', 'ecommerce', 'ngo', 'webapp'];
    this.supportedThemes = ['modern', 'elegant', 'creative', 'tech', 'minimal', 'corporate'];
  }

  /**
   * Generate a complete project with template files
   */
  async generateProject(config) {
    const startTime = Date.now();
    const projectName = config.businessName || config.organizationName || config.appName || config.name;
    const projectType = config.projectType || 'base';

    console.log(`🚀 Starting project generation: ${projectName}`);
    console.log(`📊 Project type: ${projectType}`);
    console.log(`🎨 Design theme: ${config.design?.theme || 'modern'}`);

    // Validate configuration
    this.validateConfig(config);

    // Create project structure
    const project = {
      id: `${projectType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: projectName,
      type: projectType,
      config,
      files: {},
      generationMetadata: {
        projectType: projectType,
        designTheme: config.design?.theme || 'modern',
        generatedAt: new Date().toISOString(),
        processingStartTime: startTime,
        version: '2.0.0'
      }
    };

    try {
      console.log('📁 Loading project templates...');

      // Load all template files using the unified path system
      const files = await this.templatePathManager.loadProjectTemplates(config);
      project.files = files;

      // Update metadata
      const processingTime = Date.now() - startTime;
      project.generationMetadata.processingTime = `${(processingTime / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Project generated successfully:`);
      console.log(`   📂 Files: ${project.generationMetadata.fileCount}`);
      console.log(`   ⏱️  Time: ${project.generationMetadata.processingTime}`);
      console.log(`   🎯 Type: ${projectType}`);

      return project;

    } catch (error) {
      console.error(`❌ Project generation failed: ${error.message}`);
      throw new Error(`Project generation failed: ${error.message}`);
    }
  }

  /**
   * Validate project configuration
   */
  validateConfig(config) {
    const errors = [];

    // Check required fields
    if (!config.businessName && !config.organizationName && !config.appName && !config.name) {
      errors.push('Project name is required (businessName, organizationName, appName, or name)');
    }

    // Check project type
    if (config.projectType && !this.supportedTypes.includes(config.projectType)) {
      errors.push(`Invalid project type '${config.projectType}'. Supported: ${this.supportedTypes.join(', ')}`);
    }

    // Check design theme
    if (config.design?.theme && !this.supportedThemes.includes(config.design.theme)) {
      errors.push(`Invalid design theme '${config.design.theme}'. Supported: ${this.supportedThemes.join(', ')}`);
    }

    // Check navigation structure
    if (config.headerData?.menuItems && !Array.isArray(config.headerData.menuItems)) {
      errors.push('headerData.menuItems must be an array');
    }

    // Project-specific validations
    this.validateProjectSpecificConfig(config, errors);

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate project-specific configuration
   */
  validateProjectSpecificConfig(config, errors) {
    const projectType = config.projectType || 'base';

    switch (projectType) {
      case 'ngo':
        if (!config.mission && !config.businessDescription) {
          errors.push('NGO projects require a mission statement (mission or businessDescription)');
        }
        break;

      case 'ecommerce':
        // Could add validation for payment configuration, etc.
        break;

      case 'webapp':
        // Could add validation for auth configuration, etc.
        break;
    }
  }

  /**
   * Get project type information
   */
  getProjectTypeInfo(projectType) {
    const projectTypes = {
      base: {
        name: 'Business Website',
        description: 'Professional business website with modern design',
        features: ['Hero Section', 'About Page', 'Services Page', 'Contact Form'],
        requiredFields: ['businessName'],
        optionalFields: ['industry', 'businessDescription', 'targetAudience']
      },
      ecommerce: {
        name: 'E-commerce Store',
        description: 'Complete online store with shopping cart and checkout',
        features: ['Product Catalog', 'Shopping Cart', 'Checkout', 'Payment Integration'],
        requiredFields: ['businessName'],
        optionalFields: ['industry', 'businessDescription', 'enablePayments']
      },
      ngo: {
        name: 'Non-Profit Organization',
        description: 'NGO website with donation and volunteer features',
        features: ['Donation System', 'Volunteer Signup', 'Impact Tracking', 'Programs'],
        requiredFields: ['organizationName', 'mission'],
        optionalFields: ['causeArea', 'targetBeneficiaries', 'enableDonations']
      },
      webapp: {
        name: 'Web Application',
        description: 'Full-featured web app with authentication and dashboard',
        features: ['User Authentication', 'Dashboard', 'User Management', 'Analytics'],
        requiredFields: ['appName'],
        optionalFields: ['enableAuth', 'authProvider', 'enableDashboard']
      }
    };

    return projectTypes[projectType] || projectTypes.base;
  }

  /**
   * Get design theme information
   */
  getThemeInfo(themeName) {
    const themes = {
      modern: {
        name: 'Modern',
        description: 'Clean, professional design with bold typography',
        colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' },
        fonts: { heading: 'Inter', body: 'Inter' }
      },
      elegant: {
        name: 'Elegant',
        description: 'Sophisticated design with refined typography',
        colors: { primary: '#1F2937', secondary: '#D97706', accent: '#DC2626' },
        fonts: { heading: 'Playfair Display', body: 'Source Serif Pro' }
      },
      creative: {
        name: 'Creative',
        description: 'Vibrant and playful with unique elements',
        colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#F59E0B' },
        fonts: { heading: 'Poppins', body: 'Inter' }
      },
      tech: {
        name: 'Tech',
        description: 'Futuristic design with neon accents',
        colors: { primary: '#06B6D4', secondary: '#8B5CF6', accent: '#10B981' },
        fonts: { heading: 'JetBrains Mono', body: 'Inter' }
      },
      minimal: {
        name: 'Minimal',
        description: 'Ultra-clean design with maximum whitespace',
        colors: { primary: '#000000', secondary: '#4B5563', accent: '#6B7280' },
        fonts: { heading: 'Inter', body: 'Inter' }
      },
      corporate: {
        name: 'Corporate',
        description: 'Professional business design',
        colors: { primary: '#1E40AF', secondary: '#059669', accent: '#DC2626' },
        fonts: { heading: 'Inter', body: 'Inter' }
      }
    };

    return themes[themeName] || themes.modern;
  }

  /**
   * Get default configuration for a project type
   */
  getDefaultConfig(projectType) {
    const baseConfig = {
      projectType: projectType,
      design: {
        theme: 'modern',
        layout: 'standard',
        heroStyle: 'centered'
      },
      headerData: {
        logoText: '',
        ctaText: '',
        ctaLink: '',
        menuItems: []
      },
      footerData: {
        companyName: '',
        companyDescription: '',
        email: '',
        phone: '',
        address: '',
        socialLinks: {}
      }
    };

    const projectSpecific = {
      base: {
        businessName: '',
        industry: 'business',
        businessDescription: '',
        targetAudience: 'customers',
        headerData: {
          menuItems: [
            { name: 'Home', link: '/' },
            { name: 'About', link: '/about' },
            { name: 'Services', link: '/services' },
            { name: 'Contact', link: '/contact' }
          ]
        }
      },
      ecommerce: {
        businessName: '',
        industry: 'retail',
        businessDescription: '',
        enablePayments: true,
        headerData: {
          menuItems: [
            { name: 'Home', link: '/' },
            { name: 'Shop', link: '/shop' },
            { name: 'About', link: '/about' },
            { name: 'Contact', link: '/contact' }
          ]
        }
      },
      ngo: {
        organizationName: '',
        mission: '',
        causeArea: 'Community Development',
        targetBeneficiaries: 'community members',
        enableDonations: true,
        enableVolunteering: true,
        headerData: {
          menuItems: [
            { name: 'Home', link: '/' },
            { name: 'About', link: '/about' },
            { name: 'Programs', link: '/programs' },
            { name: 'Get Involved', link: '/get-involved' },
            { name: 'Donate', link: '/donate' }
          ]
        }
      },
      webapp: {
        appName: '',
        appDescription: '',
        enableAuth: true,
        enableDashboard: true,
        headerData: {
          menuItems: [
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Users', link: '/users' },
            { name: 'Analytics', link: '/analytics' },
            { name: 'Settings', link: '/settings' }
          ]
        }
      }
    };

    return { ...baseConfig, ...projectSpecific[projectType] };
  }

  /**
   * Preview project configuration (without generating files)
   */
  previewProject(config) {
    this.validateConfig(config);

    const projectType = config.projectType || 'base';
    const templatePaths = this.templatePathManager.getTemplatePaths(projectType);
    const templateConfig = this.templatePathManager.prepareTemplateConfig(config);
    
    return {
      projectInfo: this.getProjectTypeInfo(projectType),
      themeInfo: this.getThemeInfo(config.design?.theme || 'modern'),
      templatePaths: Object.keys(templatePaths),
      templateConfig: {
        businessName: templateConfig.businessName,
        projectType: templateConfig.projectType,
        designTheme: templateConfig.designTheme,
        navigationItems: templateConfig.navigationItems.length,
        socialLinks: templateConfig.socialMediaLinks.length
      },
      estimatedFiles: Object.keys(templatePaths).length
    };
  }

  /**
   * Get supported project types
   */
  getSupportedTypes() {
    return this.supportedTypes;
  }

  /**
   * Get supported design themes
   */
  getSupportedThemes() {
    return this.supportedThemes;
  }

  /**
   * Get generator information
   */
  getGeneratorInfo() {
    return {
      version: '2.0.0',
      supportedTypes: this.supportedTypes,
      supportedThemes: this.supportedThemes,
      features: [
        'Unified template system',
        'Base template inheritance',
        'Project-specific overrides',
        'Dynamic page generation',
        'Design system integration',
        'Navigation-based routing',
        'Theme customization'
      ]
    };
  }
}

export default TemplatePathGenerator;