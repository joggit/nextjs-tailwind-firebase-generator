// Vector-Enhanced Project Generator with LangChain & Firebase
// File: lib/VectorEnhancedProjectGenerator.js

import { VectorRAGService } from './VectorRAGService.js';

class VectorEnhancedProjectGenerator {
  constructor(vectorRAGService = null) {
    this.vectorRAGService = vectorRAGService || new VectorRAGService();
    this.generatedContent = null;

    this.templates = {
      modern: {
        name: 'Modern Business',
        description: 'Clean, responsive business website',
        structure: ['Hero', 'Features', 'About', 'Contact'],
        components: ['Header', 'Footer', 'Button', 'Card', 'Hero'],
        pages: ['Home', 'About', 'Contact']
      },
      ecommerce: {
        name: 'E-commerce Store',
        description: 'Online store with shopping functionality',
        structure: ['Hero', 'ProductGrid', 'Categories', 'Cart'],
        components: ['Header', 'Footer', 'ProductCard', 'CartItem', 'Checkout'],
        pages: ['Home', 'Products', 'Cart', 'Checkout']
      },
      saas: {
        name: 'SaaS Platform',
        description: 'Software as a Service application',
        structure: ['Landing', 'Features', 'Pricing', 'Dashboard'],
        components: ['Header', 'Footer', 'PricingCard', 'DashboardWidget'],
        pages: ['Home', 'Pricing', 'Dashboard', 'Settings']
      },
      blog: {
        name: 'Blog Platform',
        description: 'Content management and blogging',
        structure: ['PostList', 'PostDetail', 'Categories'],
        components: ['Header', 'Footer', 'PostCard', 'CommentForm'],
        pages: ['Home', 'Blog', 'Post', 'Archive']
      },
      portfolio: {
        name: 'Portfolio Site',
        description: 'Showcase work and projects',
        structure: ['Hero', 'Projects', 'Skills', 'Contact'],
        components: ['Header', 'Footer', 'ProjectCard', 'SkillBar'],
        pages: ['Home', 'Portfolio', 'About', 'Contact']
      },
      corporate: {
        name: 'Corporate Website',
        description: 'Professional business website',
        structure: ['Hero', 'Services', 'About', 'Team', 'Contact'],
        components: ['Header', 'Footer', 'ServiceCard', 'TeamMember'],
        pages: ['Home', 'About', 'Services', 'Team', 'Contact']
      }
    };
  }

  async generateProject(config) {
    const template = this.templates[config.template];
    if (!template) {
      throw new Error(`Template ${config.template} not found`);
    }

    console.log(`🚀 Generating vector-enhanced project: ${config.businessName || config.name}`);
    console.log(`📊 Vector RAG Context:`, {
      business: config.businessName,
      industry: config.industry,
      type: config.businessType,
      audience: config.targetAudience,
      services: config.keyServices?.length || 0
    });

    // Initialize vector service if needed
    if (!this.vectorRAGService.isInitialized()) {
      await this.vectorRAGService.initialize();
    }

    // Generate vector-enhanced content
    console.log('🧠 Starting vector-enhanced content generation...');
    this.generatedContent = await this.vectorRAGService.generateContextualContent(config, config.template);
    console.log('✅ Vector-enhanced content generated:', this.generatedContent?.hero?.headline);

    const project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      template: config.template,
      config,
      files: {},
      generatedContent: this.generatedContent,
      vectorEnhanced: true,
      generationMetadata: {
        vectorStorageUsed: true,
        similarCompaniesFound: true,
        langchainUsed: !!process.env.OPENAI_API_KEY,
        industryKnowledgeApplied: !!config.industry
      }
    };

    try {
      // Generate files with vector-enhanced contextual content
      const baseFiles = await this.generateBaseFiles(config, template);
      const componentFiles = await this.generateComponents(template.components, config);
      const pageFiles = await this.generateVectorContextualPages(this.generatedContent.pages || template.pages, config);
      const featureFiles = await this.generateFeatureFiles(config.features || [], config);
      const apiFiles = await this.generateAPIRoutes(config);
      const configFiles = this.generateConfigFiles(config);
      const vectorFiles = this.generateVectorDocumentation(config);

      project.files = {
        ...baseFiles,
        ...componentFiles,
        ...pageFiles,
        ...featureFiles,
        ...apiFiles,
        ...configFiles,
        ...vectorFiles
      };

      console.log(`✅ Vector-enhanced project generated with ${Object.keys(project.files).length} files`);
      return project;

    } catch (error) {
      console.error('❌ Error generating vector-enhanced project:', error);
      throw new Error(`Vector-enhanced project generation failed: ${error.message}`);
    }
  }

  async generateBaseFiles(config, template) {
    return {
      'package.json': this.generatePackageJson(config),
      'next.config.js': this.generateNextConfig(config),
      'tailwind.config.js': this.generateTailwindConfig(config),
      'postcss.config.js': this.generatePostCSSConfig(),
      'app/layout.js': this.generateRootLayout(config, template),
      'app/page.js': await this.generateVectorEnhancedHomePage(config, template),
      'app/globals.css': this.generateGlobalCSS(config),
      'README.md': this.generateVectorEnhancedReadme(config),
      '.env.local.example': this.generateEnvExample(config),
      '.gitignore': this.generateGitignore(),
      'jsconfig.json': this.generateJSConfig()
    };
  }

  async generateComponents(componentList, config) {
    const components = {};

    for (const componentName of componentList) {
      try {
        console.log(`🔧 Generating vector-enhanced component: ${componentName}`);
        const componentCode = await this.generateVectorContextualComponent(componentName, config);
        components[`src/components/${componentName}.js`] = componentCode;
        console.log(`✅ Successfully generated ${componentName}`);
      } catch (error) {
        console.warn(`❌ Failed to generate ${componentName}:`, error.message);
        components[`src/components/${componentName}.js`] = this.getBasicComponentTemplate(componentName);
        console.log(`⚠️  Using basic template for ${componentName}`);
      }
    }

    // Always include enhanced UI components
    try {
      components['src/components/ui/Button.js'] = this.getButtonComponent();
      components['src/components/ui/Card.js'] = this.getCardComponent();
      components['src/components/ui/ServiceCard.js'] = this.getServiceCardComponent();
      components['src/components/ui/IndustryInsights.js'] = this.getIndustryInsightsComponent();
      console.log('✅ Added vector-enhanced UI components');
    } catch (error) {
      console.error('❌ Failed to generate UI components:', error);
    }

    return components;
  }

  async generateVectorContextualPages(pageList, config) {
    const pages = {};

    for (const pageName of pageList) {
      if (pageName.toLowerCase() === 'home') continue; // Already generated in app/page.js

      const pageCode = await this.generateVectorContextualPageCode(pageName, config);
      const pagePath = pageName.toLowerCase().replace(/\s+/g, '-');
      pages[`app/${pagePath}/page.js`] = pageCode;
    }

    // Add special vector-enhanced pages
    pages['app/insights/page.js'] = this.generateIndustryInsightsPage(config);
    pages['app/api/insights/route.js'] = this.generateInsightsAPIRoute(config);

    return pages;
  }

  async generateVectorContextualComponent(componentName, config) {
    console.log(`🎨 Generating vector-contextual component: ${componentName}`);

    try {
      const template = this.getVectorContextualComponentTemplate(componentName, config);
      console.log(`✅ Vector-contextual template generated for ${componentName}`);
      return template;
    } catch (error) {
      console.error(`❌ Vector-contextual template generation failed for ${componentName}:`, error);
      throw error;
    }
  }

  getVectorContextualComponentTemplate(componentName, config) {
    const content = this.generatedContent || {};
    const appName = config.businessName || config.name || 'Your Business';
    const appInitial = appName[0]?.toUpperCase() || 'A';

    const componentTemplates = {
      Header: this.createVectorEnhancedHeader(appName, appInitial, content, config),
      Footer: this.createVectorEnhancedFooter(appName, appInitial, content, config),
      Hero: this.generateDynamicHero(config, content), // ✅ Use new dynamic Hero
      ServiceCard: this.getServiceCardComponent(),
      Card: this.createCardTemplate(),
      Button: this.createButtonTemplate()
    };

    const template = componentTemplates[componentName];
    if (!template) {
      console.warn(`Template not found for component: ${componentName}, using basic template`);
      return this.getBasicComponentTemplate(componentName);
    }

    return template;
  }

  createVectorEnhancedHeader(appName, appInitial, content, config) {
    const navItems = content.pages || ['Home', 'About', 'Services', 'Contact'];
    const industry = config.industry || 'Business';

    return `'use client'

import { useState } from 'react'
import { Menu, X, Brain, TrendingUp } from 'lucide-react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    ${navItems.map(page => `{ name: '${page}', href: '${page === 'Home' ? '/' : `/${page.toLowerCase().replace(/\s+/g, '-')}`}' }`).join(',\n    ')},
    { name: 'Insights', href: '/insights', icon: TrendingUp, special: true }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg relative">
                ${appInitial}
                <Brain className="absolute -top-1 -right-1 w-4 h-4 text-green-400" title="Vector Enhanced" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  ${appName}
                </span>
                <div className="text-xs text-gray-500 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  AI-Enhanced ${industry}
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={\`\${item.special ? 'bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-200' : 'text-gray-600 hover:text-blue-600'} transition-colors font-medium relative group flex items-center space-x-1\`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.name}</span>
                  {!item.special && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>}
                </a>
              )
            })}
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl">
              ${content.hero?.ctaText || 'Get Started'}
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={\`\${item.special ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} block px-3 py-2 rounded-lg transition-colors flex items-center space-x-2\`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </a>
                )
              })}
              <button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium">
                ${content.hero?.ctaText || 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header`;
  }

  createVectorEnhancedFooter(appName, appInitial, content, config) {
    const email = content.contact?.email || `contact@${appName.toLowerCase().replace(/\s+/g, '')}.com`;
    const year = new Date().getFullYear();

    return `import { Brain, Database, Zap } from 'lucide-react'

function Footer() {
  const vectorFeatures = [
    { icon: Brain, label: 'AI-Enhanced Content', description: 'Generated with industry intelligence' },
    { icon: Database, label: 'Vector Storage', description: 'Learns from similar businesses' },
    { icon: Zap, label: 'Smart Recommendations', description: 'Contextual suggestions' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Vector Enhancement Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Vector-Enhanced Website</h3>
              <p className="text-blue-100">This website was generated using advanced AI and vector intelligence</p>
            </div>
            <Brain className="w-12 h-12 text-white opacity-80" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {vectorFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3 text-blue-100">
                  <IconComponent className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-sm opacity-80">{feature.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-600 to-purple-600">
                ${appInitial}
              </div>
              <div>
                <span className="text-xl font-bold">${appName}</span>
                <div className="text-sm text-gray-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  ${config.industry || 'Professional Services'} • Vector Enhanced
                </div>
              </div>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              ${content.about?.content || `${appName} delivers exceptional results with AI-enhanced solutions tailored to your ${config.industry || 'business'} needs.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              ${(content.about?.highlights || ['Quality', 'Innovation', 'AI-Enhanced']).map(highlight =>
      `<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">${highlight}</span>`
    ).join('\n              ')}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              ${(content.pages || ['Home', 'About', 'Services', 'Contact']).map(page =>
      `<li><a href="${page === 'Home' ? '/' : `/${page.toLowerCase().replace(/\s+/g, '-')}`}" className="hover:text-white transition-colors">${page}</a></li>`
    ).join('\n              ')}
              <li><a href="/insights" className="hover:text-white transition-colors text-blue-400">🧠 AI Insights</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact Info</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <span className="font-medium text-white">Email:</span><br/>
                <a href="mailto:${email}" className="hover:text-white transition-colors">${email}</a>
              </li>
              <li>
                <span className="font-medium text-white">Industry:</span><br/>
                <span>${config.industry || 'Professional Services'}</span>
              </li>
              <li>
                <span className="font-medium text-white">AI Enhanced:</span><br/>
                <span className="text-green-400">Vector Intelligence Active</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © ${year} ${appName}. Enhanced with Vector AI Technology.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center space-x-1">
              <Brain className="w-4 h-4 text-blue-400" />
              <span>Powered by Vector RAG</span>
            </span>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer`;
  }

  createVectorEnhancedHero(appName, content, config) {
    const headline = content.hero?.headline || `Welcome to ${appName}`;
    const subheadline = content.hero?.subheadline || 'AI-enhanced business solutions';
    const ctaText = content.hero?.ctaText || 'Get Started';
    const industry = config.industry || 'business';

    return `'use client'

import { ArrowRight, Play, Star, Users, Award, TrendingUp, Brain, Zap, Database } from 'lucide-react'

function Hero() {
  const stats = [
    { icon: Users, label: 'AI-Enhanced Reach', value: '10K+' },
    { icon: Award, label: 'Vector Matches', value: '99%' },
    { icon: Star, label: 'Content Quality', value: '4.9/5' },
    { icon: TrendingUp, label: 'Smart Growth', value: '200%' }
  ]

  const aiFeatures = [
    { icon: Brain, text: 'AI-Generated Content' },
    { icon: Database, text: 'Vector Intelligence' },
    { icon: Zap, text: 'Industry Insights' }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-32">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        
        {/* Vector enhancement indicators */}
        <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
            <Brain className="w-5 h-5" />
            <span>Vector Enhanced</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Industry Badge with AI Enhancement */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Brain className="w-4 h-4 mr-2 text-blue-600" />
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            AI-Enhanced ${config.industry || 'Professional Services'} Solutions
          </div>

          {/* Main Headline with Vector Enhancement */}
          <div className="animate-fadeInUp">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              ${headline.split(' ').map((word, index) => {
      if (index === headline.split(' ').length - 1) {
        return `<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${word}</span>`
      }
      return word
    }).join(' ')}
            </h1>
            <p className="text-xl leading-8 text-gray-600 max-w-3xl mx-auto mb-6">
              ${subheadline}
            </p>
            
            {/* AI Enhancement Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {aiFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                    <span>{feature.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex items-center justify-center gap-x-6 mb-16 animate-fadeInUp delay-200">
            <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl">
              <Brain className="mr-2 w-5 h-5" />
              ${ctaText}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
              <Play className="mr-2 w-5 h-5" />
              See AI Demo
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          ${config.businessType !== 'personal' ? `
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">AI-Optimized</div>
                </div>
              )
            })}
          </div>` : ''}
        </div>
      </div>
    </section>
  )
}

export default Hero`;
  }

  getServiceCardComponent() {
    return `import { ArrowRight, Brain } from 'lucide-react'

function ServiceCard({ title, description, index, vectorEnhanced = true }) {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600', 
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-teal-500 to-cyan-600'
  ]

  const colorClass = colors[index % colors.length]

  return (
    <div className="group relative bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {vectorEnhanced && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <Brain className="w-3 h-3 mr-1" />
          AI
        </div>
      )}
      
      <div className={\`w-12 h-12 rounded-lg bg-gradient-to-br \${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform\`}>
        <span className="text-white font-bold text-lg">{(index + 1)}</span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-gray-600 leading-relaxed mb-4">
        {description}
      </p>
      
      <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
        <span className="text-sm">Learn more</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
      
      {vectorEnhanced && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            AI-enhanced service recommendation
          </p>
        </div>
      )}
    </div>
  )
}

export default ServiceCard`;
  }

  // Generate additional components
  createCardTemplate() {
    return `import React from 'react'

function Card({ children, className = '', vectorEnhanced = true, ...props }) {
  return (
    <div
      className={\`bg-white rounded-lg border border-gray-200 shadow-sm \${vectorEnhanced ? 'vector-enhanced' : ''} \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card`;
  }

  createButtonTemplate() {
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
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'
  
  const variants = {
    primary: vectorEnhanced 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]} \${vectorEnhanced ? 'vector-glow' : ''} \${className}\`}
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

  getButtonComponent() {
    return this.createButtonTemplate();
  }

  getCardComponent() {
    return this.createCardTemplate();
  }

  getIndustryInsightsComponent() {
    return `import { TrendingUp, Users, Building, Award, ArrowUp, ArrowDown } from 'lucide-react'

function IndustryInsights({ data }) {
  if (!data || !data.insights) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No insights data available</p>
      </div>
    )
  }

  const { insights } = data

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalCompanies}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Services</p>
              <p className="text-2xl font-bold text-gray-900">{insights.topServices?.length || 0}</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Templates Used</p>
              <p className="text-2xl font-bold text-gray-900">{insights.popularTemplates?.length || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Business Types</p>
              <p className="text-2xl font-bold text-gray-900">{insights.businessTypes?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Top Services */}
      {insights.topServices && insights.topServices.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-600" />
            Most Popular Services in {data.industry}
          </h3>
          <div className="space-y-3">
            {insights.topServices.map(([service, count], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{service}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count} companies</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: \`\${(count / insights.totalCompanies) * 100}%\` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Popularity */}
      {insights.popularTemplates && insights.popularTemplates.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Template Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.popularTemplates.map(([template, count], index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{template}</span>
                  <p className="text-sm text-gray-600">{count} companies using this template</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-purple-600">
                    {Math.round((count / insights.totalCompanies) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Types */}
      {insights.businessTypes && insights.businessTypes.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-600" />
            Business Type Distribution
          </h3>
          <div className="space-y-3">
            {insights.businessTypes.map(([type, count], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count} companies</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {Math.round((count / insights.totalCompanies) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Enhancement Note */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Vector Intelligence Analysis</h4>
            <p className="text-gray-700 text-sm">
              These insights are generated using vector similarity analysis of {insights.totalCompanies} companies 
              in the {data.industry} industry. The data is continuously updated as more companies join our vector database.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndustryInsights`;
  }

  // Remaining generation methods continue here...

  async generateVectorContextualPageCode(pageName, config) {
    console.log(`📄 Generating vector-contextual page: ${pageName}`);

    try {
      const template = this.getVectorContextualPageTemplate(pageName, config);
      console.log(`✅ Vector-contextual page template generated for ${pageName}`);
      return template;
    } catch (error) {
      console.error(`❌ Vector-contextual page generation failed for ${pageName}:`, error);
      throw error;
    }
  }

  getVectorContextualPageTemplate(pageName, config) {
    const content = this.generatedContent || {};
    const pageNameLower = pageName.toLowerCase();

    // Generate page-specific content based on vector RAG results
    if (pageNameLower.includes('about')) {
      return this.generateVectorAboutPage(config, content);
    } else if (pageNameLower.includes('service') || pageNameLower.includes('product')) {
      return this.generateVectorServicesPage(config, content);
    } else if (pageNameLower.includes('contact')) {
      return this.generateVectorContactPage(config, content);
    } else {
      // Use the generic page generator for any other page type
      return this.generateVectorGenericPage(pageName, config, content);
    }
  }

  generateVectorServicesPage(config, content) {
    const appName = config.businessName || config.name;
    const services = content.services || {};

    return `import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import ServiceCard from '@/src/components/ui/ServiceCard'
import { Brain, Zap, Target, Award } from 'lucide-react'

function ServicesPage() {
  const services = ${JSON.stringify(services.items || [], null, 2)}

  const vectorFeatures = [
    {
      icon: Brain,
      title: 'AI-Optimized Services',
      description: 'Our services are selected and refined using AI analysis of ${config.industry || 'business'} industry best practices.'
    },
    {
      icon: Zap,
      title: 'Industry Intelligence',
      description: 'Leveraging insights from similar ${config.industry || 'business'} companies to deliver optimal solutions.'
    },
    {
      icon: Target,
      title: 'Targeted Solutions',
      description: 'Each service is tailored specifically for ${config.targetAudience || 'your needs'} using vector intelligence.'
    },
    {
      icon: Award,
      title: 'Proven Excellence',
      description: 'Our approach is validated by analysis of successful ${config.industry || 'business'} implementations.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              AI-Enhanced ${config.industry || 'Business'} Services
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              ${services.title || 'Our Services'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive ${config.industry || 'business'} solutions, intelligently selected and optimized for ${config.targetAudience || 'your success'}.
            </p>
          </div>
        </section>

        {/* Vector Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our AI-Enhanced Approach
              </h2>
              <p className="text-lg text-gray-600">
                How vector intelligence makes our ${config.industry || 'business'} services superior
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {vectorFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our ${config.industry || 'Business'} Services
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive solutions tailored for ${config.targetAudience || 'your needs'}
              </p>
            </div>
            
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <ServiceCard
                    key={index}
                    title={service.name}
                    description={service.description}
                    index={index}
                    vectorEnhanced={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Our AI is analyzing the best services for your industry. Please check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Experience AI-Enhanced ${config.industry || 'Business'} Solutions?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Let ${appName} help you achieve your goals with our vector-intelligent approach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Today
                </a>
                <a href="/insights" className="inline-block border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  View Industry Insights
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ServicesPage`;
  }

  generateVectorContactPage(config, content) {
    const appName = config.businessName || config.name;
    const contactInfo = content.contact || {};

    return `import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import { Phone, Mail, MapPin, Clock, Brain, MessageCircle } from 'lucide-react'

function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch via email',
      value: '${contactInfo.email || `contact@${appName.toLowerCase().replace(/\s+/g, '')}.com`}',
      action: 'mailto:${contactInfo.email || `contact@${appName.toLowerCase().replace(/\s+/g, '')}.com`}'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      value: '${contactInfo.phone || '(555) 123-4567'}',
      action: 'tel:${contactInfo.phone || '+15551234567'}'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our ${config.industry || 'business'} location',
      value: '${contactInfo.address || 'Available by appointment'}',
      action: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'When we\'re available',
      value: '${contactInfo.hours || 'Mon-Fri: 9AM-6PM'}',
      action: null
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI-Enhanced Contact Experience
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              ${contactInfo.title || 'Contact Us'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ${contactInfo.description || `Get in touch with ${appName} for expert ${config.industry || 'business'} solutions. Our AI-enhanced team is ready to help.`}
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                    {method.action ? (
                      <a href={method.action} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        {method.value}
                      </a>
                    ) : (
                      <span className="text-gray-700 font-medium">{method.value}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-lg text-gray-600">
                Our AI-enhanced system will route your message to the right ${config.industry || 'business'} expert
              </p>
            </div>
            
            <form className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What can we help you with?"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your ${config.industry || 'business'} needs..."
                  required
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Send AI-Enhanced Message
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <Brain className="w-4 h-4 mr-1 text-blue-500" />
                    Your message will be intelligently routed to our ${config.industry || 'business'} specialists
                  </span>
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ContactPage`;
  }

  generateVectorGenericPage(pageName, config, content) {
    const appName = config.businessName || config.name;

    return `import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import { Brain } from 'lucide-react'

function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              Vector-Enhanced ${pageName}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              ${pageName} - ${appName}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our ${pageName.toLowerCase()} powered by AI intelligence and tailored for ${config.industry || 'business'} excellence.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ${pageName} Content
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                This ${pageName.toLowerCase()} page was generated using vector intelligence specifically for ${config.industry || 'business'} industry needs. Content can be customized to match your specific requirements.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ${pageName.replace(/\s+/g, '')}Page`;
  }


  generateVectorAboutPage(config, content) {
    const appName = config.businessName || config.name;
    const aboutContent = content.about || {};

    return `import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import { Users, Target, Award, Heart, Brain, Database, Zap } from 'lucide-react'

function AboutPage() {
  const vectorEnhancements = [
    {
      icon: Brain,
      title: 'AI-Enhanced Content',
      description: 'Our content is generated using advanced AI that understands ${config.industry || 'business'} industry nuances.'
    },
    {
      icon: Database,
      title: 'Vector Intelligence',
      description: 'Learning from similar ${config.industry || 'business'} companies to provide contextual insights.'
    },
    {
      icon: Zap,
      title: 'Smart Recommendations',
      description: 'Industry-specific suggestions based on comprehensive data analysis.'
    }
  ]

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: '${aboutContent.content || `To deliver exceptional ${config.industry || 'business'} solutions enhanced by AI intelligence.`}'
    },
    {
      icon: Users,
      title: 'Our Team',
      description: 'Experienced ${config.industry || 'business'} professionals leveraging cutting-edge AI technology.'
    },
    {
      icon: Award,
      title: 'Our Expertise',
      description: '${aboutContent.highlights?.join(', ') || 'Quality service, innovation, and AI-enhanced results'} powered by vector intelligence.'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'Integrity, excellence, and innovation guide every AI-enhanced solution we deliver.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              Vector-Enhanced About Page
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About ${appName}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ${aboutContent.content || `Learn more about ${appName} and our AI-enhanced approach to ${config.industry || 'business'} excellence.`}
            </p>
          </div>
        </section>

        {/* Vector Enhancement Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Enhanced Capabilities</h2>
              <p className="text-lg text-gray-600">
                How vector intelligence powers our ${config.industry || 'business'} solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {vectorEnhancements.map((enhancement, index) => {
                const IconComponent = enhancement.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{enhancement.title}</h3>
                    <p className="text-gray-600">{enhancement.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ${appName}</h2>
              <p className="text-lg text-gray-600">
                Our commitment to excellence enhanced by AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-white hover:shadow-lg transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default AboutPage`;
  }

  generateIndustryInsightsPage(config) {
    return `'use client'

import { useState, useEffect } from 'react'
import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import IndustryInsights from '@/src/components/ui/IndustryInsights'
import { Brain, TrendingUp, Users, Building, Loader } from 'lucide-react'

function InsightsPage() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/insights?industry=${config.industry || 'technology'}')
        if (!response.ok) throw new Error('Failed to fetch insights')
        const data = await response.json()
        setInsights(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading AI insights...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              Vector Intelligence Dashboard
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Industry Insights for ${config.businessName || config.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered insights from the ${config.industry || 'business'} industry, 
              generated using vector analysis of similar companies.
            </p>
          </div>
        </section>

        {/* Insights Content */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error ? (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-600">Failed to load insights: {error}</p>
                </div>
              </div>
            ) : insights ? (
              <IndustryInsights data={insights} />
            ) : (
              <div className="text-center">
                <p className="text-gray-600">No insights available at this time.</p>
              </div>
            )}
          </div>
        </section>

        {/* Vector Technology Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powered by Vector Intelligence
              </h2>
              <p className="text-lg text-gray-600">
                How our AI system generates these insights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Advanced language models analyze ${config.industry || 'business'} data patterns
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Trend Detection</h3>
                <p className="text-gray-600">
                  Identifies emerging trends in ${config.industry || 'business'} industry
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Peer Learning</h3>
                <p className="text-gray-600">
                  Learns from similar companies to provide contextual insights
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default InsightsPage`;
  }

  generateInsightsAPIRoute(config) {
    return `import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAGService = new VectorRAGService()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry') || '${config.industry || 'technology'}'
    
    console.log('🔍 Fetching industry insights for:', industry)
    
    // Get industry insights from vector service
    const insights = await vectorRAGService.getIndustryInsights(industry)
    
    if (!insights) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No insights available for this industry'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    console.log('✅ Industry insights retrieved successfully')
    
    return new Response(JSON.stringify({
      success: true,
      insights,
      metadata: {
        industry,
        generatedAt: new Date().toISOString(),
        vectorEnhanced: true,
        dataSource: 'firebase_vector_store'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Industry insights API error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch industry insights',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request) {
  try {
    const { query, filters } = await request.json()
    
    console.log('🔍 Searching companies with query:', query)
    
    // Search companies using vector service
    const results = await vectorRAGService.searchCompanies(query, filters)
    
    return new Response(JSON.stringify({
      success: true,
      results,
      metadata: {
        query,
        filters,
        resultCount: results.length,
        searchType: 'vector_similarity',
        generatedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Company search API error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to search companies',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}`;
  }

  // Generate remaining basic component templates
  getBasicComponentTemplate(componentName) {
    return `function ${componentName}() {
  return (
    <div className="${componentName.toLowerCase()}-component p-6 bg-white rounded-lg border border-gray-200 relative">
      <div className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
        Vector Enhanced
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ${componentName}
      </h2>
      <p className="text-gray-600">
        This ${componentName} component was generated using vector intelligence and can be customized for your needs.
      </p>
    </div>
  )
}

export default ${componentName}`;
  }

  // Updated to generate ESM package.json
  generatePackageJson(config) {
    const dependencies = {
      next: '^14.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      'lucide-react': '^0.300.0',

      // Vector RAG dependencies
      'langchain': '^0.1.25',
      '@langchain/openai': '^0.0.14',
      '@langchain/core': '^0.1.17',
      'openai': '^4.20.0',
      'firebase': '^10.7.0',
      'jszip': '^3.10.0'
    };

    if (config.features?.includes('Authentication')) {
      dependencies.firebase = '^10.0.0';
    }

    if (config.features?.includes('Payment Processing')) {
      dependencies.stripe = '^13.0.0';
      dependencies['@stripe/stripe-js'] = '^2.0.0';
    }

    return JSON.stringify({
      name: (config.businessName || config.name).toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      type: 'module', // ESM support
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'vector-demo': 'node lib/vector-usage.js'
      },
      dependencies,
      devDependencies: {
        tailwindcss: '^3.3.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }

  // Updated to generate ESM Next.js config
  generateNextConfig(config) {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['langchain', 'openai', 'firebase', 'jszip']
  },
  // Vector RAG optimizations
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  }
}

export default nextConfig`; // ESM export
  }

  // Updated to generate ESM Tailwind config
  generateTailwindConfig(config) {
    const primaryColor = this.generatedContent?.colors?.[0] || '#3B82F6';

    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '${primaryColor}',
          600: '${this.adjustColor(primaryColor, -10)}',
          700: '${this.adjustColor(primaryColor, -20)}',
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out',
        'ai-pulse': 'ai-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ai-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}`; // ESM export
  }

  // Updated to generate ESM PostCSS config
  generatePostCSSConfig() {
    return `// PostCSS Configuration - ESM
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`; // ESM export
  }
  // Generate jsconfig
  generateJSConfig() {
    return `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/src/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "exclude": ["node_modules", ".next"]
  }`;
  }

  // Generate root layout with vector enhancements
  generateRootLayout(config, template) {
    const appName = config.businessName || config.name;
    const description = this.generatedContent?.hero?.subheadline || config.businessDescription || template.description;

    return `import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Vector-enhanced metadata
export const metadata = {
  title: {
    default: '${appName} - AI Enhanced',
    template: '%s | ${appName}'
  },
  description: '${description}',
  keywords: ['${config.template}', '${config.industry || 'business'}', 'ai-enhanced', 'vector-intelligence', 'nextjs'],
  authors: [{ name: '${appName}' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: '${appName} - Vector Enhanced',
    description: '${description}',
    siteName: '${appName}'
  },
  other: {
    'ai-enhanced': 'true',
    'vector-intelligence': 'active',
    'industry': '${config.industry || 'business'}',
    'generation-method': 'vector-rag'
  }
}

function RootLayout({ children }) {
  return (
    <html lang="en" className="${config.styling?.theme === 'dark' ? 'dark' : ''}">
      <body className={\`\${inter.className} antialiased\`}>
        {children}
      </body>
    </html>
  )
}

export default RootLayout`;
  }

  async generateVectorEnhancedHomePage(config, template) {
    const content = this.generatedContent || {};
    const services = content.services?.items || [];

    return `import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'
import Hero from '@/src/components/Hero'
import ServiceCard from '@/src/components/ui/ServiceCard'
import { Brain, Database, Zap } from 'lucide-react'

function HomePage() {
  const services = ${JSON.stringify(services, null, 2)};
  
  const vectorFeatures = [
    {
      icon: Brain,
      title: 'AI-Enhanced Content',
      description: 'Every word is crafted using advanced AI that understands your ${config.industry || 'business'} industry.'
    },
    {
      icon: Database, 
      title: 'Vector Intelligence',
      description: 'Content generated from analysis of similar ${config.industry || 'business'} companies in our database.'
    },
    {
      icon: Zap,
      title: 'Smart Recommendations', 
      description: 'Features and content automatically optimized for your target audience.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Vector Enhancement Banner */}
        <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6" />
                <span className="font-semibold">Vector-Enhanced Website</span>
              </div>
              <p className="text-lg opacity-90">
                This website was intelligently generated using AI that analyzed ${config.industry || 'business'} industry patterns
              </p>
            </div>
          </div>
        </section>

        {/* Vector Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powered by Vector Intelligence
              </h2>
              <p className="text-lg text-gray-600">
                How AI enhanced every aspect of this ${config.industry || 'business'} website
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {vectorFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        
        {/* Services/Features Section */}
        ${services.length > 0 ? `
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ${content.services?.title || 'Our AI-Enhanced Services'}
              </h2>
              <p className="text-lg text-gray-600">
                ${config.industry || 'Business'} solutions intelligently selected for your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.name}
                  description={service.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>` : ''}

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Experience AI-Enhanced ${config.industry || 'Business'} Solutions
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Ready to work with ${config.businessName || config.name}? Our vector-intelligent team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Today
                </a>
                <a href="/insights" className="inline-block border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  View AI Insights
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default HomePage`;
  }

  generateGlobalCSS(config) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply ${config.styling?.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'};
  }
}

@layer components {
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  /* Vector enhancement indicators */
  .vector-enhanced {
    @apply relative;
  }
  
  .vector-enhanced::after {
    content: '🧠';
    @apply absolute -top-1 -right-1 text-xs;
  }
  
  .ai-generated {
    @apply border-l-4 border-blue-500 pl-4 bg-blue-50;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .vector-glow {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
}`;
  }

  generateVectorEnhancedReadme(config) {
    return `# ${config.businessName || config.name} - Vector-Enhanced Website

${this.generatedContent?.hero?.subheadline || config.businessDescription || `An AI-enhanced ${config.industry || 'business'} website powered by vector intelligence.`}

## 🧠 Vector RAG Enhancement

This website was generated using advanced Vector RAG (Retrieval-Augmented Generation) technology:

- **Industry Analysis**: Content tailored specifically for ${config.industry || 'business'} sector
- **Vector Intelligence**: Learned from similar companies in our database  
- **AI-Generated Content**: Every section crafted with industry expertise
- **Contextual Recommendations**: Features selected based on business type and audience

## 🎯 Business Context

- **Industry**: ${config.industry || 'Professional Services'}
- **Business Type**: ${config.businessType || 'Company'}
- **Target Audience**: ${config.targetAudience || 'Customers'}
- **Key Services**: ${(config.keyServices || []).join(', ') || 'Professional services'}

## ✨ AI-Enhanced Features

### 🎨 **Smart Content Generation**
- Hero sections with industry-specific messaging
- About pages highlighting unique value propositions
- Services tailored to ${config.industry || 'business'} best practices
- Contact forms optimized for ${config.targetAudience || 'target audience'}

### 🔍 **Vector Intelligence**
- Content analyzed against similar ${config.industry || 'business'} companies
- Industry trends and patterns automatically incorporated
- Contextual recommendations based on business type
- Smart template selection for optimal results

### 📊 **AI Insights Dashboard**
Visit \`/insights\` to view:
- Industry trends and analysis
- Popular services in your sector
- Template preferences by business type
- Competitive intelligence

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS (AI-optimized color schemes)
- **Icons:** Lucide React
- **Language:** JavaScript (ES6+)
- **AI Enhancement:** LangChain + OpenAI
- **Vector Storage:** Firebase with embeddings
- **Content:** Vector RAG-generated

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project (for vector storage)
- OpenAI API key (for AI enhancement)

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Add your API keys:
   \`\`\`bash
   OPENAI_API_KEY=sk-your_openai_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   \`\`\`

3. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
${config.businessName || config.name}/
├── app/                          # Next.js App Router
│   ├── insights/                 # AI insights dashboard  
│   ├── api/insights/             # Vector intelligence API
│   └── [other-pages]/
├── src/components/               # Vector-enhanced components
│   ├── Header.js                 # Industry-aware navigation
│   ├── Footer.js                 # AI-enhanced footer
│   ├── Hero.js                   # Vector-generated hero
│   └── ui/
│       ├── ServiceCard.js        # Contextual service cards
│       └── IndustryInsights.js   # AI insights component
├── lib/
│   ├── VectorRAGService.js       # Core vector intelligence
│   ├── VectorEnhancedProjectGenerator.js
│   └── vector-usage.js           # Usage examples
├── VECTOR_ENHANCEMENT.md         # AI enhancement docs
└── package.json                  # Includes vector dependencies
\`\`\`

---

**🎉 Vector-Enhanced Website**  
*Generated with AI intelligence specifically for ${config.industry || 'business'} industry*

**Generated**: ${new Date().toISOString()}  
**Vector Enhanced**: ✅ Active  
**Industry Optimized**: ✅ ${config.industry || 'General Business'}  
**AI Model**: GPT-3.5-turbo with LangChain and vector storage`;
  }

  generateEnvExample(config) {
    const envVars = [
      `# App Configuration`,
      `NEXT_PUBLIC_APP_NAME="${config.businessName || config.name}"`,
      `NEXT_PUBLIC_APP_URL=http://localhost:3000`,
      `NEXT_PUBLIC_BUSINESS_TYPE="${config.businessType || 'business'}"`,
      `NEXT_PUBLIC_INDUSTRY="${config.industry || 'general'}"`,
      ``,
      `# Vector RAG Configuration (Required for AI enhancement)`,
      `OPENAI_API_KEY=sk-your_openai_api_key_here`,
      `OPENAI_MODEL=gpt-3.5-turbo-instruct`,
      `OPENAI_EMBEDDING_MODEL=text-embedding-ada-002`,
      ``,
      `# Firebase Configuration (Required for vector storage)`,
      `NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key`,
      `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com`,
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id`,
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com`,
      `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789`,
      `NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456`,
      ``,
      `# Vector Enhancement Settings`,
      `ENABLE_AI_CONTENT=true`,
      `VECTOR_SIMILARITY_THRESHOLD=0.8`,
      `MAX_SIMILAR_COMPANIES=5`,
      `ENABLE_VECTOR_STORAGE=true`,
      ``
    ];

    return envVars.join('\n');
  }

  generateGitignore() {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Vector RAG specific
/vector-cache/
/embeddings-cache/
VECTOR_ENHANCEMENT.md

# Firebase
.firebase/
firebase-debug.log`;
  }

  generateVectorDocumentation(config) {
    return {
      'VECTOR_ENHANCEMENT.md': this.generateVectorDocumentationFile(config),
      'lib/vector-usage.js': this.generateVectorUsageExample(config)
    };
  }

  generateVectorDocumentationFile(config) {
    return `# Vector Enhancement Documentation

## 🧠 AI-Enhanced Website for ${config.businessName || config.name}

This website was generated using advanced Vector RAG (Retrieval-Augmented Generation) technology, combining artificial intelligence with industry-specific knowledge to create contextually relevant content.

### 🎯 Vector Enhancements Applied

#### **Industry Analysis**
- **Industry**: ${config.industry || 'Not specified'}
- **Business Type**: ${config.businessType || 'Not specified'}  
- **Target Audience**: ${config.targetAudience || 'Not specified'}
- **Key Services**: ${(config.keyServices || []).join(', ') || 'Not specified'}

#### **AI-Generated Content**
- ✅ **Hero Section**: Industry-specific messaging tailored to ${config.industry || 'business'}
- ✅ **About Page**: Contextual content highlighting unique value propositions
- ✅ **Services**: Relevant offerings based on industry analysis
- ✅ **Contact**: Business-appropriate contact strategies

#### **Vector Intelligence Features**
1. **Similar Company Analysis**: Learned from similar ${config.industry || 'business'} companies
2. **Industry Knowledge Base**: Built-in expertise for ${config.industry || 'business'} sector
3. **Contextual Recommendations**: AI-powered suggestions for content and features
4. **Semantic Understanding**: Deep comprehension of business context and goals

---

**Generated on**: ${new Date().toISOString()}
**Vector Enhanced**: ✅ Active
**Industry Optimized**: ✅ ${config.industry || 'General Business'}
**AI Model**: GPT-3.5-turbo with vector intelligence`;
  }

  generateVectorUsageExample(config) {
    return `// Vector RAG Usage Examples
// File: lib/vector-usage.js

import { VectorRAGService } from './VectorRAGService.js'

// Example usage of the Vector RAG Service
class VectorUsageExamples {
  constructor() {
    this.vectorRAG = new VectorRAGService()
  }

  // Example 1: Generate content for a new company
  async generateCompanyContent() {
    const companyData = {
      businessName: '${config.businessName || 'Example Corp'}',
      industry: '${config.industry || 'Technology'}',
      businessType: '${config.businessType || 'Startup'}',
      targetAudience: '${config.targetAudience || 'Tech professionals'}',
      businessDescription: '${config.businessDescription || 'AI-powered solutions'}',
      keyServices: ${JSON.stringify(config.keyServices || ['Consulting', 'Development'])},
      template: '${config.template || 'modern'}'
    }

    try {
      const content = await this.vectorRAG.generateContextualContent(companyData, companyData.template)
      console.log('Generated content:', content)
      return content
    } catch (error) {
      console.error('Content generation failed:', error)
    }
  }

  // Example 2: Find similar companies
  async findSimilarCompanies() {
    const searchData = {
      industry: '${config.industry || 'Technology'}',
      businessType: '${config.businessType || 'Startup'}',
      targetAudience: '${config.targetAudience || 'Tech professionals'}'
    }

    try {
      const similar = await this.vectorRAG.findSimilarCompanies(searchData, 5)
      console.log('Similar companies:', similar)
      return similar
    } catch (error) {
      console.error('Similar company search failed:', error)
    }
  }

  // Example 3: Get industry insights
  async getIndustryInsights() {
    try {
      const insights = await this.vectorRAG.getIndustryInsights('${config.industry || 'technology'}')
      console.log('Industry insights:', insights)
      return insights
    } catch (error) {
      console.error('Industry insights failed:', error)
    }
  }
}

// Usage in your application
export async function demonstrateVectorRAG() {
  const examples = new VectorUsageExamples()

  console.log('🧠 Starting Vector RAG demonstrations...')

  // Generate content for current company
  await examples.generateCompanyContent()

  // Find similar companies
  await examples.findSimilarCompanies()

  // Get industry insights
  await examples.getIndustryInsights()

  console.log('✅ Vector RAG demonstrations complete!')
}

export default VectorUsageExamples`;
  }

  generateFeatureFiles(features, config) {
    return {};
  }

  generateAPIRoutes(config) {
    return {
      'app/api/contact/route.js': this.getContactAPIRoute(config),
      'app/api/health/route.js': this.getHealthCheckRoute()
    };
  }

  generateConfigFiles(config) {
    return {
      '.eslintrc.json': this.generateESLintConfig()
    };
  }

  generateESLintConfig() {
    return JSON.stringify({
      extends: ['next/core-web-vitals'],
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off'
      }
    }, null, 2);
  }

  getContactAPIRoute(config) {
    return `import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, message } = await request.json()
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 })
    }
    
    // Here you would typically send an email or save to database
    console.log('Contact form submission:', { name, email, message })
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
    
  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}`;
  }

  getHealthCheckRoute() {
    return `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    vectorEnhanced: true
  })
}`;
  }

  // Utility methods
  adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
}

export default VectorEnhancedProjectGenerator;