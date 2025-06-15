// Alternative API route using older Next.js syntax
// File: app/api/vector/upload-alt/route.js

export async function POST(req) {
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    const { VectorRAGService } = await import('@/lib/VectorRAGService.js')
    const vectorRAG = new VectorRAGService()

    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No file provided'
        }),
        { status: 400, headers }
      )
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes)`)

    // Process and vectorize the file
    const result = await vectorRAG.processAndVectorizeFile(file, {
      processedAt: new Date().toISOString(),
      apiEndpoint: '/api/vector/upload-alt'
    })

    console.log(`✅ File processed successfully: ${file.name}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'File processed and vectorized successfully',
        data: result
      }),
      { status: 200, headers }
    )

  } catch (error) {
    console.error('❌ File upload/processing failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'File processing failed',
        details: error.message
      }),
      { status: 500, headers }
    )
  }
}