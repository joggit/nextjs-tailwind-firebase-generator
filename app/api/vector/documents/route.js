// File: app/api/vector/documents/route.js
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function GET(request) {
  try {
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const documents = await vectorRAG.getDocuments({ limit: 50 })
    return Response.json({ success: true, documents })
  } catch (error) {
    console.error('❌ Failed to fetch documents:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}