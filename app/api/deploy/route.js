// app/api/deploy/route.js - Integration with your website generator
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const { projectZip, deploymentConfig, projectName } = await request.json()
    
    if (!projectZip || !deploymentConfig) {
      return NextResponse.json(
        { error: 'Missing project zip or deployment configuration' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting deployment for: ${projectName}`)
    
    const deploymentId = uuidv4()
    const tempDir = `/tmp/deployments/${deploymentId}`
    
    // Create temporary directory
    await fs.mkdir(tempDir, { recursive: true })
    
    // Save project zip file
    const zipPath = path.join(tempDir, 'project.zip')
    const zipBuffer = Buffer.from(projectZip, 'base64')
    await fs.writeFile(zipPath, zipBuffer)
    
    // Save deployment configuration
    const configPath = path.join(tempDir, 'deploy-config.json')
    await fs.writeFile(configPath, JSON.stringify(deploymentConfig, null, 2))
    
    // Execute deployment script
    const deploymentResult = await executeDeployment(zipPath, configPath, deploymentId)
    
    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })
    
    if (deploymentResult.success) {
      return NextResponse.json({
        success: true,
        deploymentId,
        message: 'Deployment completed successfully',
        url: `http${deploymentConfig.deployment.ssl_enabled ? 's' : ''}://${deploymentConfig.deployment.domain}`,
        details: deploymentResult.output
      })
    } else {
      return NextResponse.json({
        success: false,
        deploymentId,
        error: 'Deployment failed',
        details: deploymentResult.error
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal deployment error', details: error.message },
      { status: 500 }
    )
  }
}

async function executeDeployment(zipPath, configPath, deploymentId) {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'deploy.py')
    const deploy = spawn('python3', [scriptPath, zipPath, '-c', configPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let output = ''
    let error = ''
    
    deploy.stdout.on('data', (data) => {
      const message = data.toString()
      output += message
      console.log(`Deploy ${deploymentId}: ${message}`)
    })
    
    deploy.stderr.on('data', (data) => {
      const message = data.toString()
      error += message
      console.error(`Deploy ${deploymentId} Error: ${message}`)
    })
    
    deploy.on('close', (code) => {
      console.log(`Deploy ${deploymentId} finished with code: ${code}`)
      
      resolve({
        success: code === 0,
        output: output,
        error: error,
        exitCode: code
      })
    })
    
    deploy.on('error', (err) => {
      console.error(`Deploy ${deploymentId} spawn error:`, err)
      resolve({
        success: false,
        output: '',
        error: err.message,
        exitCode: -1
      })
    })
  })
}
