// File: app/api/vector/similar/route.js

import { NextResponse } from 'next/server'
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function POST(request) {
  try {
    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { companyData, limit = 5 } = await request.json()

    if (!companyData || !companyData.industry) {
      return NextResponse.json({
        success: false,
        error: 'Company data with industry is required'
      }, { status: 400 })
    }

    console.log(`🔍 Finding similar companies for: ${companyData.businessName || 'Unknown'}`)

    const similarCompanies = await vectorRAG.findSimilarCompanies(companyData, limit)

    console.log(`✅ Found ${similarCompanies.length} similar companies`)

    return NextResponse.json({
      success: true,
      similarCompanies,
      metadata: {
        searchCompany: companyData.businessName,
        industry: companyData.industry,
        resultCount: similarCompanies.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Failed to find similar companies:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to find similar companies',
      details: error.message
    }, { status: 500 })
  }
}
