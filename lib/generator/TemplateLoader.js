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

  // In your TemplateLoader.js, add these methods:

processAdvancedConditionals(template, config) {
  // Handle {{#unless condition}} blocks
  const unlessRegex = /{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g;
  template = template.replace(unlessRegex, (match, condition, content) => {
    return !config[condition] ? content : '';
  });

  // Handle {{#each array}} blocks
  const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  template = template.replace(eachRegex, (match, arrayName, content) => {
    const array = config[arrayName];
    if (Array.isArray(array)) {
      return array.map(item => {
        let itemContent = content;
        Object.entries(item).forEach(([key, value]) => {
          const itemPlaceholder = new RegExp(`{{${key}}}`, 'g');
          itemContent = itemContent.replace(itemPlaceholder, value);
        });
        return itemContent;
      }).join('');
    }
    return '';
  });

  return template;
}
// Add to TemplateLoader.js
validateTemplate(templatePath, templateContent) {
  const requiredVariables = templateContent.match(/{{(\w+)}}/g) || [];
  const missingVars = requiredVariables.filter(variable => {
    const varName = variable.replace(/[{}]/g, '');
    return !this.config.hasOwnProperty(varName);
  });
  
  if (missingVars.length > 0) {
    console.warn(`Template ${templatePath} missing variables:`, missingVars);
  }
}

} 
export default TemplateLoader;
