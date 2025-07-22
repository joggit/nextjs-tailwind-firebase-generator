// DALL-E 3 Image Generation API Route (Fixed)
// File: app/api/generate-image/route.js

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const STYLE_ENHANCEMENTS = {
  modern: 'clean, professional, contemporary, high-tech, minimalist',
  abstract: 'artistic, creative, conceptual, geometric, non-literal',
  corporate: 'business professional, formal, executive, office environment',
  tech: 'technological, digital, futuristic, cyber, innovative',
  creative: 'vibrant, colorful, artistic, imaginative, dynamic',
  minimal: 'minimalist, simple, elegant, sophisticated, clean'
}

const SIZE_MAP = {
  landscape: '1792x1024',
  portrait: '1024x1792',
  square: '1024x1024'
}

export async function POST(request) {
  try {
    const {
      prompt,
      style = 'modern',
      size = 'landscape',
      businessContext = {}
    } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Prompt is required for image generation'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🎨 Generating DALL-E 3 image with params:', {
      originalPrompt: prompt,
      style,
      size,
      businessName: businessContext.name,
      industry: businessContext.industry
    })

    // Enhance the prompt with style-specific keywords
    const styleEnhancement = STYLE_ENHANCEMENTS[style] || STYLE_ENHANCEMENTS.modern

    let enhancedPrompt = prompt

    // Add business context if provided
    if (businessContext.name && businessContext.industry) {
      enhancedPrompt = enhancedPrompt
        .replace(/\{businessName\}/g, businessContext.name)
        .replace(/\{industry\}/g, businessContext.industry)
    }

    // Add style enhancement
    enhancedPrompt += `, ${styleEnhancement}, professional photography, high quality, premium design`

    // Add technical specifications for better results
    if (size === 'landscape') {
      enhancedPrompt += ', wide format, horizontal composition'
    } else if (size === 'portrait') {
      enhancedPrompt += ', vertical format, portrait orientation'
    } else {
      enhancedPrompt += ', square format, balanced composition'
    }

    // Generate the image using DALL-E 3
    console.log('🔄 Sending request to DALL-E 3...')
    console.log('Enhanced prompt:', enhancedPrompt)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: SIZE_MAP[size] || SIZE_MAP.landscape,
      quality: "hd", // Use HD quality for better results
      response_format: "url"
    })

    const imageData = response.data[0]

    console.log('✅ DALL-E 3 image generated successfully')

    // Return the image data using standard Response constructor
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageData.url,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        revisedPrompt: imageData.revised_prompt, // DALL-E 3 often revises prompts
        style: style,
        size: size,
        metadata: {
          model: 'dall-e-3',
          quality: 'hd',
          generatedAt: new Date().toISOString(),
          businessContext: {
            name: businessContext.name,
            industry: businessContext.industry,
            description: businessContext.description
          }
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ DALL-E 3 image generation failed:', error)

    // Handle specific OpenAI errors
    if (error.code === 'content_policy_violation') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content policy violation: The prompt contains content that violates OpenAI\'s usage policies. Please try a different description.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (error.code === 'rate_limit_exceeded') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded: Too many image generation requests. Please try again in a few minutes.'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (error.code === 'insufficient_quota') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI quota exceeded: Your OpenAI account has insufficient credits for image generation.'
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Generic error handling
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate image. Please try again with a different prompt.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle GET requests with API info
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'DALL-E 3 Image Generation API',
      description: 'Generate hero images using OpenAI\'s DALL-E 3 model',
      usage: {
        method: 'POST',
        parameters: {
          prompt: 'string (required) - Description of the image to generate',
          style: 'string (optional) - Style enhancement: modern, abstract, corporate, tech, creative, minimal',
          size: 'string (optional) - Image size: landscape, portrait, square',
          businessContext: 'object (optional) - Business context for personalization'
        }
      },
      supportedSizes: Object.keys(SIZE_MAP),
      supportedStyles: Object.keys(STYLE_ENHANCEMENTS),
      requirements: [
        'OPENAI_API_KEY environment variable must be set',
        'OpenAI account with DALL-E 3 access and sufficient credits'
      ]
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}