'use strict';

import ProjectGenerator from '@/lib/ProjectGenerator.js';
import { VectorRAGService } from '@/lib/VectorRAGService.js';

// Initialize services
let vectorRAGService = null;
let projectGenerator = null;

async function initializeServices() {
  try {
    if (!vectorRAGService) {
      vectorRAGService = new VectorRAGService();
      await vectorRAGService.initialize();
    }

    if (!projectGenerator) {
      projectGenerator = new ProjectGenerator(vectorRAGService);
    }

    return { vectorRAGService, projectGenerator };
  } catch (error) {
    console.warn('⚠️ Vector services initialization failed, using fallback mode:', error.message);
    // Return basic generator without vector enhancement
    return { 
      vectorRAGService: null, 
      projectGenerator: new ProjectGenerator(null) 
    };
  }
}

export async function GET() {
  try {
    const { vectorRAGService } = await initializeServices();

    return new Response(
      JSON.stringify({
        status: 'ready',
        message: 'Vector RAG Enhanced Project Generator API is online',
        vectorStore: vectorRAGService ? vectorRAGService.isInitialized() : false,
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
        message: 'Failed to initialize services',
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
      targetAudience = '',
      keyServices = [],
      businessDescription = ''
    } = body;

    // Validate required fields
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

    const { projectGenerator, vectorRAGService } = await initializeServices();

    console.log('🚀 Starting generation for:', businessName);

    const generationRequest = {
      businessName,
      industry,
      businessType,
      template,
      customRequirements: customRequirements || businessDescription,
      vectorEnhancement: vectorEnhancement && vectorRAGService !== null,
      targetAudience,
      keyServices,
      businessDescription,
      includeAnalytics: true,
      generateSEO: true,
    };

    let generatedProject;
    
    try {
      generatedProject = await projectGenerator.generateProject(generationRequest);
    } catch (genError) {
      console.error('Generation error:', genError);
      
      // Fallback to basic generation
      console.log('🔄 Falling back to basic generation...');
      const basicGenerator = new ProjectGenerator(null);
      generationRequest.vectorEnhancement = false;
      generatedProject = await basicGenerator.generateProject(generationRequest);
    }

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
            vectorEnhanced: generationRequest.vectorEnhancement,
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