// Simple Design System
// File: lib/generator/DesignSystem.js

export class DesignSystem {
    constructor() {
        this.themes = {
            modern: {
                colors: {
                    primary: '#3B82F6',
                    secondary: '#8B5CF6',
                    accent: '#10B981',
                    neutral: '#6B7280'
                },
                fonts: {
                    heading: 'Inter',
                    body: 'Inter'
                }
            },
            elegant: {
                colors: {
                    primary: '#1F2937',
                    secondary: '#D97706',
                    accent: '#DC2626',
                    neutral: '#6B7280'
                },
                fonts: {
                    heading: 'Playfair Display',
                    body: 'Source Serif Pro'
                }
            },
            creative: {
                colors: {
                    primary: '#EC4899',
                    secondary: '#8B5CF6',
                    accent: '#F59E0B',
                    neutral: '#6B7280'
                },
                fonts: {
                    heading: 'Poppins',
                    body: 'Open Sans'
                }
            },
            tech: {
                colors: {
                    primary: '#06B6D4',
                    secondary: '#8B5CF6',
                    accent: '#10B981',
                    neutral: '#6B7280'
                },
                fonts: {
                    heading: 'JetBrains Mono',
                    body: 'Inter'
                }
            },
            minimal: {
                colors: {
                    primary: '#000000',
                    secondary: '#4B5563',
                    accent: '#6B7280',
                    neutral: '#9CA3AF'
                },
                fonts: {
                    heading: 'Inter',
                    body: 'Inter'
                }
            },
            corporate: {
                colors: {
                    primary: '#1E40AF',
                    secondary: '#059669',
                    accent: '#DC2626',
                    neutral: '#6B7280'
                },
                fonts: {
                    heading: 'Inter',
                    body: 'Inter'
                }
            }
        };
    }

    getTheme(themeId) {
        return this.themes[themeId] || this.themes.modern;
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }

    processThemeVariables(template, themeId) {
        const theme = this.getTheme(themeId);

        return template
            .replace(/{{primaryColor}}/g, theme.colors.primary)
            .replace(/{{secondaryColor}}/g, theme.colors.secondary)
            .replace(/{{accentColor}}/g, theme.colors.accent)
            .replace(/{{neutralColor}}/g, theme.colors.neutral)
            .replace(/{{headingFont}}/g, theme.fonts.heading)
            .replace(/{{bodyFont}}/g, theme.fonts.body);
    }
}

export default DesignSystem;