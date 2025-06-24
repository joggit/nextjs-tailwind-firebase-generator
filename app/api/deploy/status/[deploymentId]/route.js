// app/api/deploy/status/[deploymentId]/route.js - Deployment status endpoint
export async function GET(request, { params }) {
  try {
    const { deploymentId } = params
    
    // Check deployment status in your database or file system
    const statusFile = `/tmp/deployment-status-${deploymentId}.json`
    
    try {
      const statusData = await fs.readFile(statusFile, 'utf-8')
      const status = JSON.parse(statusData)
      
      return NextResponse.json({
        deploymentId,
        status: status.status,
        progress: status.progress,
        message: status.message,
        updatedAt: status.updatedAt
      })
    } catch (error) {
      return NextResponse.json({
        deploymentId,
        status: 'unknown',
        message: 'Deployment status not found'
      }, { status: 404 })
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get deployment status', details: error.message },
      { status: 500 }
    )
  }
}