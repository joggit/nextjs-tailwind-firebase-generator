// File: app/api/vector/documents/[documentId]/route.js
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function DELETE(request, { params }) {
  try {
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { documentId } = params
    if (!documentId) {
      return Response.json({ success: false, error: 'Document ID required' }, { status: 400 })
    }

    await vectorRAG.deleteDocument(documentId)
    return Response.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    console.error('❌ Delete failed:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { documentId } = params
    if (!documentId) {
      return Response.json({ success: false, error: 'Document ID required' }, { status: 400 })
    }

    const document = await vectorRAG.getDocument(documentId)
    if (!document) {
      return Response.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    return Response.json({ success: true, document })
  } catch (error) {
    console.error('❌ Get document failed:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}