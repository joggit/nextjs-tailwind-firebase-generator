// Simple Template Loader
// File: lib/generator/TemplateLoader.js

import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib/generator/templates');
    this.cache = new Map();
  }

  async loadTemplate(templatePath) {
    const fullPath = path.join(this.templatesPath, templatePath);

    // Check cache first
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath);
    }

    // Read file
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    // Cache it
    this.cache.set(fullPath, content);

    return content;
  }

  templateExists(templatePath) {
    const fullPath = path.join(this.templatesPath, templatePath);
    return fs.existsSync(fullPath);
  }
}

export default TemplateLoader;