// File: app/api/vector/search/route.js
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function POST(request) {
  try {
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { query, limit = 10, threshold = 0.7 } = await request.json()
    
    if (!query) {
      return Response.json({ success: false, error: 'Query required' }, { status: 400 })
    }

    const results = await vectorRAG.searchSimilarContent(query, { limit, threshold })
    return Response.json({ success: true, query, results })
  } catch (error) {
    console.error('❌ Search failed:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
