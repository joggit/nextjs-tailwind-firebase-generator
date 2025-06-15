// File: app/api/vector/companies/route.js

import { NextResponse } from 'next/server'
import { VectorRAGService } from '@/lib/VectorRAGService.js'

const vectorRAG = new VectorRAGService()

export async function GET(request) {
  try {
    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const industry = searchParams.get('industry') || ''
    const businessType = searchParams.get('businessType') || ''
    const limit = parseInt(searchParams.get('limit')) || 10

    const filters = {}
    if (industry) filters.industry = industry
    if (businessType) filters.businessType = businessType
    if (limit) filters.limit = limit

    console.log(`🔍 Searching companies with query: "${query}", filters:`, filters)

    const companies = await vectorRAG.searchCompanies(query, filters)

    return NextResponse.json({
      success: true,
      companies,
      total: companies.length,
      query,
      filters
    })

  } catch (error) {
    console.error('❌ Company search failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Company search failed',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Initialize service if needed
    if (!vectorRAG.isInitialized()) {
      await vectorRAG.initialize()
    }

    const companyData = await request.json()

    // Validate required fields
    if (!companyData.businessName || !companyData.industry) {
      return NextResponse.json({
        success: false,
        error: 'Business name and industry are required'
      }, { status: 400 })
    }

    console.log(`💾 Storing company data: ${companyData.businessName}`)

    const companyId = await vectorRAG.storeCompanyData(companyData)

    console.log(`✅ Company data stored with ID: ${companyId}`)

    return NextResponse.json({
      success: true,
      message: 'Company data stored successfully',
      companyId
    })

  } catch (error) {
    console.error('❌ Failed to store company data:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to store company data',
      details: error.message
    }, { status: 500 })
  }
}
