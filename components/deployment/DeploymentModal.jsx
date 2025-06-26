// components/DeploymentModal.jsx
'use client'

import { useState } from 'react'
import { Upload, Loader, CheckCircle } from 'lucide-react'

export default function DeploymentModal({ projectData, isOpen, onClose }) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState(null)
  const [config, setConfig] = useState({
    project_name: projectData?.name?.toLowerCase().replace(/\s+/g, '_') || '',
    domain: '',
    subdomain: '',
    server_name: 'production',
    ssl_enabled: true
  })

  const handleDeploy = async () => {
    setIsDeploying(true)

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectData,
          deploymentConfig: config
        })
      })

      const result = await response.json()

      if (result.success) {
        setDeploymentStatus('success')
        // Poll for deployment status
        pollDeploymentStatus(result.deployment_id)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setDeploymentStatus('error')
      console.error('Deployment failed:', error)
    }
  }

  const pollDeploymentStatus = async (deploymentId) => {
    // Implementation for polling deployment status
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Deploy to Production</h2>
        
        {!isDeploying ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Domain (e.g., example.com)"
              value={config.domain}
              onChange={(e) => setConfig({...config, domain: e.target.value})}
              className="w-full p-2 border rounded"
            />
            
            <input
              type="text"
              placeholder="Subdomain (optional)"
              value={config.subdomain}
              onChange={(e) => setConfig({...config, subdomain: e.target.value})}
              className="w-full p-2 border rounded"
            />
            
            <button
              onClick={handleDeploy}
              disabled={!config.domain}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Deploy Now
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            {deploymentStatus === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            )}
            <p>Deploying your website...</p>
          </div>
        )}
        
        <button onClick={onClose} className="mt-4 w-full border py-2 rounded">
          Close
        </button>
      </div>
    </div>
  )
}