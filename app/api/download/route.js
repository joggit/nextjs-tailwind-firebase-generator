// app/api/download/route.js
// Separate endpoint for downloading generated projects as ZIP

import JSZip from 'jszip';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('id');

        if (!projectId) {
            return Response.json({
                success: false,
                error: 'Project ID is required'
            }, { status: 400 });
        }

        // Retrieve project from temporary storage
        if (!global.tempProjects || !global.tempProjects[projectId]) {
            return Response.json({
                success: false,
                error: 'Project not found or expired. Please regenerate.'
            }, { status: 404 });
        }

        const projectData = global.tempProjects[projectId];
        const config = projectData.config;

        console.log(`📦 Creating ZIP for project: ${projectId}`);

        // Create ZIP file
        const zip = new JSZip();

        // Add all project files
        for (const [filename, content] of Object.entries(projectData.files)) {
            const fileContent = typeof content === 'string' ? content : String(content || '');
            zip.file(filename, fileContent);
        }

        // Add project metadata
        const projectInfo = {
            name: projectData.name || config.businessName || config.projectName,
            businessName: config.businessName || config.projectName,
            industry: config.industry,
            template: config.template,
            generatedAt: projectData.generatedAt,
            fileCount: Object.keys(projectData.files).length,
            generator: 'Website Generator v2.0',

            // Theme info
            theme: {
                primaryColor: config.theme?.primaryColor,
                secondaryColor: config.theme?.secondaryColor,
                fontFamily: config.theme?.fontFamily
            },

            // Pages info
            pages: Object.entries(config.pages || {})
                .filter(([key, page]) => page.enabled)
                .map(([key, page]) => ({ key, title: page.title })),

            // Content info
            teamMembers: config.blocks?.about?.team?.members?.length || 0,
            contactInfo: config.blocks?.contact?.contactInfo ? 'Included' : 'Not included'
        };

        zip.file('project-info.json', JSON.stringify(projectInfo, null, 2));

        // Add comprehensive README
        const readme = generateReadme(config, projectInfo);
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
        const sanitizedName = (config.businessName || config.projectName || 'website')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${sanitizedName}_${timestamp}.zip`;

        // Return ZIP file
        return new Response(zipData, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': zipData.length.toString(),
                'X-Project-ID': projectId,
                'X-File-Count': `${Object.keys(projectData.files).length}`,
                'X-Zip-Size': `${zipSize}MB`,
                'X-Project-Name': config.businessName || config.projectName
            }
        });

    } catch (error) {
        console.error('🔥 Download error:', error);

        return Response.json({
            success: false,
            error: 'Download failed',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

function generateReadme(config, projectInfo) {
    return `# ${config.businessName || config.projectName}

**AI-Generated Website Project**

Generated on ${new Date(projectInfo.generatedAt).toLocaleDateString()} using advanced AI website generator.

## 📊 Project Information

- **Business Name**: ${config.businessName || config.projectName}
- **Industry**: ${config.industry || 'N/A'}
- **Template**: ${config.template || 'modern'}
- **Files Generated**: ${projectInfo.fileCount}
- **Generated**: ${new Date(projectInfo.generatedAt).toLocaleString()}

## 🎨 Theme Configuration

- **Primary Color**: ${projectInfo.theme?.primaryColor || 'Default'}
- **Secondary Color**: ${projectInfo.theme?.secondaryColor || 'Default'}  
- **Font Family**: ${projectInfo.theme?.fontFamily || 'Inter'}

## 📄 Pages Included

${projectInfo.pages.map(page => `- **${page.title}** (/${page.key === 'home' ? '' : page.key})`).join('\n')}

## 👥 Content Features

- **Team Members**: ${projectInfo.teamMembers} configured
- **Hero Section**: Custom messaging and branding
- **Contact Information**: ${projectInfo.contactInfo}
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

1. **Extract the ZIP file** to your desired location
2. **Open terminal** in the project directory
3. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`
5. **Open browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom theme
- **Components**: Professional UI Component Library
- **Responsive**: Mobile-first design approach
- **Performance**: Optimized for speed and SEO
- **Fonts**: Google Fonts integration
- **Icons**: Lucide React icon library

## 📁 Project Structure

\`\`\`
${config.projectName || config.businessName}/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout with theme
│   ├── page.js            # Home page
│   ├── globals.css        # Global styles with custom theme
│   └── [pages]/           # Generated pages
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── Header.js         # Site header with navigation
│   └── Footer.js         # Site footer
├── lib/                  # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
└── README.md            # This file
\`\`\`

## 🎯 Customization

This project is fully customizable:

- **Colors**: Modify theme colors in \`tailwind.config.js\`
- **Content**: Edit page content in component files
- **Styling**: Update styles in component files or \`globals.css\`
- **Navigation**: Modify menu items in \`Header.js\`
- **Team**: Update team information in the About page

## 📞 Support

This project was generated using AI. For general Next.js help:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs)

---

**Generated by AI Website Generator v2.0**  
Generated on: ${projectInfo.generatedAt}  
Project ID: ${projectInfo.name}
`;
}