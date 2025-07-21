// Complete component generators for the design system
// This extends the backend API with all missing component generators

// Hero Component Generator
async function generateHero(config, designConfig) {
    const heroConfig = config.hero
    const backgroundStyle = getHeroBackgroundStyle(heroConfig, designConfig)

    return `'use client'

import { ArrowRight, Play, Star, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

export default function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden ${backgroundStyle.containerClasses}">
      ${backgroundStyle.backgroundElement}
      
      <Container className="relative z-10">
        <div className="${getHeroLayoutClasses(designConfig.layout.type)}">
          <div className="animate-${designConfig.effects.animations.entry.replace('-', '-')}">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Trusted by ${config.targetAudience}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text mb-6 leading-tight">
              ${processHeadlineWithAccent(heroConfig.headline)}
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-textSecondary mb-8 max-w-3xl ${designConfig.layout.type === 'centered' ? 'mx-auto text-center' : ''
        }">
              ${heroConfig.subheadline}
            </p>

            {/* Feature List */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {getHeroFeatures(config).map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-textSecondary">
                  <CheckCircle className="w-5 h-5 text-accent-500" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 ${designConfig.layout.type === 'centered' ? 'justify-center' : ''
        } mb-16">
              <Button size="lg" className="shadow-lg hover:shadow-xl">
                ${heroConfig.primaryCta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 w-5 h-5" />
                ${heroConfig.secondaryCta}
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {getHeroStats(config).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-heading font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-textSecondary font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          ${designConfig.layout.type === 'split' ? generateHeroImage(config, designConfig) : ''}
        </div>
      </Container>
    </section>
  )
}

// Helper functions for hero component
function getHeroLayoutClasses(layoutType) {
  switch (layoutType) {
    case 'split':
      return 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
    case 'centered':
      return 'text-center'
    case 'fullwidth':
      return 'max-w-none'
    default:
      return 'max-w-4xl'
  }
}

function processHeadlineWithAccent(headline) {
  const words = headline.split(' ')
  const lastWord = words.pop()
  const restOfHeadline = words.join(' ')
  
  return \`\${restOfHeadline} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">\${lastWord}</span>\`
}

function getHeroFeatures(config) {
  return [
    \`Professional \${config.industry} Services\`,
    'Expert Team',
    '24/7 Support',
    'Proven Results'
  ]
}

function getHeroStats(config) {
  return [
    { value: '500+', label: 'Happy Clients' },
    { value: '99%', label: 'Success Rate' },
    { value: '5★', label: 'Average Rating' },
    { value: '24/7', label: 'Support' }
  ]
}

function generateHeroImage(config, designConfig) {
  return \`
  <div className="lg:col-span-1 flex items-center justify-center">
    <div className="relative">
      <div className="w-full max-w-md mx-auto">
        <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">\${config.businessName.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-primary-700">
              \${config.businessName}
            </h3>
            <p className="text-primary-600 mt-1">Professional Excellence</p>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
    </div>
  </div>
  \`
}

function getHeroBackgroundStyle(heroConfig, designConfig) {
  const bgType = heroConfig.backgroundType || 'gradient'
  
  switch (bgType) {
    case 'gradient':
      return {
        containerClasses: 'bg-gradient-to-br from-primary-50 via-background to-secondary-50',
        backgroundElement: ''
      }
    case 'image':
      return {
        containerClasses: 'bg-cover bg-center bg-no-repeat',
        backgroundElement: \`
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-secondary-900/20"></div>
        \`
      }
    case 'video':
      return {
        containerClasses: 'relative bg-gray-900',
        backgroundElement: \`
          <div className="absolute inset-0">
            <video autoPlay muted loop className="w-full h-full object-cover">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        \`
      }
    default:
      return {
        containerClasses: 'bg-background',
        backgroundElement: ''
      }
  }
}`
}

// Footer Component Generator
async function generateFooter(config, designConfig) {
    const footerConfig = config.footer
    const currentYear = new Date().getFullYear()

    return `import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import Container from '@/components/ui/Container'

export default function Footer() {
  const socialLinks = ${JSON.stringify(footerConfig.socialLinks || {}, null, 4)}
  const quickLinks = ${JSON.stringify(footerConfig.quickLinks || [], null, 4)}

  return (
    <footer className="bg-surface border-t border-border">
      <Container>
        ${footerConfig.style === 'multiColumn' ? generateMultiColumnFooter(config, designConfig) : generateSimpleFooter(config, designConfig)}
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-textSecondary text-sm">
              © ${currentYear} ${footerConfig.companyName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.link}
                  className="text-textSecondary hover:text-primary-600 text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function generateMultiColumnFooter(config, footerConfig) {
  return \`
    <div className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Company Info */}
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-heading font-bold text-primary-600">
              \${footerConfig.companyName}
            </span>
          </Link>
          <p className="text-textSecondary mb-6 max-w-md leading-relaxed">
            \${footerConfig.companyDescription}
          </p>
          
          {/* Contact Info */}
          <div className="space-y-3">
            {\${footerConfig.email ? \`
            <div className="flex items-center text-textSecondary">
              <Mail className="w-5 h-5 mr-3 text-primary-600" />
              <span>\${footerConfig.email}</span>
            </div>
            \` : ''}}
            {\${footerConfig.phone ? \`
            <div className="flex items-center text-textSecondary">
              <Phone className="w-5 h-5 mr-3 text-primary-600" />
              <span>\${footerConfig.phone}</span>
            </div>
            \` : ''}}
            {\${footerConfig.address ? \`
            <div className="flex items-center text-textSecondary">
              <MapPin className="w-5 h-5 mr-3 text-primary-600" />
              <span>\${footerConfig.address}</span>
            </div>
            \` : ''}}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-text mb-6">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-textSecondary hover:text-primary-600 transition-colors">About Us</Link></li>
            <li><Link href="/services" className="text-textSecondary hover:text-primary-600 transition-colors">Services</Link></li>
            <li><Link href="/contact" className="text-textSecondary hover:text-primary-600 transition-colors">Contact</Link></li>
            <li><Link href="/blog" className="text-textSecondary hover:text-primary-600 transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div>
          <h3 className="text-lg font-heading font-semibold text-text mb-6">Stay Connected</h3>
          
          {\${footerConfig.showNewsletter ? \`
          <div className="mb-6">
            <p className="text-textSecondary text-sm mb-4">\${footerConfig.newsletterTitle || 'Subscribe to our newsletter'}</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 border border-border rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="bg-primary-500 text-surface px-4 py-2 rounded-r-lg hover:bg-primary-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          \` : ''}}
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null
              const icons = {
                facebook: Facebook,
                twitter: Twitter,
                linkedin: Linkedin,
                instagram: Instagram
              }
              const Icon = icons[platform]
              if (!Icon) return null
              
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  \`
}

function generateSimpleFooter(config, footerConfig) {
  return \`
    <div className="py-12 text-center">
      <Link href="/" className="inline-block mb-6">
        <span className="text-2xl font-heading font-bold text-primary-600">
          \${footerConfig.companyName}
        </span>
      </Link>
      <p className="text-textSecondary mb-8 max-w-2xl mx-auto">
        \${footerConfig.companyDescription}
      </p>
      
      {/* Social Links */}
      <div className="flex justify-center space-x-6 mb-8">
        {Object.entries(socialLinks).map(([platform, url]) => {
          if (!url) return null
          const icons = {
            facebook: Facebook,
            twitter: Twitter, 
            linkedin: Linkedin,
            instagram: Instagram
          }
          const Icon = icons[platform]
          if (!Icon) return null
          
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
            >
              <Icon className="w-6 h-6" />
            </a>
          )
        })}
      </div>
    </div>
  \`
}`
}

// Feature Section Generator
async function generateFeatureSection(config, designConfig) {
    return `import { CheckCircle, Zap, Shield, Users, Award, TrendingUp } from 'lucide-react'
import Container from '@/components/ui/Container'

export default function FeatureSection() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'We ensure the highest quality in every ${config.industry} project we deliver.'
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Quick turnaround times without compromising on quality or attention to detail.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data and projects are safe with our secure infrastructure and processes.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Work with experienced ${config.industry} professionals who understand your needs.'
    },
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Awarded for excellence in ${config.industry} services and customer satisfaction.'
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Track record of delivering measurable results and exceeding client expectations.'
    }
  ]

  return (
    <section className="py-20 bg-surface">
      <Container>
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-heading font-bold text-text mb-4">
            Why Choose ${config.businessName}
          </h2>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto">
            Discover what makes us the perfect choice for your ${config.industry} needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="card p-8 text-center group hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: \`\${index * 100}ms\` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text mb-4">
                  {feature.title}
                </h3>
                <p className="text-textSecondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}`
}

// CTA Section Generator
async function generateCTASection(config, designConfig) {
    return `import { ArrowRight, Phone, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Transform Your ${config.industry}?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Get started with ${config.businessName} today and experience the difference 
            that professional ${config.industry} services can make.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="xl" 
              className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              className="border-white text-white hover:bg-white hover:text-primary-600"
            >
              <Phone className="mr-2 w-5 h-5" />
              Call Us Today
            </Button>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Phone className="w-6 h-6 text-white/80" />
              <div className="text-left">
                <div className="text-sm text-white/80">Call Us</div>
                <div className="text-lg font-semibold">(555) 123-4567</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <Mail className="w-6 h-6 text-white/80" />
              <div className="text-left">
                <div className="text-sm text-white/80">Email Us</div>
                <div className="text-lg font-semibold">hello@${config.businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}`
}

// Container Component Generator
function generateContainer(config, designConfig) {
    return `export default function Container({ children, className = '', size = 'default', ...props }) {
  const sizes = {
    sm: 'max-w-4xl',
    default: '${designConfig.layout.container}',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  }

  return (
    <div 
      className={\`\${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}`
}

// Card Component Generator  
function generateCard(config, designConfig) {
    return `export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  ...props 
}) {
  const variants = {
    default: 'card',
    elevated: 'card shadow-xl',
    flat: 'bg-surface border border-border',
    outlined: 'bg-surface border-2 border-primary-200'
  }

  const hoverClass = hover ? 'hover:shadow-xl transition-shadow duration-300' : ''

  return (
    <div
      className={\`\${variants[variant]} \${hoverClass} \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}`
}

// Input Component Generator
function generateInput(config, designConfig) {
    return `import { forwardRef } from 'react'

const Input = forwardRef(({ 
  className = '',
  type = 'text',
  error,
  label,
  hint,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={\`
          w-full px-4 py-3 border rounded-lg 
          bg-surface text-text
          transition-all duration-200
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          placeholder:text-textMuted
          \${error 
            ? 'border-error-500 focus:ring-error-500' 
            : 'border-border hover:border-primary-300'
          }
          \${className}
        \`}
        ref={ref}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1 text-sm text-textSecondary">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input`
}

// Services Page Generator
async function generateServicesPage(config, designConfig) {
    return `import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowRight, Check } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      title: 'Consultation Services',
      description: 'Expert advice and strategic planning for your ${config.industry} needs.',
      features: ['Strategic Planning', 'Expert Analysis', 'Custom Solutions', '24/7 Support'],
      price: 'Custom Quote'
    },
    {
      title: 'Implementation',
      description: 'Full-service implementation of ${config.industry} solutions.',
      features: ['Complete Setup', 'Team Training', 'Quality Assurance', 'Ongoing Support'],
      price: 'Starting at $2,999'
    },
    {
      title: 'Maintenance & Support',
      description: 'Ongoing maintenance and support for your ${config.industry} systems.',
      features: ['Regular Updates', 'Bug Fixes', 'Performance Optimization', 'Priority Support'],
      price: 'Starting at $299/month'
    }
  ]

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
          <Container>
            <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-text mb-6">
                Our ${config.industry} Services
              </h1>
              <p className="text-xl text-textSecondary mb-8">
                Comprehensive ${config.industry} solutions designed to help your business grow and succeed.
              </p>
            </div>
          </Container>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="p-8 text-center" hover>
                  <h3 className="text-2xl font-heading font-semibold text-text mb-4">
                    {service.title}
                  </h3>
                  <p className="text-textSecondary mb-6">
                    {service.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-3xl font-heading font-bold text-primary-600 mb-2">
                      {service.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-textSecondary">
                        <Check className="w-5 h-5 text-accent-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}`
}

// Contact Page Generator
async function generateContactPage(config, designConfig) {
    return `'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
          <Container>
            <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-text mb-6">
                Get In Touch
              </h1>
              <p className="text-xl text-textSecondary">
                Ready to start your ${config.industry} project? We'd love to hear from you.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Content */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                  Send us a message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-text transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-textMuted"
                      placeholder="Tell us about your project..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 w-5 h-5" />
                    Send Message
                  </Button>
                </form>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                    Contact Information
                  </h2>
                  <p className="text-textSecondary mb-8">
                    Get in touch with our team of ${config.industry} experts. We're here to help you succeed.
                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text">Phone</h3>
                      <p className="text-textSecondary">(555) 123-4567</p>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text">Email</h3>
                      <p className="text-textSecondary">hello@${config.businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-text">Office</h3>
                      <p className="text-textSecondary">123 Business Street<br />City, State 12345</p>
                    </div>
                  </Card>
                </div>

                {/* Business Hours */}
                <Card className="p-6">
                  <h3 className="font-heading font-semibold text-text mb-4">Business Hours</h3>
                  <div className="space-y-2 text-textSecondary">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}`
}

// Navigation Component (Advanced)
async function generateNavigation(config, designConfig) {
    return `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = ${JSON.stringify(config.header.menuItems, null, 4)}

  return (
    <nav className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${
      isScrolled 
        ? 'bg-surface/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }\`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-heading font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            ${config.businessName}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === 'dropdown' && item.children?.length > 0 ? (
                  <>
                    <button className={\`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors \${
                      pathname === item.link 
                        ? 'text-primary-600' 
                        : 'text-text hover:text-primary-600'
                    }\`}>
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 w-64 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-2">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.link}
                            className="block px-4 py-3 text-sm text-text hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            <div className="font-medium">{child.name}</div>
                            {child.description && (
                              <div className="text-xs text-textSecondary mt-1">
                                {child.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.link}
                    className={\`px-3 py-2 text-sm font-medium transition-colors \${
                      pathname === item.link 
                        ? 'text-primary-600' 
                        : 'text-text hover:text-primary-600'
                    }\`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text hover:text-primary-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.type === 'dropdown' && item.children?.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 font-medium text-text border-b border-border">
                        {item.name}
                      </div>
                      <div className="pl-6 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.link}
                            className="block px-4 py-2 text-sm text-textSecondary hover:text-primary-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.link}
                      className={\`block px-4 py-2 transition-colors \${
                        pathname === item.link 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-text hover:text-primary-600 hover:bg-primary-50'
                      }\`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}`
}

export {
    generateHero,
    generateFooter,
    generateFeatureSection,
    generateCTASection,
    generateContainer,
    generateCard,
    generateInput,
    generateServicesPage,
    generateContactPage,
    generateNavigation
}