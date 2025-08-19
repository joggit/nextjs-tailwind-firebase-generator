// lib/generator/ProjectGenerator.js (Updated)
import TemplateLoader from './TemplateLoader.js';
import TemplatePathManager from './TemplatePathManager.js';

export class ProjectGenerator {
    constructor() {
        this.templateLoader = new TemplateLoader();
        this.pathManager = new TemplatePathManager();
    }

    async generateProject(config) {
        console.log(`🚀 Generating project: ${config.businessName}`);

        try {
            // Validate and process config first
            // const config = ConfigValidator.validateAndProcess(rawConfig);

            // Use TemplatePathManager to get appropriate paths
            const templatePaths = this.pathManager.getConditionalPaths(config);

            // Generate files with processed config
            const files = await this.generateFiles(templatePaths, config);

            const project = {
                id: `${config.template}_${Date.now()}`,
                name: config.businessName,
                type: config.template,
                config: config,
                files: files,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    fileCount: Object.keys(files).length,
                    configProcessed: true
                }
            };

            console.log(`✅ Generated ${Object.keys(files).length} files`);
            return project;
        } catch (error) {
            console.error('❌ Generation failed:', error);
            throw error;
        }
    }

    async generateFiles(templatePaths, config) {
        const files = {};

        for (const [outputPath, templatePath] of Object.entries(templatePaths)) {
            try {
                console.log(`🔄 Processing: ${outputPath} from ${templatePath}`);
                files[outputPath] = await this.templateLoader.loadTemplate(templatePath, config);
                console.log(`✅ Generated: ${outputPath}`);
            } catch (error) {
                console.error(`❌ Failed: ${templatePath}`, error);
                files[outputPath] = `// Error generating ${outputPath}: ${error.message}\n// Template: ${templatePath}`;
            }
        }

        return files;
    }
}

export default ProjectGenerator;