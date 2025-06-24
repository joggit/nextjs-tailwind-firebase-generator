// Updated API Route with Nested Menu Support - app/api/generate/route.js
import TemplatePathGenerator from '@/lib/generator/TemplatePathGenerator.js';

let templatePathGenerator = null;

async function initializeServices() {
  try {
    if (!templatePathGenerator) {
      templatePathGenerator = new TemplatePathGenerator();
    }
    return { templatePathGenerator };
  } catch (error) {
    console.warn('⚠️ Template generator initialization failed:', error.message);
    throw error;
  }
}

// Helper function to analyze nested menu structure
function analyzeMenuStructure(menuItems = []) {
  const totalItems = menuItems.length;
  const dropdownMenus = menuItems.filter(item => 
    item.type === 'dropdown' || (item.children && item.children.length > 0)
  );
  const nestedItems = menuItems.reduce((sum, item) => sum + (item.children?.length || 0), 0);
  const maxDepth = Math.max(1, ...menuItems.map(item => item.children?.length ? 2 : 1));
  
  return {
    totalItems,
    dropdownCount: dropdownMenus.length,
    nestedItems,
    maxDepth,
    hasNestedMenus: nestedItems > 0,
    structure: menuItems.map(item => ({
      name: item.name,
      type: item.type || 'link',
      childCount: item.children?.length || 0
    }))
  };
}

export async function GET() {
  try {
    await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Enhanced Website Generator API with Nested Menu Support is online',
        capabilities: [
          'Nested navigation menus with dropdown support',
          'Custom header and footer design',
          'Hero section customization',
          'Multi-theme design system',
          'Responsive layouts', 
          'File-based templates',
          'Ecommerce support',
          'Modern web technologies',
          'Multi-level menu structure'
        ],
        supportedTemplates: ['base', 'ecommerce'],
        supportedThemes: ['modern', 'elegant', 'creative', 'tech'],
        navigationFeatures: [
          'Dropdown menus',
          'Nested menu items',
          'Mobile-responsive navigation',
          'Custom menu styling'
        ],
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
      
      // Enhanced Header customization data with nested menu support
      headerData = {
        style: 'solid',
        logoType: 'text',
        logoText: '',
        showCta: true,
        ctaText: 'Get Started',
        ctaLink: '/contact',
        menuItems: [
          { name: 'Home', link: '/', type: 'link', children: [] },
          { name: 'About', link: '/about', type: 'link', children: [] },
          { 
            name: 'Services', 
            link: '/services', 
            type: 'dropdown',
            children: [
              { name: 'Consulting', link: '/services/consulting', description: 'Expert consulting services' },
              { name: 'Support', link: '/services/support', description: '24/7 customer support' }
            ]
          },
          { name: 'Contact', link: '/contact', type: 'link', children: [] }
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
      enableSEO = true,
      
      // Generation metadata
      generationType = 'enhanced-customization-with-nested-menus',
      apiVersion = '2.2'
      
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

    const { templatePathGenerator } = await initializeServices();
    const projectName = businessName || name;
    
    // Analyze nested menu structure
    const menuAnalysis = analyzeMenuStructure(headerData.menuItems);
    
    console.log('🎨 Starting enhanced generation with nested menus for:', projectName);
    console.log('🧭 Navigation Structure Analysis:', {
      totalMenuItems: menuAnalysis.totalItems,
      dropdownMenus: menuAnalysis.dropdownCount,
      nestedItems: menuAnalysis.nestedItems,
      maxDepth: menuAnalysis.maxDepth,
      hasNestedMenus: menuAnalysis.hasNestedMenus,
      structure: menuAnalysis.structure
    });
    
    console.log('📊 Customization data received:', {
      hero: {
        backgroundType: heroData.backgroundType,
        hasCustomHeadline: !!heroData.headline,
        hasCustomSubheadline: !!heroData.subheadline
      },
      header: {
        style: headerData.style,
        logoType: headerData.logoType,
        menuItems: menuAnalysis.totalItems,
        dropdownMenus: menuAnalysis.dropdownCount,
        nestedItems: menuAnalysis.nestedItems,
        showCta: headerData.showCta
      },
      footer: {
        style: footerData.style,
        showNewsletter: footerData.showNewsletter,
        socialLinks: Object.values(footerData.socialLinks || {}).filter(url => url.trim()).length
      }
    });

    // Log nested menu details
    if (menuAnalysis.hasNestedMenus) {
      console.log('📋 Nested Menu Details:');
      menuAnalysis.structure.forEach((item, index) => {
        if (item.childCount > 0) {
          console.log(`  └─ ${item.name} (${item.type}): ${item.childCount} sub-items`);
          const parentItem = headerData.menuItems[index];
          if (parentItem.children) {
            parentItem.children.forEach((child, childIndex) => {
              console.log(`     ├─ ${child.name} → ${child.link}`);
            });
          }
        } else {
          console.log(`  └─ ${item.name} (${item.type})`);
        }
      });
    }

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
      
      // Enhanced Header customization with nested menu support
      headerData: {
        style: headerData.style || 'solid',
        logoType: headerData.logoType || 'text',
        logoText: headerData.logoText || projectName,
        showCta: headerData.showCta !== false,
        ctaText: headerData.ctaText || 'Get Started',
        ctaLink: headerData.ctaLink || '/contact',
        
        // Enhanced menu items with nested structure
        menuItems: (headerData.menuItems || []).map(item => ({
          name: item.name,
          link: item.link,
          type: item.type || 'link',
          children: item.children || [],
          // Add processing metadata
          hasChildren: item.children && item.children.length > 0,
          isDropdown: item.type === 'dropdown',
          childCount: item.children?.length || 0
        })),
        
        // Navigation metadata for template processing
        navigationMetadata: {
          totalItems: menuAnalysis.totalItems,
          dropdownCount: menuAnalysis.dropdownCount,
          nestedItems: menuAnalysis.nestedItems,
          maxDepth: menuAnalysis.maxDepth,
          hasNestedMenus: menuAnalysis.hasNestedMenus,
          supportsMobile: true,
          supportsDropdown: true
        }
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
        'Cross-browser Compatible',
        'Nested Navigation Menus',
        'Mobile-Friendly Dropdowns'
      ],
      
      // Advanced options
      vectorEnhancement,
      enableAnalytics,
      enableSEO,
      
      // Enhanced generation metadata
      generationType,
      apiVersion,
      customizationFeatures: {
        nestedMenus: menuAnalysis.hasNestedMenus,
        dropdownMenus: menuAnalysis.dropdownCount > 0,
        customHeader: true,
        customFooter: true,
        heroCustomization: true,
        socialLinks: Object.values(footerData.socialLinks || {}).filter(url => url.trim()).length > 0,
        newsletter: footerData.showNewsletter
      }
    };

    console.log('📝 Enhanced config prepared with nested menu support:', {
      businessName: config.businessName,
      template: config.template,
      designTheme: config.design.theme,
      heroHeadline: config.design.heroData[0].headline.substring(0, 50) + '...',
      headerStyle: config.headerData.style,
      footerStyle: config.footerData.style,
      navigation: {
        totalMenuItems: config.headerData.navigationMetadata.totalItems,
        dropdownMenus: config.headerData.navigationMetadata.dropdownCount,
        nestedItems: config.headerData.navigationMetadata.nestedItems,
        hasNestedMenus: config.headerData.navigationMetadata.hasNestedMenus
      },
      socialLinks: Object.values(config.footerData.socialLinks).filter(url => url.trim()).length,
      customizationLevel: 'advanced-with-nested-menus'
    });

    // Generate project with enhanced configuration
    console.log('⚙️ Generating project with nested navigation structure...');
    const generatedProject = await templatePathGenerator.generateProject(config);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`🏁 Enhanced generation completed in ${processingTime}ms`);
    console.log(`📊 Generated ${Object.keys(generatedProject.files).length} files`);
    console.log(`🧭 Navigation features applied:`);
    console.log(`   ├─ ${menuAnalysis.totalItems} total menu items`);
    console.log(`   ├─ ${menuAnalysis.dropdownCount} dropdown menus`);
    console.log(`   ├─ ${menuAnalysis.nestedItems} nested sub-items`);
    console.log(`   └─ Mobile-responsive navigation: ✅`);

    // Enhanced response data with nested menu metadata
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
          
          // Enhanced customization metadata with nested menu info
          customization: {
            hero: {
              backgroundType: config.design.heroData[0].backgroundType,
              hasCustomContent: !!(heroData.headline || heroData.subheadline),
              customHeadline: !!heroData.headline,
              customSubheadline: !!heroData.subheadline
            },
            header: {
              style: config.headerData.style,
              logoType: config.headerData.logoType,
              menuItems: menuAnalysis.totalItems,
              dropdownMenus: menuAnalysis.dropdownCount,
              nestedItems: menuAnalysis.nestedItems,
              maxDepth: menuAnalysis.maxDepth,
              hasNestedMenus: menuAnalysis.hasNestedMenus,
              hasCta: config.headerData.showCta,
              mobileResponsive: true
            },
            footer: {
              style: config.footerData.style,
              hasNewsletter: config.footerData.showNewsletter,
              socialLinksCount: Object.values(config.footerData.socialLinks).filter(url => url.trim()).length,
              hasContactInfo: !!(config.footerData.email || config.footerData.phone || config.footerData.address)
            },
            navigation: {
              structure: menuAnalysis.structure,
              complexity: menuAnalysis.hasNestedMenus ? 'complex' : 'simple',
              features: [
                'responsive-design',
                menuAnalysis.hasNestedMenus ? 'nested-menus' : null,
                menuAnalysis.dropdownCount > 0 ? 'dropdown-support' : null,
                'mobile-friendly'
              ].filter(Boolean)
            }
          },
          
          // Technical metadata
          features: {
            vectorEnhancement: config.vectorEnhancement,
            analytics: config.enableAnalytics,
            seo: config.enableSEO,
            responsive: true,
            customDesign: true,
            nestedNavigation: menuAnalysis.hasNestedMenus,
            dropdownMenus: menuAnalysis.dropdownCount > 0,
            mobileOptimized: true
          },
          
          // Generation statistics
          generation: {
            type: generationType,
            version: apiVersion,
            processingTimeMs: processingTime,
            complexity: 'enhanced-with-nested-menus',
            featuresApplied: config.features.length
          }
        }
      }
    };

    console.log('✅ Response prepared with nested menu metadata');
    console.log('📤 Sending enhanced project data to client...');

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Generation-Time': `${processingTime}ms`,
          'X-File-Count': `${Object.keys(generatedProject.files).length}`,
          'X-Design-Theme': config.design.theme,
          'X-Customization-Level': 'enhanced-with-nested-menus',
          'X-Menu-Items': `${menuAnalysis.totalItems}`,
          'X-Dropdown-Count': `${menuAnalysis.dropdownCount}`,
          'X-Nested-Items': `${menuAnalysis.nestedItems}`,
          'X-Has-Nested-Menus': menuAnalysis.hasNestedMenus.toString()
        }
      }
    );

  } catch (error) {
    console.error('🔥 Enhanced generation with nested menus error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate enhanced project with nested menus',
        details: error.message,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'GenerationError',
        generationType: 'enhanced-customization-with-nested-menus'
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
      message: 'Use POST to generate projects with nested menu support',
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
      message: 'Use POST to generate projects with nested menu support', 
      supportedMethods: ['GET', 'POST']
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function PATCH() {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed',
      message: 'Use POST to generate projects with nested menu support',
      supportedMethods: ['GET', 'POST'] 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}