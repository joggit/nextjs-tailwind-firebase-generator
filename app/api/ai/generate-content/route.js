import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { prompt, type, config } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      )
    }

    let systemPrompt = ''
    let userPrompt = ''

    switch (type) {
      case 'component':
        systemPrompt = `You are an expert React/Next.js developer. Generate modern, accessible React components using Next.js 14 App Router patterns, Tailwind CSS, and Framer Motion for animations. Always use 'use client' directive for interactive components.`
        userPrompt = `Create a React component for: ${prompt}

Requirements:
- Use Next.js 14 App Router patterns
- Use Tailwind CSS for styling
- Add Framer Motion animations
- Include accessibility features
- Use Lucide React for icons
- Make it responsive
- Include proper TypeScript-style JSDoc comments

Return only the component code.`
        break

      case 'page':
        systemPrompt = `You are an expert Next.js developer. Generate complete page components using Next.js 14 App Router with proper metadata exports and modern React patterns.`
        userPrompt = `Create a Next.js page for: ${prompt}

Template type: ${config?.template || 'modern'}
Features: ${config?.features?.join(', ') || 'basic'}

Requirements:
- Use Next.js 14 App Router
- Export metadata for SEO
- Use 'use client' if interactive features needed
- Responsive design with Tailwind CSS
- Framer Motion animations
- Include proper page structure

Return the complete page component code.`
        break

      case 'content':
        systemPrompt = `You are a professional copywriter. Generate engaging, professional content for websites.`
        userPrompt = `Generate website content for a ${config?.businessType || 'business'} with the following context: ${prompt}

Template: ${config?.template || 'modern'}
Style: Professional yet approachable

Include:
- Compelling headlines
- Engaging descriptions
- Call-to-action text
- Feature descriptions

Return structured content in JSON format with keys: headline, description, features, cta.`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      content: generatedContent,
      usage: completion.usage
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    )
  }
}