// Simplified Project Pages Generator - Reads from Firebase and generates pages
// File: lib/ProjectPagesGenerator.js

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { OpenAI } from 'openai';

// Firebase initialization function
function initializeFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

class ProjectPagesGenerator {
  constructor() {
    this.firestore = null;
    this.openai = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Firebase
      const app = initializeFirebase();
      this.firestore = getFirestore(app);

      // Initialize OpenAI if available
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      }

      this.initialized = true;
      console.log('✅ ProjectPagesGenerator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ProjectPagesGenerator:', error);
      throw error;
    }
  }

  async generatePages(projectId, fallbackConfig = null) {
    try {
      await this.initialize();
      
      console.log(`🚀 Generating pages for project: ${projectId}`);
      
      // Get project data from Firebase or use fallback
      let projectData = fallbackConfig;
      if (projectId && projectId !== 'undefined' && projectId !== undefined) {
        console.log(`🔍 Attempting to load from Firebase with ID: ${projectId}`);
        const firebaseData = await this.getProjectDataFromFirebase(projectId);
        if (firebaseData) {
          projectData = firebaseData;
          console.log(`✅ Loaded from Firebase`);
        } else {
          console.log(`⚠️ Not found in Firebase, using fallback config`);
        }
      } else {
        console.log(`📝 Using provided config (no Firebase ID)`);
      }
      
      if (!projectData) {
        throw new Error(`No project data available`);
      }

      // Debug the project data we're working with
      console.log(`📊 Project data details:`, {
        name: projectData.businessName,
        industry: projectData.industry,
        hasPages: !!projectData.pages,
        pagesArray: Array.isArray(projectData.pages),
        pagesCount: projectData.pages?.length || 0,
        enabledPagesCount: projectData.pages?.filter(p => p.enabled).length || 0
      });

      // Generate pages based on the configuration
      const pages = await this.createPagesFromProjectData(projectData);
      
      console.log(`✅ Generated ${Object.keys(pages).length} pages`);
      return pages;

    } catch (error) {
      console.error('❌ Error generating pages:', error);
      throw error;
    }
  }

  async getProjectDataFromFirebase(projectId) {
    try {
      // Try to get from projects collection
      const projectRef = doc(this.firestore, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        console.log(`✅ Retrieved project from 'projects' collection`);
        return { id: projectId, ...data };
      }

      // Try to get from website_configurations collection (your existing data)
      const configRef = doc(this.firestore, 'website_configurations', projectId);
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const data = configSnap.data();
        console.log(`✅ Retrieved project from 'website_configurations' collection`);
        return { id: projectId, ...data };
      }

      console.warn(`⚠️ Project ${projectId} not found in either collection`);
      return null;
    } catch (error) {
      console.error('❌ Error retrieving project data:', error);
      throw error;
    }
  }

  async createPagesFromProjectData(projectData) {
    const pages = {};
    
    try {
      // Get enabled pages from configuration, or default to basic pages
      let enabledPages = [];
      
      if (projectData.pages && Array.isArray(projectData.pages) && projectData.pages.length > 0) {
        enabledPages = projectData.pages.filter(page => page.enabled);
        console.log(`📋 Found ${projectData.pages.length} total pages, ${enabledPages.length} enabled`);
      } else {
        console.log(`⚠️ No pages found in config, creating default pages`);
        enabledPages = [
          { id: 'home', name: 'Home', type: 'home', enabled: true, config: {} },
          { id: 'about', name: 'About', type: 'about', enabled: true, config: {} },
          { id: 'services', name: 'Services', type: 'services', enabled: true, config: {} },
          { id: 'contact', name: 'Contact', type: 'contact', enabled: true, config: {} }
        ];
      }
      
      console.log(`🎨 Generating ${enabledPages.length} pages...`);
      
      // Log each page we're about to generate
      enabledPages.forEach((page, index) => {
        console.log(`  ${index + 1}. ${page.name} (${page.type}) - ${page.enabled ? 'enabled' : 'disabled'}`);
      });
      
      for (const pageConfig of enabledPages) {
        const pageType = pageConfig.type;
        console.log(`  📄 Generating ${pageType} page (${pageConfig.name})...`);
        
        // Generate content for this page
        const pageContent = await this.generatePageContent(pageType, projectData, pageConfig);
        
        // Create the page component
        const pageComponent = this.createPageComponent(pageType, pageContent, projectData, pageConfig);
        
        // Determine file path
        const filePath = this.getPageFilePath(pageConfig);
        pages[filePath] = pageComponent;
        
        console.log(`  ✅ ${pageType} page generated -> ${filePath}`);
      }

      return pages;
    } catch (error) {
      console.error('❌ Error creating pages:', error);
      throw error;
    }
  }

  getPageFilePath(pageConfig) {
    const { type, id } = pageConfig;
    
    // Home page goes to app/page.js
    if (type === 'home' || id === 'home') {
      return 'app/page.js';
    }
    
    // Other pages go to app/[type]/page.js
    const pageName = type === 'custom' ? 
      pageConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 
      type;
      
    return `app/${pageName}/page.js`;
  }

  async generatePageContent(pageType, projectData, pageConfig = {}) {
    // Try AI generation first, fallback to templates
    if (this.openai) {
      try {
        const aiContent = await this.generateAIContent(pageType, projectData, pageConfig);
        console.log(`🧠 AI content generated for ${pageType}`);
        return aiContent;
      } catch (error) {
        console.warn(`⚠️ AI generation failed for ${pageType}, using template:`, error.message);
      }
    }

    // Fallback to template content
    return this.getTemplateContent(pageType, projectData, pageConfig);
  }

  async generateAIContent(pageType, projectData, pageConfig) {
    const prompt = this.createPrompt(pageType, projectData, pageConfig);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional web content creator. Generate engaging, business-appropriate content. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  createPrompt(pageType, projectData, pageConfig) {
    const businessInfo = `
Business: ${projectData.businessName}
Industry: ${projectData.industry}
Type: ${projectData.businessType}
Audience: ${projectData.targetAudience || 'General public'}
Description: ${projectData.businessDescription || 'Professional services'}
`;

    const prompts = {
      home: `Create homepage content for this business:
${businessInfo}

Return JSON:
{
  "hero": {
    "headline": "Compelling headline (max 60 chars)",
    "subheadline": "Supporting text (max 120 chars)", 
    "ctaText": "${pageConfig.config?.ctaText || 'Get Started'}"
  },
  "features": [
    {"title": "Feature 1", "description": "Brief description"},
    {"title": "Feature 2", "description": "Brief description"},
    {"title": "Feature 3", "description": "Brief description"}
  ]
}`,

      about: `Create about page content for this business:
${businessInfo}

Return JSON:
{
  "title": "About Us",
  "story": "Company story (2-3 sentences)",
  "mission": "Mission statement",
  "values": [
    {"title": "Value 1", "description": "Description"},
    {"title": "Value 2", "description": "Description"}
  ]
}`,

      services: `Create services page content for this business:
${businessInfo}

Return JSON:
{
  "title": "Our Services",
  "subtitle": "Services description",
  "services": [
    {"name": "Service 1", "description": "Service description"},
    {"name": "Service 2", "description": "Service description"},
    {"name": "Service 3", "description": "Service description"}
  ]
}`,

      contact: `Create contact page content for this business:
${businessInfo}

Return JSON:
{
  "title": "Contact Us",
  "subtitle": "Get in touch",
  "description": "Contact description",
  "methods": [
    {"type": "email", "label": "Email", "value": "contact@business.com"},
    {"type": "phone", "label": "Phone", "value": "(555) 123-4567"}
  ]
}`
    };

    return prompts[pageType] || prompts.home;
  }

  getTemplateContent(pageType, projectData, pageConfig = {}) {
    const businessName = projectData.businessName || 'Your Business';
    const industry = projectData.industry || 'business';
    
    const templates = {
      home: {
        hero: {
          headline: `Welcome to ${businessName}`,
          subheadline: `Professional ${industry} services tailored to your needs`,
          ctaText: pageConfig.config?.ctaText || 'Get Started Today'
        },
        features: [
          { title: 'Quality Service', description: 'We deliver exceptional quality in everything we do' },
          { title: 'Expert Team', description: 'Our experienced professionals are here to help' },
          { title: 'Customer Focus', description: 'Your satisfaction is our top priority' }
        ]
      },
      about: {
        title: `About ${businessName}`,
        story: `${businessName} has been serving the ${industry} industry with dedication and excellence.`,
        mission: `To provide outstanding ${industry} services that exceed our clients' expectations.`,
        values: [
          { title: 'Integrity', description: 'We conduct business with honesty and transparency' },
          { title: 'Excellence', description: 'We strive for the highest quality in all our work' }
        ]
      },
      services: {
        title: 'Our Services',
        subtitle: `Comprehensive ${industry} solutions for your needs`,
        services: [
          { name: 'Consultation', description: 'Expert advice and guidance for your projects' },
          { name: 'Implementation', description: 'Full-service project execution and delivery' },
          { name: 'Support', description: 'Ongoing assistance and maintenance services' }
        ]
      },
      contact: {
        title: 'Contact Us',
        subtitle: 'Get in touch with our team',
        description: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
        methods: [
          { type: 'phone', label: 'Phone', value: '(555) 123-4567' },
          { type: 'email', label: 'Email', value: 'info@business.com' }
        ]
      }
    };

    return templates[pageType] || templates.home;
  }

  createPageComponent(pageType, content, projectData, pageConfig = {}) {
    const componentMap = {
      home: () => this.createHomePage(content, projectData),
      about: () => this.createAboutPage(content, projectData),
      services: () => this.createServicesPage(content, projectData),
      contact: () => this.createContactPage(content, projectData)
    };

    const generator = componentMap[pageType];
    if (!generator) {
      console.warn(`Unknown page type: ${pageType}, creating basic page`);
      return this.createBasicPage(pageType, content, projectData);
    }

    return generator();
  }

  createHomePage(content, projectData) {
    return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ArrowRight, CheckCircle, Star } from 'lucide-react'

function HomePage() {
  const features = ${JSON.stringify(content.features || [], null, 2)};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              ${projectData.industry || 'Professional'} Services
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              ${content.hero?.headline || 'Welcome to Your Business'}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              ${content.hero?.subheadline || 'Professional services tailored to your needs'}
            </p>
            
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              ${content.hero?.ctaText || 'Get Started Today'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose ${projectData.businessName || 'Us'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover what makes us the perfect choice for your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
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

  createAboutPage(content, projectData) {
    const valuesArray = content.values || [];
    const valuesLength = valuesArray.length || 2; // Default to 2 columns if no values
    
    return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Card from '@/components/ui/Card'
import { Target, Heart, Lightbulb } from 'lucide-react'

function AboutPage() {
  const values = ${JSON.stringify(valuesArray, null, 2)};
  const icons = [Target, Heart, Lightbulb];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ${content.title || 'About Us'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              ${content.story || 'Learn more about our company and mission'}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              ${content.mission || 'To provide exceptional service and value to our clients'}
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(valuesLength, 3)} gap-8">
              {values.map((value, index) => {
                const IconComponent = icons[index] || Target;
                return (
                  <Card key={index} className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </Card>
                );
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

  createServicesPage(content, projectData) {
    return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ArrowRight, Wrench } from 'lucide-react'

function ServicesPage() {
  const services = ${JSON.stringify(content.services || [], null, 2)};

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ${content.title || 'Our Services'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              ${content.subtitle || 'Comprehensive solutions tailored to your needs'}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Wrench className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Button variant="outline" className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ))}
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

  createContactPage(content, projectData) {
    return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Phone, Mail, MapPin, Send } from 'lucide-react'

function ContactPage() {
  const methods = ${JSON.stringify(content.methods || [], null, 2)};
  
  const iconMap = {
    phone: Phone,
    email: Mail,
    address: MapPin
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ${content.title || 'Contact Us'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              ${content.subtitle || 'Get in touch with our team'}
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  ${content.description || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                </p>
                
                {/* Contact Methods */}
                <div className="space-y-6">
                  {methods.map((method, index) => {
                    const IconComponent = iconMap[method.type] || Phone;
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{method.label}</div>
                          <div className="text-gray-600">{method.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Form */}
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Doe"
                        required
                      />
                    </div>
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
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help you..."
                      required
                    ></textarea>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                  >
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ContactPage`;
  }

  createBasicPage(pageType, content, projectData) {
    return `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Card from '@/components/ui/Card'

function ${pageType.charAt(0).toUpperCase() + pageType.slice(1)}Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ${content.title || pageType.charAt(0).toUpperCase() + pageType.slice(1)}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              ${content.subtitle || 'Page content generated for ' + projectData.businessName}
            </p>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to ${projectData.businessName}
              </h2>
              <p className="text-gray-600">
                This ${pageType} page has been generated based on your business information.
                You can customize this content to match your specific needs.
              </p>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ${pageType.charAt(0).toUpperCase() + pageType.slice(1)}Page`;
  }
}

export default ProjectPagesGenerator;