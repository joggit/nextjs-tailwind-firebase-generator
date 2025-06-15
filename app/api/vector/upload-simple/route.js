// Quick Fix Upload API Route
// File: app/api/vector/upload-simple/route.js

import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function POST(request) {
  try {
    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const metadataString = formData.get('metadata')
    
    if (!file) {
      return Response.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    // Parse metadata
    let metadata = {}
    try {
      if (metadataString) {
        metadata = JSON.parse(metadataString)
      }
    } catch (error) {
      console.warn('Invalid metadata JSON:', error)
    }

    // Add processing metadata
    metadata.processedAt = new Date().toISOString()
    metadata.apiEndpoint = '/api/vector/upload-simple'

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes)`)

    // Process and vectorize the file
    const result = await vectorRAG.processAndVectorizeFile(file, metadata)

    console.log(`✅ File processed successfully: ${file.name}`)

    return Response.json({
      success: true,
      message: 'File processed and vectorized successfully',
      data: result
    })

  } catch (error) {
    console.error('❌ File upload/processing failed:', error)
    
    return Response.json(
      {
        success: false,
        error: 'File processing failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
