// Enhanced TemplateLoader.js
import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
    this.cache = new Map();
  }

  /**
   * Load a template file and process it with enhanced config
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
   * Enhanced template processing with advanced features
   */
  processTemplate(template, config) {
    let processed = template;

    // Step 1: Replace basic template variables
    processed = this.replaceBasicVariables(processed, config);
    
    // Step 2: Process advanced conditionals
    processed = this.processAdvancedConditionals(processed, config);
    
    // Step 3: Process loops and iterations
    processed = this.processLoops(processed, config);
    
    // Step 4: Process includes and partials
    processed = this.processIncludes(processed, config);
    
    // Step 5: Process dynamic content generation
    processed = this.processDynamicContent(processed, config);

    return processed;
  }

  /**
   * Replace basic {{variable}} patterns
   */
  replaceBasicVariables(template, config) {
    let processed = template;

    // Replace all config variables
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      
      // Handle different value types
      if (typeof value === 'string' || typeof value === 'number') {
        processed = processed.replace(placeholder, value);
      } else if (typeof value === 'boolean') {
        processed = processed.replace(placeholder, value ? 'true' : 'false');
      } else if (Array.isArray(value)) {
        processed = processed.replace(placeholder, value.join(', '));
      } else if (typeof value === 'object' && value !== null) {
        processed = processed.replace(placeholder, JSON.stringify(value));
      }
    });

    return processed;
  }

  /**
   * Process advanced conditional blocks
   */
  processAdvancedConditionals(template, config) {
    let processed = template;

    // Handle {{#if condition}} blocks
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    processed = processed.replace(ifRegex, (match, condition, content) => {
      return this.evaluateCondition(condition, config) ? content : '';
    });

    // Handle {{#unless condition}} blocks
    const unlessRegex = /{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g;
    processed = processed.replace(unlessRegex, (match, condition, content) => {
      return !this.evaluateCondition(condition, config) ? content : '';
    });

    // Handle {{#ifEquals value1 value2}} blocks
    const ifEqualsRegex = /{{#ifEquals\s+(\w+)\s+(\w+)}}([\s\S]*?){{\/ifEquals}}/g;
    processed = processed.replace(ifEqualsRegex, (match, value1, value2, content) => {
      const val1 = config[value1] || value1;
      const val2 = config[value2] || value2;
      return val1 === val2 ? content : '';
    });

    // Handle {{#ifNotEquals value1 value2}} blocks
    const ifNotEqualsRegex = /{{#ifNotEquals\s+(\w+)\s+(\w+)}}([\s\S]*?){{\/ifNotEquals}}/g;
    processed = processed.replace(ifNotEqualsRegex, (match, value1, value2, content) => {
      const val1 = config[value1] || value1;
      const val2 = config[value2] || value2;
      return val1 !== val2 ? content : '';
    });

    return processed;
  }

  /**
   * Process loop structures
   */
  processLoops(template, config) {
    let processed = template;

    // Handle {{#each array}} blocks
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
    processed = processed.replace(eachRegex, (match, arrayName, content) => {
      const array = config[arrayName];
      if (Array.isArray(array)) {
        return array.map((item, index) => {
          let itemContent = content;
          
          // Replace {{this}} with current item
          itemContent = itemContent.replace(/{{this}}/g, typeof item === 'object' ? JSON.stringify(item) : item);
          
          // Replace {{@index}} with current index
          itemContent = itemContent.replace(/{{@index}}/g, index);
          
          // Replace {{@first}} and {{@last}}
          itemContent = itemContent.replace(/{{@first}}/g, index === 0);
          itemContent = itemContent.replace(/{{@last}}/g, index === array.length - 1);
          
          // Replace object properties if item is an object
          if (typeof item === 'object' && item !== null) {
            Object.entries(item).forEach(([key, value]) => {
              const itemPlaceholder = new RegExp(`{{${key}}}`, 'g');
              itemContent = itemContent.replace(itemPlaceholder, value);
            });
          }
          
          return itemContent;
        }).join('');
      }
      return '';
    });

    return processed;
  }

  /**
   * Process include statements
   */
  processIncludes(template, config) {
    let processed = template;

    // Handle {{> partialName}} includes
    const includeRegex = /{{>\s*(\w+)}}/g;
    processed = processed.replace(includeRegex, (match, partialName) => {
      try {
        const partialPath = path.join(this.templatesPath, 'partials', `${partialName}.template`);
        if (fs.existsSync(partialPath)) {
          const partialContent = fs.readFileSync(partialPath, 'utf8');
          return this.processTemplate(partialContent, config);
        }
      } catch (error) {
        console.warn(`⚠️ Could not include partial: ${partialName}`);
      }
      return '';
    });

    return processed;
  }

  /**
   * Process dynamic content generation
   */
  processDynamicContent(template, config) {
    let processed = template;

    // Handle navigation menu generation
    processed = processed.replace(/{{navigationMenu}}/g, () => {
      if (config.navigationItems && Array.isArray(config.navigationItems)) {
        return config.navigationItems.map(item => 
          `<Link href="${item.link}" className="text-gray-600 hover:text-blue-600 transition-colors">${item.name}</Link>`
        ).join('\n          ');
      }
      return '';
    });

    // Handle mobile navigation menu generation
    processed = processed.replace(/{{mobileNavigationMenu}}/g, () => {
      if (config.navigationItems && Array.isArray(config.navigationItems)) {
        return config.navigationItems.map(item => 
          `<Link href="${item.link}" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">${item.name}</Link>`
        ).join('\n            ');
      }
      return '';
    });

    // Handle social media links generation
    processed = processed.replace(/{{socialMediaLinks}}/g, () => {
      if (config.socialMediaLinks && Array.isArray(config.socialMediaLinks)) {
        return config.socialMediaLinks.map(social => 
          `<a href="${social.url}" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="${social.name}">
            <span className="sr-only">${social.name}</span>
            <div className="w-5 h-5 bg-current"></div>
          </a>`
        ).join('\n        ');
      }
      return '';
    });

    // Handle hero background styling
    processed = processed.replace(/{{heroBackgroundStyle}}/g, () => {
      if (config.heroBackgroundType === 'gradient') {
        return 'bg-gradient-to-br from-blue-600 to-purple-600';
      } else if (config.heroBackgroundType === 'solid') {
        return 'bg-blue-600';
      } else if (config.heroBackgroundType === 'image' && config.heroBackgroundImage) {
        return `bg-cover bg-center bg-no-repeat`;
      } else if (config.heroBackgroundType === 'video') {
        return 'bg-gray-900';
      }
      return 'bg-gradient-to-br from-blue-600 to-purple-600';
    });

    // Handle hero background image
    processed = processed.replace(/{{heroBackgroundImageStyle}}/g, () => {
      if (config.heroBackgroundType === 'image' && config.heroBackgroundImage) {
        return `background-image: url('${config.heroBackgroundImage}');`;
      }
      return '';
    });

    return processed;
  }

  /**
   * Evaluate condition for conditional blocks
   */
  evaluateCondition(condition, config) {
    // Handle dot notation (e.g., design.theme)
    if (condition.includes('.')) {
      const parts = condition.split('.');
      let value = config;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) break;
      }
      return !!value;
    }
    
    // Handle simple condition
    const value = config[condition];
    return !!value;
  }

  /**
   * Load multiple templates at once with enhanced processing
   */
  async loadTemplates(templatePaths, config = {}) {
    const results = {};
    
    console.log(`🔄 Processing ${Object.keys(templatePaths).length} templates with enhanced features...`);
    
    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      try {
        results[outputPath] = await this.loadTemplate(templatePath, config);
      } catch (error) {
        console.error(`❌ Failed to process template ${templatePath}:`, error.message);
        // Continue processing other templates
        results[outputPath] = `// Error processing template: ${error.message}`;
      }
    }
    
    console.log(`✅ Processed ${Object.keys(results).length} templates successfully`);
    return results;
  }

  /**
   * Validate template syntax
   */
  validateTemplate(templatePath, templateContent) {
    const issues = [];
    
    // Check for unmatched conditional blocks
    const ifMatches = (templateContent.match(/{{#if\s+\w+}}/g) || []).length;
    const endIfMatches = (templateContent.match(/{{\/if}}/g) || []).length;
    if (ifMatches !== endIfMatches) {
      issues.push(`Unmatched {{#if}} blocks: ${ifMatches} opens, ${endIfMatches} closes`);
    }
    
    // Check for unmatched each blocks
    const eachMatches = (templateContent.match(/{{#each\s+\w+}}/g) || []).length;
    const endEachMatches = (templateContent.match(/{{\/each}}/g) || []).length;
    if (eachMatches !== endEachMatches) {
      issues.push(`Unmatched {{#each}} blocks: ${eachMatches} opens, ${endEachMatches} closes`);
    }
    
    // Check for required variables
    const requiredVariables = templateContent.match(/{{(\w+)}}/g) || [];
    const missingVars = requiredVariables.filter(variable => {
      const varName = variable.replace(/[{}]/g, '');
      return !this.config?.hasOwnProperty(varName);
    });
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Template ${templatePath} has potentially missing variables:`, missingVars);
    }
    
    if (issues.length > 0) {
      console.error(`❌ Template validation issues in ${templatePath}:`, issues);
    }
    
    return issues.length === 0;
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Template cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default TemplateLoader;