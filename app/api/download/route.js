// Simple Download Route Using Temporary Storage
// File: app/api/download/route.js

import JSZip from 'jszip';
import { projectStorage } from '../generator/route.js';

export async function GET(request) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const projectId = url.searchParams.get('id');

    try {
        // Validate project ID
        if (!projectId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing project ID',
                    message: 'Please provide a valid project ID using ?id=PROJECT_ID',
                    usage: 'GET /api/download?id=PROJECT_ID'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Check if project exists in storage
        const storedProject = projectStorage.get(projectId);

        if (!storedProject) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Project not found or expired',
                    message: 'The project may have expired or the ID is invalid',
                    projectId: projectId,
                    note: 'Projects are available for download for 30 minutes after generation'
                }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Check if project has expired
        if (Date.now() > storedProject.expiresAt) {
            // Clean up expired project
            projectStorage.delete(projectId);

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Project expired',
                    message: 'This project download link has expired',
                    projectId: projectId,
                    expiredAt: new Date(storedProject.expiresAt).toISOString(),
                    note: 'Please generate a new project to get a fresh download link'
                }),
                {
                    status: 410,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log(`📦 Starting ZIP download for project: ${projectId}`);

        const { project, config } = storedProject;

        // Create ZIP file
        const zipStartTime = Date.now();
        const zip = new JSZip();

        // Add all project files to ZIP
        for (const [filename, content] of Object.entries(project.files)) {
            // Ensure content is a string
            const fileContent = typeof content === 'string' ? content : String(content || '');
            zip.file(filename, fileContent);
        }

        // Add project metadata file
        const projectInfo = {
            name: project.name,
            type: project.type,
            businessName: config.businessName,
            generatedAt: project.metadata.generatedAt,
            generator: 'ProjectGenerator v2.0',
            designSystem: {
                theme: config.design?.name || 'Custom',
                primaryColor: config.design?.colors?.primary || '#3B82F6',
                fonts: config.design?.fonts || { heading: 'Inter', body: 'Inter' }
            },
            navigation: {
                headerStyle: config.headerData?.style || 'modern',
                menuItems: config.headerData?.menuItems?.length || 0,
                nestedItems: config.headerData?.menuItems?.reduce((sum, item) =>
                    sum + (item.children?.length || 0), 0) || 0
            },
            fileCount: Object.keys(project.files).length,
            downloadedAt: new Date().toISOString(),
            projectId: projectId
        };

        zip.file('project-info.json', JSON.stringify(projectInfo, null, 2));

        // Add README with project details
        const readme = generateProjectReadme(config, projectInfo);
        zip.file('README.md', readme);

        // Generate ZIP buffer
        const zipData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        const zipTime = Date.now() - zipStartTime;
        const totalTime = Date.now() - startTime;

        console.log(`📦 ZIP created in ${zipTime}ms`);
        console.log(`💾 ZIP size: ${(zipData.length / 1024 / 1024).toFixed(2)}MB`);
        console.log(`⏱️ Total processing time: ${totalTime}ms`);

        // Generate filename
        const sanitizedName = config.businessName
            ? config.businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
            : 'website_project';

        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const filename = `${sanitizedName}_${timestamp}.zip`;

        // Return ZIP file
        return new Response(zipData, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': zipData.length.toString(),
                'X-Zip-Time': `${zipTime}ms`,
                'X-Total-Time': `${totalTime}ms`,
                'X-File-Count': `${Object.keys(project.files).length}`,
                'X-Project-Name': config.businessName || 'Website Project',
                'X-Design-Theme': config.design?.name || 'Custom',
                'X-Project-ID': projectId,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
        const errorTime = Date.now() - startTime;

        console.error('❌ Download failed:', error);
        console.error(`📊 Error occurred after: ${errorTime}ms`);

        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to create download',
                details: error.message,
                projectId: projectId || 'unknown',
                timestamp: new Date().toISOString(),
                processingTime: `${errorTime}ms`,
                errorType: error.name || 'DownloadError'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Error-Time': `${errorTime}ms`
                }
            }
        );
    }
}

export async function POST() {
    return new Response(
        JSON.stringify({
            error: 'Method not allowed',
            message: 'Use GET with project ID to download',
            usage: 'GET /api/download?id=PROJECT_ID',
            supportedMethods: ['GET'],
            note: 'Generate a project first at /api/generator to get a download ID'
        }),
        {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

function generateProjectReadme(config, projectInfo) {
    const menuAnalysis = config.headerData?.menuItems || [];
    const nestedCount = menuAnalysis.reduce((sum, item) => sum + (item.children?.length || 0), 0);

    return `# ${config.businessName}

**AI-Generated Website Project**

Generated on ${new Date().toLocaleDateString()} using advanced design system generator.

## 📊 Project Information

- **Business Name**: ${config.businessName}
- **Industry**: ${config.industry}
- **Project Type**: ${config.projectType}
- **Design Theme**: ${config.design?.name || 'Custom'}
- **Files Generated**: ${projectInfo.fileCount}
- **Project ID**: ${projectInfo.projectId}

## 🎨 Design System

- **Theme**: ${config.design?.name || 'Custom'}
- **Primary Color**: ${config.design?.colors?.primary || '#3B82F6'}
- **Typography**: ${config.design?.fonts?.heading || 'Inter'} / ${config.design?.fonts?.body || 'Inter'}
- **Layout**: ${config.design?.layout?.type || 'Standard'}

## 🧭 Navigation Structure

- **Header Style**: ${config.headerData?.style || 'Modern'}
- **Menu Items**: ${menuAnalysis.length}
- **Nested Items**: ${nestedCount}
- **Footer Style**: ${config.footerData?.style || 'Modern'}

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
│   ├── layout.js       # Root layout with design system
│   ├── page.js         # Homepage
│   ├── globals.css     # Global styles with custom design
│   └── [pages]/        # Additional pages
├── components/         # React components
│   ├── ui/            # UI components (Button, Card, etc.)
│   ├── Header.js      # Navigation header
│   ├── Footer.js      # Footer component
│   └── Hero.js        # Hero section
├── lib/               # Utilities and configuration
│   └── design.js      # Design system configuration
├── public/            # Static assets
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind with custom design tokens
└── README.md          # This file
\`\`\`

## ✨ Features Included

${config.features.map(feature => `- ✅ ${feature}`).join('\n')}
- ✅ Custom Design System
- ✅ Responsive Navigation
- ✅ Modern UI Components
- ✅ SEO Optimized
- ✅ Accessibility Compliant

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Custom Design System
- **Components**: Professional UI Component Library
- **Typography**: Custom font configuration
- **Responsive**: Mobile-first design approach
- **Performance**: Optimized for speed and SEO

## 🎯 Customization

This project includes a complete design system that you can customize:

1. **Colors**: Edit \`tailwind.config.js\` to change the color palette
2. **Typography**: Modify font settings in \`app/layout.js\`
3. **Components**: Customize UI components in \`components/ui/\`
4. **Navigation**: Update menu structure in \`components/Header.js\`
5. **Layout**: Adjust spacing and layout in \`lib/design.js\`

## 📞 Support

This project was generated with AI assistance. For technical support:

- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **React Documentation**: [https://reactjs.org/docs](https://reactjs.org/docs)

---

**Generated by AI Website Generator v2.0**  
*Professional websites with custom design systems*
`;
}

// Handle unsupported methods
export async function PUT() {
    return new Response(
        JSON.stringify({
            error: 'Method not allowed',
            message: 'Use GET with project ID to download',
            supportedMethods: ['GET']
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
            message: 'Use GET with project ID to download',
            supportedMethods: ['GET']
        }),
        {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}