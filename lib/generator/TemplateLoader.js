// lib/generator/TemplateLoader.js (Enhanced version)
import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
  }

  async loadTemplate(templatePath, config = {}) {
    try {
      // DEBUG: Log the config structure
      console.log('🔍 Config being passed to template:', templatePath);
      console.log('🔍 Key config values:', {
        businessName: config.businessName,
        primaryColor: config.theme?.primaryColor,
        navbarBg: config.components?.navbar?.backgroundColor,
        menuItems: config.header?.menuItems?.length
      });

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

    // Process conditional blocks first (before variable replacement)
    processed = this.processConditionalBlocks(processed, config);

    // Process each/loop blocks
    processed = this.processEachBlocks(processed, config);

    // Replace variables (both handlebars and JSX-style)
    processed = this.replaceVariables(processed, config);

    // Clean up any remaining template syntax
    processed = this.cleanupTemplate(processed);

    return processed;
  }

  processConditionalBlocks(template, config) {
    // Handle JSX-compatible conditionals: {/* IF condition */} content {/* ENDIF */}
    const jsxIfRegex = /\{\s*\/\*\s*IF\s+([^*]+)\s*\*\/\s*\}([\s\S]*?)\{\s*\/\*\s*ENDIF\s*\*\/\s*\}/g;

    template = template.replace(jsxIfRegex, (match, condition, content) => {
      const shouldShow = this.evaluateCondition(condition.trim(), config);
      console.log(`🔍 Conditional ${condition}: ${shouldShow}`);
      return shouldShow ? content : '';
    });

    // Handle traditional handlebars conditionals: {{#if condition}} content {{/if}}
    const handlebarsIfRegex = /\{\{\s*#if\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g;

    template = template.replace(handlebarsIfRegex, (match, condition, content) => {
      const shouldShow = this.evaluateCondition(condition.trim(), config);
      console.log(`🔍 Handlebars conditional ${condition}: ${shouldShow}`);
      return shouldShow ? content : '';
    });

    return template;
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

  processEachBlocks(template, config) {
    // Handle JSX-compatible loops: {/* FOREACH array */} content {/* ENDFOREACH */}
    const jsxForeachRegex = /\{\s*\/\*\s*FOREACH\s+([^*]+)\s*\*\/\s*\}([\s\S]*?)\{\s*\/\*\s*ENDFOREACH\s*\*\/\s*\}/g;

    template = template.replace(jsxForeachRegex, (match, arrayPath, content) => {
      const array = this.getNestedValue(config, arrayPath.trim());
      console.log(`🔍 JSX foreach loop for ${arrayPath}:`, array);

      if (Array.isArray(array)) {
        return array.map((item, index) => {
          let itemContent = content;

          if (typeof item === 'object') {
            // Replace ${item.property} patterns
            Object.entries(item).forEach(([key, value]) => {
              const itemPattern = new RegExp(`\\$\\{item\\.${key}\\}`, 'g');
              itemContent = itemContent.replace(itemPattern, value || '');
            });
          }

          // Replace ${index} pattern
          itemContent = itemContent.replace(/\$\{index\}/g, index);

          return itemContent;
        }).join('');
      }
      return '';
    });

    // Handle traditional handlebars loops: {{#each array}} content {{/each}}
    const eachRegex = /\{\{\s*#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g;

    return template.replace(eachRegex, (match, arrayPath, content) => {
      const array = this.getNestedValue(config, arrayPath);
      console.log(`🔍 Handlebars each loop for ${arrayPath}:`, array);

      if (Array.isArray(array)) {
        return array.map((item, index) => {
          let itemContent = content;
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              itemContent = itemContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
            });
          }
          return itemContent;
        }).join('');
      }
      return '';
    });
  }

  replaceVariables(template, config) {
    // Replace JSX-style variables: ${variable.path}
    const jsxVariableRegex = /\$\{([^}]+)\}/g;

    template = template.replace(jsxVariableRegex, (match, variablePath) => {
      const value = this.getNestedValue(config, variablePath.trim());
      if (value === undefined) {
        console.log(`⚠️ Missing JSX variable: ${variablePath}`);
        return '';
      } else {
        console.log(`✅ Found JSX variable: ${variablePath} = ${value}`);
        return value;
      }
    });

    // Replace handlebars variables: {{variable.path}}
    const variableRegex = /\{\{([\w.]+)\}\}/g;

    return template.replace(variableRegex, (match, variablePath) => {
      const value = this.getNestedValue(config, variablePath);
      if (value === undefined) {
        console.log(`⚠️ Missing handlebars variable: ${variablePath}`);
        return '';
      } else {
        console.log(`✅ Found handlebars variable: ${variablePath} = ${value}`);
        return value;
      }
    });
  }

  cleanupTemplate(template) {
    // Remove any remaining template comments
    template = template.replace(/\{\s*\/\*\s*[^*]*\*\/\s*\}/g, '');

    // Clean up extra whitespace
    template = template.replace(/\n\s*\n\s*\n/g, '\n\n');

    return template;
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

  // Helper method to validate config structure
  validateConfig(config) {
    const requiredPaths = [
      'businessName',
      'theme.primaryColor',
      'components.navbar.backgroundColor',
      'header.menuItems'
    ];

    const missing = requiredPaths.filter(path => !this.getNestedValue(config, path));

    if (missing.length > 0) {
      console.warn('⚠️ Missing required config paths:', missing);
    }

    return missing.length === 0;
  }

  async loadTemplates(templatePaths, config = {}) {
    // Validate config before processing
    this.validateConfig(config);

    const results = {};
    for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
      results[outputPath] = await this.loadTemplate(templatePath, config);
    }
    return results;
  }
}

export default TemplateLoader;