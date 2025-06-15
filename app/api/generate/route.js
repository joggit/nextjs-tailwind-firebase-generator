'use strict';

import VectorEnhancedProjectGenerator from '@/lib/VectorEnhancedProjectGenerator.js';
import { VectorRAGService } from '@/lib/VectorRAGService.js';

// Initialize services
let vectorRAGService = null;
let projectGenerator = null;

async function initializeServices() {
  if (!vectorRAGService) {
    vectorRAGService = new VectorRAGService();
    await vectorRAGService.initialize();
  }

  if (!projectGenerator) {
    projectGenerator = new VectorEnhancedProjectGenerator(vectorRAGService);
  }

  return { vectorRAGService, projectGenerator };
}

export async function GET() {
  try {
    const { vectorRAGService } = await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Vector RAG Enhanced Project Generator API is online',
        vectorStore: vectorRAGService.isInitialized(),
        capabilities: [
          'AI-powered website generation',
          'Vector similarity search',
          'Context-aware recommendations',
          'Multi-template support',
          'RAG-enhanced content creation',
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
        message: 'Failed to initialize vector services',
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
      industry,
      businessType,
      template = 'modern',
      customRequirements = '',
      vectorEnhancement = true,
    } = body;

    if (!businessName || !industry || !businessType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: businessName, industry, and businessType are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { projectGenerator } = await initializeServices();

    console.log('🚀 Starting vector-enhanced generation for:', businessName);

    const generationRequest = {
      businessName,
      industry,
      businessType,
      template,
      customRequirements,
      vectorEnhancement,
      includeAnalytics: true,
      generateSEO: true,
    };

    const generatedProject = await projectGenerator.generateProject(generationRequest);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`✅ Generation completed in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          project: generatedProject,
          metadata: {
            businessName,
            industry,
            businessType,
            template,
            vectorEnhanced: vectorEnhancement,
            processingTime: `${processingTime}ms`,
            generatedAt: new Date().toISOString(),
            fileCount: generatedProject.files ? Object.keys(generatedProject.files).length : 0,
          },
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('🔥 Generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate project',
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const { vectorRAGService } = await initializeServices();

    switch (action) {
      case 'addTemplate':
        if (!data.templateId || !data.templateData) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Missing templateId or templateData',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        await vectorRAGService.addTemplate(data.templateId, data.templateData);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Template ${data.templateId} added successfully`,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'addIndustryContext':
        if (!data.industry || !data.context) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Missing industry or context data',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        await vectorRAGService.addIndustryContext(data.industry, data.context);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Industry context for ${data.industry} added successfully`,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'rebuildVectorStore':
        await vectorRAGService.rebuildVectorStore();

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Vector store rebuilt successfully',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown action: ${action}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('PUT request error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process PUT request',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const templateId = url.searchParams.get('templateId');

    if (!templateId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing templateId parameter',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { vectorRAGService } = await initializeServices();
    await vectorRAGService.removeTemplate(templateId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Template ${templateId} removed successfully`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DELETE request error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete template',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
