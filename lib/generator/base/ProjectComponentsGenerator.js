// Project Components Generator
// File: lib/ProjectComponentsGenerator.js

class ProjectComponentsGenerator {
  constructor(vectorRAGService = null) {
    this.vectorRAGService = vectorRAGService;
  }

  async generateComponents(config) {
    console.log('🔧 Generating components for project...');
    
    const components = {};
    
    try {
      // Generate core UI components
      components['components/ui/Button.jsx'] = this.createButtonComponent();
      components['components/ui/Card.jsx'] = this.createCardComponent();
      components['components/Header.js'] = this.createHeaderComponent(config);
      components['components/Footer.js'] = this.createFooterComponent(config);
      components['components/Hero.js'] = this.createHeroComponent(config);
      
      console.log(`✅ Generated ${Object.keys(components).length} components`);
      return components;
    } catch (error) {
      console.error('❌ Error generating components:', error);
      throw error;
    }
  }

  createButtonComponent() {
    return `'use client'

import React from 'react'

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  onClick,
  vectorEnhanced = false,
  type = 'button',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: vectorEnhanced 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 shadow-sm hover:shadow-md'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${vectorEnhanced ? 'transform hover:scale-105' : ''} \${className}\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button`;
  }

  createCardComponent() {
    return `import React from 'react'

function Card({ children, className = '', vectorEnhanced = false, ...props }) {
  return (
    <div
      className={\`bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow duration-200 \${vectorEnhanced ? 'hover:shadow-lg' : ''} \${className}\`}
      {...props}
    >
      {vectorEnhanced && (
        <div className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full opacity-75">
          AI Enhanced
        </div>
      )}
      {children}
    </div>
  )
}

export default Card`;
  }

  createHeaderComponent(config) {
    const businessName = config.businessName || config.name || 'Your Business';
    
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">${businessName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
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
            <Button size="sm" vectorEnhanced={true}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Login
              </Button>
              <Button className="w-full" size="sm" vectorEnhanced={true}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header`;
  }

  createFooterComponent(config) {
    const businessName = config.businessName || config.name || 'Your Business';
    const currentYear = new Date().getFullYear();
    
    return `import Link from 'next/link'
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react'

function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' }
  ]

  const services = [
    { name: 'Consultation', href: '/services#consultation' },
    { name: 'Implementation', href: '/services#implementation' },
    { name: 'Support', href: '/services#support' },
    { name: 'Training', href: '/services#training' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">${businessName}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Delivering exceptional ${config.industry || 'business'} services with AI-enhanced solutions 
              tailored to your unique needs.
            </p>
            <div className="flex items-center text-xs text-blue-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Enhanced Experience
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
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>info@${businessName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>123 Business St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © ${currentYear} ${businessName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-xs">Powered by Vector AI</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer`;
  }

  createHeroComponent(config) {
    return `'use client'

import Button from './ui/Button'
import { ArrowRight, Star, Zap } from 'lucide-react'

function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* AI Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            AI-Enhanced ${config.industry || 'Business'} Solutions
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              ${config.industry || 'Business'}
            </span>
            Experience
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover intelligent solutions powered by cutting-edge AI technology, 
            designed specifically for ${config.businessType || 'modern businesses'}.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
              vectorEnhanced={true}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-600">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"
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
      </div>
    </section>
  )
}

export default Hero`;
  }
}

export default ProjectComponentsGenerator;