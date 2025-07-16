// Enhanced TemplateLoader.js with Nested Menu Support
// File: lib/generator/TemplateLoader.js
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
    // Step 5: Process dynamic content generation (including nested menus)
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
   * Process dynamic content generation with nested menu support
   */
  processDynamicContent(template, config) {
    let processed = template;

    // Determine theme colors based on business type
    const themeColors = this.getThemeColors(config);

    // Handle navigation menu generation with nested support
    processed = processed.replace(/{{navigationMenu}}/g, () => {
      if (config.navigationItems && Array.isArray(config.navigationItems)) {
        return this.generateDesktopNavigation(config.navigationItems, themeColors);
      }
      return this.getDefaultNavigation(config, themeColors);
    });

    // Handle mobile navigation menu generation with nested support
    processed = processed.replace(/{{mobileNavigationMenu}}/g, () => {
      if (config.navigationItems && Array.isArray(config.navigationItems)) {
        return this.generateMobileNavigation(config.navigationItems, themeColors);
      }
      return this.getDefaultMobileNavigation(config, themeColors);
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
        return `bg-gradient-to-br from-${themeColors.primary}-600 to-${themeColors.secondary}-600`;
      } else if (config.heroBackgroundType === 'solid') {
        return `bg-${themeColors.primary}-600`;
      } else if (config.heroBackgroundType === 'image' && config.heroBackgroundImage) {
        return `bg-cover bg-center bg-no-repeat`;
      } else if (config.heroBackgroundType === 'video') {
        return 'bg-gray-900';
      }
      return `bg-gradient-to-br from-${themeColors.primary}-600 to-${themeColors.secondary}-600`;
    });

    return processed;
  }

  /**
   * Generate desktop navigation with nested menu support
   */
  generateDesktopNavigation(navigationItems, themeColors) {
    return navigationItems.map(item => {
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        // Generate dropdown menu for items with children
        return `<div className="relative group">
                <button className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-${themeColors.primary}-600 hover:bg-${themeColors.primary}-50 transition-colors font-medium group-hover:text-${themeColors.primary}-600">
                  ${item.name}
                  <svg className="ml-1 w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    ${item.children.map(child => 
                      `<Link href="${child.href || child.link}" className="block px-4 py-2 text-sm text-gray-700 hover:bg-${themeColors.primary}-50 hover:text-${themeColors.primary}-600 transition-colors">${child.name}</Link>`
                    ).join('\n                    ')}
                  </div>
                </div>
              </div>`;
      } else {
        // Generate regular link for items without children
        return `<Link href="${item.href || item.link}" className="px-3 py-2 rounded-md text-gray-700 hover:text-${themeColors.primary}-600 hover:bg-${themeColors.primary}-50 transition-colors font-medium">${item.name}</Link>`;
      }
    }).join('\n              ');
  }

  /**
   * Generate mobile navigation with nested menu support
   */
  generateMobileNavigation(navigationItems, themeColors) {
    let mobileNavId = 0; // For unique IDs in mobile dropdowns
    
    return navigationItems.map(item => {
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        mobileNavId++;
        // Generate accordion-style dropdown for mobile
        return `<div className="border-b border-gray-100">
                  <button 
                    onClick={() => {
                      const dropdown = document.getElementById('mobile-dropdown-${mobileNavId}');
                      const icon = document.getElementById('mobile-icon-${mobileNavId}');
                      if (dropdown.classList.contains('hidden')) {
                        dropdown.classList.remove('hidden');
                        icon.style.transform = 'rotate(180deg)';
                      } else {
                        dropdown.classList.add('hidden');
                        icon.style.transform = 'rotate(0deg)';
                      }
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:text-${themeColors.primary}-600 hover:bg-${themeColors.primary}-50 transition-colors font-medium"
                  >
                    ${item.name}
                    <svg id="mobile-icon-${mobileNavId}" className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div id="mobile-dropdown-${mobileNavId}" className="hidden bg-gray-50">
                    ${item.children.map(child => 
                      `<Link href="${child.href || child.link}" className="block px-8 py-2 text-sm text-gray-600 hover:text-${themeColors.primary}-600 hover:bg-${themeColors.primary}-50 transition-colors" onClick={() => setIsOpen(false)}>${child.name}</Link>`
                    ).join('\n                    ')}
                  </div>
                </div>`;
      } else {
        // Generate regular link for items without children
        return `<Link href="${item.href || item.link}" className="block px-4 py-3 text-gray-700 hover:text-${themeColors.primary}-600 hover:bg-${themeColors.primary}-50 transition-colors font-medium" onClick={() => setIsOpen(false)}>${item.name}</Link>`;
      }
    }).join('\n                ');
  }

  /**
   * Get theme colors based on business type
   */
  getThemeColors(config) {
    switch (config.businessType) {
      case 'ngo':
      case 'nonprofit':
      case 'charity':
        return { primary: 'green', secondary: 'blue', accent: 'yellow' };
      case 'ecommerce':
      case 'retail':
        return { primary: 'blue', secondary: 'purple', accent: 'pink' };
      case 'corporate':
      case 'business':
        return { primary: 'blue', secondary: 'gray', accent: 'green' };
      case 'creative':
      case 'agency':
        return { primary: 'purple', secondary: 'pink', accent: 'orange' };
      case 'tech':
      case 'software':
        return { primary: 'blue', secondary: 'cyan', accent: 'green' };
      default:
        return { primary: 'blue', secondary: 'purple', accent: 'green' };
    }
  }

  /**
   * Get default navigation for business type
   */
  getDefaultNavigation(config, themeColors) {
    const businessType = config.businessType || 'business';
    let defaultItems = [];

    switch (businessType) {
      case 'ngo':
      case 'nonprofit':
      case 'charity':
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'About Us', href: '/about' },
          { 
            name: 'Our Programs', 
            href: '/programs',
            children: [
              { name: 'Education', href: '/programs/education' },
              { name: 'Healthcare', href: '/programs/healthcare' },
              { name: 'Community Development', href: '/programs/community' }
            ]
          },
          { 
            name: 'Get Involved', 
            href: '/get-involved',
            children: [
              { name: 'Volunteer', href: '/volunteer' },
              { name: 'Donate', href: '/donate' },
              { name: 'Partner With Us', href: '/partner' }
            ]
          },
          { name: 'Impact Stories', href: '/stories' },
          { name: 'Contact', href: '/contact' }
        ];
        break;
      case 'ecommerce':
      case 'retail':
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'Shop', href: '/shop' },
          { name: 'Categories', href: '/categories' },
          { name: 'About', href: '/about' },
          { name: 'Contact', href: '/contact' }
        ];
        break;
      default:
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
          { name: 'Services', href: '/services' },
          { name: 'Contact', href: '/contact' }
        ];
    }

    return this.generateDesktopNavigation(defaultItems, themeColors);
  }

  /**
   * Get default mobile navigation for business type
   */
  getDefaultMobileNavigation(config, themeColors) {
    const businessType = config.businessType || 'business';
    let defaultItems = [];

    switch (businessType) {
      case 'ngo':
      case 'nonprofit':
      case 'charity':
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'About Us', href: '/about' },
          { 
            name: 'Our Programs', 
            href: '/programs',
            children: [
              { name: 'Education', href: '/programs/education' },
              { name: 'Healthcare', href: '/programs/healthcare' },
              { name: 'Community Development', href: '/programs/community' }
            ]
          },
          { 
            name: 'Get Involved', 
            href: '/get-involved',
            children: [
              { name: 'Volunteer', href: '/volunteer' },
              { name: 'Donate', href: '/donate' },
              { name: 'Partner With Us', href: '/partner' }
            ]
          },
          { name: 'Impact Stories', href: '/stories' },
          { name: 'Contact', href: '/contact' }
        ];
        break;
      case 'ecommerce':
      case 'retail':
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'Shop', href: '/shop' },
          { name: 'Categories', href: '/categories' },
          { name: 'About', href: '/about' },
          { name: 'Contact', href: '/contact' }
        ];
        break;
      default:
        defaultItems = [
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
          { name: 'Services', href: '/services' },
          { name: 'Contact', href: '/contact' }
        ];
    }

    return this.generateMobileNavigation(defaultItems, themeColors);
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
    
    console.log(`🔄 Processing ${Object.keys(templatePaths).length} templates with nested menu support...`);
    
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
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Template cache cleared');
  }
}

export default TemplateLoader;