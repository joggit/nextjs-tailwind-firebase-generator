// lib/generator/TemplateLoader.js - Enhanced for JSX with direct property access
import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
  }

  async loadTemplate(templatePath, config = {}) {
    try {
      console.log(`📄 Loading template: ${templatePath}`);
      console.log(`🔍 Config keys: ${Object.keys(config).join(', ')}`);

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

    // 1. Process conditional blocks first
    processed = this.processConditionalBlocks(processed, config);

    // 2. Process loop blocks  
    processed = this.processLoopBlocks(processed, config);

    // 3. Replace template literals with direct property access
    processed = this.replaceTemplateVariables(processed, config);

    // 4. Clean up any remaining template syntax
    processed = this.cleanupTemplate(processed);

    return processed;
  }

  processConditionalBlocks(template, config) {
    // Handle: {/* IF condition */} content {/* ENDIF */}
    const conditionalRegex = /\{\s*\/\*\s*IF\s+([^*]+)\s*\*\/\s*\}([\s\S]*?)\{\s*\/\*\s*ENDIF\s*\*\/\s*\}/g;

    return template.replace(conditionalRegex, (match, condition, content) => {
      const shouldShow = this.evaluateCondition(condition.trim(), config);
      console.log(`🔍 Conditional "${condition}": ${shouldShow}`);
      return shouldShow ? content : '';
    });
  }

  processLoopBlocks(template, config) {
    // Handle: {/* FOREACH arrayPath */} content {/* ENDFOREACH */}
    const loopRegex = /\{\s*\/\*\s*FOREACH\s+([^*]+)\s*\*\/\s*\}([\s\S]*?)\{\s*\/\*\s*ENDFOREACH\s*\*\/\s*\}/g;

    return template.replace(loopRegex, (match, arrayPath, content) => {
      const array = this.getNestedValue(config, arrayPath.trim());
      console.log(`🔍 Loop for "${arrayPath}":`, array);

      if (Array.isArray(array)) {
        return array.map((item, index) => {
          let itemContent = content;

          // Replace ${item.property} patterns
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              const itemPattern = new RegExp(`\\$\\{item\\.${key}\\}`, 'g');
              itemContent = itemContent.replace(itemPattern, this.escapeValue(value));
            });
          }

          // Replace ${index} pattern
          itemContent = itemContent.replace(/\$\{index\}/g, index);

          return itemContent;
        }).join('');
      }
      return '';
    });
  }

  replaceTemplateVariables(template, config) {
    // Handle template literals: ${path.to.property}
    const variableRegex = /\$\{([^}]+)\}/g;

    return template.replace(variableRegex, (match, variablePath) => {
      const trimmedPath = variablePath.trim();

      // Skip if it's part of a JavaScript template literal (has quotes around it)
      if (this.isJavaScriptTemplateLiteral(template, match)) {
        return match; // Keep as-is for actual JavaScript
      }

      const value = this.getNestedValue(config, trimmedPath);

      if (value === undefined || value === null) {
        console.log(`⚠️  Missing variable: ${trimmedPath}`);
        return '';
      }

      console.log(`✅ Resolved variable: ${trimmedPath} = ${value}`);
      return this.escapeValue(value);
    });
  }

  isJavaScriptTemplateLiteral(template, match) {
    // Check if the variable is inside a JavaScript template literal
    const index = template.indexOf(match);
    const before = template.substring(Math.max(0, index - 100), index);
    const after = template.substring(index, Math.min(template.length, index + 100));

    // Look for backticks indicating a JavaScript template literal
    const beforeBacktick = before.lastIndexOf('`');
    const beforeQuote = Math.max(before.lastIndexOf('"'), before.lastIndexOf("'"));
    const afterBacktick = after.indexOf('`');
    const afterQuote = Math.min(
      after.indexOf('"') === -1 ? Infinity : after.indexOf('"'),
      after.indexOf("'") === -1 ? Infinity : after.indexOf("'")
    );

    return beforeBacktick > beforeQuote && afterBacktick < afterQuote;
  }

  evaluateCondition(condition, config) {
    // Handle negation: !variable
    if (condition.startsWith('!')) {
      const variable = condition.substring(1);
      const value = this.getNestedValue(config, variable);
      return !value;
    }

    // Handle simple existence check
    const value = this.getNestedValue(config, condition);
    return !!value;
  }

  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;

    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    } catch (error) {
      console.error(`❌ Error accessing path "${path}":`, error);
      return undefined;
    }
  }

  escapeValue(value) {
    if (typeof value === 'string') {
      // Escape quotes for JavaScript string literals
      return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
    if (typeof value === 'object') {
      // For objects, return JSON string
      return JSON.stringify(value);
    }
    return String(value);
  }

  cleanupTemplate(template) {
    // Remove any remaining template comments
    template = template.replace(/\{\s*\/\*\s*[^*]*\*\/\s*\}/g, '');

    // Clean up extra whitespace
    template = template.replace(/\n\s*\n\s*\n/g, '\n\n');

    return template;
  }

  // Helper to flatten config for easier access
  flattenConfig(config, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(config)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenConfig(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  // Validation helper
  validateConfig(config, requiredPaths = []) {
    const missing = requiredPaths.filter(path => !this.getNestedValue(config, path));

    if (missing.length > 0) {
      console.warn('⚠️  Missing required config paths:', missing);
    }

    return missing.length === 0;
  }

  async loadTemplates(templatePaths, config = {}) {
    console.log('📁 Loading templates with config structure:');
    console.log('📊 Config overview:', {
      businessName: config.businessName,
      template: config.template,
      themeKeys: config.theme ? Object.keys(config.theme) : [],
      componentKeys: config.components ? Object.keys(config.components) : [],
      pagesEnabled: config.pages ? Object.keys(config.pages).filter(k => config.pages[k].enabled) : []
    });

    const results = {};

    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      try {
        results[outputPath] = await this.loadTemplate(templatePath, config);
        console.log(`✅ Processed: ${outputPath}`);
      } catch (error) {
        console.error(`❌ Failed to process ${outputPath}:`, error);
        // Continue with other templates
      }
    }

    return results;
  }
}

export default TemplateLoader;