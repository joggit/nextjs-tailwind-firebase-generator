// Enhanced Template Loader with conditional processing
// File: lib/generator/TemplateLoader.js

import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
    this.cache = new Map();
  }

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

  processTemplate(template, config) {
    let processed = template;

    // 1. Process conditional blocks first
    processed = this.processConditionals(processed, config);

    // 2. Replace template variables
    processed = this.replaceVariables(processed, config);

    return processed;
  }

  processConditionals(template, config) {
    // Handle {{#if condition}} blocks
    const ifRegex = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
    template = template.replace(ifRegex, (match, condition, content) => {
      const value = this.getNestedValue(config, condition);
      return value ? content : '';
    });

    // Handle {{#unless condition}} blocks  
    const unlessRegex = /{{#unless\s+([\w.]+)}}([\s\S]*?){{\/unless}}/g;
    template = template.replace(unlessRegex, (match, condition, content) => {
      const value = this.getNestedValue(config, condition);
      return !value ? content : '';
    });

    // Handle {{#each array}} blocks
    const eachRegex = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
    template = template.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getNestedValue(config, arrayPath);
      if (Array.isArray(array)) {
        return array.map(item => {
          let itemContent = content;
          // Replace {{this}} with current item
          if (typeof item === 'string') {
            itemContent = itemContent.replace(/{{this}}/g, item);
          } else if (typeof item === 'object') {
            // Replace {{property}} with item.property
            Object.entries(item).forEach(([key, value]) => {
              const itemRegex = new RegExp(`{{${key}}}`, 'g');
              itemContent = itemContent.replace(itemRegex, value);
            });
          }
          return itemContent;
        }).join('');
      }
      return '';
    });

    return template;
  }

  replaceVariables(template, config) {
    // Replace all {{variable}} patterns
    const variableRegex = /{{([\w.]+)}}/g;
    return template.replace(variableRegex, (match, variablePath) => {
      const value = this.getNestedValue(config, variablePath);
      return value !== undefined ? value : '';
    });
  }

  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async loadTemplates(templatePaths, config = {}) {
    const results = {};

    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      results[outputPath] = await this.loadTemplate(templatePath, config);
    }

    return results;
  }

  clearCache() {
    this.cache.clear();
  }

  validateTemplate(templatePath, templateContent, config) {
    const requiredVariables = templateContent.match(/{{([\w.]+)}}/g) || [];
    const missingVars = requiredVariables.filter(variable => {
      const varPath = variable.replace(/[{}]/g, '');
      return this.getNestedValue(config, varPath) === undefined;
    });

    if (missingVars.length > 0) {
      console.warn(`⚠️  Template ${templatePath} missing variables:`, missingVars);
    }

    return missingVars;
  }
}

export default TemplateLoader;

/*
Usage Examples:

1. Simple variables:
   {{projectName}} → config.projectName
   {{theme.primaryColor}} → config.theme.primaryColor

2. Conditional blocks:
   {{#if header.logo}}
   <img src="{{header.logo}}" />
   {{/if}}
   → Only renders if config.header.logo exists

3. Unless blocks:
   {{#unless animations.enabled}}
   <div>Animations disabled</div>
   {{/unless}}
   → Only renders if config.animations.enabled is false

4. Each loops:
   {{#each header.menuItems}}
   <a href="{{link}}">{{label}}</a>
   {{/each}}
   → Loops through config.header.menuItems array

5. Nested paths:
   {{theme.layout.header}} → config.theme.layout.header
   {{components.navbar.textColor}} → config.components.navbar.textColor
*/