// lib/generator/ConfigValidator.js
export class ConfigValidator {
    static validateAndProcess(config) {
        console.log('🔍 Validating and processing config...');

        // Ensure required base properties
        const processed = {
            ...config,
            businessName: config.businessName || config.projectName || 'Your Business',
            projectName: config.projectName || config.businessName || 'Your Project',
            businessDescription: config.businessDescription || config.description || 'Professional services',

            // Ensure theme structure
            theme: {
                primaryColor: config.theme?.primaryColor || '#1E40AF',
                secondaryColor: config.theme?.secondaryColor || '#FBBF24',
                fontFamily: config.theme?.fontFamily || 'Inter, sans-serif',
                ...config.theme
            },

            // Ensure component structure
            components: {
                navbar: {
                    backgroundColor: config.components?.navbar?.backgroundColor || config.theme?.primaryColor || '#1E40AF',
                    textColor: config.components?.navbar?.textColor || '#FFFFFF',
                    hoverColor: config.components?.navbar?.hoverColor || config.theme?.secondaryColor || '#FBBF24',
                    ...config.components?.navbar
                },
                button: {
                    primaryColor: config.components?.button?.primaryColor || config.theme?.primaryColor || '#1E40AF',
                    secondaryColor: config.components?.button?.secondaryColor || config.theme?.secondaryColor || '#FBBF24',
                    textColor: config.components?.button?.textColor || '#FFFFFF',
                    borderRadius: config.components?.button?.borderRadius || '0.5rem',
                    ...config.components?.button
                },
                ...config.components
            },

            // Ensure header structure
            header: {
                menuItems: config.header?.menuItems?.length > 0 ? config.header.menuItems : [
                    { label: 'Home', link: '/' },
                    { label: 'About', link: '/about' },
                    { label: 'Contact', link: '/contact' }
                ],
                ...config.header
            },

            // Ensure footer structure
            footer: {
                text: config.footer?.text || `© ${new Date().getFullYear()} ${config.businessName || 'Your Company'}`,
                links: config.footer?.links?.length > 0 ? config.footer.links : [
                    { label: 'Privacy Policy', link: '/privacy' },
                    { label: 'Terms of Service', link: '/terms' }
                ],
                ...config.footer
            },

            // Ensure blocks structure
            blocks: {
                home: {
                    hero: {
                        title: config.blocks?.home?.hero?.title || `Welcome to ${config.businessName || 'Your Business'}`,
                        subtitle: config.blocks?.home?.hero?.subtitle || config.businessDescription || 'Professional services',
                        buttonText: config.blocks?.home?.hero?.buttonText || 'Get Started',
                        buttonLink: config.blocks?.home?.hero?.buttonLink || '/get-started',
                        ...config.blocks?.home?.hero
                    },
                    ...config.blocks?.home
                },
                ...config.blocks
            },

            // Ensure graphics structure
            graphics: {
                currentLogo: config.graphics?.currentLogo || null,
                heroImage: config.graphics?.heroImage || null,
                ...config.graphics
            }
        };

        console.log('✅ Config processed successfully');
        console.log('🔍 Key processed values:', {
            businessName: processed.businessName,
            primaryColor: processed.theme.primaryColor,
            navbarBg: processed.components.navbar.backgroundColor,
            menuItems: processed.header.menuItems.length
        });

        return processed;
    }
}