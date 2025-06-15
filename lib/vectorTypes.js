// File: lib/vectorTypes.js

/**
 * TypeScript-like type definitions for vector operations
 */

/**
 * @typedef {Object} VectorDocument
 * @property {string} id - Unique document identifier
 * @property {string} fileName - Original file name
 * @property {string} fileType - MIME type
 * @property {number} fileSize - File size in bytes
 * @property {string} downloadURL - Firebase Storage URL
 * @property {string} storagePath - Storage path
 * @property {string} textContent - Extracted text content
 * @property {number} chunkCount - Number of vector chunks
 * @property {Object} metadata - Additional metadata
 * @property {Date} createdAt - Creation timestamp
 * @property {boolean} vectorized - Whether file is vectorized
 */

/**
 * @typedef {Object} VectorEmbedding
 * @property {string} id - Unique embedding identifier
 * @property {string} documentId - Parent document ID
 * @property {string} chunkId - Unique chunk identifier
 * @property {number} chunkIndex - Chunk position
 * @property {string} text - Text content
 * @property {number[]} embedding - Vector embedding array
 * @property {Object} metadata - Additional metadata
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} VectorSearchResult
 * @property {string} id - Result identifier
 * @property {string} documentId - Source document ID
 * @property {string} text - Matching text content
 * @property {number} similarity - Similarity score (0-1)
 * @property {number} chunkIndex - Source chunk index
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} CompanyData
 * @property {string} businessName - Company name
 * @property {string} industry - Industry sector
 * @property {string} businessType - Type of business
 * @property {string} targetAudience - Target audience
 * @property {string} businessDescription - Description
 * @property {string[]} keyServices - List of services
 * @property {number[]} embedding - Company vector embedding
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} IndustryInsights
 * @property {number} totalCompanies - Total companies analyzed
 * @property {Array<[string, number]>} topServices - Most popular services
 * @property {Array<[string, number]>} popularTemplates - Popular templates
 * @property {Array<[string, number]>} businessTypes - Business type distribution
 * @property {Date} generatedAt - Insights generation time
 */

// Export types for JSDoc usage
export const VectorTypes = {
  // This is mainly for documentation purposes
  // In a TypeScript project, these would be actual interfaces
}