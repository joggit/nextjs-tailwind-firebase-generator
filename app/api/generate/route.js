// Fixed API Route - app/api/generate/route.js
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
        message: 'Website Generator API is online',
        capabilities: [
          'Multi-theme design system',
          'Responsive layouts', 
          'File-based templates',
          'Ecommerce support',
          'Modern web technologies'
        ],
        supportedTemplates: ['base', 'ecommerce'],
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
      }
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
    
    console.log('🎨 Starting generation for:', projectName);

    // Prepare configuration
    const config = {
      businessName: projectName,
      industry,
      businessType,
      targetAudience, 
      businessDescription: businessDescription || `${projectName} - Professional services`,
      template,
      design,
      projectType: template // Use template to determine project type
    };

    console.log('📝 Generation config:', {
      businessName: config.businessName,
      template: config.template,
      design: config.design
    });

    // Generate project
    const generatedProject = await templateGenerator.generateProject(config);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`🏁 Generation completed in ${processingTime}ms`);
    console.log(`📊 Generated ${Object.keys(generatedProject.files).length} files`);

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
          design: config.design
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
          'X-File-Count': `${Object.keys(generatedProject.files).length}`
        }
      }
    );

  } catch (error) {
    console.error('🔥 Generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate project',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}