// DALL-E 3 Hero Image Generator Component
// File: components/generator/HeroImageGenerator.jsx

'use client'

import { useState, useCallback } from 'react'
import {
    Wand2,
    Image,
    Loader,
    Download,
    RefreshCw,
    Eye,
    Copy,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Settings,
    Monitor,
    Smartphone,
    Square
} from 'lucide-react'

const HERO_STYLES = {
    modern: {
        name: 'Modern',
        description: 'Clean, professional, contemporary design',
        keywords: 'modern, clean, professional, contemporary, high-tech'
    },
    abstract: {
        name: 'Abstract',
        description: 'Artistic, creative, non-literal concepts',
        keywords: 'abstract, artistic, creative, conceptual, geometric'
    },
    corporate: {
        name: 'Corporate',
        description: 'Business professional, formal environment',
        keywords: 'corporate, business, professional, office, executive'
    },
    tech: {
        name: 'Technology',
        description: 'Digital, futuristic, innovative themes',
        keywords: 'technological, digital, futuristic, cyber, innovative'
    },
    creative: {
        name: 'Creative',
        description: 'Vibrant, imaginative, colorful expressions',
        keywords: 'creative, vibrant, colorful, artistic, imaginative'
    },
    minimal: {
        name: 'Minimal',
        description: 'Simple, clean, uncluttered design',
        keywords: 'minimalist, simple, clean, elegant, sophisticated'
    }
}

const SIZE_OPTIONS = {
    landscape: {
        name: 'Landscape',
        description: '16:9 - Perfect for hero backgrounds',
        dimensions: '1792x1024',
        icon: Monitor
    },
    portrait: {
        name: 'Portrait',
        description: '9:16 - Great for mobile-first design',
        dimensions: '1024x1792',
        icon: Smartphone
    },
    square: {
        name: 'Square',
        description: '1:1 - Versatile for all layouts',
        dimensions: '1024x1024',
        icon: Square
    }
}

const PROMPT_TEMPLATES = {
    business: "A professional {industry} business environment with {style} design elements",
    product: "An elegant showcase of {industry} products and services in a {style} setting",
    team: "A modern {industry} team workspace with collaborative {style} atmosphere",
    abstract: "Abstract representation of {industry} concepts using {style} visual metaphors",
    lifestyle: "Lifestyle imagery representing {industry} success and {style} aesthetics"
}

function HeroImageGenerator({
    businessContext = {},
    currentImageUrl = '',
    onImageGenerated,
    onError,
    className = ''
}) {
    const [generating, setGenerating] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [selectedStyle, setSelectedStyle] = useState('modern')
    const [selectedSize, setSelectedSize] = useState('landscape')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [generatedImage, setGeneratedImage] = useState(null)
    const [generationHistory, setGenerationHistory] = useState([])

    // Auto-generate prompt based on business context
    const generatePrompt = useCallback((templateType = 'business') => {
        const template = PROMPT_TEMPLATES[templateType]
        const industry = businessContext.industry || 'business'
        const businessName = businessContext.businessName || businessContext.name || 'company'
        const style = HERO_STYLES[selectedStyle].keywords

        let generatedPrompt = template
            .replace('{industry}', industry)
            .replace('{style}', selectedStyle)

        // Add business-specific context
        if (businessContext.businessDescription) {
            generatedPrompt += `, incorporating elements that represent ${businessContext.businessDescription}`
        }

        // Add professional finishing touches
        generatedPrompt += `, professional photography, high quality, premium design`

        setPrompt(generatedPrompt)
    }, [businessContext, selectedStyle])

    // Generate image using the existing API
    const handleGenerateImage = useCallback(async () => {
        if (!prompt.trim()) {
            onError?.('Please enter a prompt for image generation')
            return
        }

        setGenerating(true)

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    style: selectedStyle,
                    size: selectedSize,
                    businessContext: {
                        name: businessContext.businessName || businessContext.name,
                        industry: businessContext.industry,
                        description: businessContext.businessDescription
                    }
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image')
            }

            if (data.success) {
                const imageData = {
                    url: data.imageUrl,
                    originalPrompt: data.originalPrompt,
                    enhancedPrompt: data.enhancedPrompt,
                    revisedPrompt: data.revisedPrompt,
                    style: data.style,
                    size: data.size,
                    metadata: data.metadata,
                    generatedAt: new Date().toISOString()
                }

                setGeneratedImage(imageData)
                setGenerationHistory(prev => [imageData, ...prev.slice(0, 4)]) // Keep last 5
                onImageGenerated?.(imageData)

                console.log('✅ Hero image generated successfully:', imageData.url)
            } else {
                throw new Error(data.error || 'Image generation failed')
            }

        } catch (error) {
            console.error('❌ Hero image generation failed:', error)
            onError?.(error.message || 'Failed to generate hero image')
        } finally {
            setGenerating(false)
        }
    }, [prompt, selectedStyle, selectedSize, businessContext, onImageGenerated, onError])

    // Copy prompt to clipboard
    const copyPrompt = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(prompt)
            // You could add a toast notification here
        } catch (error) {
            console.error('Failed to copy prompt:', error)
        }
    }, [prompt])

    // Use generated image
    const useImage = useCallback((imageData) => {
        onImageGenerated?.(imageData)
        setGeneratedImage(imageData)
    }, [onImageGenerated])

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Hero Image Generator</h3>
                        <p className="text-sm text-gray-600">Create stunning hero backgrounds with DALL-E 3</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <Settings className="w-4 h-4" />
                    <span>{showAdvanced ? 'Simple' : 'Advanced'}</span>
                </button>
            </div>

            {/* Quick Template Buttons */}
            <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Quick Start:</span>
                {Object.entries(PROMPT_TEMPLATES).map(([templateType, template]) => (
                    <button
                        key={templateType}
                        onClick={() => generatePrompt(templateType)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors capitalize"
                    >
                        {templateType}
                    </button>
                ))}
            </div>

            {/* Style Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Style</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(HERO_STYLES).map(([styleId, style]) => (
                        <button
                            key={styleId}
                            onClick={() => setSelectedStyle(styleId)}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${selectedStyle === styleId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="font-medium text-sm">{style.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Size Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Size</label>
                <div className="grid grid-cols-3 gap-3">
                    {Object.entries(SIZE_OPTIONS).map(([sizeId, sizeOption]) => {
                        const IconComponent = sizeOption.icon
                        return (
                            <button
                                key={sizeId}
                                onClick={() => setSelectedSize(sizeId)}
                                className={`p-3 border-2 rounded-lg text-center transition-all ${selectedSize === sizeId
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                <div className="font-medium text-sm">{sizeOption.name}</div>
                                <div className="text-xs text-gray-500">{sizeOption.dimensions}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Prompt Input */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Image Description</label>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{prompt.length}/4000</span>
                        {prompt && (
                            <button
                                onClick={copyPrompt}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy prompt"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the hero image you want to generate..."
                    rows={4}
                    maxLength={4000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />

                {showAdvanced && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt Enhancement Tips:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Be specific about colors, lighting, and composition</li>
                            <li>• Include style keywords like "professional photography" or "studio lighting"</li>
                            <li>• Mention the mood or atmosphere you want to convey</li>
                            <li>• Reference specific visual elements relevant to your industry</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleGenerateImage}
                    disabled={generating || !prompt.trim()}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {generating ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Hero Image</span>
                        </>
                    )}
                </button>

                {prompt && (
                    <button
                        onClick={() => generatePrompt('business')}
                        className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Regenerate prompt"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                )}
            </div>

            {/* Generated Image Preview */}
            {generatedImage && (
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Generated Image</h4>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => window.open(generatedImage.url, '_blank')}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                <Eye className="w-4 h-4" />
                                <span>View Full</span>
                            </button>
                            <a
                                href={generatedImage.url}
                                download={`hero-image-${Date.now()}.png`}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src={generatedImage.url}
                            alt="Generated hero image"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                            {SIZE_OPTIONS[generatedImage.size].name}
                        </div>
                    </div>

                    {showAdvanced && generatedImage.revisedPrompt && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">AI Revised Prompt:</h5>
                            <p className="text-xs text-gray-600">{generatedImage.revisedPrompt}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Generation History */}
            {generationHistory.length > 1 && (
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Generations</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {generationHistory.slice(1).map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image.url}
                                    alt={`Generated image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500"
                                    onClick={() => useImage(image)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                                    <button
                                        onClick={() => useImage(image)}
                                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium"
                                    >
                                        Use This
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Image Display */}
            {currentImageUrl && currentImageUrl !== generatedImage?.url && (
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Current Hero Image</h4>
                    <img
                        src={currentImageUrl}
                        alt="Current hero image"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                </div>
            )}
        </div>
    )
}

export default HeroImageGenerator