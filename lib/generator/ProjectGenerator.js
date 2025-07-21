// Enhanced Project Generator with Design System Integration
// File: lib/generator/ProjectGenerator.js

import { TemplateLoader } from './TemplateLoader.js';
import { TemplatePathManager } from './TemplatePathManager.js';
import { DesignSystem } from './DesignSystem.js';

export class ProjectGenerator {
    constructor() {
        this.templateLoader = new TemplateLoader();
        this.pathManager = new TemplatePathManager();
        this.designSystem = new DesignSystem();
    }

    async generateProject(config) {
        const startTime = Date.now();
        console.log(`🚀 Starting project generation: ${config.businessName}`);
        console.log(`📊 Design Config:`, {
            theme: config.design?.name || 'Unknown',
            layout: config.design?.layout?.type || 'Unknown',
            headerStyle: config.headerData?.style || 'Unknown',
            footerStyle: config.footerData?.style || 'Unknown'
        });

        try {
            // 1. Prepare configuration with design system integration
            const processedConfig = this.prepareConfig(config);
            console.log(`📋 Processed config with design integration`);

            // 2. Get template paths for project type
            const templatePaths = this.pathManager.getTemplatePaths(processedConfig.projectType);

            // 3. Generate files with design processing
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
                    designSystem: {
                        theme: processedConfig.design?.name || 'Custom',
                        mode: processedConfig.design?.mode || 'light',
                        category: processedConfig.design?.category || 'Professional',
                        layout: processedConfig.design?.layout?.type || 'split',
                        headerStyle: processedConfig.headerData?.style || 'solid',
                        footerStyle: processedConfig.footerData?.style || 'multiColumn'
                    }
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
        console.log('🔧 Preparing configuration with design system...');

        // Process design data first
        const designData = this.processDesignData(config.design);

        // Set up comprehensive configuration
        const processedConfig = {
            // Basic info
            businessName: config.businessName || config.name || 'Your Business',
            industry: config.industry || 'business',
            businessType: config.businessType || 'business',
            projectType: config.projectType || config.businessType || 'base',
            targetAudience: config.targetAudience || 'customers',
            businessDescription: config.businessDescription || 'Professional services',
            template: config.template || 'modern',

            // Enhanced design configuration
            design: designData,

            // Hero configuration (enhanced with design integration)
            heroData: {
                headline: config.heroData?.headline || `Welcome to ${config.businessName || 'Your Business'}`,
                subheadline: config.heroData?.subheadline || `Professional ${config.industry || 'business'} services tailored for you`,
                primaryCta: config.heroData?.primaryCta || 'Get Started',
                secondaryCta: config.heroData?.secondaryCta || 'Learn More',
                backgroundType: config.heroData?.backgroundType || designData.layout?.type || 'gradient',
                backgroundImage: config.heroData?.backgroundImage || '',
                backgroundVideo: config.heroData?.backgroundVideo || '',
                style: designData.layout?.type || 'split'
            },

            // Enhanced Header configuration
            headerData: this.processHeaderData(config.headerData, config, designData),

            // Enhanced Footer configuration  
            footerData: this.processFooterData(config.footerData, config, designData),

            // Features
            features: config.features || [],

            // Advanced options
            vectorEnhancement: config.vectorEnhancement !== undefined ? config.vectorEnhancement : true,
            enableAnalytics: config.enableAnalytics !== undefined ? config.enableAnalytics : true,
            enableSEO: config.enableSEO !== undefined ? config.enableSEO : true,

            // Meta
            currentYear: new Date().getFullYear()
        };

        return processedConfig;
    }

    processDesignData(designInput) {
        console.log('🎨 Processing design data:', designInput);

        // If no design input, use default
        if (!designInput) {
            return this.designSystem.getDefaultDesign();
        }

        // If design input is a preset ID, get the preset
        if (typeof designInput === 'string') {
            return this.designSystem.getPreset(designInput);
        }

        // Process comprehensive design object
        const design = {
            // Basic info
            name: designInput.name || 'Custom Design',
            mode: designInput.mode || 'light',
            category: designInput.category || 'Professional',

            // Colors with fallbacks
            colors: {
                primary: designInput.colors?.primary || '#0F172A',
                secondary: designInput.colors?.secondary || '#22D3EE',
                background: designInput.colors?.background || '#F8FAFC',
                surface: designInput.colors?.surface || '#FFFFFF',
                text: designInput.colors?.text || '#1E293B',
                accent: designInput.colors?.accent || '#FACC15',
                // Additional color variations
                primaryHover: this.adjustColor(designInput.colors?.primary || '#0F172A', -10),
                secondaryHover: this.adjustColor(designInput.colors?.secondary || '#22D3EE', -10),
                accentHover: this.adjustColor(designInput.colors?.accent || '#FACC15', -10)
            },

            // Typography
            fonts: {
                heading: designInput.fonts?.heading || 'Inter',
                body: designInput.fonts?.body || 'Rubik',
                // Additional font properties
                headingWeight: designInput.fonts?.headingWeight || '700',
                bodyWeight: designInput.fonts?.bodyWeight || '400'
            },

            // Layout configuration
            layout: {
                type: designInput.layout?.type || 'split',
                container: designInput.layout?.container || 'max-w-7xl',
                padding: designInput.layout?.padding || 'px-6 py-12',
                // Additional layout properties
                spacing: designInput.layout?.spacing || 'space-y-8',
                alignment: designInput.layout?.alignment || 'center'
            },

            // Shape and styling
            shapes: {
                borderRadius: designInput.shapes?.borderRadius || '2xl',
                buttons: designInput.shapes?.buttons || 'rounded-lg',
                images: designInput.shapes?.images || 'rounded-xl',
                cards: designInput.shapes?.cards || 'rounded-xl'
            },

            // Visual effects
            effects: {
                shadow: designInput.effects?.shadow || 'md',
                hoverAnimation: designInput.effects?.hoverAnimation || 'scale',
                entryAnimation: designInput.effects?.entryAnimation || 'fade-in-up',
                transitions: designInput.effects?.transitions || 'all 0.3s ease'
            },

            // Component styles
            components: {
                buttonStyle: designInput.components?.buttonStyle || 'solid',
                cardStyle: designInput.components?.cardStyle || 'shadow',
                ctaStyle: designInput.components?.ctaStyle || 'boxed',
                headerStyle: designInput.components?.headerStyle || 'modern',
                footerStyle: designInput.components?.footerStyle || 'detailed'
            },

            // Media and interactions
            media: designInput.media || {
                hero: {
                    backgroundType: "gradient",
                    overlay: true,
                    filter: "brightness-90"
                },
                icons: {
                    style: "lucide",
                    size: "md"
                }
            },

            interactions: designInput.interactions || {
                micro: true,
                scrollReveal: true,
                stickyHeader: true
            }
        };

        console.log('✅ Design data processed:', {
            name: design.name,
            mode: design.mode,
            layout: design.layout.type,
            primaryColor: design.colors.primary
        });

        return design;
    }

    processHeaderData(headerInput, config, designData) {
        const defaultMenuItems = [
            { name: 'Home', link: '/', type: 'link', children: [] },
            { name: 'About', link: '/about', type: 'link', children: [] },
            { name: 'Services', link: '/services', type: 'link', children: [] },
            { name: 'Contact', link: '/contact', type: 'link', children: [] }
        ];

        return {
            style: headerInput?.style || designData.components?.headerStyle || 'solid',
            logoType: headerInput?.logoType || 'text',
            logoText: headerInput?.logoText || config.businessName || 'Your Business',
            logoImage: headerInput?.logoImage || null,
            menuItems: this.processMenuItems(headerInput?.menuItems || defaultMenuItems),
            showCta: headerInput?.showCta !== undefined ? headerInput.showCta : true,
            ctaText: headerInput?.ctaText || 'Get Started',
            ctaLink: headerInput?.ctaLink || '/contact',
            // Design integration
            backgroundColor: designData.colors.surface,
            textColor: designData.colors.text,
            primaryColor: designData.colors.primary,
            hoverColor: designData.colors.primaryHover,
            borderRadius: designData.shapes.buttons,
            shadow: designData.effects.shadow
        };
    }

    processFooterData(footerInput, config, designData) {
        return {
            style: footerInput?.style || designData.components?.footerStyle || 'multiColumn',
            companyName: footerInput?.companyName || config.businessName || 'Your Business',
            companyDescription: footerInput?.companyDescription ||
                config.businessDescription ||
                `Professional ${config.industry || 'business'} services`,
            email: footerInput?.email || `contact@${(config.businessName || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
            phone: footerInput?.phone || '(555) 123-4567',
            address: footerInput?.address || '123 Business St, City, State 12345',
            showNewsletter: footerInput?.showNewsletter !== undefined ? footerInput.showNewsletter : true,
            newsletterTitle: footerInput?.newsletterTitle || 'Stay Updated',
            socialLinks: {
                facebook: footerInput?.socialLinks?.facebook || '',
                twitter: footerInput?.socialLinks?.twitter || '',
                linkedin: footerInput?.socialLinks?.linkedin || '',
                instagram: footerInput?.socialLinks?.instagram || '',
                github: footerInput?.socialLinks?.github || '',
                youtube: footerInput?.socialLinks?.youtube || ''
            },
            quickLinks: footerInput?.quickLinks || [
                { name: 'Privacy Policy', link: '/privacy' },
                { name: 'Terms of Service', link: '/terms' },
                { name: 'Support', link: '/support' }
            ],
            // Design integration
            backgroundColor: designData.mode === 'dark' ? designData.colors.surface : '#1F2937',
            textColor: designData.mode === 'dark' ? designData.colors.text : '#FFFFFF',
            primaryColor: designData.colors.primary,
            borderRadius: designData.shapes.borderRadius
        };
    }

    processMenuItems(menuItems) {
        if (!Array.isArray(menuItems)) {
            console.warn('⚠️ Menu items not an array, using defaults');
            return [
                { name: 'Home', link: '/', type: 'link', children: [] },
                { name: 'About', link: '/about', type: 'link', children: [] },
                { name: 'Services', link: '/services', type: 'link', children: [] },
                { name: 'Contact', link: '/contact', type: 'link', children: [] }
            ];
        }

        return menuItems.map(item => ({
            name: item.name || 'Unnamed',
            link: item.link || item.href || '/',
            type: item.type || 'link',
            children: Array.isArray(item.children) ? item.children.map(child => ({
                name: child.name || 'Unnamed',
                link: child.link || child.href || '/',
                description: child.description || ''
            })) : []
        }));
    }

    async generateFiles(templatePaths, config) {
        console.log('📁 Generating files with design system integration...');
        const files = {};

        for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
            try {
                console.log(`📝 Processing: ${templatePath} → ${outputPath}`);

                // Load template
                let content = await this.templateLoader.loadTemplate(templatePath);

                // Process with enhanced design system
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

        // Process all variables in order
        processed = this.processBasicVariables(processed, config);
        processed = this.processDesignVariables(processed, config);
        processed = this.processHeroVariables(processed, config);
        processed = this.processHeaderVariables(processed, config);
        processed = this.processFooterVariables(processed, config);
        processed = this.processComplexVariables(processed, config);

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

    processDesignVariables(template, config) {
        if (!config.design) return template;

        const design = config.design;

        // Color variables
        Object.entries(design.colors).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.colors\\.${key}}}`, 'g');
            template = template.replace(regex, value);
            // Legacy support
            const legacyRegex = new RegExp(`{{color${key.charAt(0).toUpperCase() + key.slice(1)}}}`, 'g');
            template = template.replace(legacyRegex, value);
        });

        // Font variables
        Object.entries(design.fonts).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.fonts\\.${key}}}`, 'g');
            template = template.replace(regex, value);
            // Legacy support
            const legacyRegex = new RegExp(`{{font${key.charAt(0).toUpperCase() + key.slice(1)}}}`, 'g');
            template = template.replace(legacyRegex, value);
        });

        // Layout variables
        Object.entries(design.layout).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.layout\\.${key}}}`, 'g');
            template = template.replace(regex, value);
        });

        // Shape variables
        Object.entries(design.shapes).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.shapes\\.${key}}}`, 'g');
            template = template.replace(regex, value);
        });

        // Effect variables
        Object.entries(design.effects).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.effects\\.${key}}}`, 'g');
            template = template.replace(regex, value);
        });

        // Component style variables
        Object.entries(design.components).forEach(([key, value]) => {
            const regex = new RegExp(`{{design\\.components\\.${key}}}`, 'g');
            template = template.replace(regex, value);
        });

        // Overall design properties
        const designVars = {
            'design.name': design.name,
            'design.mode': design.mode,
            'design.category': design.category,
            // Legacy support
            'designName': design.name,
            'designMode': design.mode,
            'themeMode': design.mode,
            'designCategory': design.category
        };

        Object.entries(designVars).forEach(([key, value]) => {
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
            'hero.style': config.heroData.style,
            // Legacy support
            'heroHeadline': config.heroData.headline,
            'heroSubheadline': config.heroData.subheadline,
            'heroPrimaryCta': config.heroData.primaryCta,
            'heroSecondaryCta': config.heroData.secondaryCta,
            'heroStyle': config.heroData.style
        };

        Object.entries(heroVars).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, value || '');
        });

        return template;
    }

    processHeaderVariables(template, config) {
        if (!config.headerData) return template;

        // Basic header variables
        const headerVars = {
            'header.style': config.headerData.style,
            'header.logoType': config.headerData.logoType,
            'header.logoText': config.headerData.logoText,
            'header.logoImage': config.headerData.logoImage || '',
            'header.showCta': config.headerData.showCta,
            'header.ctaText': config.headerData.ctaText,
            'header.ctaLink': config.headerData.ctaLink,
            'header.backgroundColor': config.headerData.backgroundColor,
            'header.textColor': config.headerData.textColor,
            'header.primaryColor': config.headerData.primaryColor,
            'header.hoverColor': config.headerData.hoverColor,
            'header.borderRadius': config.headerData.borderRadius,
            'header.shadow': config.headerData.shadow,
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

        // Process menu items with enhanced debugging
        const menuItems = config.headerData.menuItems;
        console.log('🔍 Processing menu items:', {
            type: typeof menuItems,
            isArray: Array.isArray(menuItems),
            length: menuItems?.length,
            sample: menuItems?.[0]
        });

        if (Array.isArray(menuItems) && menuItems.length > 0) {
            try {
                // Simple menu items (for basic templates)
                const menuItemsJS = menuItems.map(item =>
                    `{ name: '${item.name || 'Unnamed'}', href: '${item.link || '/'}' }`
                ).join(',\n      ');
                template = template.replace(/{{menuItems}}/g, menuItemsJS);

                // Enhanced menu items with full structure
                const enhancedMenuItemsJS = menuItems.map(item => {
                    const menuItem = {
                        name: item.name || 'Unnamed',
                        href: item.link || '/',
                        type: item.type || 'link'
                    };

                    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                        menuItem.children = item.children.map(child => ({
                            name: child.name || 'Unnamed',
                            href: child.link || '/',
                            description: child.description || ''
                        }));
                    }

                    return JSON.stringify(menuItem);
                }).join(',\n      ');

                template = template.replace(/{{enhancedMenuItems}}/g, enhancedMenuItemsJS);
                template = template.replace(/{{navigationItemsJSON}}/g, enhancedMenuItemsJS);

                console.log('✅ Menu items processed successfully');
            } catch (error) {
                console.error('❌ Error processing menu items:', error);
                template = template.replace(/{{menuItems}}/g, '');
                template = template.replace(/{{enhancedMenuItems}}/g, '');
                template = template.replace(/{{navigationItemsJSON}}/g, '');
            }
        } else {
            console.warn('⚠️ No valid menu items, using fallback');
            template = template.replace(/{{menuItems}}/g, '');
            template = template.replace(/{{enhancedMenuItems}}/g, '');
            template = template.replace(/{{navigationItemsJSON}}/g, '');
        }

        return template;
    }

    processFooterVariables(template, config) {
        if (!config.footerData) return template;

        // Basic footer variables
        const footerVars = {
            'footer.style': config.footerData.style,
            'footer.companyName': config.footerData.companyName,
            'footer.companyDescription': config.footerData.companyDescription,
            'footer.email': config.footerData.email,
            'footer.phone': config.footerData.phone,
            'footer.address': config.footerData.address,
            'footer.showNewsletter': config.footerData.showNewsletter,
            'footer.newsletterTitle': config.footerData.newsletterTitle,
            'footer.backgroundColor': config.footerData.backgroundColor,
            'footer.textColor': config.footerData.textColor,
            'footer.primaryColor': config.footerData.primaryColor,
            'footer.borderRadius': config.footerData.borderRadius,
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

    processComplexVariables(template, config) {
        // Process features array
        if (config.features && Array.isArray(config.features)) {
            const featuresJS = config.features.map(feature =>
                typeof feature === 'string' ? `'${feature}'` : JSON.stringify(feature)
            ).join(',\n      ');
            template = template.replace(/{{features}}/g, featuresJS);
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

    // Utility method to adjust colors (darken/lighten)
    adjustColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Helper methods
    getSupportedProjectTypes() {
        return this.pathManager.getSupportedProjectTypes();
    }

    getSupportedThemes() {
        return this.designSystem.getAvailableThemes();
    }

    getDesignPresets() {
        return this.designSystem.getPresets();
    }

    getThemeData(themeId) {
        return this.designSystem.getTheme(themeId);
    }
}

export default ProjectGenerator;