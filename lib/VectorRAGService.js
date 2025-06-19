// Firebase Vector RAG Service with File Vectorization
// File: lib/VectorRAGService.js

import { initializeFirebase } from '@/lib/firebase'
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore'
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { OpenAI } from 'openai'

export class VectorRAGService {
  constructor() {
    this.initialized = false
    this.db = null
    this.storage = null
    this.openai = null
    this.collections = {
      companies: 'vector_companies',
      documents: 'vector_documents',
      embeddings: 'vector_embeddings',
      insights: 'industry_insights'
    }
  }

  async initialize() {
    try {
      const app = initializeFirebase()
      this.db = getFirestore(app)
      this.storage = getStorage(app)

      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })
      }

      this.initialized = true
      console.log('✅ Firebase Vector RAG Service initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Vector RAG Service:', error)
      throw error
    }
  }

  isInitialized() {
    return this.initialized
  }

  // ==================== EMBEDDING GENERATION ====================

  async generateEmbedding(text) {
    if (!this.openai) {
      console.warn('⚠️ OpenAI not available, using mock embedding')
      return this.generateMockEmbedding(text)
    }

    try {
      const response = await this.openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        input: text
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('❌ Embedding generation failed:', error)
      return this.generateMockEmbedding(text)
    }
  }

  generateMockEmbedding(text) {
    // Simple hash-based mock embedding for development
    const hash = this.simpleHash(text)
    const embedding = new Array(1536).fill(0).map((_, i) => 
      Math.sin(hash + i) * Math.cos(hash * i) * 0.1
    )
    return embedding
  }

  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  // ==================== FILE PROCESSING ====================

  async processAndVectorizeFile(file, metadata = {}) {
    try {
      console.log(`📄 Processing file: ${file.name}`)
      
      // Upload file to Firebase Storage
      const fileRef = ref(this.storage, `documents/${Date.now()}_${file.name}`)
      const uploadResult = await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(uploadResult.ref)

      // Extract text content
      const textContent = await this.extractTextFromFile(file)
      
      // Chunk the content
      const chunks = this.chunkText(textContent, 1000, 200)
      
      // Generate embeddings for each chunk
      const vectorizedChunks = []
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = await this.generateEmbedding(chunk)
        
        vectorizedChunks.push({
          text: chunk,
          embedding: embedding,
          chunkIndex: i,
          chunkId: `${uploadResult.ref.name}_chunk_${i}`
        })
      }

      // Store document metadata and vectors in Firestore
      const docData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadURL: downloadURL,
        storagePath: uploadResult.ref.fullPath,
        textContent: textContent,
        chunkCount: chunks.length,
        metadata: metadata,
        createdAt: new Date(),
        vectorized: true
      }

      const docRef = await addDoc(collection(this.db, this.collections.documents), docData)
      
      // Store embeddings
      for (const chunk of vectorizedChunks) {
        await addDoc(collection(this.db, this.collections.embeddings), {
          documentId: docRef.id,
          chunkId: chunk.chunkId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding: chunk.embedding,
          metadata: metadata,
          createdAt: new Date()
        })
      }

      console.log(`✅ File vectorized: ${file.name} (${vectorizedChunks.length} chunks)`)
      
      return {
        documentId: docRef.id,
        downloadURL: downloadURL,
        chunkCount: vectorizedChunks.length,
        textLength: textContent.length
      }
    } catch (error) {
      console.error('❌ File vectorization failed:', error)
      throw error
    }
  }

  async extractTextFromFile(file) {
    const fileType = file.type
    
    if (fileType.startsWith('text/')) {
      return await file.text()
    }
    
    if (fileType === 'application/pdf') {
      // For PDF files, you might want to use a library like pdf-parse
      console.warn('⚠️ PDF processing not implemented, using filename as content')
      return `PDF Document: ${file.name}`
    }
    
    if (fileType.includes('word') || fileType.includes('document')) {
      console.warn('⚠️ Word document processing not implemented, using filename as content')
      return `Document: ${file.name}`
    }
    
    // Fallback: try to read as text
    try {
      return await file.text()
    } catch (error) {
      console.warn('⚠️ Could not extract text, using filename as content')
      return `File: ${file.name}`
    }
  }

  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = []
    let start = 0
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      const chunk = text.slice(start, end)
      
      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastSentence = chunk.lastIndexOf('.')
        if (lastSentence > chunkSize * 0.7) {
          chunks.push(chunk.slice(0, lastSentence + 1))
          start = start + lastSentence + 1 - overlap
        } else {
          chunks.push(chunk)
          start = end - overlap
        }
      } else {
        chunks.push(chunk)
        break
      }
      
      if (start <= 0) start = end - overlap
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0)
  }

  // ==================== VECTOR SEARCH ====================

  async searchSimilarContent(query, options = {}) {
    try {
      const {
        limit: searchLimit = 5,
        threshold = 0.7,
        metadata = {}
      } = options

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query)
      
      // Get all embeddings (in production, you'd use a vector database)
      const embeddingsQuery = query(
        collection(this.db, this.collections.embeddings),
        orderBy('createdAt', 'desc'),
        limit(100) // Adjust based on your dataset size
      )
      
      const embeddingsSnapshot = await getDocs(embeddingsQuery)
      const allEmbeddings = embeddingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Calculate similarities
      const similarities = allEmbeddings.map(item => ({
        ...item,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
      }))

      // Filter and sort by similarity
      const results = similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, searchLimit)

      console.log(`🔍 Found ${results.length} similar content pieces for query: "${query}"`)
      
      return results
    } catch (error) {
      console.error('❌ Vector search failed:', error)
      return []
    }
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // ==================== COMPANY DATA MANAGEMENT ====================

  async storeCompanyData(companyData) {
    try {
      // Generate embedding for company description
      const companyText = `${companyData.businessName} ${companyData.industry} ${companyData.businessDescription} ${(companyData.keyServices || []).join(' ')}`
      const embedding = await this.generateEmbedding(companyText)

      const docData = {
        ...companyData,
        embedding: embedding,
        textRepresentation: companyText,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(this.db, this.collections.companies), docData)
      console.log(`✅ Company data stored: ${companyData.businessName}`)
      
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to store company data:', error)
      throw error
    }
  }

  async findSimilarCompanies(companyData, limit = 5) {
    try {
      const queryText = `${companyData.industry} ${companyData.businessType} ${companyData.targetAudience}`
      const results = await this.searchSimilarContent(queryText, { 
        limit,
        threshold: 0.6 
      })
      
      return results
    } catch (error) {
      console.error('❌ Failed to find similar companies:', error)
      return []
    }
  }

  // ==================== CONTENT GENERATION ====================

  async generateContextualContent(config, template) {
    try {
      console.log(`🧠 Generating contextual content for ${config.businessName}`)
      
      // Find similar companies for context
      const similarCompanies = await this.findSimilarCompanies(config, 3)
      
      // Search for relevant documents
      const relevantDocs = await this.searchSimilarContent(
        `${config.industry} ${config.businessType} best practices`, 
        { limit: 3 }
      )

      // Generate content based on context
      const content = await this.generateContent(config, similarCompanies, relevantDocs)
      
      // Store the generated content
      await this.storeCompanyData({
        ...config,
        generatedContent: content,
        template: template,
        vectorEnhanced: true
      })

      console.log(`✅ Contextual content generated for ${config.businessName}`)
      return content
    } catch (error) {
      console.error('❌ Content generation failed:', error)
      return this.getFallbackContent(config)
    }
  }

  async generateContent(config, similarCompanies, relevantDocs) {
    if (!this.openai) {
      return this.getFallbackContent(config)
    }

    try {
      const context = this.buildContext(config, similarCompanies, relevantDocs)
      
      const prompt = `Generate website content for ${config.businessName}, a ${config.industry} company targeting ${config.targetAudience}.

Context from similar companies and documents:
${context}

Generate a JSON response with:
{
  "hero": {
    "headline": "Main headline",
    "subheadline": "Supporting text",
    "ctaText": "Call to action button text"
  },
  "about": {
    "content": "About section content",
    "highlights": ["key point 1", "key point 2", "key point 3"]
  },
  "services": {
    "title": "Services section title",
    "items": [
      {"name": "Service 1", "description": "Service description"},
      {"name": "Service 2", "description": "Service description"}
    ]
  },
  "contact": {
    "title": "Contact section title",
    "description": "Contact description",
    "email": "contact email",
    "phone": "phone number"
  },
  "pages": ["Home", "About", "Services", "Contact"]
}`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert web content generator. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const content = JSON.parse(response.choices[0].message.content)
      return content
    } catch (error) {
      console.error('❌ AI content generation failed:', error)
      return this.getFallbackContent(config)
    }
  }

  buildContext(config, similarCompanies, relevantDocs) {
    let context = ''
    
    if (similarCompanies.length > 0) {
      context += 'Similar companies:\n'
      similarCompanies.forEach(company => {
        context += `- ${company.text}\n`
      })
      context += '\n'
    }
    
    if (relevantDocs.length > 0) {
      context += 'Relevant industry insights:\n'
      relevantDocs.forEach(doc => {
        context += `- ${doc.text}\n`
      })
    }
    
    return context
  }

  getFallbackContent(config) {
    return {
      hero: {
        headline: `Welcome to ${config.businessName}`,
        subheadline: `Professional ${config.industry} solutions for ${config.targetAudience}`,
        ctaText: 'Get Started'
      },
      about: {
        content: `${config.businessName} delivers exceptional ${config.industry} services with a focus on quality and innovation.`,
        highlights: ['Quality Service', 'Expert Team', 'Customer Focus']
      },
      services: {
        title: 'Our Services',
        items: (config.keyServices || ['Consulting', 'Support']).map(service => ({
          name: service,
          description: `Professional ${service.toLowerCase()} services tailored to your needs.`
        }))
      },
      contact: {
        title: 'Contact Us',
        description: 'Get in touch to learn more about our services.',
        email: `contact@${config.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '(555) 123-4567'
      },
      pages: ['Home', 'About', 'Services', 'Contact']
    }
  }

  // ==================== INDUSTRY INSIGHTS ====================

  async getIndustryInsights(industry) {
    try {
      // Check for cached insights
      const insightsQuery = query(
        collection(this.db, this.collections.insights),
        where('industry', '==', industry),
        orderBy('updatedAt', 'desc'),
        limit(1)
      )
      
      const snapshot = await getDocs(insightsQuery)
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        // Check if insights are recent (less than 24 hours old)
        const isRecent = new Date() - data.updatedAt.toDate() < 24 * 60 * 60 * 1000
        if (isRecent) {
          return data.insights
        }
      }

      // Generate new insights
      const insights = await this.generateIndustryInsights(industry)
      
      // Store insights
      await addDoc(collection(this.db, this.collections.insights), {
        industry: industry,
        insights: insights,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return insights
    } catch (error) {
      console.error('❌ Failed to get industry insights:', error)
      return null
    }
  }

  async generateIndustryInsights(industry) {
    try {
      // Get all companies in this industry
      const companiesQuery = query(
        collection(this.db, this.collections.companies),
        where('industry', '==', industry)
      )
      
      const companiesSnapshot = await getDocs(companiesQuery)
      const companies = companiesSnapshot.docs.map(doc => doc.data())

      if (companies.length === 0) {
        return {
          totalCompanies: 0,
          topServices: [],
          popularTemplates: [],
          businessTypes: []
        }
      }

      // Analyze the data
      const insights = {
        totalCompanies: companies.length,
        topServices: this.getTopServices(companies),
        popularTemplates: this.getPopularTemplates(companies),
        businessTypes: this.getBusinessTypes(companies)
      }

      console.log(`📊 Generated insights for ${industry}: ${companies.length} companies`)
      return insights
    } catch (error) {
      console.error('❌ Industry insights generation failed:', error)
      return null
    }
  }

  getTopServices(companies) {
    const serviceCount = {}
    companies.forEach(company => {
      if (company.keyServices) {
        company.keyServices.forEach(service => {
          serviceCount[service] = (serviceCount[service] || 0) + 1
        })
      }
    })
    
    return Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  getPopularTemplates(companies) {
    const templateCount = {}
    companies.forEach(company => {
      if (company.template) {
        templateCount[company.template] = (templateCount[company.template] || 0) + 1
      }
    })
    
    return Object.entries(templateCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  getBusinessTypes(companies) {
    const typeCount = {}
    companies.forEach(company => {
      if (company.businessType) {
        typeCount[company.businessType] = (typeCount[company.businessType] || 0) + 1
      }
    })
    
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  async getDocuments(options = {}) {
    try {
      const {
        limit: queryLimit = 50,
        metadata = {}
      } = options

      let documentsQuery = query(
        collection(this.db, this.collections.documents),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      )

      const snapshot = await getDocs(documentsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('❌ Failed to get documents:', error)
      return []
    }
  }

  async deleteDocument(documentId) {
    try {
      // Get document data
      const docRef = doc(this.db, this.collections.documents, documentId)
      const docSnapshot = await getDoc(docRef)
      
      if (!docSnapshot.exists()) {
        throw new Error('Document not found')
      }

      const docData = docSnapshot.data()

      // Delete from storage
      if (docData.storagePath) {
        const storageRef = ref(this.storage, docData.storagePath)
        await deleteObject(storageRef)
      }

      // Delete embeddings
      const embeddingsQuery = query(
        collection(this.db, this.collections.embeddings),
        where('documentId', '==', documentId)
      )
      
      const embeddingsSnapshot = await getDocs(embeddingsQuery)
      const deletePromises = embeddingsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete document
      await deleteDoc(docRef)

      console.log(`✅ Document deleted: ${documentId}`)
      return true
    } catch (error) {
      console.error('❌ Failed to delete document:', error)
      throw error
    }
  }

  // ==================== GET SINGLE DOCUMENT ====================

  async getDocument(documentId) {
    try {
      const docRef = doc(this.db, this.collections.documents, documentId)
      const docSnapshot = await getDoc(docRef)
      
      if (!docSnapshot.exists()) {
        return null
      }

      const documentData = {
        id: docSnapshot.id,
        ...docSnapshot.data()
      }

      // Get associated embeddings
      const embeddingsQuery = query(
        collection(this.db, this.collections.embeddings),
        where('documentId', '==', documentId),
        orderBy('chunkIndex')
      )
      
      const embeddingsSnapshot = await getDocs(embeddingsQuery)
      const embeddings = embeddingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      documentData.embeddings = embeddings
      return documentData
    } catch (error) {
      console.error('❌ Failed to get document:', error)
      throw error
    }
  }

  // ==================== SEARCH COMPANIES ====================

  async searchCompanies(query, filters = {}) {
    try {
      const {
        industry,
        businessType,
        limit: searchLimit = 10
      } = filters

      let companiesQuery = collection(this.db, this.collections.companies)
      const constraints = []

      if (industry) {
        constraints.push(where('industry', '==', industry))
      }
      
      if (businessType) {
        constraints.push(where('businessType', '==', businessType))
      }

      constraints.push(orderBy('createdAt', 'desc'))
      constraints.push(limit(searchLimit))

      if (constraints.length > 0) {
        companiesQuery = query(companiesQuery, ...constraints)
      }

      const snapshot = await getDocs(companiesQuery)
      const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // If there's a text query, filter by similarity
      if (query && this.openai) {
        const queryEmbedding = await this.generateEmbedding(query)
        const withSimilarity = companies.map(company => ({
          ...company,
          similarity: company.embedding ? 
            this.cosineSimilarity(queryEmbedding, company.embedding) : 0
        }))
        
        return withSimilarity
          .filter(company => company.similarity > 0.3)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, searchLimit)
      }

      return companies
    } catch (error) {
      console.error('❌ Company search failed:', error)
      return []
    }
  }

  //ADDED
  // In your VectorRAGService.js, add:
async generateTemplateContent(templateType, businessContext) {
  const similarContent = await this.searchSimilarContent(
    `${businessContext.industry} ${templateType} content best practices`,
    { limit: 3 }
  );
  
  return this.generateContextualTemplate(templateType, businessContext, similarContent);
}
}

export default VectorRAGService