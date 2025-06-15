// File Download Utility
// Add this to your project to enable file downloads

export class FileDownloadHelper {
  /**
   * Create and download a zip file containing all generated project files
   * @param {Object} project - The generated project object with files
   */
  static async downloadProjectAsZip(project) {
    try {
      // Import JSZip dynamically (you'll need to install it: npm install jszip)
      const JSZip = (await import('jszip')).default;
      
      const zip = new JSZip();
      
      // Add each file to the zip
      Object.entries(project.files).forEach(([filePath, content]) => {
        zip.file(filePath, content);
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('✅ Project downloaded successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Alternative method: Download individual files
   * @param {Object} files - Object containing file paths and contents
   * @param {string} projectName - Name of the project
   */
  static downloadIndividualFiles(files, projectName) {
    try {
      Object.entries(files).forEach(([filePath, content], index) => {
        setTimeout(() => {
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          link.href = url;
          link.download = filePath.replace(/\//g, '_'); // Replace slashes with underscores
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
        }, index * 100); // Small delay between downloads
      });
      
      console.log(`✅ ${Object.keys(files).length} files downloaded!`);
      
    } catch (error) {
      console.error('❌ Individual file download failed:', error);
      throw error;
    }
  }

  /**
   * Create a downloadable project structure as text
   * @param {Object} project - The generated project
   */
  static downloadProjectStructure(project) {
    try {
      let structure = `# ${project.name} - Project Structure\n\n`;
      structure += `Template: ${project.template}\n`;
      structure += `Generated: ${new Date().toISOString()}\n`;
      structure += `Total Files: ${Object.keys(project.files).length}\n\n`;
      
      structure += `## File Structure\n\`\`\`\n`;
      
      const sortedFiles = Object.keys(project.files).sort();
      sortedFiles.forEach(filePath => {
        structure += `${filePath}\n`;
      });
      
      structure += `\`\`\`\n\n`;
      
      structure += `## File Contents\n\n`;
      
      Object.entries(project.files).forEach(([filePath, content]) => {
        structure += `### ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
      });
      
      const blob = new Blob([structure], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-structure.md`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('✅ Project structure downloaded!');
      
    } catch (error) {
      console.error('❌ Structure download failed:', error);
      throw error;
    }
  }
}