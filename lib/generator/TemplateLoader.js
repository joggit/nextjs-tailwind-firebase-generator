// Updated TemplateLoader.js with debugging
// File: lib/generator/TemplateLoader.js

import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
  }

  async loadTemplate(templatePath, config = {}) {
    try {
      // DEBUG: Log the config structure
      console.log('🔍 Config being passed to template:', JSON.stringify(config, null, 2));

      const fullPath = path.join(this.templatesPath, templatePath);
      const templateContent = fs.readFileSync(fullPath, 'utf8');
      return this.processTemplate(templateContent, config);
    } catch (error) {
      console.error(`❌ Failed to load template: ${templatePath}`, error);
      throw new Error(`Template not found: ${templatePath}`);
    }
  }

  processTemplate(template, config) {
    let processed = template;

    // DEBUG: Log some key values
    console.log('🔍 businessName:', config.businessName);
    console.log('🔍 theme.primaryColor:', config.theme?.primaryColor);
    console.log('🔍 components.navbar.backgroundColor:', config.components?.navbar?.backgroundColor);
    console.log('🔍 header.menuItems:', config.header?.menuItems);

    processed = this.processEachBlocks(processed, config);
    processed = this.replaceVariables(processed, config);

    return processed;
  }

  processEachBlocks(template, config) {
    const eachRegex = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
    return template.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getNestedValue(config, arrayPath);
      console.log(`🔍 Each loop for ${arrayPath}:`, array);

      if (Array.isArray(array)) {
        return array.map(item => {
          let itemContent = content;
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              itemContent = itemContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
          }
          return itemContent;
        }).join('');
      }
      return '';
    });
  }

  replaceVariables(template, config) {
    const variableRegex = /{{([\w.]+)}}/g;
    return template.replace(variableRegex, (match, variablePath) => {
      const value = this.getNestedValue(config, variablePath);

      // DEBUG: Log each variable replacement
      if (value === undefined) {
        console.log(`⚠️  Missing variable: ${variablePath}`);
      } else {
        console.log(`✅ Found variable: ${variablePath} = ${value}`);
      }

      return value !== undefined ? value : '';
    });
  }

  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;

    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    } catch (error) {
      console.error(`❌ Error accessing path ${path}:`, error);
      return undefined;
    }
  }

  // Helper method to log all available paths in config
  logAvailablePaths(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.logAvailablePaths(value, fullKey);
      } else {
        console.log(`📍 Available: {{${fullKey}}} = ${value}`);
      }
    });
  }

  async loadTemplates(templatePaths, config = {}) {
    const results = {};

    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      results[outputPath] = await this.loadTemplate(templatePath, config);
    }

    return results;
  }

  clearCache() {
    this.cache?.clear();
  }
}

export default TemplateLoader;