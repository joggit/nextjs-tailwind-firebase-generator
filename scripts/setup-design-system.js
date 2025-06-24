// File: scripts/setup-design-system.js

import { DesignService } from '../lib/services/DesignService.js'

const designService = new DesignService()

/**
 * Setup script to initialize Firebase design system
 */
async function setupDesignSystem() {
  try {
    console.log('🚀 Starting Design System Setup...')
    
    // Initialize the design service
    await designService.initialize()
    console.log('✅ Design Service initialized')
    
    // Check if we need to seed data
    const existingThemes = await designService.getThemes()
    
    if (existingThemes.length === 0) {
      console.log('📦 No existing data found, seeding defaults...')
      await designService.seedAllDefaults()
      console.log('✅ Default design system data seeded')
    } else {
      console.log(`ℹ️ Found ${existingThemes.length} existing themes, skipping seed`)
    }
    
    // Verify setup
    await verifySetup()
    
    console.log('🎉 Design System setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Design System setup failed:', error)
    process.exit(1)
  }
}

/**
 * Verify that the design system is properly configured
 */
async function verifySetup() {
  console.log('🔍 Verifying setup...')
  
  const options = await designService.getAllDesignOptions()
  
  console.log('📊 Design System Summary:')
  console.log(`  • Themes: ${options.themes.length}`)
  console.log(`  • Layouts: ${options.layouts.length}`)
  console.log(`  • Hero Styles: ${options.heroStyles.length}`)
  console.log(`  • Graphics: ${options.graphics.length}`)
  
  // List available themes
  if (options.themes.length > 0) {
    console.log('🎨 Available Themes:')
    options.themes.forEach(theme => {
      console.log(`  • ${theme.name} (${theme.id})`)
    })
  }
  
  // List available layouts
  if (options.layouts.length > 0) {
    console.log('📐 Available Layouts:')
    options.layouts.forEach(layout => {
      console.log(`  • ${layout.name} (${layout.id})`)
    })
  }
  
  return true
}

/**
 * Reset the design system (useful for development)
 */
async function resetDesignSystem() {
  try {
    console.log('⚠️ Resetting Design System...')
    
    await designService.initialize()
    
    // Note: In a real implementation, you'd need to delete existing data
    // For now, we'll just reseed
    await designService.seedAllDefaults()
    
    console.log('✅ Design System reset completed')
    
  } catch (error) {
    console.error('❌ Design System reset failed:', error)
    process.exit(1)
  }
}

/**
 * Export design system configuration
 */
async function exportDesignSystem(outputPath = './design-system-export.json') {
  try {
    console.log('📤 Exporting Design System...')
    
    await designService.initialize()
    const options = await designService.getAllDesignOptions()
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...options
    }
    
    const fs = await import('fs')
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))
    
    console.log(`✅ Design System exported to ${outputPath}`)
    
  } catch (error) {
    console.error('❌ Design System export failed:', error)
    process.exit(1)
  }
}

// Handle command line arguments
const command = process.argv[2]

switch (command) {
  case 'setup':
    setupDesignSystem()
    break
  case 'reset':
    resetDesignSystem()
    break
  case 'export':
    const outputPath = process.argv[3]
    exportDesignSystem(outputPath)
    break
  case 'verify':
    designService.initialize().then(verifySetup)
    break
  default:
    console.log(`
Design System Setup Utility

Usage:
  node scripts/setup-design-system.js setup   - Initialize design system
  node scripts/setup-design-system.js reset   - Reset design system
  node scripts/setup-design-system.js export  - Export configuration
  node scripts/setup-design-system.js verify  - Verify setup

Examples:
  node scripts/setup-design-system.js setup
  node scripts/setup-design-system.js export ./my-design-system.json
`)
    process.exit(0)
}
// Ensure we exit cleanly on unhandled rejections