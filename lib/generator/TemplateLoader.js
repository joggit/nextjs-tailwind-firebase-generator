// Enhanced TemplateLoader.js
import fs from 'fs';
import path from 'path';

// Design theme configurations
const DESIGN_THEMES = {
  modern: {
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
    spacing: {
      borderRadius: '0.5rem'
    }
  },
  elegant: {
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
    spacing: {
      borderRadius: '0.25rem'
    }
  },
  creative: {
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      neutral: '#6B7280'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans'
    },
    spacing: {
      borderRadius: '1rem'
    }
  }
};

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
    this.cache = new Map();
  }

  /**
   * Load a template file and process it with config
   */
  async loadTemplate(templatePath, config = {}) {
    try {
      const fullPath = path.join(this.templatesPath, templatePath);
      
      // Check cache first
      if (this.cache.has(fullPath)) {
        return this.processTemplate(this.cache.get(fullPath), config);
      }

      // Read template file
      const templateContent = fs.readFileSync(fullPath, 'utf8');
      this.cache.set(fullPath, templateContent);
      
      return this.processTemplate(templateContent, config);
    } catch (error) {
      console.error(`❌ Failed to load template: ${templatePath}`, error);
      throw new Error(`Template not found: ${templatePath}`);
    }
  }

  /**
   * Process template with config variables including design system
   */
  processTemplate(template, config) {
    let processed = template;

    // Get design theme
    const designTheme = DESIGN_THEMES[config.design?.theme] || DESIGN_THEMES.modern;
    
    // Create enhanced config with design variables
    const enhancedConfig = {
      ...config,
      // Design variables
      primaryColor: designTheme.colors.primary,
      secondaryColor: designTheme.colors.secondary,
      accentColor: designTheme.colors.accent,
      neutralColor: designTheme.colors.neutral,
      headingFont: designTheme.fonts.heading,
      bodyFont: designTheme.fonts.body,
      borderRadius: designTheme.spacing.borderRadius,
      // Theme info
      themeName: config.design?.theme || 'modern',
      themeId: config.design?.theme || 'modern'
    };

    // Replace template variables
    Object.entries(enhancedConfig).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(placeholder, value);
      }
    });

    // Handle conditional blocks
    processed = this.processConditionals(processed, enhancedConfig);
    
    return processed;
  }

  /**
   * Process conditional template blocks
   */
  processConditionals(template, config) {
    // Handle {{#if condition}} blocks
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    template = template.replace(ifRegex, (match, condition, content) => {
      return config[condition] ? content : '';
    });

    // Handle {{#unless condition}} blocks  
    const unlessRegex = /{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g;
    template = template.replace(unlessRegex, (match, condition, content) => {
      return !config[condition] ? content : '';
    });

    return template;
  }

  /**
   * Load multiple templates at once
   */
  async loadTemplates(templatePaths, config = {}) {
    const results = {};
    
    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      results[outputPath] = await this.loadTemplate(templatePath, config);
    }
    
    return results;
  }

  /**
   * Get available design themes
   */
  getAvailableThemes() {
    return Object.keys(DESIGN_THEMES);
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(themeName) {
    return DESIGN_THEMES[themeName] || DESIGN_THEMES.modern;
  }
}

export default TemplateLoader;