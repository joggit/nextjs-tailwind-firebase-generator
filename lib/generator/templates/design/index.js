// Design System Template Files
// File: lib/generator/templates/design/index.js

// Template paths for design-aware files
export const DESIGN_TEMPLATE_PATHS = {
  // Base design system files
  'styles/design-system.css': 'design/styles/design-system.css.template',
  'lib/design/theme.js': 'design/lib/theme.js.template',
  'lib/design/components.js': 'design/lib/components.js.template',
  
  // Design-aware components
  'components/design/ThemeProvider.jsx': 'design/components/ThemeProvider.jsx.template',
  'components/design/DesignElements.jsx': 'design/components/DesignElements.jsx.template',
  'components/ui/Button.jsx': 'design/components/ui/Button.jsx.template',
  'components/ui/Card.jsx': 'design/components/ui/Card.jsx.template',
  
  // Theme-specific components
  'components/Header.js': 'design/components/Header.js.template',
  'components/Footer.js': 'design/components/Footer.js.template',
  'components/Hero.js': 'design/components/Hero.js.template',
  
  // Layout components
  'components/layouts/StandardLayout.jsx': 'design/layouts/StandardLayout.jsx.template',
  'components/layouts/SidebarLayout.jsx': 'design/layouts/SidebarLayout.jsx.template',
  'components/layouts/CenteredLayout.jsx': 'design/layouts/CenteredLayout.jsx.template',
  
  // Configuration files
  'tailwind.config.js': 'design/config/tailwind.config.js.template',
  'app/globals.css': 'design/config/globals.css.template',
  'app/layout.js': 'design/config/layout.js.template'
}

// Modern Theme Template
export const MODERN_THEME_TEMPLATE = {
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
      primary: 'bg-primary text-white hover:bg-primary-600 shadow-md hover:shadow-lg transition-all',
      secondary: 'bg-secondary text-white hover:bg-secondary-600 shadow-md hover:shadow-lg transition-all',
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white'
    },
    card: {
      default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg',
      elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow rounded-lg',
      flat: 'bg-white border border-gray-200 hover:border-gray-300 transition-colors rounded-lg'
    }
  },
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    hover: 'hover:scale-105 transition-transform'
  }
}

// Elegant Theme Template
export const ELEGANT_THEME_TEMPLATE = {
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
      primary: 'bg-primary text-white hover:bg-gray-800 shadow-sm hover:shadow-md transition-all font-serif',
      secondary: 'bg-secondary text-white hover:bg-amber-700 shadow-sm hover:shadow-md transition-all font-serif',
      outline: 'border border-primary bg-transparent text-primary hover:bg-primary hover:text-white font-serif'
    },
    card: {
      default: 'bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow rounded elegant-border',
      elevated: 'bg-white shadow-md hover:shadow-lg transition-shadow rounded',
      flat: 'bg-white border border-amber-200 hover:border-amber-300 transition-colors rounded'
    }
  },
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    hover: 'hover:scale-102 transition-transform'
  }
}

// Creative Theme Template
export const CREATIVE_THEME_TEMPLATE = {
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
      primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all rounded-xl',
      secondary: 'bg-gradient-to-r from-secondary to-accent text-white hover:from-purple-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all rounded-xl',
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white rounded-xl'
    },
    card: {
      default: 'bg-white border border-gray-200 shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all rounded-xl',
      elevated: 'bg-white shadow-xl hover:shadow-2xl transition-shadow rounded-xl creative-gradient',
      flat: 'bg-white border-2 border-primary/20 hover:border-primary/40 transition-colors rounded-xl'
    }
  },
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    hover: 'hover:scale-110 transition-transform hover:rotate-1'
  }
}

// Tech Theme Template
export const TECH_THEME_TEMPLATE = {
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
      primary: 'bg-primary text-black hover:bg-cyan-400 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all border border-primary/20 neon-glow',
      secondary: 'bg-secondary text-white hover:bg-purple-400 shadow-lg hover:shadow-xl hover:shadow-secondary/50 transition-all border border-secondary/20',
      outline: 'border border-primary bg-transparent text-primary hover:bg-primary hover:text-black transition-all neon-glow'
    },
    card: {
      default: 'bg-surface border border-primary/20 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all rounded-lg backdrop-blur-sm',
      elevated: 'bg-surface shadow-xl hover:shadow-2xl hover:shadow-primary/40 transition-shadow rounded-lg border border-primary/30 neon-glow',
      flat: 'bg-surface border border-primary/10 hover:border-primary/30 transition-colors rounded-lg'
    }
  },
  animations: {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    hover: 'hover:scale-105 transition-transform animate-pulse-neon'
  }
}

// Template processing functions
export function getThemeTemplate(themeId) {
  const templates = {
    modern: MODERN_THEME_TEMPLATE,
    elegant: ELEGANT_THEME_TEMPLATE,
    creative: CREATIVE_THEME_TEMPLATE,
    tech: TECH_THEME_TEMPLATE,
    minimal: {
      ...MODERN_THEME_TEMPLATE,
      colors: {
        primary: '#000000',
        secondary: '#4B5563',
        accent: '#6B7280',
        neutral: '#9CA3AF',
        background: '#FFFFFF',
        surface: '#FAFAFA'
      },
      spacing: {
        scale: 'spacious',
        borderRadius: '0rem',
        shadowStyle: 'none'
      }
    },
    corporate: {
      ...MODERN_THEME_TEMPLATE,
      colors: {
        primary: '#1E40AF',
        secondary: '#059669',
        accent: '#DC2626',
        neutral: '#6B7280',
        background: '#F8FAFC',
        surface: '#FFFFFF'
      }
    }
  }
  
  return templates[themeId] || templates.modern
}

// Hero template variations
export const HERO_TEMPLATES = {
  centered: {
    layout: 'text-center',
    container: 'max-w-4xl mx-auto',
    background: 'bg-gradient-to-br from-primary/10 via-white to-secondary/10',
    content: 'centered-content'
  },
  
  split: {
    layout: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
    container: 'max-w-7xl mx-auto',
    background: 'bg-white',
    content: 'side-by-side'
  },
  
  fullscreen: {
    layout: 'min-h-screen flex items-center justify-center text-center',
    container: 'max-w-5xl mx-auto',
    background: 'bg-cover bg-center relative',
    content: 'overlay'
  },
  
  minimal: {
    layout: 'text-left',
    container: 'max-w-3xl mx-auto',
    background: 'bg-white',
    content: 'minimal'
  },
  
  video: {
    layout: 'min-h-screen flex items-center justify-center text-center relative',
    container: 'max-w-4xl mx-auto',
    background: 'bg-black relative overflow-hidden',
    content: 'video-overlay'
  },
  
  animated: {
    layout: 'text-center',
    container: 'max-w-4xl mx-auto',
    background: 'bg-gradient-to-br from-primary/20 to-secondary/20',
    content: 'animated-content'
  }
}

// Layout template variations
export const LAYOUT_TEMPLATES = {
  standard: {
    structure: 'header-main-footer',
    navigation: 'horizontal-top',
    sidebar: false,
    containerWidth: 'max-w-7xl',
    spacing: 'space-y-0'
  },
  
  sidebar: {
    structure: 'sidebar-main',
    navigation: 'vertical-left',
    sidebar: true,
    containerWidth: 'max-w-full',
    spacing: 'flex min-h-screen'
  },
  
  centered: {
    structure: 'centered-content',
    navigation: 'horizontal-center',
    sidebar: false,
    containerWidth: 'max-w-4xl',
    spacing: 'space-y-8'
  },
  
  magazine: {
    structure: 'multi-column',
    navigation: 'horizontal-top',
    sidebar: false,
    containerWidth: 'max-w-6xl',
    spacing: 'space-y-6'
  },
  
  landing: {
    structure: 'single-page-sections',
    navigation: 'sticky-top',
    sidebar: false,
    containerWidth: 'max-w-5xl',
    spacing: 'space-y-0'
  }
}

// Component style generators
export function generateButtonStyles(theme) {
  const themeTemplate = getThemeTemplate(theme.id)
  
  return {
    primary: themeTemplate.components.button.primary,
    secondary: themeTemplate.components.button.secondary,
    outline: themeTemplate.components.button.outline,
    ghost: `text-primary hover:bg-primary/10 focus:ring-primary-500 ${themeTemplate.animations.hover}`
  }
}

export function generateCardStyles(theme) {
  const themeTemplate = getThemeTemplate(theme.id)
  
  return {
    default: themeTemplate.components.card.default,
    elevated: themeTemplate.components.card.elevated,
    flat: themeTemplate.components.card.flat,
    outlined: `border-2 border-primary bg-transparent ${themeTemplate.animations.hover}`
  }
}

// CSS generation helpers
export function generateThemeCSS(theme) {
  const themeTemplate = getThemeTemplate(theme.id)
  
  return `
    :root {
      --color-primary: ${themeTemplate.colors.primary};
      --color-secondary: ${themeTemplate.colors.secondary};
      --color-accent: ${themeTemplate.colors.accent};
      --color-neutral: ${themeTemplate.colors.neutral};
      --color-background: ${themeTemplate.colors.background};
      --color-surface: ${themeTemplate.colors.surface};
      
      --font-heading: ${themeTemplate.typography.headingFont};
      --font-body: ${themeTemplate.typography.bodyFont};
      --weight-heading: ${themeTemplate.typography.headingWeight};
      --weight-body: ${themeTemplate.typography.bodyWeight};
      
      --border-radius: ${themeTemplate.spacing.borderRadius};
      --spacing-scale: ${themeTemplate.spacing.scale};
      --shadow-style: ${themeTemplate.spacing.shadowStyle};
    }

    .theme-${theme.id} {
      background-color: var(--color-background);
      color: var(--color-neutral);
    }

    /* Theme-specific utility classes */
    .btn-primary {
      ${themeTemplate.components.button.primary.split(' ').map(cls => `.${cls}`).join(' ')}
    }

    .btn-secondary {
      ${themeTemplate.components.button.secondary.split(' ').map(cls => `.${cls}`).join(' ')}
    }

    .card-default {
      ${themeTemplate.components.card.default.split(' ').map(cls => `.${cls}`).join(' ')}
    }

    /* Theme-specific animations */
    .theme-${theme.id} .animate-theme-hover {
      ${themeTemplate.animations.hover}
    }

    /* Special theme effects */
    ${theme.id === 'tech' ? `
    .neon-glow {
      box-shadow: 0 0 5px ${themeTemplate.colors.primary}, 0 0 10px ${themeTemplate.colors.primary};
    }
    
    .animate-pulse-neon {
      animation: pulseNeon 2s infinite;
    }
    
    @keyframes pulseNeon {
      0%, 100% { box-shadow: 0 0 5px ${themeTemplate.colors.primary}; }
      50% { box-shadow: 0 0 20px ${themeTemplate.colors.primary}, 0 0 30px ${themeTemplate.colors.primary}; }
    }
    ` : ''}
    
    ${theme.id === 'creative' ? `
    .creative-gradient {
      background: linear-gradient(135deg, ${themeTemplate.colors.primary}, ${themeTemplate.colors.secondary}, ${themeTemplate.colors.accent});
    }
    
    .animate-wiggle {
      animation: wiggle 1s ease-in-out infinite;
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
  `
}

// Template processing utilities
export function processTemplate(template, config) {
  let processed = template
  
  // Replace template variables
  Object.entries(config).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(placeholder, value)
  })
  
  // Process theme-specific replacements
  if (config.theme) {
    const themeTemplate = getThemeTemplate(config.theme.id)
    processed = processed.replace(/{{themeColors}}/g, JSON.stringify(themeTemplate.colors, null, 2))
    processed = processed.replace(/{{themeTypography}}/g, JSON.stringify(themeTemplate.typography, null, 2))
    processed = processed.replace(/{{themeSpacing}}/g, JSON.stringify(themeTemplate.spacing, null, 2))
  }
  
  return processed
}

// Export all templates and utilities
export default {
  DESIGN_TEMPLATE_PATHS,
  HERO_TEMPLATES,
  LAYOUT_TEMPLATES,
  getThemeTemplate,
  generateButtonStyles,
  generateCardStyles,
  generateThemeCSS,
  processTemplate,
  MODERN_THEME_TEMPLATE,
  ELEGANT_THEME_TEMPLATE,
  CREATIVE_THEME_TEMPLATE,
  TECH_THEME_TEMPLATE
}