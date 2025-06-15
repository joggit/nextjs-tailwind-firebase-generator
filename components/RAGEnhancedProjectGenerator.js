'use client'

import { useState } from 'react'
import { Brain, Zap, Download, Loader, CheckCircle, AlertCircle, Database, Users, Building } from 'lucide-react'
import DocumentToVectors from '@/components/vector/DocumentToVectors'

function RAGEnhancedProjectGenerator() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    businessType: '',
    targetAudience: '',
    keyServices: [],
    businessDescription: '',
    template: 'modern',
    vectorEnhancement: true
  })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [currentService, setCurrentService] = useState('')

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Food & Beverage', 'Legal', 
    'Education', 'Real Estate', 'Marketing', 'Consulting', 'Manufacturing',
    'Retail', 'Hospitality', 'Non-profit', 'Other'
  ]

  const businessTypes = [
    'Startup', 'Small Business', 'Enterprise', 'Agency', 'Freelancer',
    'Non-profit', 'E-commerce', 'SaaS', 'Consulting', 'Other'
  ]

  const templates = [
    { id: 'modern', name: 'Modern Business', description: 'Clean, professional design' },
    { id: 'saas', name: 'SaaS Platform', description: 'Software service focused' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online store layout' },
    { id: 'portfolio', name: 'Portfolio', description: 'Showcase work and projects' },
    { id: 'corporate', name: 'Corporate', description: 'Enterprise-level design' },
    { id: 'blog', name: 'Blog Platform', description: 'Content-focused layout' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addService = () => {
    if (currentService.trim() && !formData.keyServices.includes(currentService.trim())) {
      setFormData(prev => ({
        ...prev,
        keyServices: [...prev.keyServices, currentService.trim()]
      }))
      setCurrentService('')
    }
  }

  const removeService = (serviceToRemove) => {
    setFormData(prev => ({
      ...prev,
      keyServices: prev.keyServices.filter(service => service !== serviceToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customRequirements: formData.businessDescription
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to generate project')
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadProject = async () => {
    if (!result) return

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: result.project }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.businessName || 'website'}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        setError('Failed to download project')
      }
    } catch (err) {
      setError(`Download failed: ${err.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Vector Enhancement Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">Vector RAG Enhanced</h3>
              <p className="text-blue-100">AI-powered website generation with industry intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <Database className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">Vector DB</div>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">AI Content</div>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">Industry Match</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
                required
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Who are your ideal customers?"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your business, services, and what makes you unique..."
            />
          </div>
        </div>

        {/* Services */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Key Services</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentService}
              onChange={(e) => setCurrentService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a service (e.g., Web Development, Consulting)"
            />
            <button
              type="button"
              onClick={addService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.keyServices.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Template Selection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <label
                key={template.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  formData.template === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={formData.template === template.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 mt-0.5 ${
                    formData.template === template.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.template === template.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Vector Enhancement Options */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Vector AI Enhancement
          </h3>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="vectorEnhancement"
              checked={formData.vectorEnhancement}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Enable Vector RAG Intelligence</span>
              <p className="text-sm text-gray-600">
                Use AI to analyze similar companies and generate industry-specific content
              </p>
            </div>
          </label>
        </div>
         <DocumentToVectors className="mt-12" />

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !formData.businessName || !formData.industry || !formData.businessType}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Vector-Enhanced Website
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Generation Failed</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Website Generated Successfully!</span>
            </div>
            <button
              onClick={downloadProject}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Files Generated</div>
              <div className="text-gray-600">{result.metadata?.fileCount || 0} files</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Processing Time</div>
              <div className="text-gray-600">{result.metadata?.processingTime || 'N/A'}</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="font-medium text-gray-900">Vector Enhanced</div>
              <div className="text-gray-600">
                {result.metadata?.vectorEnhanced ? '✅ Active' : '❌ Disabled'}
              </div>
            </div>
          </div>

          {result.project?.generatedContent && (
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">AI-Generated Content Preview</h4>
              <p className="text-gray-600 text-sm">
                <strong>Headline:</strong> {result.project.generatedContent.hero?.headline || 'Generated with AI'}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Description:</strong> {result.project.generatedContent.hero?.subheadline || 'AI-enhanced content'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RAGEnhancedProjectGenerator