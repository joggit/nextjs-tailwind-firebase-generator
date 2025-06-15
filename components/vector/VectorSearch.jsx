// File: components/vector/VectorSearch.jsx

'use client'

import { useState } from 'react'
import { Search, Brain, FileText, Sparkles } from 'lucide-react'

export function VectorSearch({ onResults }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    try {
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
          threshold: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        onResults?.(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search through vectorized documents..."
            className="block w-full pl-10 pr-20 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="mr-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {searching ? (
                <Brain className="w-5 h-5 animate-pulse" />
              ) : (
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Search
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Search Results ({results.length})
          </h3>
          
          {results.map((result, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Document Chunk</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {Math.round(result.similarity * 100)}% match
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Chunk {result.chunkIndex + 1}
                </span>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {result.text}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Document ID: {result.documentId}</span>
                <span>Similarity: {result.similarity.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or uploading more documents
          </p>
        </div>
      )}
    </div>
  )
}