import JSZip from 'jszip';
import ProjectGenerator from '@/lib/generator/ProjectGenerator.js';

let projectGenerator = null;

async function initializeServices() {
    if (!projectGenerator) {
        projectGenerator = new ProjectGenerator();
    }
    return { projectGenerator };
}

export async function POST(req) {
    try {
        const { projectGenerator } = await initializeServices();
        const config = await req.json();
        if (!config || !config.businessName || !config.businessType) {
            return new Response(JSON.stringify({ error: 'Invalid configuration' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const project = await projectGenerator.generateProject(config);
        // Create ZIP from project.files
        const zip = new JSZip();
        for (const [filename, content] of Object.entries(project.files)) {
            zip.file(filename, content);
        }
        const zipData = await zip.generateAsync({ type: 'nodebuffer' });

        return new Response(zipData, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${project.name}.zip"`,
            },
            body: zipData,
        });
    } catch (error) {
        console.error('❌ Project generation failed:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
