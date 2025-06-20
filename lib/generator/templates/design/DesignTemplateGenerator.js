// lib/generator/design/DesignTemplateGenerator.js

import TemplateGenerator from './TemplateGenerator.js'
import { 
  getThemeTemplate, 
  getLayoutTemplate, 
  getHeroTemplate,
  generateThemeCSS,
  generateTailwindConfig,
  processTemplate
} from '../templates/design/DesignTemplateConfig.js'

class DesignTemplateGenerator extends TemplateGenerator {
  constructor() {
    super()
    this.designConfig = null
  }

  async generateProject(config) {
    console.log(`🎨 Generating design-aware project: ${config.businessName}`)
    console.log(`🎨 Design config:`, {
      theme: config.design?.theme || 'modern',
      layout: config.design?.layout || 'standard',
      heroStyle: config.design?.heroStyle || 'centered',
      graphics: config.design?.graphics || 'illustrations'
    })

    // Store design configuration
    this.designConfig = config.design || {
      theme: 'modern',
      layout: 'standard',
      heroStyle: 'centered',
      graphics: 'illustrations'
    }

    const project = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: 'design-aware',
      config,
      designConfig: this.designConfig,
      files: {},
      generationMetadata: {
        projectType: 'design-aware',
        theme: this.designConfig.theme,
        layout: this.designConfig.layout,
        heroStyle: this.designConfig.heroStyle,
        graphics: this.designConfig.graphics,
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now()
      }
    }

    try {
      console.log('🎨 Generating design-aware files...')
      
      // Generate base files with design configuration
      const baseFiles = await this.generateDesignAwareBaseFiles(config)
      
      // Generate design-specific component files
      const designFiles = await this.generateDesignFiles(config)
      
      // Generate pages with design configuration
      const pageFiles = await this.pagesGenerator.generatePages(config.projectId, config)
      
      // Generate design-aware components
      const componentFiles = this.generateDesignAwareComponents(config)
      
      // Combine all files
      project.files = {
        ...baseFiles,
        ...designFiles,
        ...pageFiles,
        ...componentFiles
      }

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`
      project.generationMetadata.fileCount = Object.keys(project.files).length
      delete project.generationMetadata.processingStartTime

      console.log(`✅ Design-aware project generated with ${Object.keys(project.files).length} files`)
      console.log(`🎨 Theme: ${this.designConfig.theme}, Layout: ${this.designConfig.layout}`)
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`)
      
      return project

    } catch (error) {
      console.error('❌ Error generating design-aware project:', error)
      throw new Error(`Design-aware project generation failed: ${error.message}`)
    }
  }

  async generateDesignAwareBaseFiles(config) {
    const baseFiles = await super.generateBaseFiles(config)
    
    // Override base files with design-aware versions
    return {
      ...baseFiles,
      'app/globals.css': this.generateDesignAwareGlobalCSS(config),
      'tailwind.config.js': this.generateDesignAwareTailwindConfig(config),
      'app/layout.js': this.generateDesignAwareRootLayout(config)
    }
  }

  generateDesignFiles(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return {
      'lib/design/theme.js': this.generateThemeFile(config),
      'lib/design/components.js': this.generateComponentsFile(config),
      'components/design/ThemeProvider.jsx': this.generateThemeProvider(config),
      'styles/design-system.css': this.generateDesignSystemCSS(config)
    }
  }

  generateDesignAwareComponents(config) {
    return {
      'components/ui/Button.jsx': this.generateDesignAwareButton(config),
      'components/ui/Card.jsx': this.generateDesignAwareCard(config),
      'components/Header.js': this.generateDesignAwareHeader(config),
      'components/Footer.js': this.generateDesignAwareFooter(config),
      'components/Hero.js': this.generateDesignAwareHero(config)
    }
  }

  generateDesignAwareGlobalCSS(config) {
    const themeCSS = generateThemeCSS(this.designConfig)
    
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Design System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600&display=swap');

/* Theme-specific CSS */
${themeCSS}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  * {
    border-color: theme('borderColor.DEFAULT');
  }
}

@layer components {
  .container {
    @apply mx-auto px-4 sm:px-6 lg:px-8;
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--color-neutral);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}`
  }

  generateDesignAwareTailwindConfig(config) {
    const tailwindConfig = generateTailwindConfig(this.designConfig)
    
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: ${JSON.stringify(tailwindConfig.theme.extend, null, 6)}
  },
  plugins: [],
}`
  }

  generateDesignAwareRootLayout(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return `import { ${themeConfig.typography.headingFont.replace(' ', '')} } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/design/ThemeProvider'

const font = ${themeConfig.typography.headingFont.replace(' ', '')}({ 
  subsets: ['latin'],
  variable: '--font-primary'
})

export const metadata = {
  title: '${config.businessName || 'Your Business'}',
  description: '${config.businessDescription || `Professional ${config.industry || 'business'} services`}',
}

function RootLayout({ children }) {
  return (
    <html lang="en" className={\`\${font.variable} theme-${themeConfig.id}\`}>
      <body className="font-body">
        <ThemeProvider theme="${themeConfig.id}">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout`
  }

  generateThemeFile(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return `// Theme Configuration - ${themeConfig.name}
export const theme = ${JSON.stringify(themeConfig, null, 2)}

export const getThemeValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme)
}

export default theme`
  }

  generateComponentsFile(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return `// Component Style Configurations
export const buttonStyles = {
  primary: '${themeConfig.components.button.primary}',
  secondary: '${themeConfig.components.button.secondary}',
  outline: '${themeConfig.components.button.outline}'
}

export const cardStyles = {
  default: '${themeConfig.components.card.default}',
  elevated: '${themeConfig.components.card.elevated}'
}

export const animationStyles = {
  fadeIn: '${themeConfig.animations.fadeIn}',
  hover: '${themeConfig.animations.hover}'
}

export default {
  buttonStyles,
  cardStyles,
  animationStyles
}`
  }

  generateThemeProvider(config) {
    return `'use client'

import { createContext, useContext } from 'react'
import theme from '@/lib/design/theme'

const ThemeContext = createContext(theme)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function ThemeProvider({ children, theme: themeOverride }) {
  const themeValue = themeOverride ? { ...theme, ...themeOverride } : theme
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider`
  }

  generateDesignSystemCSS(config) {
    return generateThemeCSS(this.designConfig)
  }

  generateDesignAwareButton(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return `'use client'

import React from 'react'
import { buttonStyles } from '@/lib/design/components'

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
    primary: buttonStyles.primary,
    secondary: buttonStyles.secondary,
    outline: buttonStyles.outline,
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary'
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

  generateDesignAwareCard(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    
    return `import React from 'react'
import { cardStyles } from '@/lib/design/components'

function Card({ 
  children, 
  variant = 'default',
  className = '', 
  hover = true,
  ...props 
}) {
  const variants = {
    default: cardStyles.default,
    elevated: cardStyles.elevated,
    flat: 'bg-white border border-gray-200'
  }

  return (
    <div
      className={\`\${variants[variant]} \${hover ? 'cursor-pointer' : ''} \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card`
  }

  generateDesignAwareHeader(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    const layoutConfig = getLayoutTemplate(this.designConfig.layout)
    
    return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sparkles } from 'lucide-react'
import Button from './ui/Button'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' }
  ]

  const headerBg = '${themeConfig.id === 'tech' ? 'bg-slate-900/95 backdrop-blur-sm border-cyan-500/20' : 
                     themeConfig.id === 'creative' ? 'bg-white/95 backdrop-blur-sm border-pink-200' : 
                     themeConfig.id === 'elegant' ? 'bg-amber-50/95 backdrop-blur-sm border-amber-200' :
                     'bg-white/95 backdrop-blur-sm'}'

  return (
    <header className={\`sticky top-0 z-50 border-b \${headerBg}\`}>
      <div className="${layoutConfig.containerWidth} mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-primary">${config.businessName || 'Your Business'}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-neutral hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-neutral hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Login
              </Button>
              <Button className="w-full" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header`
  }

  generateDesignAwareFooter(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    const currentYear = new Date().getFullYear()
    
    return `import Link from 'next/link'
import { Sparkles } from 'lucide-react'

function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' }
  ]

  const footerBg = '${themeConfig.id === 'tech' ? 'bg-slate-900' : 
                     themeConfig.id === 'creative' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 
                     themeConfig.id === 'elegant' ? 'bg-gray-900' :
                     'bg-gray-900'}'

  return (
    <footer className={\`\${footerBg} text-white\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">${config.businessName || 'Your Business'}</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              ${config.businessDescription || `Professional ${config.industry || 'business'} services with modern design and functionality.`}
            </p>
            <div className="text-xs text-gray-400">
              Powered by ${themeConfig.name} Design System
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>info@${(config.businessName || 'business').toLowerCase().replace(/\s+/g, '')}.com</p>
              <p>(555) 123-4567</p>
              <p>123 Business St, City, State 12345</p>
            </div>
          </div>

          {/* Design Credits */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Design</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Theme: ${themeConfig.name}</p>
              <p>Layout: ${this.designConfig.layout}</p>
              <p>Generated with AI</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © ${currentYear} ${config.businessName || 'Your Business'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer`
  }

  generateDesignAwareHero(config) {
    const themeConfig = getThemeTemplate(this.designConfig.theme)
    const heroConfig = getHeroTemplate(this.designConfig.heroStyle)
    
    return `'use client'

import Button from './ui/Button'
import { ArrowRight, Star, Zap, Users } from 'lucide-react'

function Hero() {
  const heroBackground = '${themeConfig.id === 'tech' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 
                          themeConfig.id === 'creative' ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50' : 
                          themeConfig.id === 'elegant' ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50' :
                          'bg-gradient-to-br from-blue-50 via-white to-purple-50'}'

  const textColor = '${themeConfig.id === 'tech' ? 'text-white' : 'text-gray-900'}'

  return (
    <section className={\`relative py-20 px-4 overflow-hidden \${heroBackground}\`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="${heroConfig.container}">
        <div className="${heroConfig.layout}">
          {/* Main Content */}
          <div className="${this.designConfig.heroStyle === 'split' ? 'lg:col-span-1' : ''}">
            {/* Industry Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              ${config.industry || 'Professional'} Excellence
            </div>

            {/* Main Headline */}
            <h1 className={\`text-4xl md:text-6xl lg:text-7xl font-heading font-bold \${textColor} mb-6 leading-tight\`}>
              ${this.designConfig.heroStyle === 'fullscreen' ? `
              <span className="block">Welcome to</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                ${config.businessName || 'Your Business'}
              </span>
              ` : `
              Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                ${config.industry || 'Business'}
              </span>
              Experience
              `}
            </h1>

            {/* Subheadline */}
            <p className={\`text-xl md:text-2xl \${themeConfig.id === 'tech' ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-3xl leading-relaxed\`}>
              ${config.businessDescription || `Discover innovative solutions powered by ${themeConfig.name} design, crafted specifically for ${config.businessType || 'modern businesses'}.`}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-${this.designConfig.heroStyle === 'centered' ? 'center' : 'start'} items-${this.designConfig.heroStyle === 'centered' ? 'center' : 'start'} mb-12">
              <Button size="xl">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-${this.designConfig.heroStyle === 'centered' ? 'center' : 'start'} justify-${this.designConfig.heroStyle === 'centered' ? 'center' : 'start'} space-y-4 sm:space-y-0 sm:space-x-8 text-${themeConfig.id === 'tech' ? 'gray-300' : 'gray-600'}">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full border-2 border-white"
                    ></div>
                  ))}
                </div>
                <span className="ml-3 text-sm">500+ Happy Clients</span>
              </div>
              
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Content (for split layout) */}
          ${this.designConfig.heroStyle === 'split' ? `
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-24 h-24 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold ${textColor}">Professional ${config.industry || 'Business'} Solutions</p>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </section>
  )
}

export default Hero`
  }
}

export default DesignTemplateGenerator