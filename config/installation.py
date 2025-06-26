#!/usr/bin/env python3
"""
Web Server Deployment Script for Generated Next.js Projects
Automates deployment to Linux servers with Nginx via SSH
"""

import os
import sys
import json
import time
import logging
import argparse
import tempfile
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass

import paramiko
from scp import SCPClient
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ServerConfig:
    """Server configuration data class"""
    hostname: str
    username: str
    password: Optional[str] = None
    private_key_path: Optional[str] = None
    port: int = 22
    domain: str = None
    ssl_email: str = None

@dataclass
class ProjectConfig:
    """Project deployment configuration"""
    name: str
    zip_file_path: str
    domain: str
    port: int = 3000
    node_version: str = "18"
    build_command: str = "npm run build"
    start_command: str = "npm start"
    env_vars: Dict[str, str] = None

class WebServer Deployer:
    """Main deployment class for managing web server setup and deployment"""
    
    def __init__(self, server_config: ServerConfig):
        self.server = server_config
        self.ssh_client = None
        self.scp_client = None
        
    def connect(self) -> bool:
        """Establish SSH connection to the server"""
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Determine authentication method
            if self.server.private_key_path:
                key = paramiko.RSAKey.from_private_key_file(self.server.private_key_path)
                self.ssh_client.connect(
                    hostname=self.server.hostname,
                    port=self.server.port,
                    username=self.server.username,
                    pkey=key
                )
            else:
                self.ssh_client.connect(
                    hostname=self.server.hostname,
                    port=self.server.port,
                    username=self.server.username,
                    password=self.server.password
                )
            
            self.scp_client = SCPClient(self.ssh_client.get_transport())
            logger.info(f"✅ Connected to {self.server.hostname}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to {self.server.hostname}: {e}")
            return False
    
    def disconnect(self):
        """Close SSH and SCP connections"""
        if self.scp_client:
            self.scp_client.close()
        if self.ssh_client:
            self.ssh_client.close()
        logger.info("🔌 Disconnected from server")
    
    def execute_command(self, command: str, sudo: bool = False) -> tuple:
        """Execute a command on the remote server"""
        if sudo:
            command = f"sudo {command}"
        
        logger.info(f"🔄 Executing: {command}")
        stdin, stdout, stderr = self.ssh_client.exec_command(command)
        
        # Wait for command to complete
        exit_status = stdout.channel.recv_exit_status()
        output = stdout.read().decode().strip()
        error = stderr.read().decode().strip()
        
        if exit_status != 0 and error:
            logger.warning(f"⚠️ Command failed: {error}")
        
        return exit_status, output, error
    
    def check_and_install_dependencies(self) -> bool:
        """Check and install required dependencies on the server"""
        logger.info("📦 Checking and installing dependencies...")
        
        # Update package list
        self.execute_command("apt update", sudo=True)
        
        # Install basic dependencies
        dependencies = [
            "curl", "wget", "unzip", "nginx", "ufw", "certbot", 
            "python3-certbot-nginx", "software-properties-common"
        ]
        
        for dep in dependencies:
            logger.info(f"Installing {dep}...")
            exit_status, _, _ = self.execute_command(f"apt install -y {dep}", sudo=True)
            if exit_status != 0:
                logger.error(f"❌ Failed to install {dep}")
                return False
        
        # Install Node.js via NodeSource
        logger.info("🟢 Installing Node.js...")
        commands = [
            "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -",
            "apt install -y nodejs"
        ]
        
        for cmd in commands:
            exit_status, _, _ = self.execute_command(cmd, sudo=True)
            if exit_status != 0:
                logger.error(f"❌ Failed to install Node.js")
                return False
        
        # Install PM2
        logger.info("⚡ Installing PM2...")
        exit_status, _, _ = self.execute_command("npm install -g pm2", sudo=True)
        if exit_status != 0:
            logger.error("❌ Failed to install PM2")
            return False
        
        # Enable Nginx and UFW
        self.execute_command("systemctl enable nginx", sudo=True)
        self.execute_command("systemctl start nginx", sudo=True)
        self.execute_command("ufw --force enable", sudo=True)
        self.execute_command("ufw allow 'Nginx Full'", sudo=True)
        self.execute_command("ufw allow ssh", sudo=True)
        
        logger.info("✅ Dependencies installed successfully")
        return True
    
    def create_project_directory(self, project_name: str) -> str:
        """Create project directory structure"""
        project_dir = f"/var/www/{project_name}"
        
        logger.info(f"📁 Creating project directory: {project_dir}")
        
        # Create directory and set permissions
        self.execute_command(f"mkdir -p {project_dir}", sudo=True)
        self.execute_command(f"chown -R {self.server.username}:{self.server.username} {project_dir}", sudo=True)
        self.execute_command(f"chmod -R 755 {project_dir}", sudo=True)
        
        return project_dir
    
    def upload_and_extract_project(self, zip_path: str, project_dir: str) -> bool:
        """Upload project zip file and extract it"""
        logger.info(f"📤 Uploading {zip_path} to server...")
        
        try:
            # Upload zip file
            remote_zip = f"{project_dir}/project.zip"
            self.scp_client.put(zip_path, remote_zip)
            
            # Extract zip file
            logger.info("📦 Extracting project files...")
            self.execute_command(f"cd {project_dir} && unzip -o project.zip")
            self.execute_command(f"rm {project_dir}/project.zip")
            
            # Find the extracted directory (it might be nested)
            _, output, _ = self.execute_command(f"find {project_dir} -maxdepth 2 -name 'package.json' -type f")
            if output:
                package_dir = os.path.dirname(output.split('\n')[0])
                if package_dir != project_dir:
                    # Move files from subdirectory to project root
                    self.execute_command(f"mv {package_dir}/* {project_dir}/")
                    self.execute_command(f"mv {package_dir}/.[^.]* {project_dir}/ 2>/dev/null || true")
                    self.execute_command(f"rmdir {package_dir}")
            
            logger.info("✅ Project uploaded and extracted successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upload project: {e}")
            return False
    
    def install_project_dependencies(self, project_dir: str) -> bool:
        """Install npm dependencies and build the project"""
        logger.info("📦 Installing project dependencies...")
        
        # Check if package.json exists
        exit_status, _, _ = self.execute_command(f"test -f {project_dir}/package.json")
        if exit_status != 0:
            logger.error("❌ package.json not found in project directory")
            return False
        
        # Install dependencies
        exit_status, output, error = self.execute_command(f"cd {project_dir} && npm install")
        if exit_status != 0:
            logger.error(f"❌ Failed to install dependencies: {error}")
            return False
        
        # Build the project
        logger.info("🔨 Building project...")
        exit_status, output, error = self.execute_command(f"cd {project_dir} && npm run build")
        if exit_status != 0:
            logger.error(f"❌ Failed to build project: {error}")
            return False
        
        logger.info("✅ Project dependencies installed and built successfully")
        return True
    
    def create_environment_file(self, project_dir: str, env_vars: Dict[str, str]):
        """Create .env.local file for the project"""
        if not env_vars:
            return
        
        logger.info("🔧 Creating environment file...")
        
        env_content = "\n".join([f"{key}={value}" for key, value in env_vars.items()])
        
        # Create temporary file and upload
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as tmp:
            tmp.write(env_content)
            tmp_path = tmp.name
        
        try:
            self.scp_client.put(tmp_path, f"{project_dir}/.env.local")
            logger.info("✅ Environment file created")
        finally:
            os.unlink(tmp_path)
    
    def configure_nginx(self, project_config: ProjectConfig) -> bool:
        """Configure Nginx for the project"""
        logger.info(f"🌐 Configuring Nginx for {project_config.domain}...")
        
        nginx_config = f"""
server {{
    listen 80;
    server_name {project_config.domain} www.{project_config.domain};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {{
        proxy_pass http://127.0.0.1:{project_config.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }}

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {{
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @proxy;
    }}

    location @proxy {{
        proxy_pass http://127.0.0.1:{project_config.port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
}}
"""
        
        # Create temporary file and upload
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as tmp:
            tmp.write(nginx_config)
            tmp_path = tmp.name
        
        try:
            config_path = f"/etc/nginx/sites-available/{project_config.name}"
            self.scp_client.put(tmp_path, config_path)
            
            # Enable the site
            self.execute_command(f"ln -sf {config_path} /etc/nginx/sites-enabled/{project_config.name}", sudo=True)
            
            # Test and reload Nginx
            exit_status, _, error = self.execute_command("nginx -t", sudo=True)
            if exit_status != 0:
                logger.error(f"❌ Nginx configuration test failed: {error}")
                return False
            
            self.execute_command("systemctl reload nginx", sudo=True)
            logger.info("✅ Nginx configured successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to configure Nginx: {e}")
            return False
        finally:
            os.unlink(tmp_path)
    
    def setup_ssl_certificate(self, domain: str, email: str) -> bool:
        """Setup SSL certificate using Let's Encrypt"""
        if not email:
            logger.info("⏭️ Skipping SSL setup (no email provided)")
            return True
        
        logger.info(f"🔒 Setting up SSL certificate for {domain}...")
        
        # Generate SSL certificate
        exit_status, output, error = self.execute_command(
            f"certbot --nginx -d {domain} -d www.{domain} --non-interactive --agree-tos --email {email}",
            sudo=True
        )
        
        if exit_status == 0:
            logger.info("✅ SSL certificate configured successfully")
            return True
        else:
            logger.warning(f"⚠️ SSL setup failed: {error}")
            return False
    
    def setup_pm2_process(self, project_config: ProjectConfig, project_dir: str) -> bool:
        """Setup PM2 process for the application"""
        logger.info("⚡ Setting up PM2 process...")
        
        # Stop existing process if it exists
        self.execute_command(f"pm2 delete {project_config.name} || true")
        
        # Create PM2 ecosystem file
        ecosystem = {
            "apps": [{
                "name": project_config.name,
                "cwd": project_dir,
                "script": "npm",
                "args": "start",
                "env": {
                    "NODE_ENV": "production",
                    "PORT": str(project_config.port),
                    **(project_config.env_vars or {})
                },
                "instances": 1,
                "autorestart": True,
                "watch": False,
                "max_memory_restart": "1G",
                "log_date_format": "YYYY-MM-DD HH:mm Z",
                "error_file": f"/var/log/pm2/{project_config.name}.error.log",
                "out_file": f"/var/log/pm2/{project_config.name}.out.log",
                "log_file": f"/var/log/pm2/{project_config.name}.log"
            }]
        }
        
        # Create log directory
        self.execute_command("mkdir -p /var/log/pm2", sudo=True)
        self.execute_command(f"chown -R {self.server.username}:{self.server.username} /var/log/pm2", sudo=True)
        
        # Upload ecosystem file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as tmp:
            json.dump(ecosystem, tmp, indent=2)
            tmp_path = tmp.name
        
        try:
            ecosystem_path = f"{project_dir}/ecosystem.config.json"
            self.scp_client.put(tmp_path, ecosystem_path)
            
            # Start the application
            exit_status, output, error = self.execute_command(f"cd {project_dir} && pm2 start ecosystem.config.json")
            if exit_status != 0:
                logger.error(f"❌ Failed to start PM2 process: {error}")
                return False
            
            # Save PM2 process list
            self.execute_command("pm2 save")
            
            # Setup PM2 startup script
            exit_status, output, _ = self.execute_command("pm2 startup")
            if "sudo" in output:
                startup_cmd = output.split("sudo ")[1].strip()
                self.execute_command(startup_cmd, sudo=True)
            
            logger.info("✅ PM2 process configured successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to setup PM2: {e}")
            return False
        finally:
            os.unlink(tmp_path)
    
    def deploy_project(self, project_config: ProjectConfig) -> bool:
        """Deploy the complete project"""
        logger.info(f"🚀 Starting deployment of {project_config.name}...")
        
        try:
            # Create project directory
            project_dir = self.create_project_directory(project_config.name)
            
            # Upload and extract project
            if not self.upload_and_extract_project(project_config.zip_file_path, project_dir):
                return False
            
            # Create environment file
            if project_config.env_vars:
                self.create_environment_file(project_dir, project_config.env_vars)
            
            # Install dependencies and build
            if not self.install_project_dependencies(project_dir):
                return False
            
            # Configure Nginx
            if not self.configure_nginx(project_config):
                return False
            
            # Setup PM2 process
            if not self.setup_pm2_process(project_config, project_dir):
                return False
            
            # Setup SSL certificate
            if self.server.ssl_email and project_config.domain:
                self.setup_ssl_certificate(project_config.domain, self.server.ssl_email)
            
            logger.info(f"🎉 Deployment completed successfully!")
            logger.info(f"🌐 Your application is now live at: http://{project_config.domain}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Deployment failed: {e}")
            return False

def load_config_file(config_path: str) -> Dict:
    """Load configuration from YAML or JSON file"""
    with open(config_path, 'r') as f:
        if config_path.endswith('.yaml') or config_path.endswith('.yml'):
            return yaml.safe_load(f)
        else:
            return json.load(f)

def main():
    parser = argparse.ArgumentParser(description="Deploy Next.js projects to web servers")
    parser.add_argument("--config", required=True, help="Configuration file (YAML or JSON)")
    parser.add_argument("--project-zip", required=True, help="Path to project zip file")
    parser.add_argument("--setup-server", action="store_true", help="Setup server dependencies")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Load configuration
        config_data = load_config_file(args.config)
        # Create server configuration
        server_config = ServerConfig(**config_data["server"])
        # Create project configuration
        project_data = config_data["project"]
        project_data["zip_file_path"] = args.project_zip
        project_config = ProjectConfig(**project_data)
        # Create deployer instance
        deployer = WebServerDeployer(server_config)
        # Connect to server
        if not deployer.connect():
            sys.exit(1)
        
        try:
            # Setup server if requested
            if args.setup_server:
                if not deployer.check_and_install_dependencies():
                    logger.error("❌ Server setup failed")
                    sys.exit(1)
            
            # Deploy project
            if not deployer.deploy_project(project_config):
                logger.error("❌ Project deployment failed")
                sys.exit(1)
                
        finally:
            deployer.disconnect()
        
        logger.info("🎉 All operations completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Script failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()