// app/api/generator/route.js
// Updated to return JSON with project data, not direct ZIP

import ProjectGenerator from '@/lib/generator/ProjectGenerator.js';

// Initialize the generator
let projectGenerator = null;

async function initializeGenerator() {
    if (!projectGenerator) {
        projectGenerator = new ProjectGenerator();
        console.log('✅ ProjectGenerator initialized');
    }
    return projectGenerator;
}

export async function GET() {
    return Response.json({
        status: 'ready',
        message: 'Website Generator API',
        version: '2.0.0',
        usage: 'POST /api/generator with your config to generate project',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request) {
    const startTime = Date.now();

    try {
        console.log('🚀 Starting project generation...');

        const generator = await initializeGenerator();
        const config = await request.json();

        // Validate required fields
        if (!config.businessName && !config.projectName) {
            return Response.json({
                success: false,
                error: 'Missing required field: businessName or projectName is required'
            }, { status: 400 });
        }

        // Generate the project
        const project = await generator.generateProject(config);
        const processingTime = Date.now() - startTime;

        console.log(`✅ Generation completed in ${processingTime}ms`);
        console.log(`📊 Generated ${Object.keys(project.files).length} files`);

        // Store project temporarily for download (or in database for persistence)
        const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store in memory (you could use Redis/database for production)
        if (typeof global !== 'undefined') {
            global.tempProjects = global.tempProjects || {};
            global.tempProjects[projectId] = {
                ...project,
                config,
                generatedAt: new Date().toISOString()
            };

            // Clean up after 30 minutes
            setTimeout(() => {
                if (global.tempProjects && global.tempProjects[projectId]) {
                    delete global.tempProjects[projectId];
                    console.log(`🗑️ Cleaned up project: ${projectId}`);
                }
            }, 30 * 60 * 1000);
        }

        // Return success response with project metadata
        return Response.json({
            success: true,
            data: {
                projectId,
                project: {
                    id: project.id,
                    name: project.name || config.businessName || config.projectName,
                    type: project.type,
                    // Don't send all files in response - too large
                    fileCount: Object.keys(project.files).length,
                    config: config
                },
                metadata: {
                    businessName: config.businessName || config.projectName,
                    industry: config.industry,
                    template: config.template,
                    processingTime: `${processingTime}ms`,
                    fileCount: Object.keys(project.files).length,
                    generatedAt: new Date().toISOString(),

                    // Enhanced metadata
                    theme: {
                        primaryColor: config.theme?.primaryColor,
                        secondaryColor: config.theme?.secondaryColor,
                        fontFamily: config.theme?.fontFamily
                    },
                    pages: {
                        total: Object.keys(config.pages || {}).length,
                        enabled: Object.values(config.pages || {}).filter(p => p.enabled).length,
                        list: Object.entries(config.pages || {})
                            .filter(([key, page]) => page.enabled)
                            .map(([key, page]) => ({ key, title: page.title }))
                    },
                    content: {
                        heroTitle: config.blocks?.home?.hero?.title,
                        teamMembers: config.blocks?.about?.team?.members?.length || 0,
                        featuresCount: config.blocks?.home?.features?.items?.length || 0
                    },

                    // Download info
                    download: {
                        projectId,
                        downloadUrl: `/api/download?id=${projectId}`,
                        expiresIn: '30 minutes'
                    }
                }
            }
        });

    } catch (error) {
        const errorTime = Date.now() - startTime;
        console.error('🔥 Generation error:', error);

        return Response.json({
            success: false,
            error: 'Generation failed',
            details: error.message,
            processingTime: `${errorTime}ms`,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}