// Debug PageEditor - Let's see what's happening step by step
// File: components/generator/PageEditorDebug.jsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Home,
    ChevronDown,
    ChevronRight,
    Wand2,
    AlertTriangle
} from 'lucide-react'

// Simplified test configuration
const TEST_PAGE_CONFIG = {
    home: {
        sections: {
            hero: {
                title: 'Hero Section',
                fields: {
                    heroTitle: {
                        type: 'text',
                        label: 'Main Headline',
                        placeholder: 'Welcome to Your Business'
                    },
                    heroImage: {
                        type: 'text',
                        label: 'Hero Image URL',
                        placeholder: '/hero-image.jpg',
                        enhancedField: 'heroImageGenerator'
                    },
                    ctaText: {
                        type: 'text',
                        label: 'Call-to-Action Button',
                        placeholder: 'Get Started'
                    }
                }
            }
        }
    }
}

function PageEditorDebug({ config = {}, onChange = () => { } }) {
    const [debugInfo, setDebugInfo] = useState({})
    const [selectedPage, setSelectedPage] = useState('home')
    const [expandedSections, setExpandedSections] = useState({ hero: true })
    const [showGenerator, setShowGenerator] = useState(false)

    // Debug logging
    useEffect(() => {
        const info = {
            configReceived: !!config,
            configKeys: Object.keys(config),
            hasDetailedPages: !!config.detailedPages,
            detailedPagesKeys: config.detailedPages ? Object.keys(config.detailedPages) : [],
            hasPages: !!config.pages,
            pagesKeys: config.pages ? Object.keys(config.pages) : [],
            businessName: config.businessName,
            industry: config.industry
        }

        setDebugInfo(info)
        console.log('🔍 PageEditor Debug Info:', info)
    }, [config])

    const handleFieldChange = useCallback((value) => {
        console.log('🔄 Field changed:', value)
        // Simple field update simulation
        const newConfig = {
            ...config,
            detailedPages: {
                ...config.detailedPages,
                home: {
                    ...config.detailedPages?.home,
                    sections: {
                        ...config.detailedPages?.home?.sections,
                        hero: {
                            ...config.detailedPages?.home?.sections?.hero,
                            heroImage: value
                        }
                    }
                }
            }
        }
        onChange(newConfig)
    }, [config, onChange])

    const toggleSection = useCallback(() => {
        setExpandedSections(prev => ({
            ...prev,
            hero: !prev.hero
        }))
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-lg">
            {/* Debug Header */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-bold text-blue-900 mb-2">🔍 PageEditor Debug Mode</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Config Status:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>✅ Config received: {debugInfo.configReceived ? 'Yes' : 'No'}</li>
                            <li>✅ Has detailedPages: {debugInfo.hasDetailedPages ? 'Yes' : 'No'}</li>
                            <li>✅ Has pages: {debugInfo.hasPages ? 'Yes' : 'No'}</li>
                            <li>✅ Business name: {debugInfo.businessName || 'Not set'}</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Data Structure:</strong>
                        <ul className="mt-1 space-y-1">
                            <li>Config keys: {debugInfo.configKeys?.join(', ') || 'None'}</li>
                            <li>DetailedPages keys: {debugInfo.detailedPagesKeys?.join(', ') || 'None'}</li>
                            <li>Pages keys: {debugInfo.pagesKeys?.join(', ') || 'None'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Simple Page Selector */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Page Selection</h3>
                <button
                    onClick={() => setSelectedPage('home')}
                    className={`flex items-center space-x-3 p-3 border-2 rounded-lg ${selectedPage === 'home' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                >
                    <Home className="w-5 h-5 text-blue-600" />
                    <div>
                        <div className="font-medium text-gray-900">Home Page</div>
                        <div className="text-sm text-gray-500">Test page with hero section</div>
                    </div>
                </button>
            </div>

            {/* Hero Section Test */}
            <div className="border border-gray-200 rounded-lg">
                <button
                    onClick={toggleSection}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">Hero Section</span>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full">
                            <Wand2 className="w-3 h-3" />
                            <span>AI Enhanced</span>
                        </div>
                        {expandedSections.hero && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                    </div>
                    <div className={`transition-transform duration-200 ${expandedSections.hero ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </button>

                {expandedSections.hero && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            ✅ Hero section is expanded! You should see the fields below.
                        </div>

                        {/* Hero Title Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Headline
                            </label>
                            <input
                                type="text"
                                placeholder="Welcome to Your Business"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Hero Image Field with AI Generator */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Hero Image URL</label>
                                <button
                                    onClick={() => setShowGenerator(!showGenerator)}
                                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    <span>{showGenerator ? 'Hide' : 'AI Generate'}</span>
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="/hero-image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />

                            {showGenerator && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Wand2 className="w-5 h-5 text-purple-600" />
                                        <h4 className="text-lg font-medium text-purple-900">AI Image Generator</h4>
                                    </div>
                                    <p className="text-purple-700 text-sm mb-4">
                                        🎉 Success! The AI image generator UI would appear here.
                                        This confirms the integration is working correctly.
                                    </p>
                                    <div className="space-y-3">
                                        <textarea
                                            placeholder="Describe the hero image you want to generate..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700">
                                            Generate Hero Image (Demo)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA Text Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Call-to-Action Button
                            </label>
                            <input
                                type="text"
                                placeholder="Get Started"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Success Message */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            ✅ If you can see this and the AI Generate button above, the integration is working!
                        </div>
                    </div>
                )}
            </div>

            {/* Current Config Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Config Object:</h4>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>

            {/* Test Button */}
            <div className="mt-6 flex space-x-3">
                <button
                    onClick={() => console.log('Current config:', config)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Log Config to Console
                </button>
                <button
                    onClick={() => handleFieldChange('/test-image.jpg')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Test Field Update
                </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-yellow-800">Debug Instructions:</h4>
                        <ol className="mt-2 text-sm text-yellow-700 space-y-1">
                            <li>1. Check if you can see the "Hero Section" with the purple "AI Enhanced" badge</li>
                            <li>2. Click on "Hero Section" to expand it</li>
                            <li>3. Look for the purple "AI Generate" button next to "Hero Image URL"</li>
                            <li>4. Click "AI Generate" to see the image generator interface</li>
                            <li>5. Check the browser console for any error messages</li>
                            <li>6. Use the test buttons below to verify functionality</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageEditorDebug