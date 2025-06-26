#!/usr/bin/env python3

import paramiko
import time

class MultiDomainSetup:
    def __init__(self, hostname, username, password=None, key_path=None):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.key_path = key_path
        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Domain configuration
        self.domains = {
            "datablox.co.za": {
                "main_port": 3000,
                "subdomains": {
                    "api": 3001,
                    "app": 3002, 
                    "admin": 3003
                }
            },
            "smartwave.co.za": {
                "main_port": 3010,
                "subdomains": {
                    "api": 3011,
                    "app": 3012,
                    "admin": 3013
                }
            },
            "mondaycafe.co.za": {
                "main_port": 3020,
                "subdomains": {
                    "api": 3021,
                    "app": 3022,
                    "admin": 3023
                }
            }
        }
    
    def connect(self):
        if self.key_path:
            self.ssh.connect(self.hostname, username=self.username, key_filename=self.key_path)
        else:
            self.ssh.connect(self.hostname, username=self.username, password=self.password)
        print(f"✅ Connected to {self.hostname}")
    
    def run_command(self, command, sudo=False):
        if sudo:
            command = f"sudo {command}"
        
        try:
            stdin, stdout, stderr = self.ssh.exec_command(command)
            exit_status = stdout.channel.recv_exit_status()
            output = stdout.read().decode()
            error = stderr.read().decode()
            
            if exit_status != 0:
                print(f"❌ Error: {command}")
                if error:
                    print(f"Error details: {error}")
                return False, output, error
            else:
                print(f"✅ {command}")
                return True, output, error
        except Exception as e:
            print(f"❌ Command failed: {e}")
            return False, "", str(e)
    
    def create_directory_structure(self):
        """Create directory structure for all domains and subdomains"""
        print("\n📁 Creating directory structure...")
        
        for domain, config in self.domains.items():
            # Main domain directory
            self.run_command(f"mkdir -p /var/www/{domain}", True)
            
            # Subdomain directories
            for subdomain in config["subdomains"]:
                subdomain_dir = f"/var/www/{subdomain}.{domain}"
                self.run_command(f"mkdir -p {subdomain_dir}", True)
            
            # Set ownership
            self.run_command(f"chown -R {self.username}:{self.username} /var/www/{domain}", True)
            for subdomain in config["subdomains"]:
                self.run_command(f"chown -R {self.username}:{self.username} /var/www/{subdomain}.{domain}", True)
    
    def create_placeholder_content(self):
        """Create placeholder HTML for domains without deployed apps"""
        print("\n📄 Creating placeholder content...")
        
        for domain, config in self.domains.items():
            # Main domain placeholder
            placeholder_html = f'''<!DOCTYPE html>
<html>
<head>
    <title>{domain.split('.')[0].title()}</title>
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; text-align: center; min-height: 100vh; 
            display: flex; flex-direction: column; justify-content: center;
        }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        h1 {{ font-size: 3em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }}
        p {{ font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }}
        .status {{ background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; 
                   backdrop-filter: blur(10px); margin: 20px 0; }}
        .subdomain {{ background: rgba(255,255,255,0.05); padding: 10px; margin: 5px 0; 
                     border-radius: 5px; }}
        a {{ color: #fff; text-decoration: none; font-weight: bold; }}
        a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{domain.split('.')[0].title()}</h1>
        <p>Next.js hosting platform ready for deployment</p>
        <div class="status">
            <h3>🚀 Deployment Ready</h3>
            <p>Use the deployment script to upload your Next.js applications:</p>
            <code style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; display: block; margin: 10px 0;">
                sudo /var/www/deploy-site.sh {domain} {config["main_port"]} &lt;git-repo-url&gt;
            </code>
        </div>
        <div class="status">
            <h3>🌐 Available Subdomains</h3>'''
            
            for subdomain, port in config["subdomains"].items():
                placeholder_html += f'''
            <div class="subdomain">
                <strong>{subdomain}.{domain}</strong> → Port {port}
            </div>'''
            
            placeholder_html += '''
        </div>
    </div>
</body>
</html>'''
            
            # Write main domain placeholder
            self.run_command(f"echo '{placeholder_html}' > /var/www/{domain}/index.html", True)
            
            # Create subdomain placeholders
            for subdomain, port in config["subdomains"].items():
                subdomain_html = placeholder_html.replace(domain.split('.')[0].title(), f"{subdomain.title()} - {domain.split('.')[0].title()}")
                subdomain_html = subdomain_html.replace(f"Port {config['main_port']}", f"Port {port}")
                self.run_command(f"echo '{subdomain_html}' > /var/www/{subdomain}.{domain}/index.html", True)
    
    def create_nginx_configs(self):
        """Create nginx configurations for all domains and subdomains"""
        print("\n⚙️ Creating nginx configurations...")
        
        for domain, config in self.domains.items():
            # Main domain config
            main_config = f'''# Main domain: {domain}
server {{
    server_name {domain} www.{domain};
    root /var/www/{domain};
    index index.html;
    
    location / {{
        try_files $uri $uri/ @nextjs;
    }}
    
    location @nextjs {{
        proxy_pass http://127.0.0.1:{config["main_port"]};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }}
    
    listen 80;
}}

# Subdomains for {domain}'''
            
            # Add subdomain configs
            for subdomain, port in config["subdomains"].items():
                subdomain_config = f'''
server {{
    server_name {subdomain}.{domain};
    root /var/www/{subdomain}.{domain};
    index index.html;
    
    location / {{
        try_files $uri $uri/ @nextjs_{subdomain};
    }}
    
    location @nextjs_{subdomain} {{
        proxy_pass http://127.0.0.1:{port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }}
    
    listen 80;
}}'''
                main_config += subdomain_config
            
            # Write config file
            config_path = f"/etc/nginx/sites-available/{domain}"
            self.run_command(f"echo '{main_config}' > {config_path}", True)
            
            # Enable site
            self.run_command(f"ln -sf {config_path} /etc/nginx/sites-enabled/{domain}", True)
    
    def setup_ssl_certificates(self):
        """Setup SSL certificates for all domains and subdomains"""
        print("\n🔒 Setting up SSL certificates...")
        
        for domain, config in self.domains.items():
            print(f"\n📜 Processing SSL for {domain}...")
            
            # Collect all domain variants for this domain
            domain_list = [domain, f"www.{domain}"]
            for subdomain in config["subdomains"]:
                domain_list.append(f"{subdomain}.{domain}")
            
            # Create certbot command for all domains at once
            domain_args = " ".join([f"-d {d}" for d in domain_list])
            certbot_cmd = f"certbot --nginx {domain_args} --non-interactive --agree-tos -m admin@{domain} --expand"
            
            success, output, error = self.run_command(certbot_cmd, True)
            if success:
                print(f"✅ SSL certificates obtained for {domain} and all subdomains")
            else:
                print(f"⚠️ SSL setup failed for {domain}: {error}")
                print("You can manually run SSL setup later")
    
    def create_deployment_scripts(self):
        """Create deployment scripts for each domain/subdomain"""
        print("\n📜 Creating deployment scripts...")
        
        # Enhanced deployment script
        deploy_script = '''#!/bin/bash

# Enhanced deployment script for multi-domain setup
# Usage: ./deploy-site.sh <full-domain> <port> <git-repo>
# Examples: 
#   ./deploy-site.sh datablox.co.za 3000 https://github.com/user/main-site.git
#   ./deploy-site.sh api.datablox.co.za 3001 https://github.com/user/api.git

FULL_DOMAIN=$1
PORT=$2
REPO=$3

if [ -z "$FULL_DOMAIN" ] || [ -z "$PORT" ] || [ -z "$REPO" ]; then
    echo "Usage: ./deploy-site.sh <full-domain> <port> <git-repo>"
    echo ""
    echo "Available domains and ports:"'''
        
        # Add domain info to help text
        for domain, config in self.domains.items():
            deploy_script += f'''
    echo "  {domain} → Port {config['main_port']}"'''
            for subdomain, port in config["subdomains"].items():
                deploy_script += f'''
    echo "  {subdomain}.{domain} → Port {port}"'''
        
        deploy_script += '''
    exit 1
fi

SITE_DIR="/var/www/$FULL_DOMAIN"

echo "🚀 Deploying $FULL_DOMAIN on port $PORT..."

# Stop existing PM2 process if running
pm2 stop "$FULL_DOMAIN" 2>/dev/null || true
pm2 delete "$FULL_DOMAIN" 2>/dev/null || true

# Clone or update repo
if [ -d "$SITE_DIR/.git" ]; then
    echo "📥 Updating existing repository..."
    cd "$SITE_DIR" && git pull
else
    echo "📥 Cloning repository..."
    rm -rf "$SITE_DIR"
    git clone "$REPO" "$SITE_DIR"
fi

cd "$SITE_DIR"

# Check if it's a Next.js project
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Not a valid Node.js project."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Start with PM2
echo "🚦 Starting application with PM2..."
pm2 start npm --name "$FULL_DOMAIN" -- start -- -p "$PORT"
pm2 save

# Test nginx and reload
echo "🔧 Testing nginx configuration..."
nginx -t && systemctl reload nginx

echo "✅ Deployment completed!"
echo "🌍 Site $FULL_DOMAIN is now live on port $PORT"
echo "🔗 Access: https://$FULL_DOMAIN"

# Show PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 status
'''
        
        # Write deployment script
        self.run_command(f"echo '{deploy_script}' > /var/www/deploy-multi-site.sh", True)
        self.run_command("chmod +x /var/www/deploy-multi-site.sh", True)
        
        # Create individual domain deployment helpers
        for domain, config in self.domains.items():
            helper_script = f'''#!/bin/bash
# Quick deployment helper for {domain}

echo "🚀 {domain.upper()} Deployment Helper"
echo "================================"
echo ""
echo "Main site: /var/www/deploy-multi-site.sh {domain} {config["main_port"]} <git-repo>"'''
            
            for subdomain, port in config["subdomains"].items():
                helper_script += f'''
echo "{subdomain}: /var/www/deploy-multi-site.sh {subdomain}.{domain} {port} <git-repo>"'''
            
            helper_script += '''
echo ""
echo "Example:"
echo "/var/www/deploy-multi-site.sh ''' + domain + f''' {config["main_port"]} https://github.com/user/repo.git"
'''
            
            self.run_command(f"echo '{helper_script}' > /var/www/deploy-{domain.split('.')[0]}.sh", True)
            self.run_command(f"chmod +x /var/www/deploy-{domain.split('.')[0]}.sh", True)
    
    def test_nginx_config(self):
        """Test nginx configuration"""
        print("\n🔧 Testing nginx configuration...")
        success, output, error = self.run_command("nginx -t", True)
        if success:
            print("✅ Nginx configuration is valid")
            self.run_command("systemctl reload nginx", True)
            return True
        else:
            print(f"❌ Nginx configuration error: {error}")
            return False
    
    def print_summary(self):
        """Print deployment summary"""
        print("\n" + "="*60)
        print("🎉 MULTI-DOMAIN SETUP COMPLETED!")
        print("="*60)
        print(f"✅ Server: {self.hostname}")
        print("✅ Domains configured:")
        
        for domain, config in self.domains.items():
            print(f"\n🌐 {domain}")
            print(f"   Main site: https://{domain} (Port {config['main_port']})")
            for subdomain, port in config["subdomains"].items():
                print(f"   {subdomain}: https://{subdomain}.{domain} (Port {port})")
        
        print(f"\n📋 DEPLOYMENT COMMANDS:")
        print("• Main deployment script: /var/www/deploy-multi-site.sh")
        print("• Domain helpers:")
        for domain in self.domains:
            domain_name = domain.split('.')[0]
            print(f"  - /var/www/deploy-{domain_name}.sh")
        
        print(f"\n🚀 EXAMPLE DEPLOYMENTS:")
        for domain, config in self.domains.items():
            print(f"sudo /var/www/deploy-multi-site.sh {domain} {config['main_port']} https://github.com/user/main-repo.git")
            break  # Just show one example
        
        print(f"\n📊 MONITORING:")
        print("• Check all sites: pm2 status")
        print("• View logs: pm2 logs")
        print("• Nginx status: sudo systemctl status nginx")
        print("• SSL status: sudo certbot certificates")
    
    def run_setup(self):
        """Run the complete multi-domain setup"""
        try:
            self.connect()
            print("🚀 Starting multi-domain setup...")
            
            self.create_directory_structure()
            self.create_placeholder_content()
            self.create_nginx_configs()
            
            if self.test_nginx_config():
                self.create_deployment_scripts()
                
                # Ask about SSL setup
                ssl_setup = input("\n🔒 Do you want to setup SSL certificates now? This requires all domains to be pointing to this server. (y/n): ").lower().strip()
                if ssl_setup == 'y':
                    self.setup_ssl_certificates()
                else:
                    print("ℹ️ SSL setup skipped. Run 'sudo certbot --nginx' manually when ready.")
                
                self.print_summary()
            else:
                print("❌ Setup failed due to nginx configuration errors")
                
        except Exception as e:
            print(f"❌ Setup failed: {e}")
        finally:
            self.ssh.close()

if __name__ == "__main__":
    # Configure your server details
    setup = MultiDomainSetup(
        hostname="75.119.141.162",
        username="root",
        password="your-actual-password",  # Replace with your password
        # key_path="/path/to/your/private/key"  # Or use SSH key
    )
    
    print("🌐 Multi-Domain Setup for Next.js Hosting")
    print("==========================================")
    print("Domains: datablox.co.za, smartwave.co.za, mondaycafe.co.za")
    print("Subdomains per domain: api, app, admin")
    print("")
    
    confirm = input("Proceed with setup? (y/n): ").lower().strip()
    if confirm == 'y':
        setup.run_setup()
    else:
        print("Setup cancelled.")