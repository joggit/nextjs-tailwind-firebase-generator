// Vector Admin Dashboard Pages
// File: app/admin/vector/page.js

'use client'

import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/vector/FileUpload'
import { DocumentManager } from '@/components/vector/DocumentManager'
import { VectorSearch } from '@/components/vector/VectorSearch'
import { 
  Brain, 
  Database, 
  Upload, 
  Search, 
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'

export default function VectorAdminPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [systemHealth, setSystemHealth] = useState(null)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/vector/health')
      if (response.ok) {
        const health = await response.json()
        setSystemHealth(health)
      }
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const handleUploadComplete = (results) => {
    console.log('Upload results:', results)
    // Optionally refresh document list or show notification
  }

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'documents', label: 'Manage Documents', icon: Database },
    { id: 'search', label: 'Vector Search', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Vector Admin</h1>
                  <p className="text-sm text-gray-600">AI Document Management</p>
                </div>
              </div>
            </div>
            
            {/* System Health Indicator */}
            <div className="flex items-center space-x-4">
              {systemHealth && (
                <div className="flex items-center space-x-2">
                  {systemHealth.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {systemHealth.status === 'healthy' ? 'System Healthy' : 'System Issues'}
                  </span>
                </div>
              )}
              <button
                onClick={checkSystemHealth}
                className="text-gray-600 hover:text-gray-900"
                title="Refresh health status"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Details */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                System health issues detected. Some features may not work properly.
              </p>
              <div className="mt-2 text-xs text-red-600">
                <div>Firestore: {systemHealth.vectorService?.firestore ? '✅' : '❌'}</div>
                <div>Storage: {systemHealth.vectorService?.storage ? '✅' : '❌'}</div>
                <div>OpenAI: {systemHealth.vectorService?.openai ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload & Vectorize Documents</h2>
                <p className="text-gray-600">
                  Upload documents to be processed with AI and stored as vectors for intelligent search.
                </p>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxFiles={10}
                acceptedTypes=".txt,.md,.pdf,.doc,.docx"
              />
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Library</h2>
                <p className="text-gray-600">
                  Manage your vectorized documents and their AI-generated embeddings.
                </p>
              </div>
              <DocumentManager />
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vector Search</h2>
                <p className="text-gray-600">
                  Search through your vectorized documents using semantic similarity.
                </p>
              </div>
              <VectorSearch onResults={setSearchResults} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <VectorAnalytics systemHealth={systemHealth} />
          )}

          {activeTab === 'settings' && (
            <VectorSettings systemHealth={systemHealth} onHealthChange={setSystemHealth} />
          )}
        </div>
      </div>
    </div>
  )
}

// Vector Analytics Component
function VectorAnalytics({ systemHealth }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // You would implement analytics endpoints
      // For now, we'll use mock data
      setTimeout(() => {
        setAnalytics({
          totalDocuments: 24,
          totalChunks: 1247,
          totalStorage: 15.7, // MB
          averageChunkSize: 847,
          processingSuccess: 96.2,
          searchQueries: 156,
          topSearchTerms: [
            'machine learning',
            'customer support',
            'data processing',
            'automation',
            'analytics'
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Brain className="w-8 h-8 animate-pulse text-blue-600 mr-3" />
        <span className="text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">Upload some documents to see analytics</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vector Analytics</h2>
        <p className="text-gray-600">
          Insights into your document vectorization and search performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Documents</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.totalDocuments}</p>
            </div>
            <Database className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Vector Chunks</p>
              <p className="text-3xl font-bold text-purple-900">{analytics.totalChunks.toLocaleString()}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Storage Used</p>
              <p className="text-3xl font-bold text-green-900">{analytics.totalStorage}MB</p>
            </div>
            <Database className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Success Rate</p>
              <p className="text-3xl font-bold text-orange-900">{analytics.processingSuccess}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Chunk Size</span>
              <span className="font-semibold">{analytics.averageChunkSize} chars</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Processing Success Rate</span>
              <span className="font-semibold text-green-600">{analytics.processingSuccess}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Search Queries</span>
              <span className="font-semibold">{analytics.searchQueries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vector Embeddings</span>
              <span className="font-semibold">{analytics.totalChunks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Search Terms */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Terms</h3>
          <div className="space-y-3">
            {analytics.topSearchTerms.map((term, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{term}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${100 - (index * 15)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{100 - (index * 15)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Vector Settings Component
function VectorSettings({ systemHealth, onHealthChange }) {
  const [settings, setSettings] = useState({
    embeddingModel: 'text-embedding-ada-002',
    chunkSize: 1000,
    chunkOverlap: 200,
    similarityThreshold: 0.7,
    maxResults: 10,
    enableAutoProcessing: true
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Here you would save settings to your backend
      setTimeout(() => {
        setSaving(false)
        alert('Settings saved successfully!')
      }, 1000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      const response = await fetch('/api/vector/health')
      if (response.ok) {
        const health = await response.json()
        onHealthChange(health)
        alert('Connection test successful!')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Connection test failed!')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vector Settings</h2>
        <p className="text-gray-600">
          Configure your vector processing and search parameters.
        </p>
      </div>

      <div className="space-y-8">
        {/* System Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          {systemHealth ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firestore Database</span>
                <span className={`font-semibold ${systemHealth.vectorService?.firestore ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.vectorService?.firestore ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firebase Storage</span>
                <span className={`font-semibold ${systemHealth.vectorService?.storage ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.vectorService?.storage ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">OpenAI API</span>
                <span className={`font-semibold ${systemHealth.vectorService?.openai ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.vectorService?.openai ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading system status...</p>
          )}
          
          <button
            onClick={testConnection}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Connections
          </button>
        </div>

        {/* Vector Processing Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Embedding Model
              </label>
              <select
                value={settings.embeddingModel}
                onChange={(e) => setSettings(prev => ({ ...prev, embeddingModel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                <option value="text-embedding-3-small">text-embedding-3-small</option>
                <option value="text-embedding-3-large">text-embedding-3-large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Size (characters)
              </label>
              <input
                type="number"
                value={settings.chunkSize}
                onChange={(e) => setSettings(prev => ({ ...prev, chunkSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="4000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Overlap (characters)
              </label>
              <input
                type="number"
                value={settings.chunkOverlap}
                onChange={(e) => setSettings(prev => ({ ...prev, chunkOverlap: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold
              </label>
              <input
                type="number"
                value={settings.similarityThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, similarityThreshold: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableAutoProcessing}
                onChange={(e) => setSettings(prev => ({ ...prev, enableAutoProcessing: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Enable automatic processing of uploaded files</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {saving ? (
              <span className="flex items-center">
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}