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
        console.log(`🚀 Starting project generation: ${config.businessName || config.projectName}`);

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
                name: processedConfig.businessName,
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
            // Basic project info - using actual frontend field names
            businessName: formData.businessName || 'Your Business',
            projectName: formData.projectName || formData.businessName || 'Your Project',
            description: formData.description || formData.businessDescription || 'Generated with Next.js',
            businessDescription: formData.businessDescription || '',
            industry: formData.industry || 'business',
            targetAudience: formData.targetAudience || 'customers',

            // Project type determination
            projectType: this.determineProjectType(formData),
            template: formData.template || 'base',

            // Theme configuration - direct pass-through since structure matches
            theme: {
                primaryColor: formData.theme?.primaryColor || '#1E40AF',
                secondaryColor: formData.theme?.secondaryColor || '#FBBF24',
                fontFamily: formData.theme?.fontFamily || 'Inter, sans-serif',
                iconLibrary: formData.theme?.iconLibrary || 'Heroicons',
                layout: formData.theme?.layout || {
                    header: 'fixed',
                    footer: 'static',
                    sidebar: 'hidden'
                },
                typography: formData.theme?.typography || {
                    baseFontSize: '16px',
                    bodyFontSize: '1rem',
                    headingFontSize: '2rem',
                    lineHeight: '1.5'
                }
            },

            // Header configuration - direct pass-through
            header: {
                logo: formData.header?.logo || '/images/logo.png',
                menuItems: formData.header?.menuItems || [
                    { label: 'Home', link: '/' },
                    { label: 'About', link: '/about' },
                    { label: 'Contact', link: '/contact' }
                ],
                showIcons: formData.header?.showIcons || false,
                levels: formData.header?.levels || 1,
                types: formData.header?.types || ['marketing']
            },

            // Footer configuration - direct pass-through
            footer: {
                text: formData.footer?.text || `© ${new Date().getFullYear()} Your Company`,
                links: formData.footer?.links || [
                    { label: 'Privacy Policy', link: '/privacy' },
                    { label: 'Terms of Service', link: '/terms' }
                ]
            },

            // Pages configuration - direct pass-through
            pages: formData.pages || {
                home: { enabled: true, title: 'Home', blocks: ['hero', 'features'] },
                about: { enabled: true, title: 'About Us', blocks: ['missionStatement'] },
                contact: { enabled: true, title: 'Contact', blocks: ['contactForm'] }
            },

            // Content blocks - direct pass-through
            blocks: formData.blocks || {
                marketing: {
                    hero: {
                        title: `Welcome to ${formData.businessName || 'Your Business'}`,
                        subtitle: formData.businessDescription || 'Building modern web applications',
                        buttonText: 'Get Started',
                        buttonLink: '/get-started'
                    },
                    features: [
                        { title: 'Fast Performance', description: 'Optimized for speed and efficiency.' },
                        { title: 'Responsive Design', description: 'Looks great on all devices.' }
                    ]
                }
            },

            // Component styling - direct pass-through
            components: formData.components || {
                button: {
                    primaryColor: formData.theme?.primaryColor || '#2563EB',
                    secondaryColor: formData.theme?.secondaryColor || '#FBBF24',
                    textColor: '#FFFFFF',
                    borderRadius: '0.5rem'
                },
                card: {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    shadow: 'md'
                },
                navbar: {
                    backgroundColor: formData.theme?.primaryColor || '#1E40AF',
                    textColor: '#FFFFFF',
                    hoverColor: '#2563EB'
                }
            },

            // Animations - direct pass-through
            animations: formData.animations || {
                enabled: true,
                hoverEffects: true,
                scrollReveal: true,
                transition: 'ease-in-out'
            },

            // Meta data - direct pass-through with fallbacks
            meta: {
                title: formData.meta?.title || formData.businessName || 'Your Project',
                keywords: formData.meta?.keywords || ['Next.js', 'Tailwind', 'Firebase'],
                ogImage: formData.meta?.ogImage || '/images/og-image.png',
                themeColor: formData.meta?.themeColor || formData.theme?.primaryColor || '#1E40AF'
            },

            // System
            currentYear: new Date().getFullYear()
        };
    }

    determineProjectType(formData) {
        // Use the template field directly if provided
        if (formData.template) {
            return formData.template;
        }

        // Check if ecommerce features are enabled
        if (formData.pages?.shop?.enabled) return 'ecommerce';

        // Check header types for hints
        if (formData.header?.types?.includes('ecommerce')) return 'ecommerce';
        if (formData.header?.types?.includes('webapp')) return 'webapp';
        if (formData.header?.types?.includes('ngo')) return 'ngo';

        // Default to base
        return 'base';
    }

    async generateFiles(templatePaths, config) {
        console.log('📁 Generating files...');
        const files = {};

        for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
            try {
                let content = await this.templateLoader.loadTemplate(templatePath, config);
                files[outputPath] = content;
            } catch (error) {
                console.error(`❌ Failed to process: ${templatePath}`, error);
                files[outputPath] = `// Error processing template: ${error.message}`;
            }
        }

        return files;
    }

    getSupportedProjectTypes() {
        return this.pathManager.getSupportedProjectTypes();
    }
}

export default ProjectGenerator;