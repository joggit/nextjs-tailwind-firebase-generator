// Streamlined Project Generator aligned with form data structure
// File: lib/generator/ProjectGenerator.js

import { TemplateLoader } from './TemplateLoader.js';
import { TemplatePathManager } from './TemplatePathManager.js';

export class ProjectGenerator {
    constructor() {
        this.templateLoader = new TemplateLoader();
        this.pathManager = new TemplatePathManager();
    }

    async generateProject(config) {
        const startTime = Date.now();
        console.log(`🚀 Starting project generation: ${config.projectName}`);

        try {
            // 1. Process form data into template config
            const processedConfig = this.processFormData(config);

            // 2. Get template paths
            const templatePaths = this.pathManager.getTemplatePaths(processedConfig.projectType);

            // 3. Generate files
            const files = await this.generateFiles(templatePaths, processedConfig);

            // 4. Create project structure
            const project = {
                id: `${processedConfig.projectType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: processedConfig.projectName,
                type: processedConfig.projectType,
                config: processedConfig,
                files: files,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    fileCount: Object.keys(files).length,
                    processingTime: `${Date.now() - startTime}ms`
                }
            };

            console.log(`✅ Project generated: ${Object.keys(files).length} files`);
            return project;
        } catch (error) {
            console.error('❌ Project generation failed:', error);
            throw error;
        }
    }

    processFormData(formData) {
        console.log('🔧 Processing form data...');

        return {
            // Basic project info
            projectName: formData.projectName || 'Your Project',
            description: formData.description || 'Generated with Next.js',
            projectType: this.determineProjectType(formData),

            // Theme configuration
            theme: {
                primaryColor: formData.theme?.primaryColor || '#1E40AF',
                secondaryColor: formData.theme?.secondaryColor || '#FBBF24',
                fontFamily: formData.theme?.fontFamily || 'Inter, sans-serif',
                iconLibrary: formData.theme?.iconLibrary || 'Heroicons',
                layout: formData.theme?.layout || {},
                typography: formData.theme?.typography || {}
            },

            // Header configuration
            header: {
                logo: formData.header?.logo || '/images/logo.png',
                menuItems: this.processMenuItems(formData.header?.menuItems || []),
                showIcons: formData.header?.showIcons || false,
                type: formData.header?.types?.[0] || 'marketing'
            },

            // Footer configuration
            footer: {
                text: formData.footer?.text || `© ${new Date().getFullYear()} Your Company`,
                links: formData.footer?.links || []
            },

            // Pages configuration
            pages: this.processPages(formData.pages || {}),

            // Content blocks
            blocks: formData.blocks || {},

            // Component styling
            components: formData.components || {},

            // Animations
            animations: formData.animations || { enabled: true },

            // Meta data
            meta: {
                title: formData.meta?.title || formData.projectName || 'Your Project',
                keywords: formData.meta?.keywords || [],
                ogImage: formData.meta?.ogImage || '/images/og-image.png',
                themeColor: formData.meta?.themeColor || formData.theme?.primaryColor || '#1E40AF'
            },

            // System
            currentYear: new Date().getFullYear()
        };
    }

    determineProjectType(formData) {
        // Check if ecommerce features are enabled
        if (formData.pages?.shop?.enabled) return 'ecommerce';

        // Check header types for hints
        if (formData.header?.types?.includes('ecommerce')) return 'ecommerce';
        if (formData.header?.types?.includes('webapp')) return 'webapp';
        if (formData.header?.types?.includes('ngo')) return 'ngo';

        // Default to base
        return 'base';
    }

    processMenuItems(menuItems) {
        if (!Array.isArray(menuItems)) return [];

        return menuItems.map(item => ({
            name: item.label || item.name || 'Unnamed',
            href: item.link || item.href || '/',
            type: 'link'
        }));
    }

    processPages(pagesData) {
        const processedPages = [];

        Object.entries(pagesData).forEach(([key, page]) => {
            if (page.enabled) {
                processedPages.push({
                    name: page.title,
                    path: key === 'home' ? '/' : `/${key}`,
                    blocks: page.blocks || []
                });
            }
        });

        return processedPages;
    }

    async generateFiles(templatePaths, config) {
        console.log('📁 Generating files...');
        const files = {};

        for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
            try {
                let content = await this.templateLoader.loadTemplate(templatePath);
                content = this.processTemplate(content, config);
                files[outputPath] = content;
            } catch (error) {
                console.error(`❌ Failed to process: ${templatePath}`, error);
                files[outputPath] = `// Error processing template: ${error.message}`;
            }
        }

        return files;
    }

    processTemplate(template, config) {
        let processed = template;

        // Basic variables
        processed = this.replaceVariables(processed, {
            projectName: config.projectName,
            description: config.description,
            currentYear: config.currentYear
        });

        // Theme variables
        processed = this.replaceVariables(processed, config.theme, 'theme');

        // Header variables
        processed = this.replaceVariables(processed, config.header, 'header');

        // Footer variables  
        processed = this.replaceVariables(processed, config.footer, 'footer');

        // Meta variables
        processed = this.replaceVariables(processed, config.meta, 'meta');

        // Component variables
        processed = this.replaceVariables(processed, config.components, 'components');

        // Process complex structures
        processed = this.processComplexVariables(processed, config);

        return processed;
    }

    replaceVariables(template, data, prefix = '') {
        if (!data || typeof data !== 'object') return template;

        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                // Handle nested objects
                template = this.replaceVariables(template, value, prefix ? `${prefix}.${key}` : key);
            } else {
                // Handle primitive values
                const variableName = prefix ? `${prefix}.${key}` : key;
                const regex = new RegExp(`{{${variableName}}}`, 'g');
                template = template.replace(regex, value || '');
            }
        });

        return template;
    }

    processComplexVariables(template, config) {
        // Menu items as JavaScript array
        if (config.header?.menuItems) {
            const menuItemsJS = config.header.menuItems
                .map(item => `{ name: '${item.name}', href: '${item.href}' }`)
                .join(',\n      ');
            template = template.replace(/{{menuItems}}/g, menuItemsJS);
        }

        // Footer links as JavaScript array
        if (config.footer?.links) {
            const footerLinksJS = config.footer.links
                .map(link => `{ name: '${link.label}', href: '${link.link}' }`)
                .join(',\n      ');
            template = template.replace(/{{footerLinks}}/g, footerLinksJS);
        }

        // Pages as JavaScript array
        if (config.pages) {
            const pagesJS = config.pages
                .map(page => `{ name: '${page.name}', path: '${page.path}' }`)
                .join(',\n      ');
            template = template.replace(/{{pages}}/g, pagesJS);
        }

        // Hero content from blocks
        const heroBlock = config.blocks?.marketing?.hero;
        if (heroBlock) {
            template = template.replace(/{{hero\.title}}/g, heroBlock.title || '');
            template = template.replace(/{{hero\.subtitle}}/g, heroBlock.subtitle || '');
            template = template.replace(/{{hero\.buttonText}}/g, heroBlock.buttonText || '');
            template = template.replace(/{{hero\.buttonLink}}/g, heroBlock.buttonLink || '');
        }

        // Features from blocks
        const features = config.blocks?.marketing?.features;
        if (features && Array.isArray(features)) {
            const featuresJS = features
                .map(feature => `{ title: '${feature.title}', description: '${feature.description}' }`)
                .join(',\n      ');
            template = template.replace(/{{features}}/g, featuresJS);
        }

        return template;
    }

    getSupportedProjectTypes() {
        return this.pathManager.getSupportedProjectTypes();
    }
}

export default ProjectGenerator;