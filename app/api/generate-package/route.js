// Simplified Package Generation API for Firebase Node.js Deployment
// File: app/api/generate-package/route.js

export async function POST(request) {
  try {
    const body = await request.json()
    const { project, projectId, optimization = 'production' } = body

    console.log('📦 Generating Firebase Node.js package:', {
      hasProject: !!project,
      projectId,
      optimization,
      filesCount: project?.files ? Object.keys(project.files).length : 0
    })

    // Get project data
    let projectData = null

    // Try temporary storage first
    if (projectId && typeof global !== 'undefined' && global.tempProjects) {
      projectData = global.tempProjects[projectId]
      console.log(`🔍 Found project in temp storage: ${projectId}`)
    }

    // Fall back to project data in request
    if (!projectData && project) {
      projectData = project
      console.log('📄 Using project data from request')
    }

    if (!projectData || !projectData.files) {
      return NextResponse.json({
        success: false,
        error: 'No project data found. Please regenerate the project.'
      }, { status: 400 })
    }

    console.log(`📊 Packaging Firebase project with ${Object.keys(projectData.files).length} files`)

    // Process files for production
    const packageFiles = optimizeForProduction(projectData.files, optimization)
    
    // Add Firebase deployment configuration
    const deploymentFiles = generateFirebaseDeploymentFiles(projectData, optimization)
    
    // Combine all files
    const allFiles = {
      ...packageFiles,
      ...deploymentFiles
    }

    const packageInfo = {
      success: true,
      files: allFiles,
      fileCount: Object.keys(allFiles).length,
      optimization,
      packageSize: calculatePackageSize(allFiles),
      metadata: {
        projectName: projectData.name || 'Firebase Website',
        projectType: 'nodejs', // Always Node.js for Firebase
        deploymentType: 'nodejs',
        endpoint: '/api/deploy/nodejs',
        generatedAt: new Date().toISOString(),
        optimization,
        deploymentReady: true,
        firebase: true
      }
    }

    console.log(`✅ Firebase package ready: ${packageInfo.fileCount} files, ${(packageInfo.packageSize / 1024 / 1024).toFixed(2)}MB`)

    return Response.json(packageInfo)

  } catch (error) {
    console.error('❌ Firebase package generation failed:', error)
    return Response.json({
      success: false,
      error: 'Package generation failed',
      details: error.message
    }, { status: 500 })
  }
}

function optimizeForProduction(files, optimization) {
  const optimizedFiles = {}
  
  for (const [filePath, content] of Object.entries(files)) {
    let optimizedContent = content
    
    if (optimization === 'production') {
      // Basic production optimizations
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        // Remove console.log statements
        optimizedContent = optimizedContent.replace(/console\.log\([^)]*\);?\n?/g, '')
        // Remove development comments
        optimizedContent = optimizedContent.replace(/\/\/ DEV:.*\n?/g, '')
      }
      
      if (filePath.endsWith('.css')) {
        // Basic CSS minification
        optimizedContent = optimizedContent.replace(/\s+/g, ' ').trim()
      }
    }
    
    optimizedFiles[filePath] = optimizedContent
  }
  
  // Ensure package.json has the right scripts for Node.js deployment
  if (optimizedFiles['package.json']) {
    const packageJson = JSON.parse(optimizedFiles['package.json'])
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "next build",
      "start": "next start",
      "dev": "next dev"
    }
    optimizedFiles['package.json'] = JSON.stringify(packageJson, null, 2)
  }
  
  // Ensure next.config.mjs is configured for Node.js (not static export)
  if (!optimizedFiles['next.config.mjs']) {
    optimizedFiles['next.config.mjs'] = generateNextConfig()
  }
  
  return optimizedFiles
}

function generateFirebaseDeploymentFiles(projectData, optimization) {
  const projectSlug = projectData.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'firebase-website'
  
  return {
    // Deployment configuration for Python API
    'deploy.json': generateDeployConfig(projectData, projectSlug),
    
    // Build script for the server
    'build.sh': generateBuildScript(projectSlug),
    
    // Environment template
    '.env.production.example': generateEnvTemplate(),
    
    // PM2 configuration for process management
    'ecosystem.config.js': generatePM2Config(projectSlug),
    
    // Simple README
    'DEPLOYMENT.md': generateDeploymentReadme(projectData, projectSlug)
  }
}

function generateDeployConfig(projectData, projectSlug) {
  const config = {
    name: projectSlug,
    type: 'nodejs',
    domain: `${projectSlug}.yourdomain.com`,
    nodeVersion: '18',
    installCommand: 'npm install',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    port: 3000,
    optimization: 'production',
    firebase: true,
    nginx: {
      proxyPass: 'http://localhost:3000',
      root: `/var/www/${projectSlug}`,
      serverMode: 'proxy'
    },
    environment: {
      NODE_ENV: 'production',
      PORT: '3000'
    }
  }
  
  return JSON.stringify(config, null, 2)
}

function generateBuildScript(projectSlug) {
  return `#!/bin/bash
# Firebase Node.js Build Script for ${projectSlug}
set -e

echo "🔥 Building Firebase Node.js application: ${projectSlug}..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
echo "🚀 Ready to start with: npm start"

# Check if .next directory exists
if [ -d ".next" ]; then
    echo "📁 Build output found in .next directory"
    ls -la .next/ | head -10
else
    echo "❌ Error: .next directory not found after build"
    exit 1
fi

echo "🎉 Firebase Node.js build process completed!"`
}

function generateNextConfig() {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure for Node.js deployment (not static export)
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
  },
  // Firebase-specific configurations
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin']
  }
}

export default nextConfig`
}

function generateEnvTemplate() {
  return `# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000

# Optional: Additional Firebase services
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your_project.cloudfunctions.net`
}

function generatePM2Config(projectSlug) {
  return `module.exports = {
  apps: [{
    name: '${projectSlug}',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/${projectSlug}',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/pm2/${projectSlug}.log',
    out_file: '/var/log/pm2/${projectSlug}-out.log',
    error_file: '/var/log/pm2/${projectSlug}-error.log',
    time: true
  }]
}`
}

function generateDeploymentReadme(projectData, projectSlug) {
  const projectName = projectData.name || 'Firebase Website'
  
  return `# ${projectName} - Firebase Deployment

## 🔥 Firebase Node.js Application

This project is configured for **Node.js deployment** using Firebase services.

### Deployment Configuration
- **Type**: Node.js Server (Required for Firebase)
- **API Endpoint**: \`POST /api/deploy/nodejs\`
- **Port**: 3000
- **Process Manager**: PM2 recommended

### Quick Deploy Steps

1. **Extract files** to \`/var/www/${projectSlug}\`
2. **Install dependencies**: \`npm install\`
3. **Build application**: \`npm run build\`
4. **Start server**: \`npm start\` (or PM2)
5. **Configure nginx** to proxy to localhost:3000

### Environment Setup

Copy \`.env.production.example\` to \`.env.local\` and configure:

\`\`\`bash
# Required Firebase config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_service_account_email
\`\`\`

### PM2 Deployment (Recommended)

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

### Nginx Configuration

\`\`\`nginx
server {
    listen 80;
    server_name ${projectSlug}.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Firebase Features
- Firestore database integration
- Firebase Authentication
- Firebase Storage
- Real-time updates
- Server-side rendering

### Technology Stack
- Next.js 14 (Node.js mode)
- React Server Components
- Firebase SDK
- Tailwind CSS
- Modern responsive design

---
**Generated**: ${new Date().toISOString()}
**Files**: ${Object.keys(projectData.files || {}).length}
**Deployment**: Node.js Server Required`
}

function calculatePackageSize(files) {
  let totalSize = 0
  for (const content of Object.values(files)) {
    totalSize += new Blob([content]).size
  }
  return totalSize
}

export async function GET() {
  return Response.json({
    message: 'Firebase Package Generation API',
    usage: 'POST with project data to generate Node.js deployment package',
    deploymentType: 'nodejs',
    endpoint: '/api/deploy/nodejs',
    status: 'ready'
  })
}