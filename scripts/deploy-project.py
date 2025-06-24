#!/usr/bin/env python3
"""
Next.js Project Deployment Script
Deploys generated Next.js projects to Linux servers with nginx
"""

import os
import sys
import argparse
import json
import logging
from pathlib import Path
from datetime import datetime
import paramiko
from scp import SCPClient
import yaml
import time

class NextJSDeployer:
    def __init__(self, config_file=None):
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('deployment.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load configuration
        self.config = self.load_config(config_file)
        self.ssh = None
        self.sftp = None
        
    def load_config(self, config_file):
        """Load deployment configuration"""
        default_config = {
            'server': {
                'host': '',
                'port': 22,
                'username': '',
                'key_file': '~/.ssh/id_rsa',
                'password': None
            },
            'deployment': {
                'base_path': '/var/www',
                'app_name': 'nextjs-app',
                'node_version': '18',
                'pm2_enabled': True,
                'nginx_enabled': True,
                'domain': 'localhost',
                'port': 3000,
                'ssl_enabled': False,
                'backup_previous': True,
                'auto_restart': True
            },
            'build': {
                'install_dependencies': True,
                'run_build': True,
                'run_tests': False,
                'env_file': None,
                'custom_build_script': None
            }
        }
        
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                if config_file.endswith('.yaml') or config_file.endswith('.yml'):
                    user_config = yaml.safe_load(f)
                else:
                    user_config = json.load(f)
            
            # Merge configs
            for key, value in user_config.items():
                if isinstance(value, dict) and key in default_config:
                    default_config[key].update(value)
                else:
                    default_config[key] = value
        
        return default_config
    
    def connect_ssh(self):
        """Establish SSH connection"""
        try:
            self.logger.info(f"Connecting to {self.config['server']['host']}...")
            
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Prepare connection parameters
            connect_params = {
                'hostname': self.config['server']['host'],
                'port': self.config['server']['port'],
                'username': self.config['server']['username'],
                'timeout': 30
            }
            
            # Use key file or password
            if self.config['server']['key_file']:
                key_file = os.path.expanduser(self.config['server']['key_file'])
                if os.path.exists(key_file):
                    connect_params['key_filename'] = key_file
                else:
                    self.logger.warning(f"Key file not found: {key_file}")
            
            if self.config['server']['password']:
                connect_params['password'] = self.config['server']['password']
            
            self.ssh.connect(**connect_params)
            self.sftp = self.ssh.open_sftp()
            self.logger.info("SSH connection established")
            
        except Exception as e:
            self.logger.error(f"SSH connection failed: {e}")
            raise
    
    def disconnect_ssh(self):
        """Close SSH connection"""
        if self.sftp:
            self.sftp.close()
        if self.ssh:
            self.ssh.close()
        self.logger.info("SSH connection closed")
    
    def execute_command(self, command, check_return_code=True, timeout=300):
        """Execute command on remote server"""
        self.logger.info(f"Executing: {command}")
        
        stdin, stdout, stderr = self.ssh.exec_command(command, timeout=timeout)
        stdout_data = stdout.read().decode('utf-8')
        stderr_data = stderr.read().decode('utf-8')
        return_code = stdout.channel.recv_exit_status()
        
        if stdout_data:
            self.logger.info(f"STDOUT: {stdout_data}")
        if stderr_data and return_code != 0:
            self.logger.error(f"STDERR: {stderr_data}")
        
        if check_return_code and return_code != 0:
            raise Exception(f"Command failed with return code {return_code}: {command}")
        
        return stdout_data, stderr_data, return_code
    
    def upload_file(self, local_path, remote_path):
        """Upload file to remote server"""
        self.logger.info(f"Uploading {local_path} to {remote_path}")
        
        try:
            # Ensure remote directory exists
            remote_dir = os.path.dirname(remote_path)
            self.execute_command(f"mkdir -p {remote_dir}", check_return_code=False)
            
            # Upload file
            with SCPClient(self.ssh.get_transport()) as scp:
                scp.put(local_path, remote_path)
            
            self.logger.info("File uploaded successfully")
        except Exception as e:
            self.logger.error(f"File upload failed: {e}")
            raise
    
    def backup_previous_deployment(self, app_path):
        """Backup previous deployment"""
        if not self.config['deployment']['backup_previous']:
            return
        
        # Check if app directory exists
        stdout, _, return_code = self.execute_command(
            f"test -d {app_path}", 
            check_return_code=False
        )
        
        if return_code == 0:  # Directory exists
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = f"{app_path}_backup_{timestamp}"
            self.execute_command(f"mv {app_path} {backup_path}")
            self.logger.info(f"Previous deployment backed up to {backup_path}")
            
            # Clean up old backups (keep only last 5)
            self.execute_command(
                f"ls -dt {app_path}_backup_* | tail -n +6 | xargs rm -rf",
                check_return_code=False
            )
    
    def install_system_dependencies(self):
        """Install system dependencies"""
        self.logger.info("Installing system dependencies...")
        
        # Update package list
        self.execute_command("sudo apt-get update", timeout=600)
        
        # Install required packages
        packages = [
            "curl", "wget", "unzip", "nginx", 
            "software-properties-common", "build-essential"
        ]
        
        package_list = " ".join(packages)
        self.execute_command(f"sudo apt-get install -y {package_list}", timeout=600)
    
    def install_node_dependencies(self):
        """Install Node.js and npm if needed"""
        self.logger.info("Checking Node.js installation...")
        
        # Check if Node.js is installed
        stdout, _, return_code = self.execute_command(
            "node --version", 
            check_return_code=False
        )
        
        if return_code != 0:
            self.logger.info("Installing Node.js...")
            node_version = self.config['deployment']['node_version']
            
            # Install Node.js using NodeSource repository
            commands = [
                f"curl -fsSL https://deb.nodesource.com/setup_{node_version}.x | sudo -E bash -",
                "sudo apt-get install -y nodejs"
            ]
            
            for cmd in commands:
                self.execute_command(cmd, timeout=600)
        else:
            self.logger.info(f"Node.js already installed: {stdout.strip()}")
        
        # Check npm
        self.execute_command("npm --version")
        self.logger.info("Node.js and npm are ready")
    
    def install_pm2(self):
        """Install PM2 process manager"""
        if not self.config['deployment']['pm2_enabled']:
            return
        
        self.logger.info("Checking PM2 installation...")
        stdout, _, return_code = self.execute_command(
            "pm2 --version", 
            check_return_code=False
        )
        
        if return_code != 0:
            self.logger.info("Installing PM2...")
            self.execute_command("sudo npm install -g pm2", timeout=300)
            self.execute_command("pm2 startup", check_return_code=False)
        else:
            self.logger.info(f"PM2 already installed: {stdout.strip()}")
    
    def deploy_project(self, zip_file_path):
        """Deploy the Next.js project"""
        app_name = self.config['deployment']['app_name']
        base_path = self.config['deployment']['base_path']
        app_path = f"{base_path}/{app_name}"
        
        try:
            # Connect to server
            self.connect_ssh()
            
            # Install system dependencies
            self.install_system_dependencies()
            
            # Install Node.js and PM2
            self.install_node_dependencies()
            if self.config['deployment']['pm2_enabled']:
                self.install_pm2()
            
            # Stop existing services
            self.stop_existing_services(app_name)
            
            # Backup previous deployment
            self.backup_previous_deployment(app_path)
            
            # Create app directory
            self.execute_command(f"sudo mkdir -p {app_path}")
            
            # Upload zip file
            remote_zip_path = f"{app_path}/project.zip"
            self.upload_file(zip_file_path, remote_zip_path)
            
            # Extract zip file
            self.logger.info("Extracting project files...")
            self.execute_command(f"cd {app_path} && sudo unzip -o project.zip")
            self.execute_command(f"sudo rm {remote_zip_path}")
            
            # Set correct permissions
            self.execute_command(f"sudo chown -R www-data:www-data {app_path}")
            self.execute_command(f"sudo chmod -R 755 {app_path}")
            
            # Copy environment file if provided
            if self.config['build']['env_file'] and os.path.exists(self.config['build']['env_file']):
                env_remote_path = f"{app_path}/.env.local"
                self.upload_file(self.config['build']['env_file'], env_remote_path)
                self.execute_command(f"sudo chown www-data:www-data {env_remote_path}")
            
            # Install project dependencies
            if self.config['build']['install_dependencies']:
                self.logger.info("Installing project dependencies...")
                self.execute_command(f"cd {app_path} && sudo -u www-data npm install", timeout=600)
            
            # Build project
            if self.config['build']['run_build']:
                self.logger.info("Building Next.js project...")
                if self.config['build']['custom_build_script']:
                    self.execute_command(f"cd {app_path} && sudo -u www-data {self.config['build']['custom_build_script']}", timeout=600)
                else:
                    self.execute_command(f"cd {app_path} && sudo -u www-data npm run build", timeout=600)
            
            # Run tests if enabled
            if self.config['build']['run_tests']:
                self.logger.info("Running tests...")
                self.execute_command(f"cd {app_path} && sudo -u www-data npm test", check_return_code=False, timeout=300)
            
            # Configure and start services
            if self.config['deployment']['nginx_enabled']:
                self.configure_nginx(app_path)
            
            if self.config['deployment']['pm2_enabled']:
                self.configure_pm2(app_path)
            else:
                self.start_application(app_path)
            
            # Verify deployment
            self.verify_deployment()
            
            self.logger.info("Deployment completed successfully!")
            self.print_deployment_info()
            
        except Exception as e:
            self.logger.error(f"Deployment failed: {e}")
            self.rollback_deployment(app_path)
            raise
        finally:
            self.disconnect_ssh()
    
    def stop_existing_services(self, app_name):
        """Stop existing services before deployment"""
        if self.config['deployment']['pm2_enabled']:
            self.execute_command(f"pm2 delete {app_name}", check_return_code=False)
        
        # Kill any process on the target port
        port = self.config['deployment']['port']
        self.execute_command(f"sudo fuser -k {port}/tcp", check_return_code=False)
        
        # Wait a moment for processes to stop
        time.sleep(2)
    
    def configure_nginx(self, app_path):
        """Configure nginx for the application"""
        self.logger.info("Configuring nginx...")
        
        app_name = self.config['deployment']['app_name']
        domain = self.config['deployment']['domain']
        port = self.config['deployment']['port']
        ssl_enabled = self.config['deployment']['ssl_enabled']
        
        # Create nginx configuration
        nginx_config = f"""
# {app_name} Next.js Application
server {{
    listen 80;
    server_name {domain} www.{domain};
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    {"return 301 https://$server_name$request_uri;" if ssl_enabled else ""}
    
    {"" if ssl_enabled else f'''
    # Static files
    location /_next/static/ {{
        alias {app_path}/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }}
    
    location /static/ {{
        alias {app_path}/public/;
        expires 30d;
        add_header Cache-Control "public";
    }}
    
    # Main application
    location / {{
        proxy_pass http://localhost:{port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }}
    '''}
}}

{f'''
server {{
    listen 443 ssl http2;
    server_name {domain} www.{domain};
    
    ssl_certificate /etc/ssl/certs/{domain}.crt;
    ssl_certificate_key /etc/ssl/private/{domain}.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Static files
    location /_next/static/ {{
        alias {app_path}/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }}
    
    location /static/ {{
        alias {app_path}/public/;
        expires 30d;
        add_header Cache-Control "public";
    }}
    
    # Main application
    location / {{
        proxy_pass http://localhost:{port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }}
}}
''' if ssl_enabled else ""}
"""
        
        # Write nginx config locally
        config_path = f"/tmp/{app_name}_nginx_local.conf"
        with open(config_path, 'w') as f:
            f.write(nginx_config.strip())
        
        # Upload and enable nginx config
        self.upload_file(config_path, f"/tmp/{app_name}_nginx.conf")
        self.execute_command(f"sudo mv /tmp/{app_name}_nginx.conf /etc/nginx/sites-available/{app_name}")
        
        # Remove default site if it exists
        self.execute_command("sudo rm -f /etc/nginx/sites-enabled/default", check_return_code=False)
        
        # Enable site
        self.execute_command(f"sudo ln -sf /etc/nginx/sites-available/{app_name} /etc/nginx/sites-enabled/")
        
        # Test and reload nginx
        self.execute_command("sudo nginx -t")
        self.execute_command("sudo systemctl enable nginx")
        self.execute_command("sudo systemctl restart nginx")
        
        # Clean up local temp file
        os.remove(config_path)
        
        self.logger.info("Nginx configured successfully")
    
    def configure_pm2(self, app_path):
        """Configure PM2 for the application"""
        self.logger.info("Configuring PM2...")
        
        app_name = self.config['deployment']['app_name']
        port = self.config['deployment']['port']
        
        # Create PM2 ecosystem file
        pm2_config = {
            "apps": [{
                "name": app_name,
                "script": "npm",
                "args": "start",
                "cwd": app_path,
                "instances": "max",
                "exec_mode": "cluster",
                "env": {
                    "NODE_ENV": "production",
                    "PORT": str(port)
                },
                "error_file": f"{app_path}/logs/err.log",
                "out_file": f"{app_path}/logs/out.log",
                "log_file": f"{app_path}/logs/combined.log",
                "time": True,
                "restart_delay": 4000,
                "max_restarts": 10,
                "min_uptime": "10s"
            }]
        }
        
        # Create logs directory
        self.execute_command(f"sudo mkdir -p {app_path}/logs")
        self.execute_command(f"sudo chown -R www-data:www-data {app_path}/logs")
        
        # Write PM2 config locally
        local_pm2_config = f"/tmp/{app_name}_pm2.json"
        with open(local_pm2_config, 'w') as f:
            json.dump(pm2_config, f, indent=2)
        
        # Upload PM2 config
        pm2_config_path = f"{app_path}/ecosystem.config.json"
        self.upload_file(local_pm2_config, pm2_config_path)
        self.execute_command(f"sudo chown www-data:www-data {pm2_config_path}")
        
        # Start with PM2
        self.execute_command(f"cd {app_path} && sudo -u www-data pm2 start ecosystem.config.json")
        self.execute_command("sudo -u www-data pm2 save")
        
        # Setup PM2 startup script
        startup_output, _, _ = self.execute_command("sudo -u www-data pm2 startup", check_return_code=False)
        if "sudo" in startup_output:
            # Extract the startup command and run it
            for line in startup_output.split('\n'):
                if line.strip().startswith('sudo'):
                    self.execute_command(line.strip(), check_return_code=False)
        
        # Clean up local temp file
        os.remove(local_pm2_config)
        
        self.logger.info("PM2 configured successfully")
    
    def start_application(self, app_path):
        """Start application without PM2"""
        self.logger.info("Starting application...")
        
        port = self.config['deployment']['port']
        app_name = self.config['deployment']['app_name']
        
        # Create systemd service file
        service_content = f"""
[Unit]
Description={app_name} Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory={app_path}
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT={port}

[Install]
WantedBy=multi-user.target
"""
        
        # Write service file
        with open(f"/tmp/{app_name}.service", 'w') as f:
            f.write(service_content.strip())
        
        # Upload and enable service
        self.upload_file(f"/tmp/{app_name}.service", f"/tmp/{app_name}_upload.service")
        self.execute_command(f"sudo mv /tmp/{app_name}_upload.service /etc/systemd/system/{app_name}.service")
        
        # Enable and start service
        self.execute_command("sudo systemctl daemon-reload")
        self.execute_command(f"sudo systemctl enable {app_name}")
        self.execute_command(f"sudo systemctl start {app_name}")
        
        # Clean up
        os.remove(f"/tmp/{app_name}.service")
        
        self.logger.info("Application started with systemd")
    
    def verify_deployment(self):
        """Verify that the deployment is working"""
        self.logger.info("Verifying deployment...")
        
        port = self.config['deployment']['port']
        
        # Wait for application to start
        time.sleep(10)
        
        # Check if application is responding
        stdout, stderr, return_code = self.execute_command(
            f"curl -f http://localhost:{port}",
            check_return_code=False,
            timeout=30
        )
        
        if return_code == 0:
            self.logger.info("✅ Application is responding correctly")
        else:
            self.logger.warning("⚠️ Application health check failed")
            
        # Check nginx status
        if self.config['deployment']['nginx_enabled']:
            self.execute_command("sudo systemctl status nginx --no-pager", check_return_code=False)
        
        # Check PM2 status
        if self.config['deployment']['pm2_enabled']:
            self.execute_command("sudo -u www-data pm2 status", check_return_code=False)
    
    def rollback_deployment(self, app_path):
        """Rollback to previous deployment if it exists"""
        self.logger.info("Attempting rollback...")
        
        try:
            # Find the most recent backup
            stdout, _, return_code = self.execute_command(
                f"ls -dt {app_path}_backup_* | head -1",
                check_return_code=False
            )
            
            if return_code == 0 and stdout.strip():
                backup_path = stdout.strip()
                self.logger.info(f"Rolling back to: {backup_path}")
                
                # Remove failed deployment
                self.execute_command(f"sudo rm -rf {app_path}", check_return_code=False)
                
                # Restore backup
                self.execute_command(f"sudo mv {backup_path} {app_path}")
                
                # Restart services
                if self.config['deployment']['pm2_enabled']:
                    self.execute_command(f"cd {app_path} && sudo -u www-data pm2 restart all", check_return_code=False)
                
                self.logger.info("Rollback completed")
            else:
                self.logger.warning("No backup found for rollback")
                
        except Exception as e:
            self.logger.error(f"Rollback failed: {e}")
    
    def print_deployment_info(self):
        """Print deployment information"""
        domain = self.config['deployment']['domain']
        port = self.config['deployment']['port']
        ssl_enabled = self.config['deployment']['ssl_enabled']
        
        protocol = "https" if ssl_enabled else "http"
        url = f"{protocol}://{domain}"
        
        print("\n" + "="*50)
        print("🚀 DEPLOYMENT SUCCESSFUL!")
        print("="*50)
        print(f"Application: {self.config['deployment']['app_name']}")
        print(f"URL: {url}")
        print(f"Server: {self.config['server']['host']}")
        print(f"Port: {port}")
        print(f"PM2 Enabled: {self.config['deployment']['pm2_enabled']}")
        print(f"Nginx Enabled: {self.config['deployment']['nginx_enabled']}")
        print("="*50)
        
        if self.config['deployment']['nginx_enabled']:
            print(f"🌐 Access your application at: {url}")
        else:
            print(f"🌐 Access your application at: http://{domain}:{port}")
        
        print("\n📝 Useful commands:")
        if self.config['deployment']['pm2_enabled']:
            print("  pm2 status                    # Check PM2 status")
            print("  pm2 logs                      # View application logs")
            print("  pm2 restart all               # Restart application")
        
        if self.config['deployment']['nginx_enabled']:
            print("  sudo systemctl status nginx   # Check nginx status")
            print("  sudo nginx -t                 # Test nginx config")
        
        print("  tail -f deployment.log         # View deployment logs")
        print("\n")
    
    def create_sample_config(self, output_path):
        """Create a sample configuration file"""
        sample_config = {
            "server": {
                "host": "your-server.com",
                "port": 22,
                "username": "ubuntu",
                "key_file": "~/.ssh/id_rsa",
                "password": None
            },
            "deployment": {
                "base_path": "/var/www",
                "app_name": "my-nextjs-app",
                "node_version": "18",
                "pm2_enabled": True,
                "nginx_enabled": True,
                "domain": "example.com",
                "port": 3000,
                "ssl_enabled": False,
                "backup_previous": True,
                "auto_restart": True
            },
            "build": {
                "install_dependencies": True,
                "run_build": True,
                "run_tests": False,
                "env_file": ".env.production",
                "custom_build_script": None
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(sample_config, f, indent=2)
        
        print(f"Sample configuration created at: {output_path}")
        print("\nEdit the configuration file with your server details and run:")
        print(f"python deploy.py your-project.zip -c {output_path}")

def main():
    parser = argparse.ArgumentParser(
        description='Deploy Next.js projects to Linux servers',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python deploy.py project.zip -c config.json
  python deploy.py --create-config config.json
  python deploy.py project.zip --config deployment-config.yaml
        """
    )
    
    parser.add_argument('zip_file', nargs='?', help='Path to the Next.js project zip file')
    parser.add_argument('-c', '--config', help='Configuration file path (JSON or YAML)')
    parser.add_argument('--create-config', help='Create sample configuration file and exit')
    
    args = parser.parse_args()
    
    if args.create_config:
        deployer = NextJSDeployer()
        deployer.create_sample_config(args.create_config)
        return
    
    if not args.zip_file:
        parser.print_help()
        sys.exit(1)
    
    if not os.path.exists(args.zip_file):
        print(f"❌ Error: Zip file not found: {args.zip_file}")
        sys.exit(1)
    
    if not args.config:
        print("❌ Error: Configuration file is required")
        print("Create one with: python deploy.py --create-config config.json")
        sys.exit(1)
    
    try:
        deployer = NextJSDeployer(args.config)
        deployer.deploy_project(args.zip_file)
    except KeyboardInterrupt:
        print("\n❌ Deployment cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()