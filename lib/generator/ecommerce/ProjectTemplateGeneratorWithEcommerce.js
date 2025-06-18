// lib/generator/ecommerce/ProjectTemplateGeneratorWithEcommerce.js
import ProjectTemplateGenerator from '../base/ProjectTemplateGenerator.js';
import { loadEcommerceTemplates, loadBaseTemplates } from './EcommerceTemplateConfig.js';

class ProjectTemplateGeneratorWithEcommerce extends ProjectTemplateGenerator {
  constructor() {
    super();
    this.ecommerceGenerator = new EcommercePagesGenerator();
  }

  async generateProject(config) {
    console.log(`🚀 Generating ecommerce project: ${config.businessName}`);
    
    const project = {
      id: `ecommerce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: 'ecommerce',
      config,
      files: {},
      generationMetadata: {
        projectType: 'ecommerce',
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now()
      }
    };

    try {
      console.log('📁 Loading template files...');
      
      // Load base templates
      const baseFiles = await loadBaseTemplates(config);
      console.log(`✅ Loaded ${Object.keys(baseFiles).length} base templates`);
      
      // Load ecommerce templates
      const ecommerceFiles = await loadEcommerceTemplates(config);
      console.log(`✅ Loaded ${Object.keys(ecommerceFiles).length} ecommerce templates`);
      
      // Generate pages using existing page generator
      const pageFiles = await this.pagesGenerator.generatePages(config.projectId, config);
      console.log(`✅ Generated ${Object.keys(pageFiles).length} pages`);
      
      // Combine all files
      project.files = {
        ...baseFiles,
        ...ecommerceFiles,
        ...pageFiles
      };
      
      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Ecommerce project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);
      
      return project;

    } catch (error) {
      console.error('❌ Error generating ecommerce project:', error);
      throw new Error(`Ecommerce project generation failed: ${error.message}`);
    }
  }
}

export default ProjectTemplateGeneratorWithEcommerce;