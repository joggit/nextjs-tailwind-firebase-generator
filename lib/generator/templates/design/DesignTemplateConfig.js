// lib/generator/templates/design/DesignTemplateConfig.js

export const DESIGN_THEMES = {
  modern: {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      neutral: '#6B7280',
      background: '#FFFFFF',
      surface: '#F9FAFB'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '700',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'comfortable',
      borderRadius: '0.5rem',
      shadowStyle: 'sharp'
    },
    components: {
      button: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium',
        secondary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200',
        outline: 'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200'
      },
      card: {
        default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg',
        elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'hover:scale-105 transition-transform duration-200'
    }
  },
  
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    colors: {
      primary: '#1F2937',
      secondary: '#D97706',
      accent: '#DC2626',
      neutral: '#6B7280',
      background: '#FFFBEB',
      surface: '#FFFFFF'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Source Serif Pro',
      headingWeight: '600',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'spacious',
      borderRadius: '0.25rem',
      shadowStyle: 'soft'
    },
    components: {
      button: {
        primary: 'bg-gray-800 text-white hover:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 font-serif',
        secondary: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md transition-all duration-300 font-serif',
        outline: 'border border-gray-800 bg-transparent text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-300 font-serif'
      },
      card: {
        default: 'bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded elegant-border',
        elevated: 'bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'hover:scale-102 transition-transform duration-300'
    }
  },

  creative: {
    id: 'creative',
    name: 'Creative',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      neutral: '#6B7280',
      background: '#F3F4F6',
      surface: '#FFFFFF'
    },
    typography: {
      headingFont: 'Poppins',
      bodyFont: 'Open Sans',
      headingWeight: '800',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'comfortable',
      borderRadius: '1rem',
      shadowStyle: 'colorful'
    },
    components: {
      button: {
        primary: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-bold',
        secondary: 'bg-gradient-to-r from-purple-500 to-amber-500 text-white hover:from-purple-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl',
        outline: 'border-2 border-pink-500 bg-transparent text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-200 rounded-xl'
      },
      card: {
        default: 'bg-white border border-gray-200 shadow-md hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-200 rounded-xl',
        elevated: 'bg-white shadow-xl hover:shadow-2xl transition-shadow duration-200 rounded-xl creative-gradient'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'hover:scale-110 transition-transform duration-200 hover:rotate-1'
    }
  },

  tech: {
    id: 'tech',
    name: 'Tech',
    colors: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#10B981',
      neutral: '#6B7280',
      background: '#0F172A',
      surface: '#1E293B'
    },
    typography: {
      headingFont: 'JetBrains Mono',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'compact',
      borderRadius: '0.5rem',
      shadowStyle: 'neon'
    },
    components: {
      button: {
        primary: 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-200 border border-cyan-500/20 neon-glow font-mono',
        secondary: 'bg-purple-500 text-white hover:bg-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-200 border border-purple-500/20',
        outline: 'border border-cyan-500 bg-transparent text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all duration-200 neon-glow'
      },
      card: {
        default: 'bg-slate-800 border border-cyan-500/20 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-200 rounded-lg backdrop-blur-sm',
        elevated: 'bg-slate-800 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/40 transition-shadow duration-200 rounded-lg border border-cyan-500/30 neon-glow'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'hover:scale-105 transition-transform duration-200 animate-pulse-neon'
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#4B5563',
      accent: '#6B7280',
      neutral: '#9CA3AF',
      background: '#FFFFFF',
      surface: '#FAFAFA'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '500',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'spacious',
      borderRadius: '0rem',
      shadowStyle: 'none'
    },
    components: {
      button: {
        primary: 'bg-black text-white hover:bg-gray-800 transition-colors duration-200 font-medium',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200',
        outline: 'border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors duration-200'
      },
      card: {
        default: 'bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200',
        elevated: 'bg-white border border-gray-300 hover:border-gray-400 transition-colors duration-200'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'transition-all duration-200'
    }
  },

  corporate: {
    id: 'corporate',
    name: 'Corporate',
    colors: {
      primary: '#1E40AF',
      secondary: '#059669',
      accent: '#DC2626',
      neutral: '#6B7280',
      background: '#F8FAFC',
      surface: '#FFFFFF'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '600',
      bodyWeight: '400'
    },
    spacing: {
      scale: 'comfortable',
      borderRadius: '0.375rem',
      shadowStyle: 'professional'
    },
    components: {
      button: {
        primary: 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm hover:shadow-md transition-all duration-200 font-semibold',
        secondary: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200',
        outline: 'border border-blue-700 bg-transparent text-blue-700 hover:bg-blue-700 hover:text-white transition-all duration-200'
      },
      card: {
        default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-md',
        elevated: 'bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-md'
      }
    },
    animations: {
      fadeIn: 'animate-fadeInUp',
      hover: 'hover:scale-105 transition-transform duration-200'
    }
  }
}

export const LAYOUT_TEMPLATES = {
  standard: {
    id: 'standard',
    name: 'Standard',
    structure: 'header-main-footer',
    navigation: 'horizontal-top',
    sidebar: false,
    containerWidth: 'max-w-7xl',
    spacing: 'space-y-0'
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    structure: 'sidebar-main',
    navigation: 'vertical-left',
    sidebar: true,
    containerWidth: 'max-w-full',
    spacing: 'flex min-h-screen'
  },
  centered: {
    id: 'centered',
    name: 'Centered',
    structure: 'centered-content',
    navigation: 'horizontal-center',
    sidebar: false,
    containerWidth: 'max-w-4xl',
    spacing: 'space-y-8'
  },
  magazine: {
    id: 'magazine',
    name: 'Magazine',
    structure: 'multi-column',
    navigation: 'horizontal-top',
    sidebar: false,
    containerWidth: 'max-w-6xl',
    spacing: 'space-y-6'
  },
  landing: {
    id: 'landing',
    name: 'Landing',
    structure: 'single-page-sections',
    navigation: 'sticky-top',
    sidebar: false,
    containerWidth: 'max-w-5xl',
    spacing: 'space-y-0'
  }
}

export const HERO_TEMPLATES = {
  centered: {
    id: 'centered',
    name: 'Centered',
    layout: 'text-center',
    container: 'max-w-4xl mx-auto',
    background: 'bg-gradient-to-br from-primary/10 via-white to-secondary/10',
    content: 'centered-content'
  },
  split: {
    id: 'split',
    name: 'Split',
    layout: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
    container: 'max-w-7xl mx-auto',
    background: 'bg-white',
    content: 'side-by-side'
  },
  fullscreen: {
    id: 'fullscreen',
    name: 'Fullscreen',
    layout: 'min-h-screen flex items-center justify-center text-center',
    container: 'max-w-5xl mx-auto',
    background: 'bg-cover bg-center relative',
    content: 'overlay'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    layout: 'text-left',
    container: 'max-w-3xl mx-auto',
    background: 'bg-white',
    content: 'minimal'
  },
  video: {
    id: 'video',
    name: 'Video',
    layout: 'min-h-screen flex items-center justify-center text-center relative',
    container: 'max-w-4xl mx-auto',
    background: 'bg-black relative overflow-hidden',
    content: 'video-overlay'
  },
  animated: {
    id: 'animated',
    name: 'Animated',
    layout: 'text-center',
    container: 'max-w-4xl mx-auto',
    background: 'bg-gradient-to-br from-primary/20 to-secondary/20',
    content: 'animated-content'
  }
}

export function getThemeTemplate(themeId) {
  return DESIGN_THEMES[themeId] || DESIGN_THEMES.modern
}

export function getLayoutTemplate(layoutId) {
  return LAYOUT_TEMPLATES[layoutId] || LAYOUT_TEMPLATES.standard
}

export function getHeroTemplate(heroId) {
  return HERO_TEMPLATES[heroId] || HERO_TEMPLATES.centered
}

export function generateThemeCSS(themeConfig) {
  const theme = getThemeTemplate(themeConfig.theme)
  
  return `
/* ${theme.name} Theme Variables */
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-neutral: ${theme.colors.neutral};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  
  --font-heading: '${theme.typography.headingFont}', sans-serif;
  --font-body: '${theme.typography.bodyFont}', sans-serif;
  --weight-heading: ${theme.typography.headingWeight};
  --weight-body: ${theme.typography.bodyWeight};
  
  --border-radius: ${theme.spacing.borderRadius};
  --spacing-scale: ${theme.spacing.scale};
  --shadow-style: ${theme.spacing.shadowStyle};
}

/* Theme-specific body styles */
body {
  background-color: var(--color-background);
  color: var(--color-neutral);
  font-family: var(--font-body);
  font-weight: var(--weight-body);
}

/* Heading styles */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--weight-heading);
  color: ${theme.colors.primary};
}

/* Theme-specific component styles */
.btn-primary {
  ${theme.components.button.primary.split(' ').map(cls => `@apply ${cls};`).join(' ')}
}

.btn-secondary {
  ${theme.components.button.secondary.split(' ').map(cls => `@apply ${cls};`).join(' ')}
}

.btn-outline {
  ${theme.components.button.outline.split(' ').map(cls => `@apply ${cls};`).join(' ')}
}

.card-default {
  ${theme.components.card.default.split(' ').map(cls => `@apply ${cls};`).join(' ')}
}

.card-elevated {
  ${theme.components.card.elevated.split(' ').map(cls => `@apply ${cls};`).join(' ')}
}

/* Theme-specific animations */
.animate-theme-hover {
  ${theme.animations.hover}
}

/* Special theme effects */
${theme.id === 'tech' ? `
.neon-glow {
  box-shadow: 0 0 5px ${theme.colors.primary}, 0 0 10px ${theme.colors.primary};
}

.animate-pulse-neon {
  animation: pulseNeon 2s infinite;
}

@keyframes pulseNeon {
  0%, 100% { box-shadow: 0 0 5px ${theme.colors.primary}; }
  50% { box-shadow: 0 0 20px ${theme.colors.primary}, 0 0 30px ${theme.colors.primary}; }
}
` : ''}

${theme.id === 'creative' ? `
.creative-gradient {
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent});
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
` : ''}

${theme.id === 'elegant' ? `
.elegant-border {
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.elegant-spacing {
  line-height: 1.8;
  letter-spacing: 0.02em;
}
` : ''}

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}
`
}

export function generateTailwindConfig(themeConfig) {
  const theme = getThemeTemplate(themeConfig.theme)
  
  return {
    theme: {
      extend: {
        colors: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent,
          neutral: theme.colors.neutral,
          'theme-background': theme.colors.background,
          'theme-surface': theme.colors.surface
        },
        fontFamily: {
          heading: [theme.typography.headingFont, 'sans-serif'],
          body: [theme.typography.bodyFont, 'sans-serif']
        },
        fontWeight: {
          'heading': theme.typography.headingWeight,
          'body': theme.typography.bodyWeight
        },
        borderRadius: {
          'theme': theme.spacing.borderRadius
        },
        animation: {
          'fadeInUp': 'fadeInUp 0.6s ease-out',
          'pulseNeon': theme.id === 'tech' ? 'pulseNeon 2s infinite' : undefined,
          'wiggle': theme.id === 'creative' ? 'wiggle 1s ease-in-out infinite' : undefined
        }
      }
    }
  }
}

export function processTemplate(template, config) {
  let processed = template
  
  // Get theme configuration
  const themeConfig = getThemeTemplate(config.design?.theme || 'modern')
  const layoutConfig = getLayoutTemplate(config.design?.layout || 'standard')
  const heroConfig = getHeroTemplate(config.design?.heroStyle || 'centered')
  
  // Replace basic template variables
  Object.entries(config).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(placeholder, value)
  })
  
  // Replace theme-specific variables
  processed = processed.replace(/{{themeColors}}/g, JSON.stringify(themeConfig.colors, null, 2))
  processed = processed.replace(/{{themeTypography}}/g, JSON.stringify(themeConfig.typography, null, 2))
  processed = processed.replace(/{{themeSpacing}}/g, JSON.stringify(themeConfig.spacing, null, 2))
  processed = processed.replace(/{{themeComponents}}/g, JSON.stringify(themeConfig.components, null, 2))
  
  // Replace layout variables
  processed = processed.replace(/{{layoutStructure}}/g, layoutConfig.structure)
  processed = processed.replace(/{{navigationStyle}}/g, layoutConfig.navigation)
  processed = processed.replace(/{{containerWidth}}/g, layoutConfig.containerWidth)
  
  // Replace hero variables
  processed = processed.replace(/{{heroLayout}}/g, heroConfig.layout)
  processed = processed.replace(/{{heroContainer}}/g, heroConfig.container)
  processed = processed.replace(/{{heroBackground}}/g, heroConfig.background)
  
  // Replace component styles
  processed = processed.replace(/{{buttonPrimary}}/g, themeConfig.components.button.primary)
  processed = processed.replace(/{{buttonSecondary}}/g, themeConfig.components.button.secondary)
  processed = processed.replace(/{{buttonOutline}}/g, themeConfig.components.button.outline)
  processed = processed.replace(/{{cardDefault}}/g, themeConfig.components.card.default)
  processed = processed.replace(/{{cardElevated}}/g, themeConfig.components.card.elevated)
  
  // Replace theme ID
  processed = processed.replace(/{{themeId}}/g, themeConfig.id)
  
  return processed
}

export default {
  DESIGN_THEMES,
  LAYOUT_TEMPLATES,
  HERO_TEMPLATES,
  getThemeTemplate,
  getLayoutTemplate,
  getHeroTemplate,
  generateThemeCSS,
  generateTailwindConfig,
  processTemplate
}