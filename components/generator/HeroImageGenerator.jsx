// DALL-E 3 Hero Image Generator
// File: components/generator/HeroImageGenerator.jsx

'use client'

import { useState } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  Image as ImageIcon, 
  Wand2, 
  Download, 
  RefreshCw,
  Upload,
  X,
  Check,
  Sparkles,
  Palette,
  Camera,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

const IMAGE_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean, professional, contemporary' },
  { id: 'abstract', name: 'Abstract', description: 'Artistic, creative, non-literal' },
  { id: 'corporate', name: 'Corporate', description: 'Business-focused, professional' },
  { id: 'tech', name: 'Technology', description: 'Digital, futuristic, technical' },
  { id: 'creative', name: 'Creative', description: 'Artistic, colorful, imaginative' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, clean, uncluttered' }
]

const IMAGE_SIZES = [
  { id: 'landscape', name: 'Landscape', ratio: '16:9', description: 'Wide format, perfect for hero sections' },
  { id: 'square', name: 'Square', ratio: '1:1', description: 'Equal dimensions, versatile' },
  { id: 'portrait', name: 'Portrait', ratio: '9:16', description: 'Tall format, good for mobile' }
]

const PROMPT_SUGGESTIONS = {
  business: [
    'Professional team working in modern office',
    'Handshake between business partners',
    'Modern cityscape with glass buildings',
    'Abstract representation of growth and success'
  ],
  technology: [
    'Futuristic digital landscape',
    'Abstract network connections',
    'Modern data center with glowing servers',
    'AI and machine learning visualization'
  ],
  healthcare: [
    'Modern medical facility',
    'Healthcare professionals in action',
    'Abstract representation of health and wellness',
    'Medical innovation and technology'
  ],
  education: [
    'Students learning in modern classroom',
    'Books and digital devices combined',
    'Abstract representation of knowledge',
    'Modern campus or library setting'
  ],
  retail: [
    'Modern shopping experience',
    'Product showcase in elegant setting',
    'Abstract representation of commerce',
    'Happy customers in retail environment'
  ]
}

export default function HeroImageGenerator({ config, onChange, onNext, onPrev }) {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [selectedSize, setSelectedSize] = useState('landscape')
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [activeTab, setActiveTab] = useState('generate') // 'generate' or 'upload'

  const generatePrompt = () => {
    const industry = config.industry || 'business'
    const businessName = config.businessName || 'business'
    const style = IMAGE_STYLES.find(s => s.id === selectedStyle)
    
    const basePrompt = `${style.description} hero image for ${businessName}, a ${industry} company`
    const industryPrompts = PROMPT_SUGGESTIONS[industry] || PROMPT_SUGGESTIONS.business
    const randomPrompt = industryPrompts[Math.floor(Math.random() * industryPrompts.length)]
    
    return `${basePrompt}, ${randomPrompt}, high quality, professional photography`
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      const autoPrompt = generatePrompt()
      setPrompt(autoPrompt)
    }

    setGenerating(true)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || generatePrompt(),
          style: selectedStyle,
          size: selectedSize,
          businessContext: {
            name: config.businessName,
            industry: config.industry,
            description: config.businessDescription
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      
      if (data.success) {
        const newImage = {
          id: Date.now(),
          url: data.imageUrl,
          prompt: prompt || generatePrompt(),
          style: selectedStyle,
          size: selectedSize,
          createdAt: new Date().toISOString()
        }
        
        setGeneratedImages(prev => [newImage, ...prev])
        setSelectedImage(newImage)
        
        // Update config with generated images
        onChange({
          ...config,
          heroImages: [...(config.heroImages || []), newImage]
        })
      } else {
        throw new Error(data.error || 'Image generation failed')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      alert(`Failed to generate image: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            type: 'uploaded',
            size: file.size,
            createdAt: new Date().toISOString()
          }
          
          setUploadedImages(prev => [newImage, ...prev])
          
          // Update config with uploaded images
          onChange({
            ...config,
            heroImages: [...(config.heroImages || []), newImage]
          })
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const selectImage = (image) => {
    setSelectedImage(image)
    onChange({
      ...config,
      selectedHeroImage: image
    })
  }

  const removeImage = (imageId) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId))
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
    
    if (selectedImage?.id === imageId) {
      setSelectedImage(null)
    }
    
    // Update config
    const updatedImages = (config.heroImages || []).filter(img => img.id !== imageId)
    onChange({
      ...config,
      heroImages: updatedImages,
      selectedHeroImage: selectedImage?.id === imageId ? null : config.selectedHeroImage
    })
  }

  const allImages = [...generatedImages, ...uploadedImages]

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero Images</h2>
        <p className="text-gray-600">Generate AI images or upload your own for the hero section</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Generate with AI
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Images
            </button>
          </nav>
        </div>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-8">
          {/* Image Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Prompt Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate based on your business details
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Prompts
                </label>
                <div className="space-y-2">
                  {(PROMPT_SUGGESTIONS[config.industry] || PROMPT_SUGGESTIONS.business).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style and Size Options */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        selectedStyle === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className="text-xs text-gray-600">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Image Format</label>
                <div className="space-y-2">
                  {IMAGE_SIZES.map((size) => (
                    <label key={size.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="imageSize"
                        value={size.id}
                        checked={selectedSize === size.id}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-sm">{size.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({size.ratio})</span>
                        <div className="text-xs text-gray-600">{size.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={generating}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Hero Images</h3>
            <p className="text-gray-600 mb-4">
              Upload your own images for the hero section
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Choose Images</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supports JPG, PNG, WebP. Recommended: 1920x1080px
            </p>
          </div>
        </div>
      )}

      {/* Generated/Uploaded Images Gallery */}
      {allImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Images ({allImages.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allImages.map((image) => (
              <div
                key={image.id}
                className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedImage?.id === image.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectImage(image)}
              >
                <div className="aspect-video bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.prompt || image.name || 'Hero image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    {selectedImage?.id === image.id && (
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <div className="text-white text-xs">
                    {image.type === 'uploaded' ? (
                      <div>Uploaded: {image.name}</div>
                    ) : (
                      <div>
                        <div>Style: {image.style}</div>
                        <div className="truncate">Prompt: {image.prompt}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Section */}
      {selectedImage && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Hero Image</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-white rounded-lg overflow-hidden border">
                <img
                  src={selectedImage.url}
                  alt="Selected hero image"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Device Preview Toggles */}
              <div className="flex justify-center space-x-2 bg-white rounded-lg p-2">
                <button className="p-2 rounded-md bg-blue-50 text-blue-600">
                  <Monitor className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <Tablet className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Image Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image Details</h4>
                <div className="space-y-2 text-sm">
                  {selectedImage.type === 'uploaded' ? (
                    <>
                      <div><span className="font-medium">Type:</span> Uploaded Image</div>
                      <div><span className="font-medium">Name:</span> {selectedImage.name}</div>
                      <div><span className="font-medium">Size:</span> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</div>
                    </>
                  ) : (
                    <>
                      <div><span className="font-medium">Type:</span> AI Generated</div>
                      <div><span className="font-medium">Style:</span> {selectedImage.style}</div>
                      <div><span className="font-medium">Prompt:</span> {selectedImage.prompt}</div>
                    </>
                  )}
                  <div><span className="font-medium">Created:</span> {new Date(selectedImage.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Usage in Website</h4>
                <p className="text-sm text-gray-600">
                  This image will be used as the background for your hero section. 
                  It will be automatically optimized for different screen sizes and devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Images State */}
      {allImages.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mt-8">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">
            Generate AI images or upload your own to get started
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('generate')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate with AI</span>
            </button>
            <label
              htmlFor="image-upload"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Images</span>
            </label>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">
            Hero Images {allImages.length > 0 ? 'Ready' : 'Optional'}
          </div>
          <div className="text-xs text-gray-500">
            {allImages.length} image{allImages.length !== 1 ? 's' : ''} added
            {selectedImage ? ' • 1 selected' : ''}
          </div>
        </div>

        <button
          onClick={onNext}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Next: Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}