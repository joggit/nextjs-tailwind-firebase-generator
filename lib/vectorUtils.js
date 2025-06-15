// Vector Utilities and Configuration
// File: lib/vectorUtils.js

/**
 * Utility functions for vector operations
 */
export class VectorUtils {
  
  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  /**
   * Calculate Euclidean distance between two vectors
   */
  static euclideanDistance(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return Infinity
    }

    let sum = 0
    for (let i = 0; i < vectorA.length; i++) {
      sum += Math.pow(vectorA[i] - vectorB[i], 2)
    }
    return Math.sqrt(sum)
  }

  /**
   * Normalize a vector to unit length
   */
  static normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude === 0 ? vector : vector.map(val => val / magnitude)
  }

  /**
   * Generate a random vector for testing purposes
   */
  static generateRandomVector(dimension = 1536) {
    return Array.from({ length: dimension }, () => (Math.random() - 0.5) * 2)
  }

  /**
   * Chunk text into smaller pieces with overlap
   */
  static chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = []
    let start = 0
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunk = text.slice(start, end)
      
      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastSentence = chunk.lastIndexOf('.')
        const lastNewline = chunk.lastIndexOf('\n')
        const breakPoint = Math.max(lastSentence, lastNewline)
        
        if (breakPoint > chunkSize * 0.7) {
          chunk = chunk.slice(0, breakPoint + 1)
          start = start + breakPoint + 1 - overlap
        } else {
          start = end - overlap
        }
      } else {
        chunks.push(chunk.trim())
        break
      }
      
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim())
      }
      
      if (start <= 0) start = end - overlap
    }
    
    return chunks.filter(chunk => chunk.length > 0)
  }

  /**
   * Extract text from different file types
   */
  static async extractTextFromFile(file) {
    const fileType = file.type
    
    try {
      if (fileType.startsWith('text/')) {
        return await file.text()
      }
      
      if (fileType === 'application/json') {
        const jsonText = await file.text()
        const jsonData = JSON.parse(jsonText)
        return JSON.stringify(jsonData, null, 2)
      }
      
      if (fileType.includes('csv')) {
        const csvText = await file.text()
        return csvText.replace(/,/g, ' | ') // Convert CSV to readable format
      }
      
      // For other file types, try to read as text
      return await file.text()
    } catch (error) {
      console.warn(`Failed to extract text from ${file.name}:`, error)
      return `File: ${file.name} (${file.type})`
    }
  }

  /**
   * Validate vector dimensions
   */
  static validateVector(vector, expectedDimension = 1536) {
    if (!Array.isArray(vector)) return false
    if (vector.length !== expectedDimension) return false
    return vector.every(val => typeof val === 'number' && !isNaN(val))
  }

  /**
   * Clean and preprocess text for embedding
   */
  static preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\w\s\.,!?;:-]/g, '')  // Remove special characters
      .trim()
      .toLowerCase()
  }

  /**
   * Calculate statistics for a collection of vectors
   */
  static calculateVectorStats(vectors) {
    if (!vectors || vectors.length === 0) {
      return { count: 0, avgMagnitude: 0, dimensions: 0 }
    }

    const dimensions = vectors[0].length
    let totalMagnitude = 0
    
    vectors.forEach(vector => {
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
      totalMagnitude += magnitude
    })

    return {
      count: vectors.length,
      dimensions: dimensions,
      avgMagnitude: totalMagnitude / vectors.length,
      totalSize: vectors.length * dimensions
    }
  }

  /**
   * Find the most similar vectors to a query vector
   */
  static findMostSimilar(queryVector, vectorCollection, topK = 5) {
    const similarities = vectorCollection.map((item, index) => ({
      index,
      item,
      similarity: this.cosineSimilarity(queryVector, item.vector || item.embedding)
    }))

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Create a simple hash from text for caching
   */
  static simpleHash(text) {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Validate environment configuration
   */
  static validateEnvironment() {
    const required = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'OPENAI_API_KEY'
    ]

    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing)
      return false
    }

    return true
  }

  /**
   * Generate vector embedding cache key
   */
  static generateCacheKey(text, model = 'text-embedding-ada-002') {
    const textHash = this.simpleHash(text)
    return `embedding_${model}_${textHash}`
  }
}