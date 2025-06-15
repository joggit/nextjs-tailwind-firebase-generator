// File: app/api/vector/upload/route.js
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function POST(request) {
  try {
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const result = await vectorRAG.processAndVectorizeFile(file, {
      processedAt: new Date().toISOString()
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ Upload failed:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
