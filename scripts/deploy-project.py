#!/usr/bin/env python3
"""
Automated Server Deployment System for Next.js Projects
Handles server setup, nginx virtual hosting, and project deployment
"""

import os
import sys
import json
import subprocess
import paramiko
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
import yaml
import shutil
import zipfile
import tempfile

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('deployment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ServerConfig:
    """Server configuration"""
    host: str
    username: str
    password: Optional[str] = None
    key_file: Optional[str] = None
    port: int = 22
    os_type: str = "ubuntu"  # ubuntu, debian, centos

@dataclass
class ProjectConfig:
    """Project deployment configuration"""
    domain: str
    subdomain: Optional[str] = None
    project_name: str = ""
    ssl_enabled: bool = True
    node_version: str = "18"
    port: int = 3000
    env_vars: Dict[str, str] = None
    build_command: str = "npm run build"
    start_command: str = "npm start"
    
    def __post_init__(self):
        if not self.project_name:
            self.project_name = self.domain.replace('.', '_')
        if self.env_vars is None:
            self.env_vars = {}

class ServerManager:
    """Manages server operations via SSH"""
    
    def __init__(self, config: ServerConfig):
        self.config = config
        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.connected = False
    
    def connect(self):
        """Connect to server via SSH"""
        try:
            if self.config.key_file:
                self.ssh.connect(
                    hostname=self.config.host,
                    username=self.config.username,
                    key_filename=self.config.key_file,
                    port=self.config.port
                )
            else:
                self.ssh.connect(
                    hostname=self.config.host,
                    username=self.config.username,
                    password=self.config.password,
                    port=self.config.port
                )
            self.connected = True
            logger.info(f"Connected to {self.config.host}")
        except Exception as e:
            logger.error(f"Failed to connect to server: {e}")
            raise
    
    def execute_command(self, command: str, sudo: bool = False) -> tuple:
        """Execute command on remote server"""
        if not self.connected:
            self.connect()
        
        if sudo:
            command = f"sudo {command}"
        
        logger.info(f"Executing: {command}")
        stdin, stdout, stderr = self.ssh.exec_command(command)
        
        # Wait for command to complete
        exit_status = stdout.channel.recv_exit_status()
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        if exit_status != 0 and error:
            logger.warning(f"Command failed with exit code {exit_status}: {error}")
        
        return exit_status, output, error
    
    def upload_file(self, local_path: str, remote_path: str):
        """Upload file to server"""
        if not self.connected:
            self.connect()
        
        sftp = self.ssh.open_sftp()
        try:
            # Create remote directory if it doesn't exist
            remote_dir = os.path.dirname(remote_path)
            try:
                sftp.mkdir(remote_dir)
            except:
                pass  # Directory might already exist
            
            sftp.put(local_path, remote_path)
            logger.info(f"Uploaded {local_path} to {remote_path}")
        finally:
            sftp.close()
    
    def upload_directory(self, local_path: str, remote_path: str):
        """Upload entire directory to server"""
        if not self.connected:
            self.connect()
        
        sftp = self.ssh.open_sftp()
        try:
            # Create remote directory
            self.execute_command(f"mkdir -p {remote_path}")
            
            for root, dirs, files in os.walk(local_path):
                # Create directories
                for dirname in dirs:
                    local_dir = os.path.join(root, dirname)
                    relative_path = os.path.relpath(local_dir, local_path)
                    remote_dir = os.path.join(remote_path, relative_path).replace('\\', '/')
                    try:
                        sftp.mkdir(remote_dir)
                    except:
                        pass
                
                # Upload files
                for filename in files:
                    local_file = os.path.join(root, filename)
                    relative_path = os.path.relpath(local_file, local_path)
                    remote_file = os.path.join(remote_path, relative_path).replace('\\', '/')
                    sftp.put(local_file, remote_file)
                    logger.info(f"Uploaded {relative_path}")
        finally:
            sftp.close()
    
    def disconnect(self):
        """Close SSH connection"""
        if self.connected:
            self.ssh.close()
            self.connected = False
            logger.info("Disconnected from server")

class ServerSetup:
    """Handles initial server setup"""
    
    def __init__(self, server_manager: ServerManager):
        self.server = server_manager
    
    def setup_server(self):
        """Complete server setup"""
        logger.info("Starting server setup...")
        
        self.update_system()
        self.install_nodejs()
        self.install_nginx()
        self.install_pm2()
        self.install_certbot()
        self.setup_firewall()
        self.create_deploy_user()
        
        logger.info("Server setup completed!")
    
    def update_system(self):
        """Update system packages"""
        logger.info("Updating system packages...")
        
        if self.server.config.os_type in ['ubuntu', 'debian']:
            self.server.execute_command("apt update && apt upgrade -y", sudo=True)
        elif self.server.config.os_type == 'centos':
            self.server.execute_command("yum update -y", sudo=True)
    
    def install_nodejs(self):
        """Install Node.js and npm"""
        logger.info("Installing Node.js...")
        
        if self.server.config.os_type in ['ubuntu', 'debian']:
            commands = [
                "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -",
                "apt-get install -y nodejs",
                "npm install -g npm@latest"
            ]
        elif self.server.config.os_type == 'centos':
            commands = [
                "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -",
                "yum install -y nodejs",
                "npm install -g npm@latest"
            ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=True)
    
    def install_nginx(self):
        """Install and configure nginx"""
        logger.info("Installing nginx...")
        
        if self.server.config.os_type in ['ubuntu', 'debian']:
            self.server.execute_command("apt install -y nginx", sudo=True)
        elif self.server.config.os_type == 'centos':
            self.server.execute_command("yum install -y nginx", sudo=True)
        
        # Start and enable nginx
        self.server.execute_command("systemctl start nginx", sudo=True)
        self.server.execute_command("systemctl enable nginx", sudo=True)
        
        # Create sites directory
        self.server.execute_command("mkdir -p /etc/nginx/sites-available", sudo=True)
        self.server.execute_command("mkdir -p /etc/nginx/sites-enabled", sudo=True)
        
        # Update main nginx config
        nginx_config = self.get_main_nginx_config()
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(nginx_config)
            temp_path = f.name
        
        self.server.upload_file(temp_path, "/tmp/nginx.conf")
        self.server.execute_command("mv /tmp/nginx.conf /etc/nginx/nginx.conf", sudo=True)
        self.server.execute_command("nginx -t", sudo=True)
        self.server.execute_command("systemctl reload nginx", sudo=True)
        
        os.unlink(temp_path)
    
    def install_pm2(self):
        """Install PM2 process manager"""
        logger.info("Installing PM2...")
        self.server.execute_command("npm install -g pm2", sudo=True)
        self.server.execute_command("pm2 startup", sudo=True)
    
    def install_certbot(self):
        """Install Certbot for SSL certificates"""
        logger.info("Installing Certbot...")
        
        if self.server.config.os_type in ['ubuntu', 'debian']:
            commands = [
                "apt install -y snapd",
                "snap install core; snap refresh core",
                "snap install --classic certbot",
                "ln -sf /snap/bin/certbot /usr/bin/certbot"
            ]
        elif self.server.config.os_type == 'centos':
            commands = [
                "yum install -y epel-release",
                "yum install -y certbot python3-certbot-nginx"
            ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=True)
    
    def setup_firewall(self):
        """Configure firewall"""
        logger.info("Configuring firewall...")
        
        commands = [
            "ufw allow ssh",
            "ufw allow 'Nginx Full'",
            "ufw --force enable"
        ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=True)
    
    def create_deploy_user(self):
        """Create deployment user"""
        logger.info("Creating deployment user...")
        
        commands = [
            "useradd -m -s /bin/bash deploy",
            "usermod -aG sudo deploy",
            "mkdir -p /home/deploy/.ssh",
            "chown deploy:deploy /home/deploy/.ssh",
            "chmod 700 /home/deploy/.ssh"
        ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=True)
    
    def get_main_nginx_config(self) -> str:
        """Get main nginx configuration"""
        return """
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    multi_accept on;
    use epoll;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    
    # Logging Settings
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
"""

class ProjectDeployer:
    """Handles project deployment"""
    
    def __init__(self, server_manager: ServerManager):
        self.server = server_manager
    
    def deploy_project(self, project_config: ProjectConfig, project_path: str):
        """Deploy a Next.js project"""
        logger.info(f"Deploying project {project_config.project_name}...")
        
        # Create project directory
        app_dir = f"/var/www/{project_config.project_name}"
        self.server.execute_command(f"mkdir -p {app_dir}", sudo=True)
        self.server.execute_command(f"chown -R deploy:deploy {app_dir}", sudo=True)
        
        # Upload project files
        if project_path.endswith('.zip'):
            self.deploy_from_zip(project_config, project_path)
        else:
            self.deploy_from_directory(project_config, project_path)
        
        # Install dependencies and build
        self.install_dependencies(project_config)
        self.build_project(project_config)
        
        # Configure nginx
        self.configure_nginx(project_config)
        
        # Start with PM2
        self.start_with_pm2(project_config)
        
        # Setup SSL if enabled
        if project_config.ssl_enabled:
            self.setup_ssl(project_config)
        
        logger.info(f"Project {project_config.project_name} deployed successfully!")
    
    def deploy_from_zip(self, project_config: ProjectConfig, zip_path: str):
        """Deploy from ZIP file"""
        app_dir = f"/var/www/{project_config.project_name}"
        
        # Upload ZIP file
        self.server.upload_file(zip_path, f"/tmp/{project_config.project_name}.zip")
        
        # Extract ZIP file
        commands = [
            f"cd {app_dir}",
            f"unzip -o /tmp/{project_config.project_name}.zip",
            f"rm /tmp/{project_config.project_name}.zip",
            f"chown -R deploy:deploy {app_dir}"
        ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=True)
    
    def deploy_from_directory(self, project_config: ProjectConfig, project_path: str):
        """Deploy from local directory"""
        app_dir = f"/var/www/{project_config.project_name}"
        self.server.upload_directory(project_path, app_dir)
        self.server.execute_command(f"chown -R deploy:deploy {app_dir}", sudo=True)
    
    def install_dependencies(self, project_config: ProjectConfig):
        """Install npm dependencies"""
        logger.info("Installing dependencies...")
        app_dir = f"/var/www/{project_config.project_name}"
        
        # Create .env file
        env_content = "\n".join([f"{k}={v}" for k, v in project_config.env_vars.items()])
        if env_content:
            with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
                f.write(env_content)
                temp_path = f.name
            
            self.server.upload_file(temp_path, f"{app_dir}/.env")
            os.unlink(temp_path)
        
        # Install dependencies
        self.server.execute_command(f"cd {app_dir} && npm install --production", sudo=False)
    
    def build_project(self, project_config: ProjectConfig):
        """Build the Next.js project"""
        logger.info("Building project...")
        app_dir = f"/var/www/{project_config.project_name}"
        self.server.execute_command(f"cd {app_dir} && {project_config.build_command}", sudo=False)
    
    def configure_nginx(self, project_config: ProjectConfig):
        """Configure nginx virtual host"""
        logger.info("Configuring nginx...")
        
        domain = project_config.domain
        if project_config.subdomain:
            domain = f"{project_config.subdomain}.{project_config.domain}"
        
        nginx_config = self.get_nginx_site_config(project_config, domain)
        
        # Upload configuration
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            f.write(nginx_config)
            temp_path = f.name
        
        site_config = f"/etc/nginx/sites-available/{project_config.project_name}"
        self.server.upload_file(temp_path, site_config)
        
        # Enable site
        self.server.execute_command(
            f"ln -sf {site_config} /etc/nginx/sites-enabled/{project_config.project_name}",
            sudo=True
        )
        
        # Test and reload nginx
        exit_code, _, _ = self.server.execute_command("nginx -t", sudo=True)
        if exit_code == 0:
            self.server.execute_command("systemctl reload nginx", sudo=True)
        else:
            logger.error("Nginx configuration test failed!")
            raise Exception("Invalid nginx configuration")
        
        os.unlink(temp_path)
    
    def start_with_pm2(self, project_config: ProjectConfig):
        """Start application with PM2"""
        logger.info("Starting application with PM2...")
        
        app_dir = f"/var/www/{project_config.project_name}"
        
        # Create PM2 ecosystem file
        ecosystem_config = {
            "apps": [{
                "name": project_config.project_name,
                "cwd": app_dir,
                "script": project_config.start_command,
                "instances": "max",
                "exec_mode": "cluster",
                "env": {
                    "NODE_ENV": "production",
                    "PORT": str(project_config.port),
                    **project_config.env_vars
                }
            }]
        }
        
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
            json.dump(ecosystem_config, f, indent=2)
            temp_path = f.name
        
        ecosystem_file = f"{app_dir}/ecosystem.config.json"
        self.server.upload_file(temp_path, ecosystem_file)
        
        # Start with PM2
        commands = [
            f"pm2 delete {project_config.project_name} || true",
            f"pm2 start {ecosystem_file}",
            "pm2 save"
        ]
        
        for cmd in commands:
            self.server.execute_command(cmd, sudo=False)
        
        os.unlink(temp_path)
    
    def setup_ssl(self, project_config: ProjectConfig):
        """Setup SSL certificate with Let's Encrypt"""
        logger.info("Setting up SSL certificate...")
        
        domain = project_config.domain
        if project_config.subdomain:
            domain = f"{project_config.subdomain}.{project_config.domain}"
        
        # Request SSL certificate
        cmd = f"certbot --nginx -d {domain} --non-interactive --agree-tos --email admin@{project_config.domain}"
        exit_code, output, error = self.server.execute_command(cmd, sudo=True)
        
        if exit_code == 0:
            logger.info("SSL certificate installed successfully")
        else:
            logger.warning(f"SSL setup failed: {error}")
    
    def get_nginx_site_config(self, project_config: ProjectConfig, domain: str) -> str:
        """Generate nginx site configuration"""
        return f"""
server {{
    listen 80;
    server_name {domain};
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}}

server {{
    listen 443 ssl http2;
    server_name {domain};
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Static files
    location /_next/static/ {{
        alias /var/www/{project_config.project_name}/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }}
    
    location /static/ {{
        alias /var/www/{project_config.project_name}/public/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }}
    
    # Main application
    location / {{
        proxy_pass http://localhost:{project_config.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}
}}
"""

class DeploymentManager:
    """Main deployment management class"""
    
    def __init__(self, config_file: str = "deployment_config.yaml"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self) -> dict:
        """Load deployment configuration"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return yaml.safe_load(f)
        else:
            # Create default config
            default_config = {
                'servers': {
                    'production': {
                        'host': 'your-server-ip',
                        'username': 'deploy',
                        'key_file': '~/.ssh/id_rsa',
                        'port': 22,
                        'os_type': 'ubuntu'
                    }
                },
                'projects': {
                    'example': {
                        'domain': 'example.com',
                        'ssl_enabled': True,
                        'node_version': '18',
                        'port': 3000,
                        'env_vars': {
                            'NODE_ENV': 'production'
                        }
                    }
                }
            }
            
            with open(self.config_file, 'w') as f:
                yaml.dump(default_config, f, default_flow_style=False)
            
            logger.info(f"Created default config file: {self.config_file}")
            return default_config
    
    def setup_server(self, server_name: str):
        """Setup a new server"""
        if server_name not in self.config['servers']:
            raise ValueError(f"Server '{server_name}' not found in config")
        
        server_config = ServerConfig(**self.config['servers'][server_name])
        server_manager = ServerManager(server_config)
        
        try:
            server_manager.connect()
            setup = ServerSetup(server_manager)
            setup.setup_server()
        finally:
            server_manager.disconnect()
    
    def deploy_project(self, server_name: str, project_name: str, project_path: str):
        """Deploy a project to a server"""
        if server_name not in self.config['servers']:
            raise ValueError(f"Server '{server_name}' not found in config")
        
        if project_name not in self.config['projects']:
            raise ValueError(f"Project '{project_name}' not found in config")
        
        server_config = ServerConfig(**self.config['servers'][server_name])
        project_config = ProjectConfig(**self.config['projects'][project_name])
        
        server_manager = ServerManager(server_config)
        deployer = ProjectDeployer(server_manager)
        
        try:
            server_manager.connect()
            deployer.deploy_project(project_config, project_path)
        finally:
            server_manager.disconnect()
    
    def list_deployments(self, server_name: str):
        """List all deployments on a server"""
        if server_name not in self.config['servers']:
            raise ValueError(f"Server '{server_name}' not found in config")
        
        server_config = ServerConfig(**self.config['servers'][server_name])
        server_manager = ServerManager(server_config)
        
        try:
            server_manager.connect()
            exit_code, output, _ = server_manager.execute_command("pm2 list")
            if exit_code == 0:
                print("PM2 Processes:")
                print(output)
            
            exit_code, output, _ = server_manager.execute_command("ls -la /var/www/", sudo=True)
            if exit_code == 0:
                print("\nDeployed Projects:")
                print(output)
        finally:
            server_manager.disconnect()

def main():
    """Main CLI interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Automated Server Deployment System')
    parser.add_argument('action', choices=['setup', 'deploy', 'list'], help='Action to perform')
    parser.add_argument('--server', required=True, help='Server name from config')
    parser.add_argument('--project', help='Project name from config (for deploy)')
    parser.add_argument('--path', help='Project path (for deploy)')
    parser.add_argument('--config', default='deployment_config.yaml', help='Config file path')
    
    args = parser.parse_args()
    
    try:
        manager = DeploymentManager(args.config)
        
        if args.action == 'setup':
            manager.setup_server(args.server)
            
        elif args.action == 'deploy':
            if not args.project or not args.path:
                print("Error: --project and --path are required for deploy action")
                sys.exit(1)
            manager.deploy_project(args.server, args.project, args.path)
            
        elif args.action == 'list':
            manager.list_deployments(args.server)
            
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()