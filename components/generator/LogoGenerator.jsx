// Logo Generator Component
// File: components/generator/LogoGenerator.jsx

'use client'

import { useState } from 'react'
import { Sparkles, Download, RefreshCw, Loader, CheckCircle, AlertCircle, Palette, Eye } from 'lucide-react'

const LOGO_STYLES = [
    { id: 'modern', name: 'Modern', description: 'Clean, minimalist, geometric' },
    { id: 'classic', name: 'Classic', description: 'Timeless, elegant, traditional' },
    { id: 'tech', name: 'Tech', description: 'Digital, futuristic, innovative' },
    { id: 'creative', name: 'Creative', description: 'Artistic, unique, expressive' },
    { id: 'corporate', name: 'Corporate', description: 'Professional, trustworthy' },
    { id: 'startup', name: 'Startup', description: 'Fresh, dynamic, energetic' },
    { id: 'luxury', name: 'Luxury', description: 'Premium, elegant, sophisticated' },
    { id: 'playful', name: 'Playful', description: 'Fun, friendly, colorful' }
]

const LOGO_TYPES = [
    { id: 'combination', name: 'Combination', description: 'Text + icon together' },
    { id: 'wordmark', name: 'Wordmark', description: 'Text-based logo only' },
    { id: 'icon', name: 'Icon', description: 'Symbol/icon only' },
    { id: 'emblem', name: 'Emblem', description: 'Badge-style design' },
    { id: 'abstract', name: 'Abstract', description: 'Geometric shapes' }
]

const INDUSTRIES = [
    'technology', 'healthcare', 'finance', 'education', 'food', 'fashion',
    'sports', 'travel', 'real_estate', 'consulting', 'general'
]

function LogoGenerator({ businessName, industry = 'technology', onLogoGenerated, className = '' }) {
    const [generating, setGenerating] = useState(false)
    const [logos, setLogos] = useState(null)
    const [error, setError] = useState(null)
    const [config, setConfig] = useState({
        style: 'modern',
        logoType: 'combination',
        colors: 'professional blue and gray colors',
        description: '',
        customRequirements: ''
    })

    const generateLogos = async () => {
        if (!businessName?.trim()) {
            setError('Business name is required')
            return
        }

        setGenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/generate-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: businessName.trim(),
                    industry,
                    ...config
                })
            })

            const data = await response.json()

            if (data.success) {
                setLogos(data.logos)
                onLogoGenerated?.(data.logos)
                console.log('✅ Logos generated successfully')
            } else {
                setError(data.error || 'Failed to generate logos')
            }
        } catch (err) {
            console.error('Logo generation error:', err)
            setError('Failed to generate logos. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    const downloadLogo = async (logoUrl, filename) => {
        try {
            const response = await fetch(logoUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download failed:', error)
        }
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    AI Logo Generator
                </h3>
                <p className="text-gray-600">
                    Create professional logos for {businessName || 'your business'} using AI
                </p>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Logo Configuration</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Style Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Style
                        </label>
                        <select
                            value={config.style}
                            onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {LOGO_STYLES.map(style => (
                                <option key={style.id} value={style.id}>
                                    {style.name} - {style.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Logo Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo Type
                        </label>
                        <select
                            value={config.logoType}
                            onChange={(e) => setConfig(prev => ({ ...prev, logoType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {LOGO_TYPES.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name} - {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color Preference
                        </label>
                        <input
                            type="text"
                            value={config.colors}
                            onChange={(e) => setConfig(prev => ({ ...prev, colors: e.target.value }))}
                            placeholder="e.g., blue and white, vibrant colors, monochrome"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Description (optional)
                        </label>
                        <input
                            type="text"
                            value={config.description}
                            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of your business"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Custom Requirements */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Requirements (optional)
                    </label>
                    <textarea
                        value={config.customRequirements}
                        onChange={(e) => setConfig(prev => ({ ...prev, customRequirements: e.target.value }))}
                        placeholder="Any specific requirements or elements you want included..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Generate Button */}
                <div className="mt-6">
                    <button
                        onClick={generateLogos}
                        disabled={generating || !businessName?.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {generating ? (
                            <>
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                Generating Logos...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Logos
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="font-medium text-red-800">Generation Failed</span>
                    </div>
                    <p className="text-red-700 mt-2">{error}</p>
                    <button
                        onClick={generateLogos}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Generated Logos */}
            {logos && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">Logos Generated Successfully!</span>
                        </div>
                        <button
                            onClick={generateLogos}
                            disabled={generating}
                            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Regenerate
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Logo */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-900 mb-2">Primary Logo</h4>
                                <p className="text-sm text-gray-600">Main branding, headers, business cards</p>
                            </div>
                            <div className="aspect-square bg-gray-50 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                                <img
                                    src={logos.primary.url}
                                    alt="Primary Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => downloadLogo(logos.primary.url, `${businessName}-logo-primary.png`)}
                                    className="flex-1 flex items-center justify-center bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </button>
                                <button
                                    onClick={() => window.open(logos.primary.url, '_blank')}
                                    className="flex items-center justify-center bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Simplified Logo */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <h4 className="font-semibold text-gray-900 mb-2">Simplified Logo</h4>
                                <p className="text-sm text-gray-600">Favicons, small sizes, watermarks</p>
                            </div>
                            <div className="aspect-square bg-gray-50 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                                <img
                                    src={logos.simplified.url}
                                    alt="Simplified Logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => downloadLogo(logos.simplified.url, `${businessName}-logo-simplified.png`)}
                                    className="flex-1 flex items-center justify-center bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </button>
                                <button
                                    onClick={() => window.open(logos.simplified.url, '_blank')}
                                    className="flex items-center justify-center bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Usage Tips */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                            <Palette className="w-4 h-4 mr-2" />
                            Usage Recommendations
                        </h5>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>• Convert to SVG format for perfect scalability</p>
                            <p>• Test readability at small sizes (16x16, 32x32 pixels)</p>
                            <p>• Ensure logos work on both light and dark backgrounds</p>
                            <p>• Consider creating a monochrome version for single-color applications</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LogoGenerator