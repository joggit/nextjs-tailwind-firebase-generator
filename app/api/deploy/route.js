import { NextResponse } from 'next/server'

const DEPLOYMENT_API_URL = process.env.DEPLOYMENT_API_URL || 'http://localhost:8000'

export async function POST(request) {
  try {
    const { project, deploymentConfig } = await request.json()

    const deploymentPayload = {
      project_files: project.files,
      deployment_config: {
        project_name: deploymentConfig.project_name,
        domain: deploymentConfig.domain,
        subdomain: deploymentConfig.subdomain,
        server_name: deploymentConfig.server_name || 'production',
        ssl_enabled: deploymentConfig.ssl_enabled !== false,
        env_vars: {
          NODE_ENV: 'production',
          NEXT_PUBLIC_APP_URL: buildProjectUrl(deploymentConfig),
          ...deploymentConfig.env_vars
        }
      }
    }

    const response = await fetch(`${DEPLOYMENT_API_URL}/api/deploy/from-generator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deploymentPayload)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({
      success: true,
      deployment_id: result.deployment_id,
      message: 'Deployment started successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function buildProjectUrl(config) {
  const protocol = config.ssl_enabled !== false ? 'https' : 'http'
  const domain = config.subdomain ? `${config.subdomain}.${config.domain}` : config.domain
  return `${protocol}://${domain}`
}