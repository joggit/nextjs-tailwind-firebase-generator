// API Route for Ecommerce Project Generation
// File: app/api/generateEcommerce/route.js

'use strict';

import TemplateGenerator from '@/lib/generator/TemplateGenerator.js';

// Initialize services
let ecommerceGenerator = null;

async function initializeServices() {
  try {
    if (!ecommerceGenerator) {
      ecommerceGenerator = new TemplateGenerator();
    }

    return { ecommerceGenerator };
  } catch (error) {
    console.warn('⚠️ Ecommerce generator initialization failed:', error.message);
    throw error;
  }
}

export async function GET() {
  try {
    const { ecommerceGenerator } = await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Ecommerce Project Generator API is online',
        capabilities: [
          'Ecommerce website generation',
          'Shopping cart functionality',
          'Product management',
          'Checkout process',
          'User account system',
          'Payment integration ready'
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
        message: 'Failed to initialize ecommerce generator',
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
      projectType,
      businessDescription = '',
      pages = [],
      enableEcommerce = true,
      enableCheckout = true,
      enableUserAccounts = true,
      enableWishlist = true,
      customRequirements = ''
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

    const { ecommerceGenerator } = await initializeServices();

    const projectName = businessName || name;
    console.log('🚀 Starting ecommerce generation for:', projectName);

    // Prepare configuration following the same pattern
    const generationConfig = {
      projectId: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessName: projectName,
      name: projectName,
      industry: industry || 'retail',
      businessType: businessType || 'ecommerce',
      projectType: projectType || 'ecommerce',
      businessDescription: businessDescription || `${projectName} - Quality products and services`,
      pages: pages.length > 0 ? pages : [],
      enableEcommerce,
      enableCheckout,
      enableUserAccounts,
      enableWishlist,
      customRequirements: customRequirements || businessDescription,
      includeAnalytics: true,
      generateSEO: true
    };

    console.log('📝 Generation config:', {
      businessName: generationConfig.businessName,
      projectType: generationConfig.projectType,
      businessType: generationConfig.businessType,
      industry: generationConfig.industry,
      enabledPages: generationConfig.pages?.filter(p => p.enabled)?.length || 0,
      enableEcommerce: generationConfig.enableEcommerce
    });

    let generatedProject;
    
    try {
      console.log('🎯 Generating ecommerce project...');
      generatedProject = await ecommerceGenerator.generateProject(generationConfig);
      console.log('✅ Ecommerce generation completed successfully');
    } catch (genError) {
      console.error('❌ Ecommerce generation error:', genError);
      throw new Error(`Ecommerce generation failed: ${genError.message}`);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`🏁 Generation completed in ${processingTime}ms`);
    console.log(`📊 Generated ${generatedProject?.files ? Object.keys(generatedProject.files).length : 0} files`);

    // Follow the same response structure as the working route
    return new Response(
      JSON.stringify({
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
            ecommerceEnabled: generationConfig.enableEcommerce,
            featuresEnabled: {
              checkout: generationConfig.enableCheckout,
              userAccounts: generationConfig.enableUserAccounts,
              wishlist: generationConfig.enableWishlist
            }
          },
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('🔥 Ecommerce generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate ecommerce project',
        details: error.message,
        timestamp: new Date().toISOString(),
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
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function DELETE() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function PATCH() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}