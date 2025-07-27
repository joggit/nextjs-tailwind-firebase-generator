// Combined Generator Route - Handles both JSON and ZIP responses
// File: app/api/generator/route.js

import JSZip from 'jszip';
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
    try {
        await initializeGenerator();

        return new Response(
            JSON.stringify({
                status: 'ready',
                message: 'Website Generator API',
                version: '2.0.0',
                capabilities: [
                    'Multi-template generation',
                    'Design system integration',
                    'Responsive design',
                    'Professional components',
                    'Direct ZIP download',
                    'Next.js 14 + Tailwind CSS'
                ],
                supportedTemplates: [
                    'modern', 'ecommerce', 'blog', 'portfolio', 'corporate'
                ],
                usage: {
                    preview: 'POST /api/generator (returns JSON)',
                    download: 'POST /api/generator?download=true (returns ZIP)'
                },
                timestamp: new Date().toISOString()
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('❌ API initialization error:', error);
        return new Response(
            JSON.stringify({
                status: 'error',
                message: 'Failed to initialize generator',
                error: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function POST(request) {
    const startTime = Date.now();

    try {
        const generator = await initializeGenerator();
        const url = new URL(request.url);
        const downloadMode = url.searchParams.get('download') === 'true';

        console.log(`🚀 Starting generation (${downloadMode ? 'ZIP download' : 'JSON response'})...`);

        // Parse and validate request body
        const body = await request.json();
        const config = body;


        // Generate the project
        const project = await generator.generateProject(config);

        const processingTime = Date.now() - startTime;
        console.log(`✅ Generation completed in ${processingTime}ms`);
        console.log(`📊 Generated ${Object.keys(project.files).length} files`);

        // Return ZIP file if download requested
        if (downloadMode) {
            return await createZipResponse(project, config, processingTime);
        }

        // Return JSON response for preview
        return createJsonResponse(project, config, processingTime);

    } catch (error) {
        const errorTime = Date.now() - startTime;
        console.error('🔥 Generation error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: 'Generation failed',
                details: error.message,
                processingTime: `${errorTime}ms`,
                timestamp: new Date().toISOString()
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}



async function createZipResponse(project, config, processingTime) {
    try {
        console.log('📦 Creating ZIP file...');

        const zip = new JSZip();

        // Add all project files
        for (const [filename, content] of Object.entries(project.files)) {
            const fileContent = typeof content === 'string' ? content : String(content || '');
            zip.file(filename, fileContent);
        }

        // Add project metadata
        const projectInfo = {
            name: project.name || config.businessName,
            type: project.type || config.projectType,
            businessName: config.businessName,
            industry: config.industry,
            template: config.template,
            generatedAt: config.generatedAt,
            processingTime: `${processingTime}ms`,
            fileCount: Object.keys(project.files).length,
            features: config.features,
            generator: 'Website Generator v2.0'
        };

        zip.file('project-info.json', JSON.stringify(projectInfo, null, 2));


        // Generate ZIP
        const zipData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const zipSize = (zipData.length / 1024 / 1024).toFixed(2);
        console.log(`📦 ZIP created: ${zipSize}MB`);

        // Generate filename
        const sanitizedName = config.businessName
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizedName}_${timestamp}.zip`;

        return new Response(zipData, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': zipData.length.toString(),
                'X-Generation-Time': `${processingTime}ms`,
                'X-File-Count': `${Object.keys(project.files).length}`,
                'X-Zip-Size': `${zipSize}MB`,
                'X-Project-Name': config.businessName,
                'X-Template': config.template
            }
        });

    } catch (zipError) {
        console.error('❌ ZIP creation failed:', zipError);
        throw new Error(`ZIP creation failed: ${zipError.message}`);
    }
}

function createJsonResponse(project, config, processingTime) {
    return new Response(
        JSON.stringify({
            success: true,
            data: {
                project: {
                    id: project.id,
                    name: project.name,
                    type: project.type,
                    config: project.config,
                    metadata: project.generationMetadata || project.metadata || {},
                    fileCount: Object.keys(project.files).length,
                    files: Object.keys(project.files).map(path => ({
                        path,
                        size: project.files[path].length,
                        type: getFileType(path)
                    }))
                },
                metadata: {
                    businessName: config.businessName,
                    industry: config.industry,
                    template: config.template,
                    processingTime: `${processingTime}ms`,
                    generatedAt: config.generatedAt,
                    fileCount: Object.keys(project.files).length,

                    downloadUrl: `/api/generator?download=true`,
                    downloadNote: 'POST the same configuration with ?download=true to get ZIP',

                    technology: {
                        framework: 'Next.js 14',
                        styling: 'Tailwind CSS',
                        components: 'Professional UI Library',
                        responsive: true
                    }
                }
            }
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Generation-Time': `${processingTime}ms`,
                'X-File-Count': `${Object.keys(project.files).length}`,
                'X-Template': config.template,
                'X-Business-Name': config.businessName
            }
        }
    );
}


function getFileType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const typeMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'css': 'stylesheet',
        'json': 'json',
        'md': 'markdown',
        'html': 'html'
    };
    return typeMap[ext] || 'text';
}

// Handle unsupported methods
export async function PUT() {
    return new Response(
        JSON.stringify({
            error: 'Method not allowed',
            message: 'Use POST to generate projects',
            supportedMethods: ['GET', 'POST'],
            usage: {
                preview: 'POST /api/generator',
                download: 'POST /api/generator?download=true'
            }
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
            supportedMethods: ['GET', 'POST']
        }),
        {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}