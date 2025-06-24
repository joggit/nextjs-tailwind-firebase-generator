// components/deployment/DeploymentForm.jsx - React component for deployment
'use client'

import { useState } from 'react'
import { Cloud, Server, Globe, Key, Settings } from 'lucide-react'

export default function DeploymentForm({ project, onDeploy }) {
  const [config, setConfig] = useState({
    server: {
      host: '',
      port: 22,
      username: 'ubuntu',
      key_file: '~/.ssh/id_rsa',
      password: ''
    },
    deployment: {
      app_name: project?.name?.toLowerCase().replace(/\s+/g, '-') || 'nextjs-app',
      domain: '',
      port: 3000,
      ssl_enabled: false,
      pm2_enabled: true,
      nginx_enabled: true
    }
  })
  
  const [deploying, setDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState(null)

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setDeploymentResult(null)
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectZip: project.zipData, // Base64 encoded zip
          deploymentConfig: config,
          projectName: project.name
        })
      })
      
      const result = await response.json()
      setDeploymentResult(result)
      
      if (result.success) {
        onDeploy?.(result)
      }
      
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: 'Deployment request failed',
        details: error.message
      })
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Cloud className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Deploy to Server</h2>
        </div>

        {/* Server Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Server className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Server Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server Host *
                </label>
                <input
                  type="text"
                  value={config.server.host}
                  onChange={(e) => handleInputChange('server', 'host', e.target.value)}
                  placeholder="your-server.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SSH Port
                </label>
                <input
                  type="number"
                  value={config.server.port}
                  onChange={(e) => handleInputChange('server', 'port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={config.server.username}
                  onChange={(e) => handleInputChange('server', 'username', e.target.value)}
                  placeholder="ubuntu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SSH Key Path
                </label>
                <input
                  type="text"
                  value={config.server.key_file}
                  onChange={(e) => handleInputChange('server', 'key_file', e.target.value)}
                  placeholder="~/.ssh/id_rsa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Deployment Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Deployment Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Name *
                </label>
                <input
                  type="text"
                  value={config.deployment.app_name}
                  onChange={(e) => handleInputChange('deployment', 'app_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  value={config.deployment.domain}
                  onChange={(e) => handleInputChange('deployment', 'domain', e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Port
                </label>
                <input
                  type="number"
                  value={config.deployment.port}
                  onChange={(e) => handleInputChange('deployment', 'port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deployment.ssl_enabled}
                    onChange={(e) => handleInputChange('deployment', 'ssl_enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable SSL</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deployment.pm2_enabled}
                    onChange={(e) => handleInputChange('deployment', 'pm2_enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use PM2</span>
                </label>
              </div>
            </div>
          </div>

          {/* Deployment Results */}
          {deploymentResult && (
            <div className={`rounded-lg p-6 ${
              deploymentResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                {deploymentResult.success ? (
                  <>
                    <Globe className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Deployment Successful!</h3>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 text-red-600">❌</div>
                    <h3 className="font-semibold text-red-800">Deployment Failed</h3>
                  </>
                )}
              </div>
              
              {deploymentResult.success ? (
                <div className="space-y-2">
                  <p className="text-green-700">{deploymentResult.message}</p>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Your application is now live at:</p>
                    <a 
                      href={deploymentResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {deploymentResult.url}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-700">{deploymentResult.error}</p>
                  {deploymentResult.details && (
                    <div className="bg-white rounded p-3 border border-red-200">
                      <p className="text-sm text-gray-600 mb-1">Error details:</p>
                      <pre className="text-xs text-red-800 whitespace-pre-wrap">
                        {deploymentResult.details}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Deploy Button */}
          <div className="flex justify-end">
            <button
              onClick={handleDeploy}
              disabled={deploying || !config.server.host || !config.deployment.domain}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {deploying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  <span>Deploy to Server</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
