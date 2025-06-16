// File: lib/vectorConfig.js

/**
 * Vector RAG System Configuration
 */
export const VectorConfig = {
  // OpenAI Settings
  openai: {
    defaultModel: 'gpt-3.5-turbo',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
    maxTokens: 2000,
    temperature: 0.7
  },

  // Vector Processing Settings
  processing: {
    chunkSize: parseInt(process.env.VECTOR_CHUNK_SIZE) || 1000,
    chunkOverlap: parseInt(process.env.VECTOR_CHUNK_OVERLAP) || 200,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    supportedTypes: [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },

  // Search Settings
  search: {
    defaultThreshold: parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD) || 0.7,
    maxResults: parseInt(process.env.VECTOR_MAX_RESULTS) || 10,
    enableCaching: process.env.ENABLE_VECTOR_CACHE === 'true'
  },

  // Firebase Collections
  collections: {
    companies: 'vector_companies',
    documents: 'vector_documents',
    embeddings: 'vector_embeddings',
    insights: 'industry_insights',
    cache: 'vector_cache'
  },

  // Feature Flags
  features: {
    enableAutoProcessing: process.env.ENABLE_AUTO_PROCESSING !== 'false',
    enableVectorStorage: process.env.ENABLE_VECTOR_STORAGE !== 'false',
    enableInsights: process.env.ENABLE_INSIGHTS !== 'false',
    debugMode: process.env.NODE_ENV === 'development'
  }
}