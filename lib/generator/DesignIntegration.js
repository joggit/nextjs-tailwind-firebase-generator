// Design Integration System
// File: lib/generator/DesignIntegration.js

import TemplateGenerator from './TemplateGenerator.js'
import { loadBaseTemplates, loadEcommerceTemplates } from './TemplatePaths.js'

// Simple design themes configuration
const DESIGN_THEMES = {
  modern: {
    id: 'modern',
    name: 'Modern',
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
    id: 'elegant', 
    name: 'Elegant',
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
    id: 'creative',
    name: 'Creative',
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
    id: 'tech',
    name: 'Tech',
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
    id: 'minimal',
    name: 'Minimal',
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
    id: 'corporate',
    name: 'Corporate', 
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
}

// Layout options
const LAYOUT_OPTIONS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    containerWidth: 'max-w-7xl',
    structure: 'header-main-footer'
  },
  
  centered: {
    id: 'centered', 
    name: 'Centered',
    containerWidth: 'max-w-4xl',
    structure: 'centered-content'
  },

  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    containerWidth: 'max-w-full',
    structure: 'sidebar-main'
  },

  magazine: {
    id: 'magazine',
    name: 'Magazine', 
    containerWidth: 'max-w-6xl',
    structure: 'multi-column'
  },

  landing: {
    id: 'landing',
    name: 'Landing',
    containerWidth: 'max-w-5xl', 
    structure: 'single-page-sections'
  }
}

// Hero style options
const HERO_STYLES = {
  centered: {
    id: 'centered',
    name: 'Centered',
    layout: 'text-center'
  },
  
  split: {
    id: 'split',
    name: 'Split',
    layout: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
  },

  fullscreen: {
    id: 'fullscreen', 
    name: 'Fullscreen',
    layout: 'min-h-screen flex items-center justify-center text-center'
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    layout: 'text-left'
  }
}

/**
 * Enhanced Template Generator with Design System Integration
 */
export class DesignIntegratedGenerator extends TemplateGenerator {
  constructor() {
    super()
    this.designThemes = DESIGN_THEMES
    this.layoutOptions = LAYOUT_OPTIONS
    this.heroStyles = HERO_STYLES
  }

  /**
   * Generate project with design system integration
   */
  async generateProject(config) {
    console.log(`🎨 Generating design-enhanced project: ${config.businessName}`)
    
    // Extract design configuration
    const designConfig = this.processDesignConfig(config)
    
    // Create enhanced template configuration
    const enhancedConfig = await this.enhanceConfigWithDesign(config, designConfig)
    
    // Generate project using parent class with enhancements
    const project = await super.generateProject(enhancedConfig)
    
    // Apply design system enhancements
    await this.applyDesignEnhancements(project, designConfig)
    
    console.log(`✅ Design-enhanced project generated: ${Object.keys(project.files).length} files`)
    
    return project
  }

  /**
   * Process and validate design configuration
   */
  processDesignConfig(config) {
    const design = config.design || {}
    
    return {
      theme: this.designThemes[design.theme] || this.designThemes.modern,
      layout: this.layoutOptions[design.layout] || this.layoutOptions.standard,
      heroStyle: this.heroStyles[design.heroStyle] || this.heroStyles.centered,
      customizations: design.customizations || {}
    }
  }

  /**
   * Enhance configuration with design system data
   */
  async enhanceConfigWithDesign(config, designConfig) {
    return {
      ...config,
      
      // Add design system variables
      designSystem: {
        theme: designConfig.theme,
        layout: designConfig.layout, 
        heroStyle: designConfig.heroStyle
      },
      
      // Enhanced styling properties
      primaryColor: designConfig.theme.colors.primary,
      secondaryColor: designConfig.theme.colors.secondary,
      accentColor: designConfig.theme.colors.accent,
      neutralColor: designConfig.theme.colors.neutral,
      
      // Typography
      headingFont: designConfig.theme.fonts.heading,
      bodyFont: designConfig.theme.fonts.body,
      
      // Layout properties
      containerWidth: designConfig.layout.containerWidth,
      layoutStructure: designConfig.layout.structure,
      
      // Hero properties
      heroLayout: designConfig.heroStyle.layout,
      
      // Design metadata
      themeId: designConfig.theme.id,
      layoutId: designConfig.layout.id,
      heroStyleId: designConfig.heroStyle.id
    }
  }

  /**
   * Apply design system enhancements to generated files
   */
  async applyDesignEnhancements(project, designConfig) {
    // Enhance CSS with design system
    if (project.files['app/globals.css']) {
      project.files['app/globals.css'] = this.enhanceGlobalCSS(
        project.files['app/globals.css'], 
        designConfig
      )
    }
    
    // Enhance Tailwind config
    if (project.files['tailwind.config.js']) {
      project.files['tailwind.config.js'] = this.enhanceTailwindConfig(
        project.files['tailwind.config.js'],
        designConfig
      )
    }
    
    // Add design system components
    project.files['components/ui/Button.jsx'] = this.generateDesignButton(designConfig)
    project.files['components/ui/Card.jsx'] = this.generateDesignCard(designConfig)
    
    // Add design system utilities
    project.files['lib/design/theme.js'] = this.generateThemeConfig(designConfig)
    
    return project
  }

  /**
   * Enhance global CSS with design system variables
   */
  enhanceGlobalCSS(existingCSS, designConfig) {
    const theme = designConfig.theme
    
    const designSystemCSS = `
/* Design System Variables */
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-neutral: ${theme.colors.neutral};
  
  --font-heading: '${theme.fonts.heading}', sans-serif;
  --font-body: '${theme.fonts.body}', sans-serif;
}

/* Design System Utilities */
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-accent { color: var(--color-accent); }
.text-neutral { color: var(--color-neutral); }

.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }

.font-heading { font-family: var(--font-heading); }
.font-body { font-family: var(--font-body); }

/* Theme-specific enhancements */
${this.generateThemeSpecificCSS(theme)}
`

    return existingCSS + '\n' + designSystemCSS
  }

  /**
   * Generate theme-specific CSS
   */
  generateThemeSpecificCSS(theme) {
    switch (theme.id) {
      case 'tech':
        return `
.tech-glow {
  box-shadow: 0 0 10px ${theme.colors.primary}40;
}
        `
      case 'creative':
        return `
.creative-gradient {
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
}
        `
      case 'elegant':
        return `
.elegant-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
        `
      default:
        return ''
    }
  }

  /**
   * Enhance Tailwind config with design system
   */
  enhanceTailwindConfig(existingConfig, designConfig) {
    const theme = designConfig.theme
    
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${theme.colors.primary}',
        secondary: '${theme.colors.secondary}',
        accent: '${theme.colors.accent}',
        neutral: '${theme.colors.neutral}',
      },
      fontFamily: {
        heading: ['${theme.fonts.heading}', 'sans-serif'],
        body: ['${theme.fonts.body}', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`
  }

  /**
   * Generate design-aware Button component
   */
  generateDesignButton(designConfig) {
    const theme = designConfig.theme
    
    return `'use client'

import React from 'react'

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary shadow-md hover:shadow-lg',
    secondary: 'bg-secondary text-white hover:opacity-90 focus:ring-secondary shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary hover:bg-opacity-10'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  }

  return (
    <button
      type={type}
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button`
  }

  /**
   * Generate design-aware Card component
   */
  generateDesignCard(designConfig) {
    const theme = designConfig.theme
    
    return `import React from 'react'

function Card({ 
  children, 
  variant = 'default',
  className = '', 
  hover = true,
  ...props 
}) {
  const baseClasses = 'bg-white border border-gray-200 transition-all duration-200'
  
  const variants = {
    default: 'shadow-sm hover:shadow-md rounded-lg',
    elevated: 'shadow-lg hover:shadow-xl rounded-lg',
    flat: 'shadow-none hover:shadow-sm rounded-lg border-2',
    ${theme.id === 'tech' ? 'tech: "shadow-md hover:shadow-lg tech-glow rounded-lg",' : ''}
    ${theme.id === 'elegant' ? 'elegant: "elegant-shadow hover:shadow-xl rounded-lg",' : ''}
  }

  return (
    <div
      className={\`\${baseClasses} \${variants[variant]} \${hover ? 'cursor-pointer' : ''} \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card`
  }

  /**
   * Generate theme configuration file
   */
  generateThemeConfig(designConfig) {
    return `// Design System Theme Configuration
export const theme = ${JSON.stringify(designConfig.theme, null, 2)}

export const layout = ${JSON.stringify(designConfig.layout, null, 2)}

export const heroStyle = ${JSON.stringify(designConfig.heroStyle, null, 2)}

export function getThemeValue(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], theme)
}

export function getColorValue(colorName) {
  return theme.colors[colorName] || theme.colors.primary
}

export function getFontValue(fontType) {
  return theme.fonts[fontType] || theme.fonts.body
}

export default { theme, layout, heroStyle }`
  }

  /**
   * Get available design options
   */
  getAvailableDesigns() {
    return {
      themes: Object.values(this.designThemes).map(theme => ({
        id: theme.id,
        name: theme.name,
        colors: theme.colors,
        fonts: theme.fonts
      })),
      
      layouts: Object.values(this.layoutOptions).map(layout => ({
        id: layout.id,
        name: layout.name,
        containerWidth: layout.containerWidth,
        structure: layout.structure
      })),
      
      heroStyles: Object.values(this.heroStyles).map(hero => ({
        id: hero.id,
        name: hero.name,
        layout: hero.layout
      }))
    }
  }
}

// Export for use in API routes
export default DesignIntegratedGenerator