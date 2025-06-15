// File: app/api/vector/health/route.js
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function GET() {
  try {
    let initialized = vectorRAG.isInitialized()
    
    if (!initialized) {
      try {
        await vectorRAG.initialize()
        initialized = true
      } catch (error) {
        console.warn('Initialization failed:', error)
      }
    }

    const status = {
      status: initialized ? 'healthy' : 'unhealthy',
      vectorService: {
        initialized,
        firestore: !!vectorRAG.db,
        storage: !!vectorRAG.storage,
        openai: !!vectorRAG.openai
      },
      environment: {
        hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        hasOpenAIKey: !!(process.env.OPENAI_API_KEY)
      }
    }

    return Response.json(status)
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 })
  }
}