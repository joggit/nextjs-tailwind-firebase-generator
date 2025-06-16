'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle, Brain, Database } from 'lucide-react'

export function FileUpload({ onUploadComplete, maxFiles = 10, acceptedTypes = '' }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
  }

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      if (acceptedTypes && !acceptedTypes.split(',').some(type => 
        file.type.includes(type.trim()) || file.name.endsWith(type.trim())
      )) {
        return false
      }
      return file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles))
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    const results = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(prev => ({ ...prev, [i]: 0 }))

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('metadata', JSON.stringify({
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          type: file.type,
          size: file.size
        }))

        const response = await fetch('/api/vector/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()
        results.push({ file: file.name, success: true, result })
        setUploadProgress(prev => ({ ...prev, [i]: 100 }))

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        results.push({ file: file.name, success: false, error: error.message })
        setUploadProgress(prev => ({ ...prev, [i]: -1 }))
      }
    }

    setUploading(false)
    onUploadComplete?.(results)
    
    // Clear successful uploads
    const failedIndices = results
      .map((result, index) => result.success ? -1 : index)
      .filter(index => index >= 0)
    
    setFiles(prev => prev.filter((_, index) => failedIndices.includes(index)))
    setUploadProgress({})
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Documents for Vector Analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Brain className="w-4 h-4 mr-1 text-blue-500" />
                AI Processing
              </span>
              <span className="flex items-center">
                <Database className="w-4 h-4 mr-1 text-purple-500" />
                Vector Storage
              </span>
            </div>
          </div>
          
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept={acceptedTypes}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900">Selected Files ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {uploading && uploadProgress[index] !== undefined && (
                  <div className="flex items-center space-x-2">
                    {uploadProgress[index] === -1 ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : uploadProgress[index] === 100 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[index]}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Processing & Vectorizing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload & Vectorize Files
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}


