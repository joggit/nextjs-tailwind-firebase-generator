// DALL-E 3 Image Generation API Route
// File: app/api/generate-image/route.js

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting and caching
const generateRequests = new Map()
const RATE_LIMIT = 10 // requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function checkRateLimit(ip) {
  const now = Date.now()
  const requests = generateRequests.get(ip) || []
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false
  }
  
  recentRequests.push(now)
  generateRequests.set(ip, recentRequests)
  return true
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  return 'unknown'
}

export async function POST(request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image generation not configured. Please add OPENAI_API_KEY to your environment variables.' 
        },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { 
      prompt, 
      style = 'modern', 
      size = 'landscape', 
      businessContext = {} 
    } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Validate prompt length (DALL-E 3 has a 4000 character limit)
    if (prompt.length > 4000) {
      return NextResponse.json(
        { success: false, error: 'Prompt is too long. Maximum 4000 characters.' },
        { status: 400 }
      )
    }

    console.log(`🎨 Generating image for: ${businessContext.name || 'Unknown Business'}`)
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)
    console.log(`🎭 Style: ${style}, Size: ${size}`)

    // Enhanced prompt with style and quality improvements
    const enhancedPrompt = enhancePrompt(prompt, style, businessContext)
    
    // Map size to DALL-E 3 format
    const dalleSize = mapSizeFormat(size)
    
    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: dalleSize,
      quality: "hd", // Use HD quality for better results
      style: mapStyleToDALLE(style)
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated')
    }

    const imageUrl = response.data[0].url
    const revisedPrompt = response.data[0].revised_prompt

    console.log(`✅ Image generated successfully`)
    console.log(`🔗 Image URL: ${imageUrl.substring(0, 50)}...`)

    // Return the generated image data
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      revisedPrompt: revisedPrompt,
      style: style,
      size: size,
      metadata: {
        model: "dall-e-3",
        quality: "hd",
        generatedAt: new Date().toISOString(),
        businessContext: businessContext.name || 'Unknown'
      }
    })

  } catch (error) {
    console.error('🔥 Image generation error:', error)
    
    // Handle specific OpenAI errors
    if (error.response?.status === 400) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid prompt. Please try a different description.',
          details: error.response.data?.error?.message 
        },
        { status: 400 }
      )
    }
    
    if (error.response?.status === 429) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      )
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid OpenAI API key. Please check your configuration.' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate image. Please try again.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function enhancePrompt(originalPrompt, style, businessContext) {
  let enhanced = originalPrompt

  // Add style-specific enhancements
  const styleEnhancements = {
    modern: "modern, clean, professional, contemporary design, high-tech",
    abstract: "abstract, artistic, creative, non-literal, conceptual art",
    corporate: "corporate, business professional, formal, executive, office environment",
    tech: "technological, digital, futuristic, high-tech, innovative, cyber",
    creative: "creative, artistic, vibrant, imaginative, colorful, expressive",
    minimal: "minimalist, simple, clean, uncluttered, elegant, sophisticated"
  }

  const styleKeywords = styleEnhancements[style] || styleEnhancements.modern
  
  // Add business context if available
  if (businessContext.industry) {
    enhanced += `, ${businessContext.industry} industry context`
  }
  
  // Add style keywords
  enhanced += `, ${styleKeywords}`
  
  // Add quality and technical specifications
  enhanced += ", professional photography, high resolution, studio lighting, premium quality"
  
  // Ensure we don't exceed DALL-E's character limit
  if (enhanced.length > 4000) {
    enhanced = enhanced.substring(0, 3997) + "..."
  }
  
  return enhanced
}

function mapSizeFormat(size) {
  switch (size) {
    case 'landscape':
      return '1792x1024' // 16:9 aspect ratio
    case 'portrait':
      return '1024x1792' // 9:16 aspect ratio
    case 'square':
    default:
      return '1024x1024' // 1:1 aspect ratio
  }
}

function mapStyleToDALLE(style) {
  // DALL-E 3 supports 'vivid' and 'natural' styles
  switch (style) {
    case 'creative':
    case 'abstract':
      return 'vivid' // More dramatic, colorful images
    case 'modern':
    case 'corporate':
    case 'tech':
    case 'minimal':
    default:
      return 'natural' // More natural, realistic images
  }
}

// GET endpoint for checking service status
export async function GET() {
  const isConfigured = !!process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    status: 'ready',
    configured: isConfigured,
    message: isConfigured 
      ? 'DALL-E 3 image generation is ready' 
      : 'OpenAI API key not configured',
    supportedStyles: ['modern', 'abstract', 'corporate', 'tech', 'creative', 'minimal'],
    supportedSizes: ['landscape', 'portrait', 'square'],
    rateLimit: `${RATE_LIMIT} requests per hour`,
    model: 'dall-e-3',
    quality: 'hd'
  })
}