// Updated API Route - app/api/generate/route.js
import TemplateGenerator from '@/lib/generator/TemplateGenerator.js';

let templateGenerator = null;

async function initializeServices() {
  try {
    if (!templateGenerator) {
      templateGenerator = new TemplateGenerator();
    }
    return { templateGenerator };
  } catch (error) {
    console.warn('⚠️ Template generator initialization failed:', error.message);
    throw error;
  }
}

export async function GET() {
  try {
    await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Enhanced Website Generator API is online',
        capabilities: [
          'Custom header and footer design',
          'Hero section customization',
          'Multi-theme design system',
          'Responsive layouts', 
          'File-based templates',
          'Ecommerce support',
          'Modern web technologies'
        ],
        supportedTemplates: ['base', 'ecommerce'],
        supportedThemes: ['modern', 'elegant', 'creative', 'tech'],
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API initialization error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Failed to initialize generator',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    
    const {
      // Core business information
      businessName,
      name,
      industry = 'business',
      businessType = 'company', 
      targetAudience = 'customers',
      businessDescription = '',
      template = 'base',
      
      // Design configuration
      design = {
        theme: 'modern',
        layout: 'standard',
        heroStyle: 'centered'
      },
      
      // Hero customization data
      heroData = {
        headline: '',
        subheadline: '',
        primaryCta: 'Get Started',
        secondaryCta: 'Learn More',
        backgroundType: 'gradient',
        backgroundImage: '',
        backgroundVideo: ''
      },
      
      // Header customization data
      headerData = {
        style: 'solid',
        logoType: 'text',
        logoText: '',
        showCta: true,
        ctaText: 'Get Started',
        ctaLink: '/contact',
        menuItems: [
          { name: 'Home', link: '/' },
          { name: 'About', link: '/about' },
          { name: 'Services', link: '/services' },
          { name: 'Contact', link: '/contact' }
        ]
      },
      
      // Footer customization data
      footerData = {
        style: 'multiColumn',
        companyName: '',
        companyDescription: '',
        email: '',
        phone: '',
        address: '',
        showNewsletter: true,
        newsletterTitle: 'Stay Updated',
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        }
      },
      
      // Pages and features
      pages = [],
      features = [],
      
      // Advanced options
      vectorEnhancement = false,
      enableAnalytics = true,
      enableSEO = true
      
    } = body;

    // Validate required fields
    if (!businessName && !name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: businessName or name is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { templateGenerator } = await initializeServices();
    const projectName = businessName || name;
    
    console.log('🎨 Starting enhanced generation for:', projectName);
    console.log('📊 Customization data received:', {
      hero: {
        backgroundType: heroData.backgroundType,
        hasCustomHeadline: !!heroData.headline
      },
      header: {
        style: headerData.style,
        menuItems: headerData.menuItems?.length || 0,
        showCta: headerData.showCta
      },
      footer: {
        style: footerData.style,
        showNewsletter: footerData.showNewsletter,
        socialLinks: Object.values(footerData.socialLinks || {}).filter(url => url.trim()).length
      }
    });

    // Prepare enhanced configuration for template generator
    const config = {
      // Core business info
      businessName: projectName,
      industry,
      businessType,
      targetAudience, 
      businessDescription: businessDescription || `${projectName} - Professional ${industry} services`,
      
      // Project type determination
      template,
      projectType: template,
      
      // Enhanced design configuration
      design: {
        theme: design.theme || 'modern',
        layout: design.layout || 'standard',
        heroStyle: design.heroStyle || 'centered',
        
        // Transform heroData for template processing
        heroData: [{
          type: design.heroStyle || 'centered',
          headline: heroData.headline || `Transform Your ${industry} with ${projectName}`,
          description: heroData.subheadline || businessDescription || `Professional ${industry} solutions for ${targetAudience}`,
          ctaPrimary: { 
            text: heroData.primaryCta || 'Get Started', 
            href: '/contact' 
          },
          ctaSecondary: { 
            text: heroData.secondaryCta || 'Learn More', 
            href: '/about' 
          },
          backgroundType: heroData.backgroundType || 'gradient',
          backgroundImage: heroData.backgroundImage || '',
          backgroundVideo: heroData.backgroundVideo || ''
        }]
      },
      
      // Header customization
      headerData: {
        style: headerData.style || 'solid',
        logoType: headerData.logoType || 'text',
        logoText: headerData.logoText || projectName,
        showCta: headerData.showCta !== false,
        ctaText: headerData.ctaText || 'Get Started',
        ctaLink: headerData.ctaLink || '/contact',
        menuItems: headerData.menuItems || [
          { name: 'Home', link: '/' },
          { name: 'About', link: '/about' },
          { name: 'Services', link: '/services' },
          { name: 'Contact', link: '/contact' }
        ]
      },
      
      // Footer customization
      footerData: {
        style: footerData.style || 'multiColumn',
        companyName: footerData.companyName || projectName,
        companyDescription: footerData.companyDescription || businessDescription || `Professional ${industry} services`,
        email: footerData.email || `contact@${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: footerData.phone || '(555) 123-4567',
        address: footerData.address || '123 Business St, City, State 12345',
        showNewsletter: footerData.showNewsletter !== false,
        newsletterTitle: footerData.newsletterTitle || 'Stay Updated',
        socialLinks: footerData.socialLinks || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        }
      },
      
      // Pages configuration
      pages: pages.length > 0 ? pages : [
        { id: 'home', name: 'Home', type: 'home', enabled: true },
        { id: 'about', name: 'About', type: 'about', enabled: true },
        { id: 'services', name: 'Services', type: 'services', enabled: true },
        { id: 'contact', name: 'Contact', type: 'contact', enabled: true }
      ],
      
      // Features
      features: features.length > 0 ? features : [
        'Responsive Design',
        'SEO Optimized',
        'Modern UI/UX',
        'Cross-browser Compatible'
      ],
      
      // Advanced options
      vectorEnhancement,
      enableAnalytics,
      enableSEO,
      
      // Generation metadata
      generationType: 'enhanced-customization',
      apiVersion: '2.1'
    };

    console.log('📝 Enhanced config prepared:', {
      businessName: config.businessName,
      template: config.template,
      designTheme: config.design.theme,
      heroHeadline: config.design.heroData[0].headline.substring(0, 50) + '...',
      headerStyle: config.headerData.style,
      footerStyle: config.footerData.style,
      menuItems: config.headerData.menuItems.length,
      socialLinks: Object.values(config.footerData.socialLinks).filter(url => url.trim()).length
    });

    // Generate project with enhanced configuration
    const generatedProject = await templateGenerator.generateProject(config);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`🏁 Enhanced generation completed in ${processingTime}ms`);
    console.log(`📊 Generated ${Object.keys(generatedProject.files).length} files`);

    // Enhanced response data
    const responseData = {
      success: true,
      data: {
        project: generatedProject,
        metadata: {
          businessName: config.businessName,
          template: config.template,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString(),
          fileCount: Object.keys(generatedProject.files).length,
          
          // Design metadata
          design: {
            theme: config.design.theme,
            layout: config.design.layout,
            heroStyle: config.design.heroStyle
          },
          
          // Customization metadata
          customization: {
            hero: {
              backgroundType: config.design.heroData[0].backgroundType,
              hasCustomContent: !!(heroData.headline || heroData.subheadline)
            },
            header: {
              style: config.headerData.style,
              logoType: config.headerData.logoType,
              menuItems: config.headerData.menuItems.length,
              hasCta: config.headerData.showCta
            },
            footer: {
              style: config.footerData.style,
              hasNewsletter: config.footerData.showNewsletter,
              socialLinksCount: Object.values(config.footerData.socialLinks).filter(url => url.trim()).length,
              hasContactInfo: !!(config.footerData.email || config.footerData.phone || config.footerData.address)
            }
          },
          
          // Technical metadata
          features: {
            vectorEnhancement: config.vectorEnhancement,
            analytics: config.enableAnalytics,
            seo: config.enableSEO,
            responsive: true,
            customDesign: true
          }
        }
      }
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Generation-Time': `${processingTime}ms`,
          'X-File-Count': `${Object.keys(generatedProject.files).length}`,
          'X-Design-Theme': config.design.theme,
          'X-Customization-Level': 'enhanced'
        }
      }
    );

  } catch (error) {
    console.error('🔥 Enhanced generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate enhanced project',
        details: error.message,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'GenerationError'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed', 
      message: 'Use POST to generate projects',
      supportedMethods: ['GET', 'POST']
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function DELETE() {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed',
      message: 'Use POST to generate projects', 
      supportedMethods: ['GET', 'POST']
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}