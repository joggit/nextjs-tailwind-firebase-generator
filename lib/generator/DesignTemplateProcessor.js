// Enhanced Template Processor with Design System Integration
// File: lib/generator/DesignTemplateProcessor.js

import { TemplateLoader } from './TemplateLoader.js';
import { 
  getThemeTemplate, 
  getLayoutTemplate, 
  getHeroTemplate 
} from './templates/design/DesignTemplateConfig.js';

export class DesignTemplateProcessor extends TemplateLoader {
  constructor() {
    super();
    this.designConfig = null;
  }

  /**
   * Process template with design system variables
   */
  processDesignTemplate(template, config) {
    // First, create a complete variable map including design system variables
    const completeConfig = this.buildCompleteConfig(config);
    
    // Process the template with all variables
    return this.processTemplate(template, completeConfig);
  }

  /**
   * Build complete configuration including design system variables
   */
  buildCompleteConfig(config) {
    const designConfig = config.design || {};
    
    // Get design templates
    const themeTemplate = getThemeTemplate(designConfig.theme || 'modern');
    const layoutTemplate = getLayoutTemplate(designConfig.layout || 'standard');
    const heroTemplate = getHeroTemplate(designConfig.heroStyle || 'centered');

    // Build complete config with design variables
    const completeConfig = {
      // Original config
      ...config,
      
      // Basic business info
      businessName: config.businessName || config.name || 'Your Business',
      industry: config.industry || 'business',
      businessDescription: config.businessDescription || `Professional ${config.industry || 'business'} solutions`,
      targetAudience: config.targetAudience || 'customers',
      
      // Design System Variables
      ...this.buildDesignVariables(themeTemplate, layoutTemplate, heroTemplate, config),
      
      // Theme colors (flattened for easy access)
      primary: themeTemplate.colors.primary,
      secondary: themeTemplate.colors.secondary,
      accent: themeTemplate.colors.accent,
      neutral: themeTemplate.colors.neutral,
      background: themeTemplate.colors.background,
      surface: themeTemplate.colors.surface,
      
      // Typography
      fontHeading: themeTemplate.typography.headingFont,
      fontBody: themeTemplate.typography.bodyFont,
      headingWeight: themeTemplate.typography.headingWeight,
      bodyWeight: themeTemplate.typography.bodyWeight,
      
      // Current year for copyright
      currentYear: new Date().getFullYear()
    };

    return completeConfig;
  }

  /**
   * Build design-specific template variables
   */
  buildDesignVariables(themeTemplate, layoutTemplate, heroTemplate, config) {
    const designConfig = config.design || {};
    
    return {
      // Hero Section Variables
      heroBackground: this.getHeroBackground(themeTemplate, designConfig),
      heroLayout: heroTemplate.layout,
      heroContainer: heroTemplate.container,
      containerWidth: layoutTemplate.containerWidth,
      
      // Typography Sizing
      headlineSize: this.getHeadlineSize(designConfig.heroStyle),
      
      // Layout Variables
      maxWidth: this.getMaxWidth(designConfig.heroStyle),
      justifyContent: this.getJustifyContent(designConfig.heroStyle),
      
      // Theme Classes
      themeClasses: this.getThemeClasses(themeTemplate),
      buttonPrimary: themeTemplate.components.button.primary,
      buttonSecondary: themeTemplate.components.button.secondary,
      buttonOutline: themeTemplate.components.button.outline,
      cardDefault: themeTemplate.components.card.default,
      cardElevated: themeTemplate.components.card.elevated,
      
      // Animation Classes
      animationHover: themeTemplate.animations.hover,
      animationFadeIn: themeTemplate.animations.fadeIn,
      
      // Navigation
      navigationStyle: layoutTemplate.navigation,
      sidebarEnabled: layoutTemplate.sidebar,
      
      // Spacing
      spacingScale: themeTemplate.spacing.scale,
      borderRadius: themeTemplate.spacing.borderRadius,
      shadowStyle: themeTemplate.spacing.shadowStyle
    };
  }

  /**
   * Get hero background based on theme
   */
  getHeroBackground(themeTemplate, designConfig) {
    const themeId = themeTemplate.id;
    
    switch (themeId) {
      case 'tech':
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
      case 'creative':
        return 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50';
      case 'elegant':
        return 'bg-gradient-to-br from-amber-50 via-white to-orange-50';
      case 'minimal':
        return 'bg-white';
      case 'corporate':
        return 'bg-gradient-to-br from-blue-50 via-white to-gray-50';
      default: // modern
        return 'bg-gradient-to-br from-blue-50 via-white to-purple-50';
    }
  }

  /**
   * Get headline size based on hero style
   */
  getHeadlineSize(heroStyle) {
    switch (heroStyle) {
      case 'fullscreen':
        return 'text-5xl md:text-7xl lg:text-8xl';
      case 'minimal':
        return 'text-3xl md:text-4xl lg:text-5xl';
      case 'split':
        return 'text-4xl md:text-5xl lg:text-6xl';
      default: // centered, animated, video
        return 'text-4xl md:text-6xl lg:text-7xl';
    }
  }

  /**
   * Get max width based on hero style
   */
  getMaxWidth(heroStyle) {
    switch (heroStyle) {
      case 'fullscreen':
        return 'max-w-5xl mx-auto';
      case 'minimal':
        return 'max-w-2xl mx-auto';
      case 'split':
        return 'max-w-lg';
      default:
        return 'max-w-3xl mx-auto';
    }
  }

  /**
   * Get justify content based on hero style
   */
  getJustifyContent(heroStyle) {
    switch (heroStyle) {
      case 'split':
        return 'justify-start';
      case 'minimal':
        return 'justify-start';
      default:
        return 'justify-center';
    }
  }

  /**
   * Get theme-specific CSS classes
   */
  getThemeClasses(themeTemplate) {
    return `theme-${themeTemplate.id}`;
  }

  /**
   * Load and process design-aware template
   */
  async loadDesignTemplate(templatePath, config = {}) {
    try {
      // Load the raw template
      const template = await this.loadTemplate(templatePath, {});
      
      // Process with design system variables
      return this.processDesignTemplate(template, config);
    } catch (error) {
      console.error(`❌ Failed to load design template: ${templatePath}`, error);
      throw error;
    }
  }

  /**
   * Process advanced template features including loops and conditionals
   */
  processTemplate(template, config) {
    let processed = template;

    // Replace basic template variables
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(placeholder, String(value || ''));
    });

    // Handle conditional blocks
    processed = this.processConditionals(processed, config);
    
    // Handle loops
    processed = this.processLoops(processed, config);
    
    // Handle nested object access
    processed = this.processNestedAccess(processed, config);

    return processed;
  }

  /**
   * Process nested object access like {{design.theme}}
   */
  processNestedAccess(template, config) {
    const nestedRegex = /\{\{([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*)\}\}/g;
    
    return template.replace(nestedRegex, (match, path) => {
      try {
        const value = path.split('.').reduce((obj, key) => obj?.[key], config);
        return String(value || '');
      } catch (error) {
        console.warn(`❌ Failed to resolve nested path: ${path}`);
        return match; // Keep original if resolution fails
      }
    });
  }

  /**
   * Process loop blocks like {{#each features}}
   */
  processLoops(template, config) {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(loopRegex, (match, arrayName, content) => {
      const array = config[arrayName];
      if (Array.isArray(array)) {
        return array.map((item, index) => {
          let itemContent = content;
          
          // Replace item properties
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              const itemPlaceholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
              itemContent = itemContent.replace(itemPlaceholder, String(value || ''));
            });
          }
          
          // Replace special loop variables
          itemContent = itemContent.replace(/\{\{@index\}\}/g, index);
          itemContent = itemContent.replace(/\{\{@first\}\}/g, index === 0);
          itemContent = itemContent.replace(/\{\{@last\}\}/g, index === array.length - 1);
          
          return itemContent;
        }).join('');
      }
      return '';
    });
  }

  /**
   * Enhanced conditional processing
   */
  processConditionals(template, config) {
    // Handle {{#if condition}} blocks
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    template = template.replace(ifRegex, (match, condition, content) => {
      return config[condition] ? content : '';
    });

    // Handle {{#unless condition}} blocks
    const unlessRegex = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    template = template.replace(unlessRegex, (match, condition, content) => {
      return !config[condition] ? content : '';
    });

    return template;
  }

  /**
   * Validate that all required variables are present
   */
  validateTemplate(templateContent, config) {
    const requiredVariables = templateContent.match(/\{\{(\w+)\}\}/g) || [];
    const missingVars = requiredVariables.filter(variable => {
      const varName = variable.replace(/[{}]/g, '');
      return !config.hasOwnProperty(varName);
    });
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Template missing variables:`, missingVars);
      return false;
    }
    
    return true;
  }
}

export default DesignTemplateProcessor;