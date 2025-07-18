// Project Generator - Main Orchestrator
// File: lib/generator/ProjectGenerator.js

import { DesignSystem } from './DesignSystem.js';
import { TemplateLoader } from './TemplateLoader.js';
import { TemplatePathManager } from './TemplatePathManager.js';

export class ProjectGenerator {
    constructor() {
        this.designSystem = new DesignSystem();
        this.templateLoader = new TemplateLoader();
        this.pathManager = new TemplatePathManager();
    }

    async generateProject(config) {
        const startTime = Date.now();
        console.log(`🚀 Starting project generation: ${config.businessName}`);
        console.log(`Project Config to be used for template processing:`, config);
        try {
            // 1. Prepare configuration
            const processedConfig = this.prepareConfig(config);
            console.log(`📋 Processed config:`, processedConfig);

            // 2. Get template paths for project type
            const templatePaths = this.pathManager.getTemplatePaths(processedConfig.projectType);

            // 3. Generate files
            const files = await this.generateFiles(templatePaths, processedConfig);

            // 4. Create project structure
            const project = {
                id: `${processedConfig.projectType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: processedConfig.businessName,
                type: processedConfig.projectType,
                config: processedConfig,
                files: files,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    fileCount: Object.keys(files).length,
                    processingTime: `${Date.now() - startTime}ms`,
                    theme: processedConfig.design.theme,
                    layout: processedConfig.design.layout,
                    heroStyle: processedConfig.design.heroStyle
                }
            };
            console.log(`✅ Project generated successfully: ${Object.keys(files).length} files`);
            return project;
        } catch (error) {
            console.error('❌ Project generation failed:', error);
            throw error;
        }
    }

    prepareConfig(config) {
        // Set defaults and process configuration with comprehensive fallbacks
        const processedConfig = {
            // Basic info
            businessName: config.businessName || config.name || 'Your Business',
            industry: config.industry || 'business',
            businessType: config.businessType || 'business',
            projectType: config.projectType || config.businessType || 'base',
            targetAudience: config.targetAudience || 'customers',
            businessDescription: config.businessDescription || 'Professional services',
            template: config.template || 'modern',

            // Design configuration
            design: {
                theme: config.design?.theme || 'modern',
                layout: config.design?.layout || 'standard',
                heroStyle: config.design?.heroStyle || 'centered',
                graphics: config.design?.graphics || 'illustrations'
            },

            // Hero configuration
            heroData: {
                headline: config.heroData?.headline || `Welcome to ${config.businessName || 'Your Business'}`,
                subheadline: config.heroData?.subheadline || `Professional ${config.industry || 'business'} services tailored for you`,
                primaryCta: config.heroData?.primaryCta || 'Get Started',
                secondaryCta: config.heroData?.secondaryCta || 'Learn More',
                backgroundType: config.heroData?.backgroundType || 'gradient',
                backgroundImage: config.heroData?.backgroundImage || '',
                backgroundVideo: config.heroData?.backgroundVideo || ''
            },

            // Enhanced Header configuration
            headerData: {
                style: config.headerData?.style || 'solid',
                logoType: config.headerData?.logoType || 'text',
                logoText: config.headerData?.logoText || config.businessName || 'Your Business',
                logoImage: config.headerData?.logoImage || null,
                showCta: config.headerData?.showCta !== undefined ? config.headerData.showCta : true,
                ctaText: config.headerData?.ctaText || 'Get Started',
                ctaLink: config.headerData?.ctaLink || '/contact',
                menuItems: config.headerData?.menuItems || [
                    { name: 'Home', link: '/', type: 'link', children: [] },
                    { name: 'About', link: '/about', type: 'link', children: [] },
                    { name: 'Services', link: '/services', type: 'link', children: [] },
                    { name: 'Contact', link: '/contact', type: 'link', children: [] }
                ]
            },

            // Footer configuration
            footerData: {
                style: config.footerData?.style || 'multiColumn',
                companyName: config.footerData?.companyName || config.businessName || 'Your Business',
                companyDescription: config.footerData?.companyDescription ||
                    config.businessDescription ||
                    `Professional ${config.industry || 'business'} services`,
                email: config.footerData?.email || `contact@${(config.businessName || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
                phone: config.footerData?.phone || '',
                address: config.footerData?.address || '',
                showNewsletter: config.footerData?.showNewsletter !== undefined ? config.footerData.showNewsletter : true,
                newsletterTitle: config.footerData?.newsletterTitle || 'Stay Updated',
                socialLinks: {
                    facebook: config.footerData?.socialLinks?.facebook || '',
                    twitter: config.footerData?.socialLinks?.twitter || '',
                    linkedin: config.footerData?.socialLinks?.linkedin || '',
                    instagram: config.footerData?.socialLinks?.instagram || ''
                },
                quickLinks: config.footerData?.quickLinks || [
                    { name: 'Privacy Policy', link: '/privacy' },
                    { name: 'Terms of Service', link: '/terms' },
                    { name: 'Support', link: '/support' }
                ]
            },

            // Features and pages
            features: config.features || [],
            pages: config.pages && config.pages.length > 0 ? config.pages : [
                { id: 'home', name: 'Home', type: 'home', enabled: true },
                { id: 'about', name: 'About', type: 'about', enabled: true },
                { id: 'services', name: 'Services', type: 'services', enabled: true },
                { id: 'contact', name: 'Contact', type: 'contact', enabled: true }
            ],

            // Advanced options
            vectorEnhancement: config.vectorEnhancement !== undefined ? config.vectorEnhancement : true,
            enableAnalytics: config.enableAnalytics !== undefined ? config.enableAnalytics : true,
            enableSEO: config.enableSEO !== undefined ? config.enableSEO : true,

            // Meta
            currentYear: new Date().getFullYear()
        };

        // Get theme data from design system
        const themeData = this.designSystem.getTheme(processedConfig.design.theme);
        processedConfig.themeData = themeData;

        return processedConfig;
    }

    async generateFiles(templatePaths, config) {
        const files = {};
        for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
            try {
                console.log(`📝 Processing: ${templatePath} → ${outputPath}`);
                // Load template
                let content = await this.templateLoader.loadTemplate(templatePath);
                // Process variables
                content = this.processTemplate(content, config);
                // Store file
                files[outputPath] = content;
            } catch (error) {
                console.error(`❌ Failed to process template: ${templatePath}`, error);
                // Continue with other files instead of failing completely
                files[outputPath] = `// Error processing template: ${templatePath}\n// ${error.message}`;
            }
        }
        return files;
    }

    processTemplate(template, config) {
        let processed = template;

        // Process all basic variables
        processed = this.processBasicVariables(processed, config);

        // Process hero data variables
        processed = this.processHeroVariables(processed, config);

        // Process header data variables
        processed = this.processHeaderVariables(processed, config);

        // Process footer data variables
        processed = this.processFooterVariables(processed, config);

        // Process design variables
        processed = this.processDesignVariables(processed, config);

        // Process theme variables using design system
        processed = this.designSystem.processThemeVariables(processed, config.design.theme);

        // Process complex data structures
        processed = this.processComplexVariables(processed, config);

        // Clean up any remaining template syntax
        processed = this.cleanupRemainingTags(processed);

        return processed;
    }

    processBasicVariables(template, config) {
        const basicVars = {
            businessName: config.businessName,
            industry: config.industry,
            businessType: config.businessType,
            projectType: config.projectType,
            targetAudience: config.targetAudience,
            businessDescription: config.businessDescription,
            template: config.template,
            currentYear: config.currentYear
        };

        Object.entries(basicVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value || '');
        });

        return template;
    }

    processHeroVariables(template, config) {
        if (!config.heroData) return template;

        const heroVars = {
            'hero.headline': config.heroData.headline,
            'hero.subheadline': config.heroData.subheadline,
            'hero.primaryCta': config.heroData.primaryCta,
            'hero.secondaryCta': config.heroData.secondaryCta,
            'hero.backgroundType': config.heroData.backgroundType,
            'hero.backgroundImage': config.heroData.backgroundImage,
            'hero.backgroundVideo': config.heroData.backgroundVideo,
            // Legacy support
            'heroHeadline': config.heroData.headline,
            'heroSubheadline': config.heroData.subheadline,
            'heroPrimaryCta': config.heroData.primaryCta,
            'heroSecondaryCta': config.heroData.secondaryCta
        };

        Object.entries(heroVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value || '');
        });

        return template;
    }

    processHeaderVariables(template, config) {
        if (!config.headerData) return template;

        const headerVars = {
            'header.style': config.headerData.style,
            'header.logoType': config.headerData.logoType,
            'header.logoText': config.headerData.logoText,
            'header.logoImage': config.headerData.logoImage || '',
            'header.showCta': config.headerData.showCta,
            'header.ctaText': config.headerData.ctaText,
            'header.ctaLink': config.headerData.ctaLink,
            // Legacy support
            'headerStyle': config.headerData.style,
            'logoType': config.headerData.logoType,
            'logoText': config.headerData.logoText,
            'logoImage': config.headerData.logoImage || '',
            'headerCtaText': config.headerData.ctaText,
            'headerCtaLink': config.headerData.ctaLink,
            'showHeaderCTA': config.headerData.showCta
        };

        Object.entries(headerVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value !== undefined ? value : '');
        });

        // Process menu items from config.pages (primary method)
        if (config.pages && Array.isArray(config.pages)) {
            const enabledPages = config.pages.filter(page => page.enabled !== false);

            // Generate menu items from pages
            const menuItemsFromPages = enabledPages.map(page => {
                const href = page.id === 'home' ? '/' : `/${page.id}`;
                return `{ name: '${page.name}', href: '${href}' }`;
            }).join(',\n      ');

            template = template.replace(/{{menuItems}}/g, menuItemsFromPages);

            // Enhanced menu items with page data
            const enhancedMenuItemsFromPages = enabledPages.map(page => {
                const menuItem = {
                    name: page.name,
                    href: page.id === 'home' ? '/' : `/${page.id}`,
                    type: page.type || 'link',
                    id: page.id
                };

                if (page.children && page.children.length > 0) {
                    menuItem.children = page.children.map(child => ({
                        name: child.name,
                        href: child.href || `/${child.id}`,
                        description: child.description || ''
                    }));
                }

                return JSON.stringify(menuItem);
            }).join(',\n      ');

            template = template.replace(/{{enhancedMenuItems}}/g, enhancedMenuItemsFromPages);
            template = template.replace(/{{navigationItemsJSON}}/g, enhancedMenuItemsFromPages);
        }
        // Fallback to headerData.menuItems if no pages defined
        else if (config.headerData.menuItems) {
            // Simple menu items (legacy)
            const menuItemsJS = config.headerData.menuItems.map(item =>
                `{ name: '${item.name}', href: '${item.link || item.href}' }`
            ).join(',\n      ');
            template = template.replace(/{{menuItems}}/g, menuItemsJS);

            // Enhanced menu items with nested structure
            const enhancedMenuItemsJS = config.headerData.menuItems.map(item => {
                const menuItem = {
                    name: item.name,
                    href: item.link || item.href,
                    type: item.type || 'link'
                };

                if (item.children && item.children.length > 0) {
                    menuItem.children = item.children.map(child => ({
                        name: child.name,
                        href: child.link || child.href,
                        description: child.description || ''
                    }));
                }

                return JSON.stringify(menuItem);
            }).join(',\n      ');

            template = template.replace(/{{enhancedMenuItems}}/g, enhancedMenuItemsJS);
            template = template.replace(/{{navigationItemsJSON}}/g, enhancedMenuItemsJS);
        }

        return template;
    }

    processFooterVariables(template, config) {
        if (!config.footerData) return template;

        const footerVars = {
            'footer.style': config.footerData.style,
            'footer.companyName': config.footerData.companyName,
            'footer.companyDescription': config.footerData.companyDescription,
            'footer.email': config.footerData.email,
            'footer.phone': config.footerData.phone,
            'footer.address': config.footerData.address,
            'footer.showNewsletter': config.footerData.showNewsletter,
            'footer.newsletterTitle': config.footerData.newsletterTitle,
            // Legacy support
            'footerStyle': config.footerData.style,
            'companyName': config.footerData.companyName,
            'companyDescription': config.footerData.companyDescription,
            'companyEmail': config.footerData.email,
            'companyPhone': config.footerData.phone,
            'companyAddress': config.footerData.address
        };

        Object.entries(footerVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value || '');
        });

        // Process social links
        if (config.footerData.socialLinks) {
            Object.entries(config.footerData.socialLinks).forEach(([platform, url]) => {
                const regex = new RegExp(`{{footer\\.socialLinks\\.${platform}}}`, 'g');
                template = template.replace(regex, url || '');
                // Legacy support
                const legacyRegex = new RegExp(`{{${platform}Url}}`, 'g');
                template = template.replace(legacyRegex, url || '');
            });

            // Generate social links JSON
            const socialLinksJS = JSON.stringify(config.footerData.socialLinks);
            template = template.replace(/{{socialLinksJson}}/g, socialLinksJS);
        }

        // Process quick links
        if (config.footerData.quickLinks) {
            const quickLinksJS = config.footerData.quickLinks.map(link =>
                `{ name: '${link.name}', href: '${link.link || link.href}' }`
            ).join(',\n      ');
            template = template.replace(/{{quickLinks}}/g, quickLinksJS);
        }

        return template;
    }

    processDesignVariables(template, config) {
        if (!config.design) return template;

        const designVars = {
            'design.theme': config.design.theme,
            'design.layout': config.design.layout,
            'design.heroStyle': config.design.heroStyle,
            'design.graphics': config.design.graphics,
            // Legacy support
            'theme': config.design.theme,
            'layout': config.design.layout,
            'heroStyle': config.design.heroStyle
        };

        Object.entries(designVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value || '');
        });

        return template;
    }

    processComplexVariables(template, config) {
        // Process features array
        if (config.features && Array.isArray(config.features)) {
            const featuresJS = config.features.map(feature =>
                typeof feature === 'string' ? `'${feature}'` : JSON.stringify(feature)
            ).join(',\n      ');
            template = template.replace(/{{features}}/g, featuresJS);
        }

        // Process pages array
        if (config.pages && Array.isArray(config.pages)) {
            const pagesJS = config.pages.map(page => JSON.stringify(page)).join(',\n      ');
            template = template.replace(/{{pages}}/g, pagesJS);
        }

        // Process boolean flags
        const booleanVars = {
            vectorEnhancement: config.vectorEnhancement,
            enableAnalytics: config.enableAnalytics,
            enableSEO: config.enableSEO
        };

        Object.entries(booleanVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value ? 'true' : 'false');
        });

        return template;
    }

    cleanupRemainingTags(template) {
        // Remove any remaining handlebars-style template tags
        // Remove conditional blocks
        template = template.replace(/{{#if\s+[^}]+}}[\s\S]*?{{\/if}}/g, '');
        template = template.replace(/{{#unless\s+[^}]+}}[\s\S]*?{{\/unless}}/g, '');

        // Remove loop blocks
        template = template.replace(/{{#each\s+[^}]+}}[\s\S]*?{{\/each}}/g, '');

        // Remove any remaining handlebars variables
        template = template.replace(/{{[^}]+}}/g, '');

        // Clean up extra whitespace
        template = template.replace(/\n\s*\n\s*\n/g, '\n\n');

        return template;
    }

    // Helper methods
    getSupportedProjectTypes() {
        return this.pathManager.getSupportedProjectTypes();
    }

    getSupportedThemes() {
        return this.designSystem.getAvailableThemes();
    }

    getThemeData(themeId) {
        return this.designSystem.getTheme(themeId);
    }
}

export default ProjectGenerator;