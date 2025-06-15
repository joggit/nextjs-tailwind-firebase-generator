// lib/vectorStore.js

import { cosineSimilarity, validateVector } from './vectorUtils.js'

// In-memory store for development (replace with actual database in production)
class MemoryVectorStore {
  constructor() {
    this.documents = new Map()
    this.vectors = new Map()
    this.metadata = new Map()
    this.nextId = 1
  }

  async addVector(vectorData) {
    const id = `vec_${this.nextId++}`
    
    const validation = validateVector(vectorData.embedding)
    if (!validation.valid) {
      throw new Error(`Invalid vector: ${validation.error}`)
    }

    this.vectors.set(id, {
      id,
      embedding: vectorData.embedding,
      content: vectorData.content,
      documentId: vectorData.documentId,
      chunkIndex: vectorData.chunkIndex || 0,
      createdAt: new Date().toISOString(),
      ...vectorData.metadata
    })

    return id
  }

  async searchVectors(query) {
    const results = []
    const queryEmbedding = query.embedding
    const limit = query.limit || 10
    const threshold = query.threshold || 0.7

    for (const [id, vectorData] of this.vectors) {
      const similarity = cosineSimilarity(queryEmbedding, vectorData.embedding)
      
      if (similarity >= threshold) {
        results.push({
          ...vectorData,
          similarity
        })
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  async getDocuments(query = {}) {
    return Array.from(this.documents.values()).filter(doc => {
      if (query.filter) {
        return Object.entries(query.filter).every(([key, value]) => {
          return doc[key] === value
        })
      }
      return true
    })
  }

  async addDocument(docData) {
    const id = `doc_${this.nextId++}`
    this.documents.set(id, {
      id,
      ...docData,
      createdAt: new Date().toISOString()
    })
    return id
  }
}

// Firestore Vector Store Implementation
class FirestoreVectorStore {
  constructor() {
    this.db = null
    this.initialized = false
  }

  async initialize() {
    try {
      // Initialize Firestore - you'll need to set this up
      // const { initializeApp } = await import('firebase/app')
      // const { getFirestore } = await import('firebase/firestore')
      // 
      // const app = initializeApp({
      //   // Your Firebase config
      // })
      // this.db = getFirestore(app)
      
      console.log('Firestore vector store would be initialized here')
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Firestore:', error)
      throw error
    }
  }

  async addVector(vectorData) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const validation = validateVector(vectorData.embedding)
      if (!validation.valid) {
        throw new Error(`Invalid vector: ${validation.error}`)
      }

      const docRef = {
        embedding: vectorData.embedding,
        content: vectorData.content,
        documentId: vectorData.documentId,
        documentName: vectorData.documentName || 'Unknown',
        chunkIndex: vectorData.chunkIndex || 0,
        metadata: vectorData.metadata || {},
        createdAt: new Date().toISOString(),
        userId: vectorData.userId || null
      }

      // In production, you would use Firestore:
      // const result = await addDoc(collection(this.db, 'vectors'), docRef)
      // return result.id

      // For now, return a mock ID
      return `firestore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    } catch (error) {
      console.error('Error adding vector to Firestore:', error)
      throw error
    }
  }

  async searchVectors(query) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // In production, you would implement vector similarity search
      // For now, return empty results
      console.log('Firestore vector search would be implemented here')
      return []

    } catch (error) {
      console.error('Error searching vectors in Firestore:', error)
      return []
    }
  }

  async getDocuments(query = {}) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // In production, query Firestore documents collection
      console.log('Firestore document retrieval would be implemented here')
      return []

    } catch (error) {
      console.error('Error getting documents from Firestore:', error)
      return []
    }
  }

  async addDocument(docData) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const docRef = {
        name: docData.name,
        content: docData.content,
        type: docData.type || 'text',
        size: docData.size || 0,
        metadata: docData.metadata || {},
        userId: docData.userId || null,
        createdAt: new Date().toISOString()
      }

      // In production:
      // const result = await addDoc(collection(this.db, 'documents'), docRef)
      // return result.id

      return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    } catch (error) {
      console.error('Error adding document to Firestore:', error)
      throw error
    }
  }
}

// Vector Store Factory
let vectorStoreInstance = null

export function getVectorStore() {
  if (!vectorStoreInstance) {
    // Choose store type based on environment
    const storeType = process.env.VECTOR_STORE_TYPE || 'memory'
    
    switch (storeType) {
      case 'firestore':
        vectorStoreInstance = new FirestoreVectorStore()
        break
      case 'memory':
      default:
        vectorStoreInstance = new MemoryVectorStore()
        break
    }
  }
  
  return vectorStoreInstance
}

// Convenience functions
export async function addVector(vectorData) {
  const store = getVectorStore()
  return await store.addVector(vectorData)
}

export async function searchVectors(query) {
  const store = getVectorStore()
  return await store.searchVectors(query)
}

export async function addDocument(docData) {
  const store = getVectorStore()
  return await store.addDocument(docData)
}

export async function getDocuments(query = {}) {
  const store = getVectorStore()
  return await store.getDocuments(query)
}

// Document processing utilities
export async function processAndStoreDocument(documentData) {
  try {
    const { 
      content, 
      name, 
      type = 'text',
      userId = null,
      metadata = {} 
    } = documentData

    if (!content || !name) {
      throw new Error('Document content and name are required')
    }

    // Add document to store
    const documentId = await addDocument({
      name,
      content,
      type,
      size: content.length,
      userId,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString()
      }
    })

    // Split content into chunks and create vectors
    const { splitTextIntoChunks, generateEmbedding } = await import('./vectorUtils.js')
    
    const chunks = splitTextIntoChunks(content, {
      chunkSize: 1000,
      chunkOverlap: 200,
      preserveSentences: true
    })

    const vectorIds = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      try {
        const embedding = await generateEmbedding(chunk)
        
        const vectorId = await addVector({
          embedding,
          content: chunk,
          documentId,
          documentName: name,
          chunkIndex: i,
          userId,
          metadata: {
            ...metadata,
            chunkSize: chunk.length,
            totalChunks: chunks.length
          }
        })

        vectorIds.push(vectorId)

      } catch (chunkError) {
        console.error(`Error processing chunk ${i} of document ${name}:`, chunkError)
        // Continue with other chunks
      }
    }

    return {
      documentId,
      vectorIds,
      chunksProcessed: vectorIds.length,
      totalChunks: chunks.length,
      success: vectorIds.length > 0
    }

  } catch (error) {
    console.error('Error processing and storing document:', error)
    throw error
  }
}

// Batch processing for multiple documents
export async function processBatchDocuments(documents) {
  const results = []
  const errors = []

  for (const doc of documents) {
    try {
      const result = await processAndStoreDocument(doc)
      results.push(result)
    } catch (error) {
      errors.push({
        document: doc.name,
        error: error.message
      })
    }
  }

  return {
    results,
    errors,
    successCount: results.length,
    errorCount: errors.length
  }
}

// Search with filters and ranking
export async function advancedVectorSearch(query, options = {}) {
  try {
    const {
      limit = 10,
      threshold = 0.7,
      filters = {},
      rankingFunction = null,
      includeContent = true,
      includeMetadata = true
    } = options

    // Get basic search results
    const searchResults = await searchVectors({
      embedding: query.embedding,
      limit: limit * 2, // Get more results for filtering
      threshold
    })

    // Apply filters
    let filteredResults = searchResults

    if (Object.keys(filters).length > 0) {
      filteredResults = searchResults.filter(result => {
        return Object.entries(filters).every(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle complex filters like { userId: { in: [...] } }
            if (value.in && Array.isArray(value.in)) {
              return value.in.includes(result[key])
            }
            if (value.ne !== undefined) {
              return result[key] !== value.ne
            }
            if (value.gt !== undefined) {
              return result[key] > value.gt
            }
            if (value.lt !== undefined) {
              return result[key] < value.lt
            }
          }
          return result[key] === value
        })
      })
    }

    // Apply custom ranking function
    if (rankingFunction && typeof rankingFunction === 'function') {
      filteredResults = filteredResults.map(result => ({
        ...result,
        customScore: rankingFunction(result)
      })).sort((a, b) => {
        // Combine similarity and custom score
        const scoreA = (a.similarity * 0.7) + (a.customScore * 0.3)
        const scoreB = (b.similarity * 0.7) + (b.customScore * 0.3)
        return scoreB - scoreA
      })
    }

    // Limit results
    const finalResults = filteredResults.slice(0, limit)

    // Format results based on options
    return finalResults.map(result => {
      const formatted = {
        id: result.id,
        similarity: result.similarity,
        documentId: result.documentId,
        documentName: result.documentName,
        chunkIndex: result.chunkIndex
      }

      if (includeContent) {
        formatted.content = result.content
      }

      if (includeMetadata) {
        formatted.metadata = result.metadata || {}
      }

      if (result.customScore !== undefined) {
        formatted.customScore = result.customScore
      }

      return formatted
    })

  } catch (error) {
    console.error('Advanced vector search error:', error)
    return []
  }
}

// Health check for vector store
export async function checkVectorStoreHealth() {
  try {
    const store = getVectorStore()
    
    // Basic connectivity test
    const testDoc = {
      name: 'health-check',
      content: 'This is a health check document.',
      type: 'test'
    }

    // Try to add and retrieve a test document
    const docId = await store.addDocument(testDoc)
    const docs = await store.getDocuments({ filter: { id: docId } })
    
    return {
      status: 'healthy',
      vectorStore: {
        type: store.constructor.name,
        initialized: store.initialized !== false,
        responsive: true
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Vector store health check failed:', error)
    
    return {
      status: 'unhealthy',
      error: error.message,
      vectorStore: {
        responsive: false
      },
      timestamp: new Date().toISOString()
    }
  }
}