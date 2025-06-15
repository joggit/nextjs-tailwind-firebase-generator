// File: components/vector/DocumentManager.jsx

'use client'

import { useState, useEffect } from 'react'
import { File, Download, Trash2, Search, Calendar, Database, Brain, ExternalLink } from 'lucide-react'

export function DocumentManager() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocs, setSelectedDocs] = useState(new Set())

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/vector/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document and all its vectors?')) {
      return
    }

    try {
      const response = await fetch(`/api/vector/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        setSelectedDocs(prev => {
          const newSet = new Set(prev)
          newSet.delete(documentId)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const deleteSelected = async () => {
    if (selectedDocs.size === 0) return
    
    if (!confirm(`Delete ${selectedDocs.size} selected documents?`)) {
      return
    }

    const promises = Array.from(selectedDocs).map(docId => 
      fetch(`/api/vector/documents/${docId}`, { method: 'DELETE' })
    )

    try {
      await Promise.all(promises)
      setDocuments(prev => prev.filter(doc => !selectedDocs.has(doc.id)))
      setSelectedDocs(new Set())
    } catch (error) {
      console.error('Failed to delete selected documents:', error)
    }
  }

  const toggleSelectDoc = (docId) => {
    setSelectedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.metadata && JSON.stringify(doc.metadata).toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Brain className="w-8 h-8 animate-pulse text-blue-600 mr-3" />
        <span className="text-gray-600">Loading vector documents...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Vector Document Library</h2>
        </div>
        <p className="text-gray-600">
          Manage your vectorized documents and their AI-generated embeddings
        </p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {selectedDocs.size > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedDocs.size})</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <File className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vector Chunks</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0)}
              </p>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0) / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
            <Brain className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vectorized</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => doc.vectorized).length}
              </p>
            </div>
            <Brain className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'Upload some documents to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDocs.size === filteredDocuments.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs(new Set(filteredDocuments.map(doc => doc.id)))
                        } else {
                          setSelectedDocs(new Set())
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Document</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Chunks</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Uploaded</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => toggleSelectDoc(doc.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-sm text-gray-500">{doc.fileType}</p>
                          {doc.vectorized && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <Brain className="w-3 h-3 mr-1" />
                              Vectorized
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.chunkCount || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(doc.createdAt.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {doc.downloadURL && (
                          <a
                            href={doc.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
