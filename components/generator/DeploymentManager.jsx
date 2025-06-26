'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Server, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Monitor,
  Shield,
  Zap,
  Database,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

export default function DeploymentManager({ project, onDeploymentComplete }) {
  const [deploymentStatus, setDeploymentStatus] = useState('idle') // idle, packaging, deploying, success, error
  const [deploymentConfig, setDeploymentConfig] = useState({
    siteName: project?.name?.toLowerCase().replace(/\s+/g, '-') || '',
    domain: '',
    serverConfig: 'production', // production, staging, custom
    enableSSL: false,
    enablePM2: true,
    enableOptimization: true
  })
  const [deploymentLog, setDeploymentLog] = useState([])
  const [error, setError] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [packageInfo, setPackageInfo] = useState(null)

  // Auto-generate site name from project name
  useEffect(() => {
    if (project?.name && !deploymentConfig.siteName) {
      setDeploymentConfig(prev => ({
        ...prev,
        siteName: project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }))
    }
  }, [project?.name])

  const serverConfigs = {
    production: {
      name: 'Production Server',
      description: 'Deploy to live production environment',
      icon: '🚀',
      color: 'green'
    },
    staging: {
      name: 'Staging Server', 
      description: 'Deploy to staging environment for testing',
      icon: '🧪',
      color: 'blue'
    },
    custom: {
      name: 'Custom Server',
      description: 'Deploy to a custom server configuration',
      icon: '⚙️',
      color: 'purple'
    }
  }

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setDeploymentLog(prev => [...prev, { timestamp, message, type, id: Date.now() }])
  }

  const clearLogs = () => {
    setDeploymentLog([])
  }

  const generateDeploymentPackage = async () => {
    try {
      setDeploymentStatus('packaging')
      addLogEntry('Generating deployment package...', 'info')

      const response = await fetch('/api/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project.id,
          optimization: deploymentConfig.enableOptimization ? 'production' : 'development'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate package')
      }

      const packageData = await response.json()
      setPackageInfo(packageData)
      addLogEntry(`✅ Package generated (${(packageData.packageSize / 1024 / 1024).toFixed(2)}MB, ${packageData.files} files)`, 'success')
      
      return packageData

    } catch (error) {
      addLogEntry(`❌ Package generation failed: ${error.message}`, 'error')
      throw error
    }
  }

  const deployToServer = async (packageData) => {
    try {
      setDeploymentStatus('deploying')
      addLogEntry('Deploying to remote server...', 'info')
      addLogEntry(`Target: ${deploymentConfig.siteName} (${deploymentConfig.serverConfig})`, 'info')

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packagePath: packageData.packagePath,
          siteName: deploymentConfig.siteName,
          domain: deploymentConfig.domain,
          serverConfig: deploymentConfig.serverConfig,
          options: {
            enableSSL: deploymentConfig.enableSSL,
            enablePM2: deploymentConfig.enablePM2,
            enableOptimization: deploymentConfig.enableOptimization
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Deployment failed')
      }

      const deployData = await response.json()
      
      if (deployData.success) {
        addLogEntry('✅ Deployment completed successfully!', 'success')
        addLogEntry(`🌐 Site available at: ${deployData.url}`, 'success')
        setDeploymentStatus('success')
        setDeploymentResult(deployData)
        onDeploymentComplete?.(deployData)
      } else {
        throw new Error(deployData.error || 'Deployment failed')
      }

      return deployData

    } catch (error) {
      addLogEntry(`❌ Deployment failed: ${error.message}`, 'error')
      throw error
    }
  }

  const deployWebsite = async () => {
    if (!project) {
      setError('No project available for deployment')
      return
    }

    if (!deploymentConfig.siteName.trim()) {
      setError('Site name is required')
      return
    }

    setError(null)
    setDeploymentResult(null)
    clearLogs()
    
    try {
      // Step 1: Generate package
      const packageData = await generateDeploymentPackage()
      
      // Step 2: Deploy to server
      await deployToServer(packageData)

    } catch (err) {
      setError(err.message)
      setDeploymentStatus('error')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addLogEntry(`📋 Copied to clipboard: ${text}`, 'info')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getStatusConfig = () => {
    switch (deploymentStatus) {
      case 'packaging':
        return {
          icon: <Loader className="w-5 h-5 animate-spin text-blue-600" />,
          text: 'Generating Package...',
          color: 'text-blue-600'
        }
      case 'deploying':
        return {
          icon: <Loader className="w-5 h-5 animate-spin text-blue-600" />,
          text: 'Deploying to Server...',
          color: 'text-blue-600'
        }
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Deployed Successfully',
          color: 'text-green-600'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'Deployment Failed',
          color: 'text-red-600'
        }
      default:
        return {
          icon: <Server className="w-5 h-5 text-gray-600" />,
          text: 'Ready to Deploy',
          color: 'text-gray-600'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const isDeploying = deploymentStatus === 'packaging' || deploymentStatus === 'deploying'

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusConfig.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Deploy Website</h3>
              <p className={`text-sm ${statusConfig.color}`}>{statusConfig.text}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Multi-host Deployment</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Info */}
        {project && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Project Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-medium text-gray-900">{project.name}</div>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="font-medium text-gray-900 capitalize">{project.type}</div>
              </div>
              <div>
                <span className="text-gray-600">Files:</span>
                <div className="font-medium text-gray-900">
                  {project.files ? Object.keys(project.files).length : 'N/A'} files
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Deployment Configuration
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name *
              </label>
              <input
                type="text"
                value={deploymentConfig.siteName}
                onChange={(e) => setDeploymentConfig(prev => ({ 
                  ...prev, 
                  siteName: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                }))}
                placeholder="my-awesome-site"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDeploying}
              />
              <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain (Optional)
              </label>
              <input
                type="text"
                value={deploymentConfig.domain}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="mysite.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDeploying}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use default subdomain</p>
            </div>
          </div>

          {/* Server Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Server
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(serverConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setDeploymentConfig(prev => ({ ...prev, serverConfig: key }))}
                  disabled={isDeploying}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    deploymentConfig.serverConfig === key
                      ? `border-${config.color}-500 bg-${config.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isDeploying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-medium text-gray-900">{config.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{config.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isDeploying}
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900">Advanced Settings</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.enableSSL}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, enableSSL: e.target.checked }))}
                    disabled={isDeploying}
                    className="rounded border-gray-300 mr-2"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Enable SSL/HTTPS</span>
                    <p className="text-xs text-gray-500">Requires SSL certificate configuration</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.enablePM2}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, enablePM2: e.target.checked }))}
                    disabled={isDeploying}
                    className="rounded border-gray-300 mr-2"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">PM2 Process Management</span>
                    <p className="text-xs text-gray-500">For Node.js process monitoring</p>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.enableOptimization}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, enableOptimization: e.target.checked }))}
                    disabled={isDeploying}
                    className="rounded border-gray-300 mr-2"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Production Optimization</span>
                    <p className="text-xs text-gray-500">Minify files and optimize for production</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Package Information */}
        {packageInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Package Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Size:</span>
                <div className="font-medium text-blue-900">
                  {(packageInfo.packageSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div>
                <span className="text-blue-600">Files:</span>
                <div className="font-medium text-blue-900">{packageInfo.files}</div>
              </div>
              <div>
                <span className="text-blue-600">Optimization:</span>
                <div className="font-medium text-blue-900 capitalize">{packageInfo.optimization}</div>
              </div>
              <div>
                <span className="text-blue-600">Status:</span>
                <div className="font-medium text-green-900">Ready</div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment Button */}
        <button
          onClick={deployWebsite}
          disabled={!deploymentConfig.siteName || isDeploying}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
        >
          {isDeploying ? (
            <span className="flex items-center justify-center">
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {deploymentStatus === 'packaging' ? 'Generating Package...' : 'Deploying to Server...'}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Server className="w-5 h-5 mr-2" />
              Deploy to Server
            </span>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium text-red-800">Deployment Error</span>
                <p className="text-red-700 mt-1 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Success Display */}
        {deploymentStatus === 'success' && deploymentResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Deployment Successful! 🎉</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-700 text-sm">Live URL:</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={deploymentResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    {deploymentResult.url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(deploymentResult.url)}
                    className="text-green-600 hover:text-green-700"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-green-700 text-sm">Site Name:</span>
                <span className="text-green-900 font-medium text-sm">{deploymentResult.siteName}</span>
              </div>
              
              {deploymentResult.domain && (
                <div className="flex items-center justify-between">
                  <span className="text-green-700 text-sm">Domain:</span>
                  <span className="text-green-900 font-medium text-sm">{deploymentResult.domain}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deployment Log */}
        {deploymentLog.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Deployment Log
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearLogs}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                  disabled={isDeploying}
                >
                  Clear
                </button>
                <button
                  onClick={() => setDeploymentLog([...deploymentLog])}
                  className="text-gray-500 hover:text-gray-700"
                  title="Refresh logs"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
              <div className="space-y-1">
                {deploymentLog.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-2">
                    <span className="text-gray-500 min-w-20 text-xs">
                      {entry.timestamp}
                    </span>
                    <span className={`${
                      entry.type === 'error' ? 'text-red-400' :
                      entry.type === 'success' ? 'text-green-400' :
                      'text-gray-300'
                    }`}>
                      {entry.message}
                    </span>
                  </div>
                ))}
                {isDeploying && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <span className="text-gray-500 min-w-20 text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Deployment Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center">
              <Zap className="w-3 h-3 mr-2" />
              <span>Automated nginx configuration</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-2" />
              <span>Security headers & optimization</span>
            </div>
            <div className="flex items-center">
              <Database className="w-3 h-3 mr-2" />
              <span>Static file caching</span>
            </div>
            <div className="flex items-center">
              <Server className="w-3 h-3 mr-2" />
              <span>Multi-site hosting support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}