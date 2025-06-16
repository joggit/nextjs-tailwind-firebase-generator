'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/vector/FileUpload'
import { Brain, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function DocumentToVectors({ className = '', onDocumentsProcessed }) {
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, success, error
  const [uploadResults, setUploadResults] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const handleUploadComplete = (results) => {
    console.log('Upload results:', results)
    setUploadResults(results)
    
    const successfulUploads = results.filter(r => r.success)
    const failedUploads = results.filter(r => !r.success)
    
    if (successfulUploads.length > 0) {
      setUploadStatus('success')
      onDocumentsProcessed?.(successfulUploads)
    } else if (failedUploads.length > 0) {
      setUploadStatus('error')
      setErrorMessage(failedUploads[0].error || 'Upload failed')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Upload Business Documents (Optional)
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your business plan, marketing materials, or any relevant documents 
          to enhance AI content generation with your specific information.
        </p>
      </div>

      {/* Upload Status */}
      {uploadStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h4 className="font-medium text-green-800">Documents Processed Successfully!</h4>
              <p className="text-green-700 text-sm mt-1">
                {uploadResults.filter(r => r.success).length} documents have been vectorized and will enhance your website content.
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {uploadResults.filter(r => r.success).map((result, index) => (
              <div key={index} className="text-sm text-green-700 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {result.file} - {result.result?.chunkCount || 0} chunks created
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h4 className="font-medium text-red-800">Upload Failed</h4>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Component */}
      <div className="bg-gray-50 rounded-xl p-6">
        <FileUpload
          onUploadComplete={handleUploadComplete}
          maxFiles={5}
          acceptedTypes=".txt,.md,.pdf,.doc,.docx"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Brain className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">How Vector Enhancement Works</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your documents are analyzed and converted to vector embeddings</li>
              <li>• AI uses this information to generate more accurate content</li>
              <li>• Website copy becomes tailored to your specific business</li>
              <li>• Services and features match your actual offerings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}