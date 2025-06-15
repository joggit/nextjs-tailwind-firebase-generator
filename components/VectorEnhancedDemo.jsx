// components/VectorEnhancedDemo.jsx

'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Zap, 
  FileText, 
  Globe, 
  Database,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  BarChart3
} from 'lucide-react'
import DocumentToVectors from '@/components/vector/DocumentToVectors'

export default function VectorEnhancedDemo() {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessData, setBusinessData] = useState({
    businessName: 'TechSolutions Pro',
    industry: 'Technology',
    businessType: 'Consulting',
    targetAudience: 'Small to medium businesses',
    keyServices: ['Web Development', 'Digital Marketing', 'IT Consulting'],
    businessDescription: 'We help businesses leverage technology to grow and succeed in the digital age.'
  })
  const [vectorData, setVectorData] = useState(null)
  const [generationStatus, setGenerationStatus] = useState('idle')
  const [generatedWebsite, setGeneratedWebsite] = useState(null)
  const [demoMode, setDemoMode] = useState(true)

  const steps = [
    {
      number: 1,
      title: 'Upload Business Documents',
      description: 'Upload your business plan, marketing materials, or any relevant documents',
      icon: FileText,
      status: 'active'
    },
    {
      number: 2,
      title: 'AI Vector Processing',
      description: 'Documents are analyzed and converted to vector embeddings',
      icon: Brain,
      status: 'pending'
    },
    {
      number: 3,
      title: 'Enhanced Content Generation',
      description: 'AI generates personalized website content using your documents',
      icon: Zap,
      status: 'pending'
    },
    {
      number: 4,
      title: 'Website Creation',
      description: 'Complete website with HTML, CSS, and JavaScript files',
      icon: Globe,
      status: 'pending'
    }
  ]

  const [processSteps, setProcessSteps] = useState(steps)

  // Demo data for vector enhancement
  const demoVectorData = {
    documentsProcessed: 3,
    vectorsCreated: 47,
    keyInsights: [
      'Strong focus on digital transformation services',
      'Expertise in cloud migration and automation',
      'Proven track record with 150+ successful projects',
      'Specialization in small to medium business solutions'
    ],
    relevantContent: [
      {
        document: 'business-plan.pdf',
        similarity: 0.92,
        content: 'TechSolutions Pro specializes in helping businesses modernize their technology infrastructure...'
      },
      {
        document: 'services-overview.docx',
        similarity: 0.89,
        content: 'Our comprehensive suite of digital services includes web development, cloud solutions...'
      },
      {
        document: 'case-studies.md',
        similarity: 0.85,
        content: 'We have successfully helped over 150 businesses achieve their digital transformation goals...'
      }
    ]
  }

  useEffect(() => {
    if (demoMode && currentStep === 2) {
      // Simulate vector processing
      setTimeout(() => {
        setVectorData(demoVectorData)
        updateStepStatus(2, 'completed')
        updateStepStatus(3, 'active')
        setCurrentStep(3)
      }, 3000)
    }
  }, [currentStep, demoMode])

  const updateStepStatus = (stepNumber, status) => {
    setProcessSteps(prev => 
      prev.map(step => 
        step.number === stepNumber 
          ? { ...step, status }
          : step
      )
    )
  }

  const handleDocumentUpload = (uploadResults) => {
    if (uploadResults && uploadResults.length > 0) {
      updateStepStatus(1, 'completed')
      updateStepStatus(2, 'active')
      setCurrentStep(2)
      setDemoMode(false)
    }
  }

  const generateWebsite = async () => {
    setGenerationStatus('generating')
    updateStepStatus(3, 'active')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...businessData,
          vectorEnhancement: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedWebsite(result.data)
        setGenerationStatus('completed')
        updateStepStatus(3, 'completed')
        updateStepStatus(4, 'completed')
        setCurrentStep(4)
      } else {
        setGenerationStatus('error')
        console.error('Generation failed:', result.error)
      }

    } catch (error) {
      setGenerationStatus('error')
      console.error('Generation error:', error)
    }
  }

  const startDemo = () => {
    setDemoMode(true)
    setCurrentStep(2)
    updateStepStatus(1, 'completed')
    updateStepStatus(2, 'active')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vector-Enhanced Website Generator
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your business documents and watch as AI creates a personalized website 
          using intelligent vector analysis of your content.
        </p>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How Vector Enhancement Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon
            const isActive = step.status === 'active'
            const isCompleted = step.status === 'completed'
            const isPending = step.status === 'pending'

            return (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <IconComponent className="w-8 h-8" />
                    )}
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${
                    isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className={`text-sm ${
                    isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className={`h-0.5 w-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                    <ArrowRight className={`absolute top-1/2 right-4 transform -translate-y-1/2 w-4 h-4 ${
                      isCompleted ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={startDemo}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Zap className="w-5 h-5 mr-2 inline" />
          Start Demo Mode
        </button>
        
        {vectorData && (
          <button
            onClick={generateWebsite}
            disabled={generationStatus === 'generating'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {generationStatus === 'generating' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2 inline" />
                Generate Website
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Document Upload */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <DocumentToVectors 
              onUploadComplete={handleDocumentUpload}
              className="bg-white rounded-xl shadow-lg p-6"
            />
          )}

          {/* Vector Processing Display */}
          {currentStep >= 2 && vectorData && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                Vector Analysis Results
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{vectorData.documentsProcessed}</div>
                  <div className="text-sm text-blue-700">Documents Processed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{vectorData.vectorsCreated}</div>
                  <div className="text-sm text-purple-700">Vectors Created</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(vectorData.relevantContent[0]?.similarity * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-green-700">Best Match</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Key Insights Extracted:</h4>
                <ul className="space-y-2">
                  {vectorData.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Most Relevant Content:</h4>
                <div className="space-y-3">
                  {vectorData.relevantContent.map((content, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-blue-600">{content.document}</span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {(content.similarity * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{content.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Website Generation Results */}
          {generatedWebsite && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-green-600" />
                Generated Website
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedWebsite.metadata?.fileCount || 5}
                  </div>
                  <div className="text-sm text-green-700">Files Generated</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generatedWebsite.metadata?.processingTime || '2.3s'}
                  </div>
                  <div className="text-sm text-blue-700">Processing Time</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedWebsite.metadata?.vectorEnhanced ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-purple-700">Vector Enhanced</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Website
                </button>
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Files
                </button>
              </div>

              {generatedWebsite.generatedContent && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Generated Content Preview:</h4>
                  <div className="text-sm text-gray-700">
                    <p><strong>Hero Headline:</strong> {generatedWebsite.generatedContent.hero?.headline}</p>
                    <p><strong>Description:</strong> {generatedWebsite.generatedContent.hero?.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Business Data & Status */}
        <div className="space-y-6">
          {/* Business Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData(prev => ({...prev, businessName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={businessData.industry}
                  onChange={(e) => setBusinessData(prev => ({...prev, industry: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Legal">Legal</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <div className="flex flex-wrap gap-2">
                  {businessData.keyServices.map((service, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Status</h3>
            
            <div className="space-y-3">
              {processSteps.map(step => (
                <div key={step.number} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step.status === 'completed' 
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? '✓' : step.number}
                  </div>
                  <span className={`${
                    step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vector Enhancement Info */}
          {vectorData && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                AI Enhancement Active
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vector Embeddings:</span>
                  <span className="font-semibold">{vectorData.vectorsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents Analyzed:</span>
                  <span className="font-semibold">{vectorData.documentsProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Relevance:</span>
                  <span className="font-semibold text-green-600">
                    {(vectorData.relevantContent[0]?.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
                <p className="text-xs text-gray-600">
                  ✨ Your website content will be personalized based on the analysis 
                  of your uploaded documents, ensuring accuracy and relevance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {generationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Generation Failed</h3>
              <p className="text-red-700">
                There was an error generating your website. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}