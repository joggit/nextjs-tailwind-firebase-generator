// Simple Project Template Generator with Firebase Pages Integration
// File: lib/ProjectTemplateGenerator.js

import ProjectPagesGenerator from './ProjectPagesGenerator.js';

class ProjectTemplateGenerator {
  constructor() {
    this.pagesGenerator = new ProjectPagesGenerator();
    this.generatedContent = null;
  }

  async generateProject(config) {
    console.log(`🚀 Generating project: ${config.businessName || config.name}`);
    console.log(`📊 Project details:`, {
      business: config.businessName,
      industry: config.industry,
      type: config.businessType,
      pages: config.pages?.length || 0
    });

    const project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      config,
      files: {},
      generationMetadata: {
        pageCount: config.pages?.filter(p => p.enabled).length || 1,
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now()
      }
    };

    try {
      console.log('🔧 Generating project files...');
      
      // Generate base files
      const baseFiles = await this.generateBaseFiles(config);
      
      // Generate pages using Firebase data
      const pageFiles = await this.pagesGenerator.generatePages(config.projectId, config);
      
      // Generate basic components
      const componentFiles = this.generateComponents(config);
      
      // Combine all files
      project.files = {
        ...baseFiles,
        ...pageFiles,
        ...componentFiles
      };

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);
      
      return project;

    } catch (error) {
      console.error('❌ Error generating project:', error);
      throw new Error(`Project generation failed: ${error.message}`);
    }
  }

  async generateBaseFiles(config) {
    return {
      'package.json': this.generatePackageJson(config),
      'next.config.mjs': this.generateNextConfig(),
      'tailwind.config.js': this.generateTailwindConfig(),
      'postcss.config.js': this.generatePostCSSConfig(),
      'app/layout.js': this.generateRootLayout(config),
      'app/globals.css': this.generateGlobalCSS(),
      '.env.local.example': this.generateEnvExample(),
      '.gitignore': this.generateGitignore(),
      'jsconfig.json': this.generateJSConfig(),
      'README.md': this.generateReadme(config)
    };
  }

  generateComponents(config) {
    return {
      'components/Header.js': this.generateHeader(config),
      'components/Footer.js': this.generateFooter(config),
      'components/ui/Button.jsx': this.generateButton(),
      'components/ui/Card.jsx': this.generateCard()
    };
  }

  generatePackageJson(config) {
    return JSON.stringify({
      name: (config.businessName || config.name).toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        'lucide-react': '^0.300.0',
        firebase: '^10.7.0',
        openai: '^4.20.0'
      },
      devDependencies: {
        tailwindcss: '^3.3.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }

  generateNextConfig() {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['openai', 'firebase']
  }
}

export default nextConfig`;
  }

  generateTailwindConfig() {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}`;
  }

  generatePostCSSConfig() {
    return `// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  }

  generateRootLayout(config) {
    const appName = config.businessName || config.name;
    const description = config.businessDescription || `Professional ${config.industry || 'business'} services`;

    return `import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '${appName}',
  description: '${description}',
}

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

export default RootLayout`;
  }

  generateGlobalCSS() {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-white text-gray-900;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`;
  }

  generateHeader(config) {
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
            <Button size="sm">
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

export default Header`;
  }

  generateFooter(config) {
    const businessName = config.businessName || config.name || 'Your Business';
    const currentYear = new Date().getFullYear();
    
    return `import Link from 'next/link'
import { Sparkles } from 'lucide-react'

function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">${businessName}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional ${config.industry || 'business'} services tailored to your needs.
            </p>
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

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>info@${businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
              <p>(555) 123-4567</p>
              <p>123 Business St, City, State 12345</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © ${currentYear} ${businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer`;
  }

  generateButton() {
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
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
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

export default Button`;
  }

  generateCard() {
    return `import React from 'react'

function Card({ children, className = '', ...props }) {
  return (
    <div
      className={\`bg-white rounded-lg border border-gray-200 shadow-sm \${className}\`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card`;
  }

  generateEnvExample() {
    return `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# OpenAI Configuration (Optional - for AI content generation)
OPENAI_API_KEY=sk-your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`;
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

# OS
Thumbs.db`;
  }

  generateJSConfig() {
    return JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["./*"],
          "@/components/*": ["./components/*"],
          "@/lib/*": ["./lib/*"],
          "@/app/*": ["./app/*"]
        }
      },
      exclude: ["node_modules", ".next"]
    }, null, 2);
  }

  generateReadme(config) {
    return `# ${config.businessName || 'Business Website'}

A modern, responsive website built with Next.js and Tailwind CSS.

## 🚀 Features

- **Responsive Design**: Works on all devices
- **Modern Stack**: Next.js 14, React 18, Tailwind CSS
- **Fast Performance**: Optimized for speed
- **SEO Ready**: Search engine optimized

## 📋 Pages

${config.pages?.filter(p => p.enabled).map(page => `- **${page.name}**: ${page.type} page`).join('\n') || '- **Home**: Main landing page'}

## 🛠 Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🚀 Deployment

Deploy easily with Vercel:

\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

---

Generated with AI assistance for ${config.businessName || 'your business'}.`;
  }
}

export default ProjectTemplateGenerator;