// Enhanced Design System
// File: lib/generator/DesignSystem.js

export class DesignSystem {
    constructor() {
        this.defaultConfig = {
            colors: {
                primary: '#3B82F6',
                secondary: '#8B5CF6',
                accent: '#10B981',
                neutral: '#6B7280',
                background: '#FFFFFF',
                surface: '#F9FAFB',
                text: '#1F2937',
                textLight: '#6B7280'
            },
            typography: {
                headingFont: 'Inter',
                bodyFont: 'Inter',
                headingWeight: '700',
                bodyWeight: '400',
                headingSize: 'responsive',
                bodySize: 'base'
            },
            layout: {
                type: 'standard',
                containerWidth: 'max-w-7xl',
                spacing: 'comfortable',
                borderRadius: 'rounded-lg',
                shadowStyle: 'modern'
            },
            components: {
                buttonStyle: 'modern',
                cardStyle: 'elevated',
                inputStyle: 'modern',
                navigationStyle: 'horizontal'
            },
            effects: {
                animations: true,
                transitions: true,
                hoverEffects: true,
                gradients: true
            }
        }
    }

    // Color options
    getColorPalettes() {
        return {
            blue: {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                accent: '#60A5FA',
                name: 'Professional Blue'
            },
            purple: {
                primary: '#8B5CF6',
                secondary: '#7C3AED',
                accent: '#A78BFA',
                name: 'Creative Purple'
            },
            green: {
                primary: '#10B981',
                secondary: '#059669',
                accent: '#34D399',
                name: 'Growth Green'
            },
            orange: {
                primary: '#F59E0B',
                secondary: '#D97706',
                accent: '#FBBF24',
                name: 'Energetic Orange'
            },
            pink: {
                primary: '#EC4899',
                secondary: '#DB2777',
                accent: '#F472B6',
                name: 'Vibrant Pink'
            },
            slate: {
                primary: '#475569',
                secondary: '#334155',
                accent: '#64748B',
                name: 'Professional Slate'
            }
        }
    }

    // Font options
    getFontOptions() {
        return {
            headingFonts: [
                { id: 'inter', name: 'Inter', description: 'Modern sans-serif', family: 'Inter' },
                { id: 'poppins', name: 'Poppins', description: 'Friendly rounded', family: 'Poppins' },
                { id: 'playfair', name: 'Playfair Display', description: 'Elegant serif', family: 'Playfair Display' },
                { id: 'montserrat', name: 'Montserrat', description: 'Clean geometric', family: 'Montserrat' },
                { id: 'roboto', name: 'Roboto', description: 'Google standard', family: 'Roboto' },
                { id: 'opensans', name: 'Open Sans', description: 'Readable humanist', family: 'Open Sans' }
            ],
            bodyFonts: [
                { id: 'inter', name: 'Inter', description: 'Modern readable', family: 'Inter' },
                { id: 'opensans', name: 'Open Sans', description: 'Clean readable', family: 'Open Sans' },
                { id: 'roboto', name: 'Roboto', description: 'Google standard', family: 'Roboto' },
                { id: 'lato', name: 'Lato', description: 'Warm friendly', family: 'Lato' },
                { id: 'source', name: 'Source Sans Pro', description: 'Adobe clean', family: 'Source Sans Pro' },
                { id: 'nunito', name: 'Nunito', description: 'Rounded friendly', family: 'Nunito' }
            ]
        }
    }

    // Layout options
    getLayoutOptions() {
        return {
            standard: {
                id: 'standard',
                name: 'Standard',
                description: 'Traditional header, main, footer layout',
                containerWidth: 'max-w-7xl',
                navigation: 'horizontal'
            },
            wide: {
                id: 'wide',
                name: 'Wide',
                description: 'Full-width content areas',
                containerWidth: 'max-w-full',
                navigation: 'horizontal'
            },
            centered: {
                id: 'centered',
                name: 'Centered',
                description: 'Narrow centered content',
                containerWidth: 'max-w-4xl',
                navigation: 'horizontal'
            },
            sidebar: {
                id: 'sidebar',
                name: 'Sidebar',
                description: 'Side navigation layout',
                containerWidth: 'max-w-full',
                navigation: 'sidebar'
            },
            magazine: {
                id: 'magazine',
                name: 'Magazine',
                description: 'Multi-column layout',
                containerWidth: 'max-w-6xl',
                navigation: 'horizontal'
            }
        }
    }

    // Spacing options
    getSpacingOptions() {
        return {
            compact: { id: 'compact', name: 'Compact', description: 'Tight spacing' },
            comfortable: { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing' },
            spacious: { id: 'spacious', name: 'Spacious', description: 'Generous spacing' }
        }
    }

    // Border radius options
    getBorderRadiusOptions() {
        return {
            none: { id: 'none', name: 'None', description: 'Sharp corners', value: 'rounded-none' },
            small: { id: 'small', name: 'Small', description: 'Subtle curves', value: 'rounded' },
            medium: { id: 'medium', name: 'Medium', description: 'Balanced curves', value: 'rounded-lg' },
            large: { id: 'large', name: 'Large', description: 'Smooth curves', value: 'rounded-xl' },
            full: { id: 'full', name: 'Full', description: 'Pill shape', value: 'rounded-full' }
        }
    }

    // Shadow options
    getShadowOptions() {
        return {
            none: { id: 'none', name: 'None', description: 'No shadows' },
            subtle: { id: 'subtle', name: 'Subtle', description: 'Light shadows' },
            modern: { id: 'modern', name: 'Modern', description: 'Balanced shadows' },
            dramatic: { id: 'dramatic', name: 'Dramatic', description: 'Strong shadows' }
        }
    }

    // Component style options
    getComponentStyles() {
        return {
            buttons: {
                modern: { id: 'modern', name: 'Modern', description: 'Clean contemporary' },
                rounded: { id: 'rounded', name: 'Rounded', description: 'Soft friendly' },
                sharp: { id: 'sharp', name: 'Sharp', description: 'Angular precise' },
                minimal: { id: 'minimal', name: 'Minimal', description: 'Simple clean' }
            },
            cards: {
                flat: { id: 'flat', name: 'Flat', description: 'No shadows' },
                elevated: { id: 'elevated', name: 'Elevated', description: 'Subtle shadows' },
                floating: { id: 'floating', name: 'Floating', description: 'Strong shadows' },
                outlined: { id: 'outlined', name: 'Outlined', description: 'Border only' }
            }
        }
    }

    // Generate complete design configuration
    generateConfig(userSelections) {
        return {
            ...this.defaultConfig,
            ...userSelections,
            generated: true,
            timestamp: new Date().toISOString()
        }
    }

    // Generate CSS variables from config
    generateCSSVariables(config) {
        return `
      :root {
        /* Colors */
        --color-primary: ${config.colors.primary};
        --color-secondary: ${config.colors.secondary};
        --color-accent: ${config.colors.accent};
        --color-neutral: ${config.colors.neutral};
        --color-background: ${config.colors.background};
        --color-surface: ${config.colors.surface};
        --color-text: ${config.colors.text};
        --color-text-light: ${config.colors.textLight};
        
        /* Typography */
        --font-heading: '${config.typography.headingFont}', sans-serif;
        --font-body: '${config.typography.bodyFont}', sans-serif;
        --weight-heading: ${config.typography.headingWeight};
        --weight-body: ${config.typography.bodyWeight};
        
        /* Layout */
        --container-width: ${config.layout.containerWidth};
        --border-radius: ${config.layout.borderRadius};
        --spacing-scale: ${config.layout.spacing};
      }
    `
    }

    // Generate Tailwind config
    generateTailwindConfig(config) {
        return {
            theme: {
                extend: {
                    colors: {
                        primary: config.colors.primary,
                        secondary: config.colors.secondary,
                        accent: config.colors.accent,
                        neutral: config.colors.neutral,
                        'theme-background': config.colors.background,
                        'theme-surface': config.colors.surface,
                        'theme-text': config.colors.text,
                        'theme-text-light': config.colors.textLight
                    },
                    fontFamily: {
                        heading: [config.typography.headingFont, 'sans-serif'],
                        body: [config.typography.bodyFont, 'sans-serif']
                    },
                    fontWeight: {
                        'heading': config.typography.headingWeight,
                        'body': config.typography.bodyWeight
                    }
                }
            }
        }
    }
}

export const designSystem = new DesignSystem()

