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
        const config = validateAndPrepareConfig(body);

        console.log('📋 Generation config:', {
            businessName: config.businessName,
            template: config.template,
            projectType: config.projectType,
            downloadMode
        });

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

function validateAndPrepareConfig(body) {
    const {
        businessName,
        name,
        industry,
        businessType,
        projectType,
        targetAudience,
        businessDescription,
        template,
        design,
        features,
        customRequirements
    } = body;

    // Validate required fields
    const finalBusinessName = businessName || name;
    if (!finalBusinessName) {
        throw new Error('businessName or name is required');
    }

    // Build configuration with intelligent defaults
    return {
        businessName: finalBusinessName,
        industry: industry || 'business',
        businessType: businessType || 'company',
        projectType: projectType || businessType || template || 'modern',
        targetAudience: targetAudience || 'customers',
        businessDescription: businessDescription || customRequirements ||
            `${finalBusinessName} - Professional ${industry || 'business'} services`,

        // Template and design
        template: template || 'modern',
        design: design || { theme: template || 'modern' },

        // Features
        features: Array.isArray(features) ? features : [
            'Responsive Design',
            'SEO Optimized',
            'Modern UI/UX',
            'Professional Components'
        ],

        // Metadata
        generatedAt: new Date().toISOString(),
        generator: 'ProjectGenerator v2.0'
    };
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

        // Add README
        const readme = createProjectReadme(config, projectInfo);
        zip.file('README.md', readme);

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

function createProjectReadme(config, projectInfo) {
    return `# ${config.businessName}

**AI-Generated Website Project**

Generated on ${new Date().toLocaleDateString()} using the Website Generator.

## 📊 Project Information

- **Business Name**: ${config.businessName}
- **Industry**: ${config.industry}
- **Template**: ${config.template}
- **Files Generated**: ${projectInfo.fileCount}
- **Processing Time**: ${projectInfo.processingTime}

## 🚀 Getting Started

1. **Extract the ZIP file** to your desired location
2. **Open terminal** in the project directory
3. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
4. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
5. **Open browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
${config.businessName.replace(/[^a-zA-Z0-9]/g, '_')}/
├── app/                 # Next.js 14 App Router
│   ├── layout.js       # Root layout
│   ├── page.js         # Homepage
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # UI components
│   ├── Header.js      # Navigation
│   ├── Footer.js      # Footer
│   └── Hero.js        # Hero section
├── lib/               # Utilities
├── public/            # Static assets
├── package.json       # Dependencies
├── tailwind.config.js # Tailwind configuration
└── README.md          # This file
\`\`\`

## ✨ Features Included

${config.features.map(feature => `- ✅ ${feature}`).join('\n')}

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Components**: Professional UI Component Library
- **Performance**: Optimized for speed and SEO
- **Responsive**: Mobile-first design

## 🎯 Customization

- Edit \`tailwind.config.js\` for styling
- Modify components in \`components/\`
- Update content in \`app/page.js\`
- Customize navigation in \`components/Header.js\`

---

**Generated by Website Generator v2.0**
`;
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