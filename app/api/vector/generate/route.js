// File: app/api/vector/generate/route.js

import { NextResponse } from 'next/server'
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function POST(request) {
  try {
    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { config, template } = await request.json()

    if (!config || !config.businessName) {
      return NextResponse.json({
        success: false,
        error: 'Config with business name is required'
      }, { status: 400 })
    }

    console.log(`🧠 Generating contextual content for: ${config.businessName}`)

    const content = await vectorRAG.generateContextualContent(config, template || 'modern')

    console.log(`✅ Contextual content generated for: ${config.businessName}`)

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        businessName: config.businessName,
        industry: config.industry,
        template: template || 'modern',
        vectorEnhanced: true,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Content generation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Content generation failed',
      details: error.message
    }, { status: 500 })
  }
}