// Logo Generation API Route
// File: app/api/generate-logo/route.js

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const LOGO_STYLES = {
    modern: 'modern, clean, minimalist, geometric, professional',
    classic: 'classic, timeless, elegant, traditional, sophisticated',
    tech: 'technological, digital, futuristic, innovative, high-tech',
    creative: 'creative, artistic, unique, expressive, bold',
    corporate: 'corporate, professional, trustworthy, established, formal',
    startup: 'fresh, innovative, dynamic, energetic, modern',
    luxury: 'luxury, premium, elegant, sophisticated, high-end',
    playful: 'playful, fun, friendly, approachable, colorful'
}

const LOGO_TYPES = {
    wordmark: 'text-based logo, typography logo, company name as logo',
    icon: 'icon logo, symbol logo, pictorial mark',
    combination: 'combination logo, text and icon logo, logo with company name and symbol',
    emblem: 'emblem logo, badge logo, circular logo with text inside',
    abstract: 'abstract logo, geometric shapes, modern abstract design'
}

const INDUSTRY_ELEMENTS = {
    technology: 'circuits, data, connections, digital elements',
    healthcare: 'medical cross, heart, care symbols',
    finance: 'growth arrows, charts, stability symbols',
    education: 'books, graduation, learning symbols',
    food: 'natural elements, organic shapes',
    fashion: 'elegant lines, style elements',
    sports: 'dynamic movement, energy, strength',
    travel: 'journey elements, maps, adventure',
    real_estate: 'buildings, houses, architectural elements',
    consulting: 'professional, advisory, expertise symbols'
}

export async function POST(request) {
    try {
        const {
            businessName,
            industry = 'technology',
            style = 'modern',
            logoType = 'combination',
            colors = 'professional colors',
            description = '',
            customRequirements = ''
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

        if (!businessName) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Business name is required for logo generation'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        console.log('🎨 Generating logo for:', {
            businessName,
            industry,
            style,
            logoType,
            colors
        })

        // Build the logo prompt
        const styleElements = LOGO_STYLES[style] || LOGO_STYLES.modern
        const typeElements = LOGO_TYPES[logoType] || LOGO_TYPES.combination
        const industryElements = INDUSTRY_ELEMENTS[industry] || 'professional business elements'

        let logoPrompt = `Create a professional ${typeElements} for "${businessName}"`

        // Add industry context
        if (industry && industry !== 'general') {
            logoPrompt += `, a ${industry} company`
        }

        // Add description if provided
        if (description) {
            logoPrompt += `. ${description}`
        }

        // Add style and design elements
        logoPrompt += `. Style: ${styleElements}. Incorporate ${industryElements}.`

        // Add color specifications
        logoPrompt += ` Use ${colors}.`

        // Add technical specifications for logos
        logoPrompt += ' Design requirements: clean, scalable, works on white background, professional branding, vector-style design, high contrast, readable text'

        // Add logo-specific constraints
        logoPrompt += ', no photography, no realistic images, logo design only, graphic design, brand identity'

        // Add custom requirements if provided
        if (customRequirements) {
            logoPrompt += `. Additional requirements: ${customRequirements}`
        }

        console.log('🔄 Sending logo request to DALL-E 3...')
        console.log('Logo prompt:', logoPrompt)

        // Generate multiple logo variations
        const logoResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: logoPrompt,
            n: 1,
            size: "1024x1024", // Square format works best for logos
            quality: "hd",
            response_format: "url"
        })

        const logoData = logoResponse.data[0]

        // Also generate a simplified version
        const simplifiedPrompt = `Simplified version of a ${styleElements} logo for "${businessName}". Minimalist design, ${colors}, clean lines, scalable, works in small sizes, professional branding`

        console.log('🔄 Generating simplified logo version...')

        const simplifiedResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: simplifiedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            response_format: "url"
        })

        const simplifiedData = simplifiedResponse.data[0]

        console.log('✅ Logo variations generated successfully')

        return new Response(
            JSON.stringify({
                success: true,
                logos: {
                    primary: {
                        url: logoData.url,
                        prompt: logoPrompt,
                        revisedPrompt: logoData.revised_prompt,
                        type: 'primary',
                        size: '1024x1024'
                    },
                    simplified: {
                        url: simplifiedData.url,
                        prompt: simplifiedPrompt,
                        revisedPrompt: simplifiedData.revised_prompt,
                        type: 'simplified',
                        size: '1024x1024'
                    }
                },
                businessContext: {
                    name: businessName,
                    industry,
                    style,
                    logoType,
                    colors
                },
                metadata: {
                    model: 'dall-e-3',
                    quality: 'hd',
                    generatedAt: new Date().toISOString(),
                    variations: 2
                },
                recommendations: {
                    usage: {
                        primary: 'Use for main branding, website headers, business cards',
                        simplified: 'Use for favicons, small sizes, watermarks'
                    },
                    formats: 'Consider converting to SVG for scalability',
                    sizes: 'Test readability at small sizes (16x16, 32x32 pixels)'
                }
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('❌ Logo generation failed:', error)

        // Handle specific OpenAI errors
        if (error.code === 'content_policy_violation') {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Content policy violation: Please try a different business name or description that complies with content policies.'
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
                    error: 'Rate limit exceeded: Too many logo generation requests. Please try again in a few minutes.'
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
                    error: 'OpenAI quota exceeded: Your OpenAI account has insufficient credits for logo generation.'
                }),
                {
                    status: 402,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to generate logo. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}

export async function GET() {
    return new Response(
        JSON.stringify({
            message: 'Logo Generation API',
            description: 'Generate professional logos using DALL-E 3',
            usage: {
                method: 'POST',
                parameters: {
                    businessName: 'string (required) - Name of the business',
                    industry: 'string (optional) - Business industry',
                    style: 'string (optional) - Logo style preference',
                    logoType: 'string (optional) - Type of logo design',
                    colors: 'string (optional) - Color preferences',
                    description: 'string (optional) - Business description',
                    customRequirements: 'string (optional) - Additional requirements'
                }
            },
            supportedStyles: Object.keys(LOGO_STYLES),
            supportedLogoTypes: Object.keys(LOGO_TYPES),
            supportedIndustries: Object.keys(INDUSTRY_ELEMENTS),
            features: [
                'Generates primary and simplified logo variations',
                'Industry-specific design elements',
                'Professional branding guidelines',
                'Scalable design recommendations',
                'Multiple style options'
            ]
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}