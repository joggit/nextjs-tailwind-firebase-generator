// lib/config.js - Configuration Management

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: process.env.VECTOR_EMBEDDING_MODEL || 'text-embedding-ada-002',
    chatModel: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },

  // Vector Store Configuration
  vectorStore: {
    type: process.env.VECTOR_STORE_TYPE || 'memory',
    chunkSize: parseInt(process.env.VECTOR_CHUNK_SIZE) || 1000,
    chunkOverlap: parseInt(process.env.VECTOR_CHUNK_OVERLAP) || 200,
    similarityThreshold: parseFloat(process.env.VECTOR_SIMILARITY_THRESHOLD) || 0.7,
    maxSearchResults: 10
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || '.txt,.md,.pdf,.doc,.docx').split(','),
    maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10
  },

  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development'
  }
}

// Validation function
export function validateConfig() {
  const errors = []

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required')
  }

  if (config.vectorStore.type === 'firestore') {
    if (!config.firebase.projectId) {
      errors.push('FIREBASE_PROJECT_ID is required for Firestore vector store')
    }
    if (!config.firebase.clientEmail) {
      errors.push('FIREBASE_CLIENT_EMAIL is required for Firestore vector store')
    }
    if (!config.firebase.privateKey) {
      errors.push('FIREBASE_PRIVATE_KEY is required for Firestore vector store')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`)
  }

  return true
}
