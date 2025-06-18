// lib/generator/TemplateLoader.js
import fs from 'fs';
import path from 'path';

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
   * Process template with config variables
   */
  processTemplate(template, config) {
    let processed = template;

    // Replace template variables
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(placeholder, value);
    });

    // Handle conditional blocks
    processed = this.processConditionals(processed, config);
    
    return processed;
  }

  /**
   * Process conditional template blocks
   */
  processConditionals(template, config) {
    // Handle {{#if condition}} blocks
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    return template.replace(ifRegex, (match, condition, content) => {
      return config[condition] ? content : '';
    });
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
} 
export default TemplateLoader;
