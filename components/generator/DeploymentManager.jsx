// Deployment Manager - With Domain Selection
// File: components/generator/DeploymentManager.jsx

'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  Server, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  FileText,
  Settings,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

// Configuration for your deployment server
const DEPLOYMENT_API = {
  BASE_URL: 'http://75.119.141.162:5000',
  ENDPOINT: '/api/deploy/nodejs',
  DOMAINS_ENDPOINT: '/api/domains',
  STATUS_ENDPOINT: '/api/status'
}

export default function DeploymentManager({ project, onDeploymentComplete }) {
  const [deploymentStatus, setDeploymentStatus] = useState('idle')
  const [deploymentConfig, setDeploymentConfig] = useState({
    selectedDomain: '',
    enableSSL: false,
    deploymentType: 'nodejs'
  })
  const [availableDomains, setAvailableDomains] = useState([])
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [deploymentLog, setDeploymentLog] = useState([])
  const [error, setError] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)

  // Predefined domains structure for your hosting setup
  const DOMAIN_STRUCTURE = [
    // Datablox domains
    { domain: 'datablox.co.za', port: 3000, type: 'main' },
    { domain: 'app.datablox.co.za', port: 3001, type: 'subdomain' },
    { domain: 'admin.datablox.co.za', port: 3002, type: 'subdomain' },
    { domain: 'api.datablox.co.za', port: 3003, type: 'subdomain' },
    { domain: 'docs.datablox.co.za', port: 3004, type: 'subdomain' },
    { domain: 'blog.datablox.co.za', port: 3005, type: 'subdomain' },
    { domain: 'support.datablox.co.za', port: 3006, type: 'subdomain' },
    
    // Monday Cafe domains
    { domain: 'mondaycafe.co.za', port: 3010, type: 'main' },
    { domain: 'menu.mondaycafe.co.za', port: 3011, type: 'subdomain' },
    { domain: 'order.mondaycafe.co.za', port: 3012, type: 'subdomain' },
    { domain: 'admin.mondaycafe.co.za', port: 3013, type: 'subdomain' },
    { domain: 'booking.mondaycafe.co.za', port: 3014, type: 'subdomain' },
    { domain: 'events.mondaycafe.co.za', port: 3015, type: 'subdomain' },
    { domain: 'loyalty.mondaycafe.co.za', port: 3016, type: 'subdomain' },
    
    // SmartWave domains
    { domain: 'smartwave.co.za', port: 3020, type: 'main' },
    { domain: 'app.smartwave.co.za', port: 3021, type: 'subdomain' },
    { domain: 'dashboard.smartwave.co.za', port: 3022, type: 'subdomain' },
    { domain: 'api.smartwave.co.za', port: 3023, type: 'subdomain' },
    { domain: 'docs.smartwave.co.za', port: 3024, type: 'subdomain' },
    { domain: 'analytics.smartwave.co.za', port: 3025, type: 'subdomain' },
    { domain: 'support.smartwave.co.za', port: 3026, type: 'subdomain' }
  ]

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setDeploymentLog(prev => [...prev, { timestamp, message, type, id: Date.now() }])
  }

  const clearLogs = () => {
    setDeploymentLog([])
  }

  // Fetch available domains from your hosting server
  const fetchAvailableDomains = async () => {
    setLoadingDomains(true)
    try {
      addLogEntry('🔍 Checking available domains...', 'info')
      
      // Fetch existing deployments
      const response = await fetch(`${DEPLOYMENT_API.BASE_URL}${DEPLOYMENT_API.DOMAINS_ENDPOINT}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch domains: ${response.status}`)
      }
      
      const data = await response.json()
      const existingDomains = data.domains || []
      
      // Debug: log what we got from API
      console.log('API Response:', data)
      console.log('Existing domains:', existingDomains)
      addLogEntry(`📊 API returned ${existingDomains.length} domain records`, 'info')
      
      // Get domain names that have active deployments (not just configured)
      const deployedDomainNames = existingDomains
        .filter(d => d.status === 'active' && d.site_type !== 'static') // Only active non-static sites
        .map(d => d.domain_name)
      
      addLogEntry(`🚀 Found ${deployedDomainNames.length} active deployments: ${deployedDomainNames.join(', ')}`, 'info')
      
      // Check for actual running Node.js apps by checking if files exist
      const availableDomainsWithStatus = await Promise.all(
        DOMAIN_STRUCTURE.map(async (domain) => {
          const isConfigured = existingDomains.some(d => d.domain_name === domain.domain)
          const hasActiveDeployment = deployedDomainNames.includes(domain.domain)
          
          // Check if there's an actual running app
          let hasRunningApp = false
          try {
            const statusResponse = await fetch(`${DEPLOYMENT_API.BASE_URL}/api/apps/status/${domain.domain.replace(/\./g, '-')}`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              hasRunningApp = statusData.success && statusData.status === 'running'
            }
          } catch (err) {
            // App status check failed, assume not running
            hasRunningApp = false
          }
          
          return {
            ...domain,
            isConfigured,
            hasActiveDeployment,
            hasRunningApp,
            available: !hasRunningApp // Available if no running app
          }
        })
      )
      
      // Filter to only available domains
      const available = availableDomainsWithStatus.filter(d => d.available)
      
      // Debug logging
      availableDomainsWithStatus.forEach(domain => {
        const status = domain.hasRunningApp ? '🔴 Running' : 
                     domain.hasActiveDeployment ? '🟡 Configured' : 
                     '🟢 Available'
        addLogEntry(`  ${domain.domain}: ${status}`, 'info')
      })
      
      setAvailableDomains(available)
      addLogEntry(`✅ Found ${available.length} available domains for deployment`, 'success')
      
      if (available.length === 0) {
        addLogEntry('💡 All domains have running apps. Try stopping an app first or add more domains.', 'warning')
      }
      
    } catch (err) {
      setError(`Failed to fetch domains: ${err.message}`)
      addLogEntry(`❌ Error fetching domains: ${err.message}`, 'error')
      
      // Fallback: show all domains if API fails
      const fallbackDomains = DOMAIN_STRUCTURE.map(d => ({ ...d, available: true }))
      setAvailableDomains(fallbackDomains)
      addLogEntry('🔄 Using fallback: showing all domains', 'info')
    } finally {
      setLoadingDomains(false)
    }
  }

  // Load domains on component mount
  useEffect(() => {
    fetchAvailableDomains()
  }, [])

  // Get domain configuration by domain name
  const getSelectedDomainConfig = () => {
    return DOMAIN_STRUCTURE.find(d => d.domain === deploymentConfig.selectedDomain)
  }

  // Download as ZIP (fallback option)
  const downloadAsZip = async () => {
    try {
      setDeploymentStatus('packaging')
      clearLogs()
      addLogEntry('Preparing download package...', 'info')

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${deploymentConfig.selectedDomain || 'website'}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        addLogEntry('✅ Download started', 'success')
        setDeploymentStatus('success')
        setDeploymentResult({
          success: true,
          type: 'download',
          fileName: `${deploymentConfig.selectedDomain || 'website'}.zip`
        })
      } else {
        throw new Error('Download failed')
      }
    } catch (err) {
      setError(err.message)
      setDeploymentStatus('error')
      addLogEntry(`❌ Download failed: ${err.message}`, 'error')
    }
  }

  // Generate deployment package and deploy to server
  const deployToServer = async () => {
    if (!deploymentConfig.selectedDomain) {
      setError('Please select a domain for deployment')
      return
    }

    const domainConfig = getSelectedDomainConfig()
    if (!domainConfig) {
      setError('Invalid domain configuration')
      return
    }

    setError(null)
    setDeploymentResult(null)
    clearLogs()
    setDeploymentStatus('packaging')

    try {
      // Step 1: Generate deployment package
      addLogEntry('📦 Generating Firebase deployment package...', 'info')
      
      const response = await fetch('/api/generate-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: project,
          optimization: 'production'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Package generation failed: ${response.status} - ${errorText}`)
      }
      const packageData = await response.json()
      if (!packageData.success) {
        throw new Error(packageData.error || 'Package generation failed')
      }
      addLogEntry(`✅ Package generated: ${packageData.fileCount} files`, 'success')
      
      // Step 2: Deploy to your Python API server
      setDeploymentStatus('deploying')
      addLogEntry('🚀 Deploying to server...', 'info')
      addLogEntry(`📡 Connecting to ${DEPLOYMENT_API.BASE_URL}`, 'info')
      addLogEntry(`🌐 Target domain: ${deploymentConfig.selectedDomain}`, 'info')
      addLogEntry(`🔌 Target port: ${domainConfig.port}`, 'info')

      const deployResponse = await fetch(`${DEPLOYMENT_API.BASE_URL}${DEPLOYMENT_API.ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: deploymentConfig.selectedDomain.replace(/\./g, '-'), // Convert domain to safe name
          files: packageData.files,
          deployConfig: {
            port: domainConfig.port,
            domain: deploymentConfig.selectedDomain,
            ssl: deploymentConfig.enableSSL,
            nodeVersion: '18',
            buildCommand: 'npm run build',
            startCommand: 'npm start'
          }
        })
      })

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text()
        throw new Error(`Deployment failed: ${deployResponse.status} - ${errorText}`)
      }
      const deployResult = await deployResponse.json()
      addLogEntry('✅ Deployed successfully to server!', 'success')
      
      setDeploymentStatus('success')
      const finalResult = {
        success: true,
        domain: deploymentConfig.selectedDomain,
        port: domainConfig.port,
        url: `http${deploymentConfig.enableSSL ? 's' : ''}://${deploymentConfig.selectedDomain}`,
        ssl: deploymentConfig.enableSSL,
        filesUploaded: packageData.fileCount,
        deploymentType: 'nodejs',
        endpoint: DEPLOYMENT_API.ENDPOINT,
        serverResponse: deployResult,
        type: 'live-deployment'
      }

      addLogEntry(`🌐 Live at: ${finalResult.url}`, 'success')
      
      setDeploymentResult(finalResult)
      onDeploymentComplete?.(finalResult)

      // Refresh available domains after successful deployment
      setTimeout(() => {
        fetchAvailableDomains()
      }, 2000)

    } catch (err) {
      setError(err.message)
      setDeploymentStatus('error')
      addLogEntry(`❌ Deployment failed: ${err.message}`, 'error')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addLogEntry(`📋 Copied: ${text}`, 'info')
    } catch (err) {
      console.error('Failed to copy:', err)
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
          text: 'Deployed Successfully!',
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

  const getDomainBadgeColor = (type) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800'
      case 'subdomain':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusConfig = getStatusConfig()
  const isProcessing = deploymentStatus === 'packaging' || deploymentStatus === 'deploying'
  const selectedDomainConfig = getSelectedDomainConfig()

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusConfig.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Deploy Configuration</h3>
              <p className={`text-sm ${statusConfig.color}`}>{statusConfig.text}</p>
            </div>
          </div>
          <button
            onClick={fetchAvailableDomains}
            disabled={loadingDomains || isProcessing}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-white/50 transition-colors"
            title="Refresh domains"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDomains ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Info */}
        {project && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Project Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
              <div>
                <span className="text-gray-600">Design Theme:</span>
                <div className="font-medium text-gray-900 capitalize">
                  {project.config?.design?.theme || project.designConfig?.theme || 'modern'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Deployment Configuration
          </h4>

          {/* Domain Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Target Domain *
            </label>
            
            {loadingDomains ? (
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                <Loader className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Loading available domains...</span>
              </div>
            ) : availableDomains.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3 border border-amber-300 rounded-lg bg-amber-50">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800 font-medium">No domains available</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    All configured domains appear to have running apps. Check the deployment log for details.
                  </p>
                </div>
                
                {/* Debug/Override Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Debug: Show All Domains</span>
                    <button
                      onClick={() => {
                        setAvailableDomains(DOMAIN_STRUCTURE.map(d => ({ ...d, available: true })))
                        addLogEntry('🔄 Manual override: showing all domains', 'info')
                      }}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      disabled={isProcessing}
                    >
                      Show All
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Click "Show All" to override the filter and see all {DOMAIN_STRUCTURE.length} configured domains.
                    This may overwrite existing deployments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={deploymentConfig.selectedDomain}
                  onChange={(e) => setDeploymentConfig(prev => ({ 
                    ...prev, 
                    selectedDomain: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                >
                  <option value="">Choose a domain...</option>
                  {availableDomains.map((domain) => (
                    <option key={domain.domain} value={domain.domain}>
                      {domain.domain} (Port: {domain.port})
                    </option>
                  ))}
                </select>

                {/* Available Domains Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableDomains.map((domain) => (
                    <button
                      key={domain.domain}
                      onClick={() => setDeploymentConfig(prev => ({ 
                        ...prev, 
                        selectedDomain: domain.domain
                      }))}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        deploymentConfig.selectedDomain === domain.domain
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={isProcessing}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {domain.domain}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDomainBadgeColor(domain.type)}`}>
                          {domain.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Port: {domain.port}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Domain Info */}
          {selectedDomainConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Selected Domain Configuration</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Domain:</span>
                  <div className="font-medium text-blue-900">{selectedDomainConfig.domain}</div>
                </div>
                <div>
                  <span className="text-blue-700">Port:</span>
                  <div className="font-medium text-blue-900">{selectedDomainConfig.port}</div>
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Your app will be accessible at: http{deploymentConfig.enableSSL ? 's' : ''}://{selectedDomainConfig.domain}
              </div>
            </div>
          )}

          {/* SSL Option */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deploymentConfig.enableSSL}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, enableSSL: e.target.checked }))}
                disabled={isProcessing}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Enable SSL/HTTPS (Recommended)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={deployToServer}
            disabled={!deploymentConfig.selectedDomain || isProcessing || availableDomains.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {deploymentStatus === 'packaging' ? 'Generating Package...' : 'Deploying to Server...'}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Server className="w-5 h-5 mr-2" />
                Deploy to {deploymentConfig.selectedDomain || 'Selected Domain'}
              </span>
            )}
          </button>

          <button
            onClick={downloadAsZip}
            disabled={!project || isProcessing}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            <span className="flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" />
              Download ZIP
            </span>
          </button>
        </div>

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
                <span className="font-medium text-green-800">
                  {deploymentResult.type === 'download' ? 'Download Ready! 📁' : 'Live Deployment Successful! 🚀'}
                </span>
              </div>
            </div>
            
            {deploymentResult.type !== 'download' && (
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
                <div className="text-xs text-green-600 bg-white p-2 rounded">
                  <strong>Domain:</strong> {deploymentResult.domain} • 
                  <strong> Port:</strong> {deploymentResult.port} • 
                  <strong> Files:</strong> {deploymentResult.filesUploaded} • 
                  <strong> SSL:</strong> {deploymentResult.ssl ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deployment Log */}
        {deploymentLog.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Deployment Log</h4>
              <button
                onClick={clearLogs}
                className="text-gray-500 hover:text-gray-700 text-xs"
                disabled={isProcessing}
              >
                Clear
              </button>
            </div>
            
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
              <div className="space-y-1">
                {deploymentLog.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-2">
                    <span className="text-gray-500 min-w-20 text-xs">
                      {entry.timestamp}
                    </span>
                    <span className={`${
                      entry.type === 'error' ? 'text-red-400' :
                      entry.type === 'success' ? 'text-green-400' :
                      entry.type === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Domain Deployment Guide
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div><strong>1. Select Domain:</strong> Choose from available pre-configured domains</div>
            <div><strong>2. Configure SSL:</strong> Enable HTTPS for production deployments</div>
            <div><strong>3. Deploy:</strong> Firebase app will be deployed to selected domain</div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="text-xs text-blue-600 bg-white p-2 rounded">
              <strong>🌐 Total Domains:</strong> {DOMAIN_STRUCTURE.length} configured ({availableDomains.length} available) • 
              <strong>🔥 Firebase Ready:</strong> Optimized for Firebase integration with server-side rendering
            </div>
            
            {availableDomains.length === 0 && (
              <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                <strong>🔧 Troubleshooting:</strong> If no domains show as available, check the deployment log above. 
                You may need to stop existing apps or use the "Show All" override button.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}