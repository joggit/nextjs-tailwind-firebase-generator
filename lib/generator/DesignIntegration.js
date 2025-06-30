// File: lib/generator/DesignIntegration.js
// Design Integration System for Enhanced Project Generation

import TemplatePathGenerator from './TemplatePathGenerator.js';
import { loadBaseTemplates, loadEcommerceTemplates } from './TemplatePaths.js';

export class DesignIntegratedGenerator extends TemplatePathGenerator {
  constructor() {
    super();
    this.themes = this.initializeThemes();
  }

  initializeThemes() {
    return {
      modern: {
        name: 'Modern',
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          neutral: '#6B7280'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        spacing: 'comfortable',
        corners: 'rounded'
      },
      elegant: {
        name: 'Elegant',
        colors: {
          primary: '#1F2937',
          secondary: '#D97706',
          accent: '#DC2626',
          neutral: '#6B7280'
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Source Serif Pro'
        },
        spacing: 'spacious',
        corners: 'sharp'
      },
      creative: {
        name: 'Creative',
        colors: {
          primary: '#EC4899',
          secondary: '#8B5CF6',
          accent: '#F59E0B',
          neutral: '#6B7280'
        },
        fonts: {
          heading: 'Poppins',
          body: 'Inter'
        },
        spacing: 'comfortable',
        corners: 'very-rounded'
      },
      tech: {
        name: 'Tech',
        colors: {
          primary: '#06B6D4',
          secondary: '#8B5CF6',
          accent: '#10B981',
          neutral: '#6B7280'
        },
        fonts: {
          heading: 'JetBrains Mono',
          body: 'Inter'
        },
        spacing: 'compact',
        corners: 'sharp'
      },
      minimal: {
        name: 'Minimal',
        colors: {
          primary: '#000000',
          secondary: '#4B5563',
          accent: '#6B7280',
          neutral: '#9CA3AF'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        spacing: 'spacious',
        corners: 'sharp'
      },
      corporate: {
        name: 'Corporate',
        colors: {
          primary: '#1E40AF',
          secondary: '#059669',
          accent: '#DC2626',
          neutral: '#6B7280'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        spacing: 'comfortable',
        corners: 'rounded'
      }
    };
  }

  async generateProject(config) {
    console.log(`🎨 Generating design-integrated project: ${config.businessName}`);
    
    // Extract design configuration
    const designConfig = config.design || {};
    const selectedTheme = this.themes[designConfig.theme] || this.themes.modern;
    
    console.log(`🎨 Using theme: ${selectedTheme.name}`);

    const project = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: config.projectType || 'website',
      config,
      files: {},
      generationMetadata: {
        projectType: config.projectType || 'website',
        theme: selectedTheme.name,
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now()
      }
    };

    try {
      // Prepare enhanced template configuration
      const templateConfig = this.prepareTemplateConfig(config, selectedTheme);
      
      // Load base templates
      const baseFiles = await loadBaseTemplates(templateConfig);
      console.log(`✅ Loaded ${Object.keys(baseFiles).length} base templates`);

      // Load specialized templates if needed
      let specializedFiles = {};
      if (config.projectType === 'ecommerce' || config.template === 'ecommerce') {
        specializedFiles = await loadEcommerceTemplates(templateConfig);
        console.log(`✅ Loaded ${Object.keys(specializedFiles).length} ecommerce templates`);
      }

      // Apply design enhancements
      const designEnhancedFiles = this.applyDesignEnhancements(
        { ...baseFiles, ...specializedFiles }, 
        selectedTheme, 
        templateConfig
      );

      project.files = designEnhancedFiles;

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      project.generationMetadata.designEnhanced = true;
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Design-integrated project generated with ${Object.keys(project.files).length} files`);
      
      return project;

    } catch (error) {
      console.error('❌ Error generating design-integrated project:', error);
      throw new Error(`Design-integrated project generation failed: ${error.message}`);
    }
  }

  prepareTemplateConfig(config, selectedTheme) {
    console.log('🔧 Preparing enhanced template configuration...');

    // Base template configuration
    const templateConfig = {
      // Business Information
      businessName: config.businessName || 'Your Business',
      businessNameSlug: (config.businessName || 'your-business').toLowerCase().replace(/\s+/g, '-'),
      industry: config.industry || 'business',
      businessType: config.businessType || 'company',
      targetAudience: config.targetAudience || 'customers',
      businessDescription: config.businessDescription || 'Professional services',

      // Design Theme Integration
      themeName: selectedTheme.name,
      primaryColor: selectedTheme.colors.primary,
      secondaryColor: selectedTheme.colors.secondary,
      accentColor: selectedTheme.colors.accent,
      neutralColor: selectedTheme.colors.neutral,
      headingFont: selectedTheme.fonts.heading,
      bodyFont: selectedTheme.fonts.body,
      spacing: selectedTheme.spacing,
      corners: selectedTheme.corners,

      // Header Data (with nested menu support)
      headerData: config.headerData || {
        style: 'solid',
        logoType: 'text',
        logoText: config.businessName || 'Your Business',
        showCta: true,
        ctaText: 'Get Started',
        ctaLink: '/contact',
        menuItems: [
          { name: 'Home', link: '/', type: 'link', children: [] },
          { name: 'About', link: '/about', type: 'link', children: [] },
          { name: 'Services', link: '/services', type: 'link', children: [] },
          { name: 'Contact', link: '/contact', type: 'link', children: [] }
        ]
      },

      // Hero Data
      heroData: config.design?.heroData || [{
        type: 'centered',
        headline: `Welcome to ${config.businessName || 'Your Business'}`,
        description: config.businessDescription || 'Professional services for your success',
        ctaPrimary: { text: 'Get Started', href: '/contact' },
        ctaSecondary: { text: 'Learn More', href: '/about' },
        backgroundType: 'gradient'
      }],

      // Footer Data
      footerData: config.footerData || {
        style: 'multiColumn',
        companyName: config.businessName || 'Your Business',
        companyDescription: config.businessDescription || 'Professional services',
        email: `contact@${(config.businessName || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '(555) 123-4567',
        address: '123 Business St, City, State 12345',
        showNewsletter: true,
        socialLinks: {}
      },

      // Feature Flags
      enableEcommerce: config.projectType === 'ecommerce' || config.template === 'ecommerce',
      enableAnalytics: config.enableAnalytics !== false,
      enableSEO: config.enableSEO !== false,

      // Technical Configuration
      currentYear: new Date().getFullYear(),
      projectId: config.projectId || `design_${Date.now()}`,

      // Pages
      pages: config.pages || [
        { id: 'home', name: 'Home', type: 'home', enabled: true },
        { id: 'about', name: 'About', type: 'about', enabled: true },
        { id: 'services', name: 'Services', type: 'services', enabled: true },
        { id: 'contact', name: 'Contact', type: 'contact', enabled: true }
      ],

      // Features
      features: config.features || [
        'Responsive Design',
        'SEO Optimized',
        'Modern UI/UX'
      ]
    };

    return templateConfig;
  }

  applyDesignEnhancements(files, selectedTheme, templateConfig) {
    console.log('🎨 Applying design enhancements...');

    const enhancedFiles = {};

    // Process each file with design enhancements
    for (const [filePath, content] of Object.entries(files)) {
      try {
        let enhancedContent = content;

        // Apply theme-specific enhancements based on file type
        if (filePath.endsWith('.css') || filePath.includes('globals.css')) {
          enhancedContent = this.enhanceStylesWithTheme(content, selectedTheme);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
          enhancedContent = this.enhanceComponentWithTheme(content, selectedTheme, templateConfig);
        } else if (filePath.includes('tailwind.config')) {
          enhancedContent = this.enhanceTailwindConfig(content, selectedTheme);
        }

        enhancedFiles[filePath] = enhancedContent;
      } catch (error) {
        console.warn(`⚠️ Failed to enhance ${filePath}:`, error.message);
        enhancedFiles[filePath] = content; // Use original content if enhancement fails
      }
    }

    return enhancedFiles;
  }

  enhanceStylesWithTheme(content, theme) {
    // Add theme-specific CSS variables and enhancements
    const themeVariables = `
/* ${theme.name} Theme Variables */
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-neutral: ${theme.colors.neutral};
  --font-heading: '${theme.fonts.heading}', sans-serif;
  --font-body: '${theme.fonts.body}', sans-serif;
  --spacing: ${theme.spacing};
  --corners: ${theme.corners};
}

/* Theme-specific enhancements */
.theme-${theme.name.toLowerCase()} {
  --primary: ${theme.colors.primary};
  --secondary: ${theme.colors.secondary};
  --accent: ${theme.colors.accent};
}
`;

    return themeVariables + '\n' + content;
  }

  enhanceComponentWithTheme(content, theme, templateConfig) {
    // Replace theme placeholders in components
    let enhanced = content;

    // Replace color placeholders
    enhanced = enhanced.replace(/{{primaryColor}}/g, theme.colors.primary);
    enhanced = enhanced.replace(/{{secondaryColor}}/g, theme.colors.secondary);
    enhanced = enhanced.replace(/{{accentColor}}/g, theme.colors.accent);
    enhanced = enhanced.replace(/{{neutralColor}}/g, theme.colors.neutral);

    // Replace font placeholders
    enhanced = enhanced.replace(/{{headingFont}}/g, theme.fonts.heading);
    enhanced = enhanced.replace(/{{bodyFont}}/g, theme.fonts.body);

    // Replace business information
    enhanced = enhanced.replace(/{{businessName}}/g, templateConfig.businessName);
    enhanced = enhanced.replace(/{{industry}}/g, templateConfig.industry);
    enhanced = enhanced.replace(/{{businessDescription}}/g, templateConfig.businessDescription);

    // Replace theme name
    enhanced = enhanced.replace(/{{themeName}}/g, theme.name);

    return enhanced;
  }

  enhanceTailwindConfig(content, theme) {
    // Enhance Tailwind config with theme colors
    const themeColors = `
  colors: {
    primary: '${theme.colors.primary}',
    secondary: '${theme.colors.secondary}',
    accent: '${theme.colors.accent}',
    neutral: '${theme.colors.neutral}',
  },
  fontFamily: {
    heading: ['${theme.fonts.heading}', 'sans-serif'],
    body: ['${theme.fonts.body}', 'sans-serif'],
  },`;

    // Insert theme colors into the extend section
    if (content.includes('extend: {')) {
      return content.replace('extend: {', `extend: {\n${themeColors}`);
    }

    return content;
  }

  // Utility method to get available themes
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name,
      colors: this.themes[key].colors
    }));
  }

  // Utility method to get theme by ID
  getTheme(themeId) {
    return this.themes[themeId] || this.themes.modern;
  }
}

export default DesignIntegratedGenerator;