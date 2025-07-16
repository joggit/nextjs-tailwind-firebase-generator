// File: README.md (Updated)
# Full-Stack Website Generator & Deployer
A comprehensive solution for generating professional websites with AI-powered design systems and deploying them instantly to Linux servers using automated Python deployment scripts.

## Features

### 🎨 AI-Powered Website Generation
- **Design System Integration**: Multiple themes, layouts, and customization options
- **Vector RAG Enhancement**: Upload documents to enhance AI content generation
- **Template Variety**: Ecommerce, SaaS, Blog, Portfolio, and more
- **Component Library**: Modern UI components with Tailwind CSS

### 🚀 Automated Deployment
- **Multi-Server Support**: Deploy to production, staging, or custom servers
- **Python + Paramiko**: Secure SSH-based deployment automation
- **Nginx Configuration**: Automatic web server setup with optimization
- **SSL Automation**: Let's Encrypt SSL certificates configured automatically
- **PM2 Integration**: Process management for Node.js applications

### 📊 Management & Monitoring
- **Deployment Status**: Real-time monitoring of deployments
- **Server Health**: Check server connectivity and status
- **Vector Admin**: Manage documents and AI enhancement
- **Troubleshooting**: Built-in diagnostic tools

## Quick Start

### 1. Setup Deployment Environment
```bash
# Clone and install dependencies
npm install

# Setup deployment environment
npm run setup-deployment

# Generate SSH keys
npm run generate-keys
```

### 2. Configure Servers
```bash
# Update server configuration
nano config/deployment.json

# Test server connections
npm run test-connections
```

### 3. Prepare Target Servers
```bash
# Run on each deployment server (as root)
curl -fsSL https://your-domain.com/scripts/prepare_server.sh | sudo bash
```

### 4. Start Generating & Deploying
```bash
# Start the development server
npm run dev

# Access the application
open http://localhost:3000
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App  │────│   Python Script  │────│  Linux Servers  │
│                 │    │   (Paramiko)     │    │   (Nginx/PM2)   │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • AI Generation │    │ • SSH Connection │    │ • Website Files │
│ • Design System │    │ • File Upload    │    │ • Nginx Config  │
│ • UI Components │    │ • Nginx Setup    │    │ • SSL Certs     │
│ • Vector RAG    │    │ • SSL Config     │    │ • PM2 Processes │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Deployment Process

1. **Generate Website**: AI creates custom website with design system
2. **Package Files**: Bundle project files for deployment
3. **SSH Connection**: Secure connection to target server
4. **File Upload**: Transfer and extract project files
5. **Nginx Setup**: Configure web server with optimization
6. **SSL Configuration**: Automatic Let's Encrypt setup (optional)
7. **PM2 Setup**: Process management for Node.js apps (optional)
8. **Health Check**: Verify deployment success

## Server Requirements

### Target Servers
- Ubuntu 20.04+ or Debian 11+
- SSH access with key-based authentication
- sudo privileges for deployment user
- Domain/subdomain pointing to server (for SSL)

### Required Software (installed by setup script)
- nginx
- Node.js 18+
- npm
- PM2 (for Node.js apps)
- certbot (for SSL)
- UFW firewall
- fail2ban (security)

## Configuration

### Deployment Configuration (`config/deployment.json`)
```json
{
  "production": {
    "production_host": "your-server.com",
    "production_username": "deploy",
    "production_key_file": "~/.ssh/production_deploy_key"
  },
  "staging": {
    "staging_host": "staging.your-server.com",
    "staging_username": "deploy", 
    "staging_key_file": "~/.ssh/staging_deploy_key"
  }
}
```

### Environment Variables (`.env.local`)
```bash
# OpenAI API (for AI generation)
OPENAI_API_KEY=your_openai_key

# Firebase (for vector storage)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Optional: Deployment notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## Security

### SSH Security
- Key-based authentication only
- Restricted deployment user permissions
- Firewall configuration (UFW)
- Intrusion detection (fail2ban)

### Server Security
- Automatic security headers in nginx
- SSL/TLS encryption
- Regular security updates
- Log monitoring and rotation

## Troubleshooting

### Common Issues
```bash
# Run diagnostic script
npm run troubleshoot

# Test server connections
npm run test-connections

# Check deployment logs
tail -f logs/deployment.log

# Check nginx configuration
sudo nginx -t

# Monitor PM2 processes
pm2 status
pm2 logs
```

### Support Resources
- 📖 [Deployment Setup Guide](./DEPLOYMENT_SETUP.md)
- 🔧 Built-in troubleshooting script
- 📊 Real-time deployment monitoring
- 🚨 Automated error reporting

## Development

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Deployment Scripts
```bash
npm run setup-deployment  # Setup deployment environment
npm run generate-keys     # Generate SSH keys
npm run test-connections  # Test server connections
npm run troubleshoot      # Run diagnostics
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test deployment functionality
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details

## Support

For issues and questions:
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 Email: support@your-domain.com
- 💬 Discord: [Your Discord Server]

---

Built with ❤️ using Next.js, Python, and modern deployment practices.
