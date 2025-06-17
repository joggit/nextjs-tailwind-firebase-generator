// Download Route for Generated Projects
// File: app/api/download/route.js

import JSZip from 'jszip';

export async function POST(request) {
  try {
    const body = await request.json();
    const { project } = body;

    console.log('📦 Processing download request...');

    let projectData = null;

    // Try to get project from temporary storage first
    if (project?.id && typeof global !== 'undefined' && global.tempProjects) {
      projectData = global.tempProjects[project.id];
      console.log(`🔍 Found project in temporary storage: ${project.id}`);
    }

    // Fall back to the project data passed in the request
    if (!projectData) {
      projectData = project;
      console.log('📄 Using project data from request');
    }

    if (!projectData || !projectData.files) {
      return new Response(
        JSON.stringify({
          error: 'No project data found. Please regenerate the project.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📊 Creating ZIP with ${Object.keys(projectData.files).length} files...`);

    // Create ZIP file
    const zip = new JSZip();

    // Add all files to ZIP
    for (const [filePath, content] of Object.entries(projectData.files)) {
      // Ensure we have valid content
      const fileContent = typeof content === 'string' ? content : String(content || '');
      
      // Add file to ZIP
      zip.file(filePath, fileContent);
    }

    // Add a README.md with project information
    const readme = `# ${projectData.name || 'Generated Project'}

## Project Information
- **Type**: ${projectData.type || 'Ecommerce Website'}
- **Generated**: ${new Date().toISOString()}
- **Files**: ${Object.keys(projectData.files).length}

## Getting Started

1. Extract this ZIP file to your desired location
2. Open a terminal in the project directory
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

This is a Next.js project with the following key directories:

- \`app/\` - App Router pages and layouts
- \`components/\` - Reusable React components
- \`lib/\` - Utility functions and configurations
- \`public/\` - Static assets

## Features

${projectData.config?.enableEcommerce ? '- ✅ E-commerce functionality' : ''}
${projectData.config?.enableCheckout ? '- ✅ Shopping cart and checkout' : ''}
${projectData.config?.enableUserAccounts ? '- ✅ User account management' : ''}
${projectData.config?.enableWishlist ? '- ✅ Wishlist functionality' : ''}

## Customization

This project was generated with AI assistance. Feel free to modify and customize it according to your needs.

## Support

For questions about this generated project, please refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
`;

    zip.file('README.md', readme);

    // Generate ZIP file
    console.log('🔄 Generating ZIP file...');
    const zipData = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    console.log(`✅ ZIP file generated (${(zipData.length / 1024 / 1024).toFixed(2)}MB)`);

    // Clean up temporary storage
    if (projectData.id && typeof global !== 'undefined' && global.tempProjects) {
      delete global.tempProjects[projectData.id];
      console.log(`🗑️ Cleaned up temporary project: ${projectData.id}`);
    }

    // Return ZIP file
    return new Response(zipData, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${(projectData.name || 'website').replace(/[^a-zA-Z0-9]/g, '_')}.zip"`,
        'Content-Length': zipData.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Download failed:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to create download',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Download endpoint - Use POST with project data',
      usage: 'POST /api/download with { project: { ... } }',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}