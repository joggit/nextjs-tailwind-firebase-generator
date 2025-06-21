// Updated Generate API Route with Design System Support
// File: app/api/generate/route.js

'use strict';

import TemplateGenerator from '@/lib/generator/TemplateGenerator.js';

// Initialize template generator
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
    const { templateGenerator } = await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Design-Enhanced Website Generator API is online',
        capabilities: [
          'Multi-theme design system',
          'Responsive layouts',
          'Custom hero styles',
          'Professional component library',
          'Modern web technologies',
          'SEO optimization'
        ],
        supportedThemes: [
          'modern', 'elegant', 'creative', 'tech', 'minimal', 'corporate'
        ],
        supportedLayouts: [
          'standard', 'sidebar', 'centered', 'magazine', 'landing'
        ],
        supportedHeroStyles: [
          'centered', 'split', 'fullscreen', 'minimal', 'video', 'animated'
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
        message: 'Failed to initialize template generator',
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
      businessName,
      name,
      industry,
      businessType,
      targetAudience,
      businessDescription = '',
      pages = [],
      features = [],
      
      // Design Configuration
      design = {},
      designConfig = {},
      
      // Enhanced Features
      vectorEnhancement = false,
      enableAnalytics = true,
      enableSEO = true,
      
      // Legacy support
      template = 'modern',
      customRequirements = '',
      projectType = 'website'
    } = body;

    // Validate required fields
    if (!businessName && !name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: businessName or name is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { templateGenerator } = await initializeServices();

    const projectName = businessName || name;
    console.log('🎨 Starting design-enhanced generation for:', projectName);

    // Merge design configurations (prioritize designConfig over design)
    const finalDesignConfig = {
      theme: designConfig.theme || design.theme || template || 'modern',
      layout: designConfig.layout || design.layout || 'standard',
      heroStyle: designConfig.heroStyle || design.heroStyle || 'centered',
      graphics: designConfig.graphics || design.graphics || 'illustrations',
      customizations: {
        ...design.customizations,
        ...designConfig.customizations
      }
    };

    // Prepare comprehensive configuration
    const generationConfig = {
      // Basic Info
      projectId: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessName: projectName,
      name: projectName,
      industry: industry || 'business',
      businessType: businessType || 'company',
      targetAudience: targetAudience || 'customers',
      businessDescription: businessDescription || customRequirements || `${projectName} - Professional services`,
      projectType: projectType,
      
      // Design Configuration
      design: finalDesignConfig,
      
      // Page Configuration
      pages: pages.length > 0 ? pages : [
        { id: 'home', name: 'Home', type: 'home', enabled: true, config: {} },
        { id: 'about', name: 'About', type: 'about', enabled: true, config: {} },
        { id: 'services', name: 'Services', type: 'services', enabled: true, config: {} },
        { id: 'contact', name: 'Contact', type: 'contact', enabled: true, config: {} }
      ],
      
      // Features
      features: features.length > 0 ? features : [
        'Responsive Design',
        'SEO Optimized',
        'Modern UI/UX',
        'Cross-browser Compatible'
      ],
      
      // Enhanced Options
      vectorEnhancement,
      enableAnalytics,
      enableSEO,
      
      // Ecommerce specific
      enableCheckout: projectType === 'ecommerce',
      enableUserAccounts: projectType === 'ecommerce',
      enableWishlist: projectType === 'ecommerce',
      
      // Generation Metadata
      generationType: 'design-enhanced',
      apiVersion: '2.0',
      includeDesignSystem: true
    };

    console.log('📝 Generation config:', {
      businessName: generationConfig.businessName,
      projectType: generationConfig.projectType,
      designTheme: finalDesignConfig.theme,
      layout: finalDesignConfig.layout,
      heroStyle: finalDesignConfig.heroStyle,
      industry: generationConfig.industry,
      businessType: generationConfig.businessType,
      enabledPages: generationConfig.pages?.filter(p => p.enabled)?.length || 0
    });

    let generatedProject;
    
    try {
      console.log('🎯 Generating design-enhanced project...');
      generatedProject = await templateGenerator.generateProject(generationConfig);
      console.log('✅ Design-enhanced generation completed successfully');
    } catch (genError) {
      console.error('❌ Design generation error:', genError);
      throw new Error(`Design-enhanced generation failed: ${genError.message}`);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`🏁 Generation completed in ${processingTime}ms`);
    console.log(`📊 Generated ${generatedProject?.files ? Object.keys(generatedProject.files).length : 0} files`);

    // Create response with enhanced metadata
    const responseData = {
      success: true,
      data: {
        project: generatedProject,
        metadata: {
          businessName: generationConfig.businessName,
          industry: generationConfig.industry,
          businessType: generationConfig.businessType,
          projectType: generationConfig.projectType,
          processingTime: `${processingTime}ms`,
          generatedAt: new Date().toISOString(),
          fileCount: generatedProject?.files ? Object.keys(generatedProject.files).length : 0,
          
          // Design Metadata
          designSystem: {
            theme: finalDesignConfig.theme,
            layout: finalDesignConfig.layout,
            heroStyle: finalDesignConfig.heroStyle,
            graphics: finalDesignConfig.graphics,
            customizations: Object.keys(finalDesignConfig.customizations || {}).length
          },
          
          // Feature Metadata
          featuresEnabled: {
            vectorEnhancement: generationConfig.vectorEnhancement,
            analytics: generationConfig.enableAnalytics,
            seo: generationConfig.enableSEO,
            designSystem: true,
            responsiveDesign: true,
            ecommerce: generationConfig.projectType === 'ecommerce'
          },
          
          // Page Metadata
          pages: {
            total: generationConfig.pages.length,
            enabled: generationConfig.pages.filter(p => p.enabled).length,
            types: [...new Set(generationConfig.pages.filter(p => p.enabled).map(p => p.type))]
          },
          
          // Technical Metadata
          technical: {
            framework: 'Next.js 14',
            styling: 'Tailwind CSS + Design System',
            components: 'Custom UI Library',
            animations: 'CSS Transitions',
            responsive: true,
            accessibility: 'WCAG 2.1 AA',
            seo: 'Built-in optimization'
          }
        },
      },
    };

    // Test serialization and handle large responses
    try {
      const testSerialization = JSON.stringify(responseData);
      const sizeInMB = (testSerialization.length / (1024 * 1024)).toFixed(2);
      console.log(`✅ Response serializable: ${sizeInMB}MB`);
      
      // If response is too large (>4MB), use temporary storage
      if (testSerialization.length > 4 * 1024 * 1024) {
        console.log(`⚠️ Response too large (${sizeInMB}MB), using temporary storage...`);
        
        if (typeof global !== 'undefined') {
          global.tempProjects = global.tempProjects || {};
          global.tempProjects[generatedProject.id] = generatedProject;
          
          // Clean up after 15 minutes
          setTimeout(() => {
            if (global.tempProjects && global.tempProjects[generatedProject.id]) {
              delete global.tempProjects[generatedProject.id];
              console.log(`🗑️ Cleaned up temporary project: ${generatedProject.id}`);
            }
          }, 15 * 60 * 1000);
        }

        // Return lightweight response
        responseData.data.project = {
          id: generatedProject.id,
          name: generatedProject.name,
          type: generatedProject.type,
          config: generatedProject.config,
          generationMetadata: generatedProject.generationMetadata,
          _filesInTempStorage: true,
          _tempStorageId: generatedProject.id
        };
      }

    } catch (serializationError) {
      console.error(`❌ Serialization failed: ${serializationError.message}`);
      
      // Fallback to minimal response
      responseData.data.project = {
        id: generatedProject.id,
        name: generatedProject.name,
        type: generatedProject.type,
        generationMetadata: generatedProject.generationMetadata,
        _serializationError: true
      };
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Generation-Time': `${processingTime}ms`,
          'X-File-Count': `${generatedProject?.files ? Object.keys(generatedProject.files).length : 0}`,
          'X-Design-Theme': finalDesignConfig.theme,
          'X-Project-Type': generationConfig.projectType
        },
      }
    );

  } catch (error) {
    console.error('🔥 Design-enhanced generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate design-enhanced project',
        details: error.message,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'GenerationError'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
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