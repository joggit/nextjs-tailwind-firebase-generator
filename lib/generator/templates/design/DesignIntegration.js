// Design Integration Layer
// File: lib/generator/design/DesignIntegration.js

export class DesignIntegration {
  constructor() {
    this.designTemplates = new Map();
    this.initializeDesignTemplates();
  }

  initializeDesignTemplates() {
    // Modern Professional Design
    this.designTemplates.set('modern-professional', {
      name: 'Modern Professional',
      description: 'Clean, professional design with modern aesthetics',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6', 
        accent: '#10B981',
        neutral: '#6B7280'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      components: {
        header: this.getModernHeader(),
        footer: this.getModernFooter(),
        hero: this.getModernHero(),
        features: this.getModernFeatures(),
        contact: this.getModernContact()
      },
      styles: this.getModernStyles()
    });

    // Creative Agency Design
    this.designTemplates.set('creative-agency', {
      name: 'Creative Agency',
      description: 'Bold, creative design with vibrant colors',
      colors: {
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#8B5CF6',
        neutral: '#374151'
      },
      fonts: {
        heading: 'Poppins',
        body: 'Inter'
      },
      components: {
        header: this.getCreativeHeader(),
        footer: this.getCreativeFooter(),
        hero: this.getCreativeHero(),
        features: this.getCreativeFeatures(),
        contact: this.getCreativeContact()
      },
      styles: this.getCreativeStyles()
    });

    // Minimal Clean Design
    this.designTemplates.set('minimal-clean', {
      name: 'Minimal Clean',
      description: 'Minimalist design with focus on content',
      colors: {
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#3B82F6',
        neutral: '#F3F4F6'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      components: {
        header: this.getMinimalHeader(),
        footer: this.getMinimalFooter(),
        hero: this.getMinimalHero(),
        features: this.getMinimalFeatures(),
        contact: this.getMinimalContact()
      },
      styles: this.getMinimalStyles()
    });
  }

  // Integration with existing ProjectGenerator
  enhanceProjectWithDesign(projectConfig, designTemplate = 'modern-professional') {
    const design = this.designTemplates.get(designTemplate);
    if (!design) {
      console.warn(`Design template '${designTemplate}' not found, using default`);
      return projectConfig;
    }

    return {
      ...projectConfig,
      design: {
        template: designTemplate,
        ...design
      },
      // Enhanced styling configuration
      styling: {
        theme: design.colors.primary.includes('F') ? 'light' : 'auto',
        primaryColor: design.colors.primary,
        secondaryColor: design.colors.secondary,
        accentColor: design.colors.accent,
        neutralColor: design.colors.neutral,
        fontHeading: design.fonts.heading,
        fontBody: design.fonts.body
      }
    };
  }

  // Generate enhanced components for existing generator
  generateDesignEnhancedComponents(config) {
    const designTemplate = config.design?.template || 'modern-professional';
    const design = this.designTemplates.get(designTemplate);
    
    if (!design) return {};

    return {
      'components/Header.js': this.processComponentTemplate(design.components.header, config),
      'components/Footer.js': this.processComponentTemplate(design.components.footer, config),
      'components/Hero.js': this.processComponentTemplate(design.components.hero, config),
      'components/ui/Button.jsx': this.generateEnhancedButton(design),
      'components/ui/Card.jsx': this.generateEnhancedCard(design),
      'app/globals.css': this.generateEnhancedCSS(design, config)
    };
  }

  // Process template with config variables
  processComponentTemplate(template, config) {
    return template
      .replace(/\{\{businessName\}\}/g, config.businessName || 'Your Business')
      .replace(/\{\{industry\}\}/g, config.industry || 'Business')
      .replace(/\{\{businessDescription\}\}/g, config.businessDescription || 'Professional services')
      .replace(/\{\{primaryColor\}\}/g, config.design?.colors?.primary || '#3B82F6')
      .replace(/\{\{secondaryColor\}\}/g, config.design?.colors?.secondary || '#8B5CF6');
  }

  // Modern Professional Components
  getModernHeader() {
    return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sparkles } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{{businessName}}</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 relative group"
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Login
            </Link>
            <Link href="/contact" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100">
                <Link href="/contact" className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link href="/contact" className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}`;
  }

  getModernHero() {
    return `'use client'

import { ArrowRight, Star, CheckCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Trust indicator */}
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
          <Star className="w-4 h-4 mr-2" />
          Trusted by 1000+ {{industry}} professionals
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Transform Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {{industry}}
          </span>
          Experience
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {{businessDescription}}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-600">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"></div>
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
    </section>
  )
}`;
  }

  getModernFeatures() {
    return `import { CheckCircle, Zap, Shield, Users } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'We ensure the highest quality in every project we deliver.'
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Quick turnaround times without compromising on quality.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data and projects are safe with our secure infrastructure.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Work with experienced professionals who understand your needs.'
    }
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose {{businessName}}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what makes us the perfect choice for your {{industry}} needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}`;
  }

  getModernFooter() {
    return `import Link from 'next/link'
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{{businessName}}</span>
            </Link>
            <p className="text-gray-300 text-lg mb-6 max-w-md">
              {{businessDescription}}
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Built with modern technology</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['About', 'Services', 'Contact', 'Privacy'].map((link) => (
                <li key={link}>
                  <Link 
                    href={\`/\${link.toLowerCase()}\`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <span>hello@{{businessName}}.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                <span>Your Location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {{businessName}}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-xs">Powered by AI</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}`;
  }

  getModernContact() {
    return `'use client'

import { useState } from 'react'
import { Send, Phone, Mail, MapPin } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-xl text-gray-600">Ready to start your project? Contact us today!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <Phone className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">(555) 123-4567</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <Mail className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">hello@{{businessName}}.com</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <MapPin className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="text-gray-600">123 Business St<br />City, State 12345</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}`;
  }

  // Creative Agency Components (simplified for brevity)
  getCreativeHeader() {
    return this.getModernHeader().replace(/blue-600/g, 'orange-500').replace(/purple-600/g, 'red-500');
  }

  getCreativeFooter() {
    return this.getModernFooter().replace(/blue-500/g, 'orange-500').replace(/purple-500/g, 'red-500');
  }

  getCreativeHero() {
    return this.getModernHero().replace(/blue-/g, 'orange-').replace(/purple-/g, 'red-');
  }

  getCreativeFeatures() {
    return this.getModernFeatures().replace(/blue-/g, 'orange-').replace(/purple-/g, 'red-');
  }

  getCreativeContact() {
    return this.getModernContact().replace(/blue-/g, 'orange-').replace(/purple-/g, 'red-');
  }

  // Minimal Clean Components (simplified for brevity)
  getMinimalHeader() {
    return this.getModernHeader().replace(/gradient-to-r from-blue-600 to-purple-600/g, 'gray-900').replace(/shadow-lg/g, '');
  }

  getMinimalFooter() {
    return this.getModernFooter().replace(/gradient-to-br from-blue-500 to-purple-500/g, 'gray-800');
  }

  getMinimalHero() {
    return this.getModernHero().replace(/gradient-to-r from-blue-600 to-purple-600/g, 'gray-900');
  }

  getMinimalFeatures() {
    return this.getModernFeatures().replace(/blue-/g, 'gray-').replace(/purple-/g, 'gray-');
  }

  getMinimalContact() {
    return this.getModernContact().replace(/blue-/g, 'gray-').replace(/purple-/g, 'gray-');
  }

  // Enhanced UI Components
  generateEnhancedButton(design) {
    return `'use client'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  onClick,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-[${design.colors.primary}] to-[${design.colors.secondary}] text-white hover:scale-105 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-md hover:shadow-lg',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 shadow-sm hover:shadow-md'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}`;
  }

  generateEnhancedCard(design) {
    return `export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={\`bg-white rounded-xl border border-gray-200 shadow-sm \${
        hover ? 'hover:shadow-lg hover:scale-105 transition-all duration-300' : ''
      } \${className}\`}
      style={{ 
        borderColor: hover ? '${design.colors.primary}20' : undefined 
      }}
      {...props}
    >
      {children}
    </div>
  )
}`;
  }

  // Style generators
  getModernStyles() {
    return `
      .animate-blob {
        animation: blob 7s infinite;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }

      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
    `;
  }

  getCreativeStyles() {
    return this.getModernStyles() + `
      .creative-gradient {
        background: linear-gradient(45deg, #F59E0B, #EF4444, #8B5CF6);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
      }

      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
  }

  getMinimalStyles() {
    return `
      .minimal-shadow {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }
      
      .minimal-shadow:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    `;
  }

  generateEnhancedCSS(design, config) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply text-gray-900 bg-gray-50;
    font-family: '${design.fonts.body}', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: '${design.fonts.heading}', sans-serif;
  }
}

@layer components {
  ${design.styles}
  
  .design-primary {
    color: ${design.colors.primary};
  }
  
  .design-secondary {
    color: ${design.colors.secondary};
  }
  
  .design-accent {
    color: ${design.colors.accent};
  }
  
  .bg-design-primary {
    background-color: ${design.colors.primary};
  }
  
  .bg-design-secondary {
    background-color: ${design.colors.secondary};
  }
  
  .bg-design-accent {
    background-color: ${design.colors.accent};
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: ${design.colors.primary};
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: ${design.colors.secondary};
}`;
  }

  // Available design templates
  getAvailableDesigns() {
    return Array.from(this.designTemplates.keys()).map(key => {
      const design = this.designTemplates.get(key);
      return {
        id: key,
        name: design.name,
        description: design.description,
        colors: design.colors,
        preview: `bg-gradient-to-r from-[${design.colors.primary}] to-[${design.colors.secondary}]`
      };
    });
  }
}

export default DesignIntegration;