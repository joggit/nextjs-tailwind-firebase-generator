#!/usr/bin/env python3

import paramiko
import time

class NginxMultisiteSetup:
    def __init__(self, hostname, username, password=None, key_path=None):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.key_path = key_path
        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    def connect(self):
        if self.key_path:
            self.ssh.connect(self.hostname, username=self.username, key_filename=self.key_path)
        else:
            self.ssh.connect(self.hostname, username=self.username, password=self.password)
        print(f"Connected to {self.hostname}")
    
    def reconnect(self):
        self.ssh.close()
        time.sleep(2)
        if self.key_path:
            self.ssh.connect(self.hostname, username=self.username, key_filename=self.key_path)
        else:
            self.ssh.connect(self.hostname, username=self.username, password=self.password)
        print(f"Reconnected to {self.hostname}")
    
    def run_command(self, command, sudo=False):
        if sudo:
            command = f"sudo {command}"
        
        try:
            stdin, stdout, stderr = self.ssh.exec_command(command)
            exit_status = stdout.channel.recv_exit_status()
            output = stdout.read().decode()
            error = stderr.read().decode()
            
            if exit_status != 0:
                print(f"Error running: {command}")
                print(f"Error: {error}")
            else:
                print(f"✓ {command}")
            return output, error, exit_status
        
        except paramiko.AuthenticationException:
            print("Authentication failed, reconnecting...")
            self.reconnect()
            return self.run_command(command, sudo)  # Retry the command
    
    def setup_server(self):
        commands = [
            # Update system
            ("apt update && apt upgrade -y", True),
            
            # Install dependencies
            ("apt install -y curl wget git ufw", True),
            
            # Install Node.js (LTS)
            ("curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -", False),
            ("apt install -y nodejs", True),

            # Add this line to remove the default nginx site 
            # SSL setup wont work if the default site is enabled
            ("rm -f /etc/nginx/sites-enabled/default", True),
            
            # Install nginx
            ("apt install -y nginx", True),
            
            # Install PM2 globally
            ("npm install -g pm2", True),
            
            # Create directory structure
            ("mkdir -p /var/www", True),
            ("mkdir -p /etc/nginx/sites-available", True),
            ("mkdir -p /etc/nginx/sites-enabled", True),
            
            # Set permissions
            (f"chown -R {self.username}:{self.username} /var/www", True),
            
            # Configure firewall
            ("ufw allow 22/tcp", True),
            ("ufw allow 80/tcp", True),
            ("ufw allow 443/tcp", True),
            ("ufw --force enable", True),
            
            # Start and enable services
            ("systemctl start nginx", True),
            ("systemctl enable nginx", True),
            # Certbot for SSL
            ("apt install -y certbot python3-certbot-nginx", True),
        ]
        
        for command, use_sudo in commands:
            self.run_command(command, use_sudo)
            time.sleep(1)
    
    def create_nginx_config(self):
        # Main nginx config
        nginx_conf = '''
server_tokens off;
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";

upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Default server block
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

# Include site configs
include /etc/nginx/sites-enabled/*;
'''
        
        # Write main config
        self.run_command(f"echo '{nginx_conf}' > /etc/nginx/conf.d/multisite.conf", True)
        
        # Create sample site config template
        site_template = '''
server {
    listen 80;
    server_name DOMAIN_NAME;
    
    location / {
        proxy_pass http://127.0.0.1:PORT_NUMBER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
'''
        
        self.run_command(f"echo '{site_template}' > /var/www/site-template.conf", True)
        
    def create_deployment_script(self):
        deploy_script = '''#!/bin/bash

# Usage: ./deploy-site.sh <domain> <port> <git-repo>
DOMAIN=$1
PORT=$2
REPO=$3

if [ -z "$DOMAIN" ] || [ -z "$PORT" ] || [ -z "$REPO" ]; then
    echo "Usage: ./deploy-site.sh <domain> <port> <git-repo>"
    exit 1
fi

SITE_DIR="/var/www/$DOMAIN"

# Clone or update repo
if [ -d "$SITE_DIR" ]; then
    cd "$SITE_DIR" && git pull
else
    git clone "$REPO" "$SITE_DIR"
fi

cd "$SITE_DIR"

# Install dependencies and build
npm install
npm run build

# Create nginx config
sed "s/DOMAIN_NAME/$DOMAIN/g; s/PORT_NUMBER/$PORT/g" /var/www/site-template.conf > "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"

# Start with PM2
pm2 start npm --name "$DOMAIN" -- start -- -p "$PORT"
pm2 save

# Test and reload nginx
nginx -t && systemctl reload nginx

echo "Site $DOMAIN deployed on port $PORT"
'''
        
        self.run_command(f"echo '{deploy_script}' > /var/www/deploy-site.sh", True)
        self.run_command("chmod +x /var/www/deploy-site.sh", True)
    
    def setup_ssl_for_domain(self, domain):
        """Setup SSL for a specific domain"""
        try:
            self.reconnect()  # Ensure fresh connection
            print(f"🔒 Setting up SSL for {domain}...")
            self.run_command(f"certbot --nginx -d {domain} -d www.{domain} --non-interactive --agree-tos -m admin@{domain}", True)
            print(f"✅ SSL configured for {domain}")
        except Exception as e:
            print(f"❌ SSL setup failed for {domain}: {e}")
    
    def finalize_setup(self):
        # Test nginx config
        self.run_command("nginx -t", True)
        
        # Reload nginx
        self.run_command("systemctl reload nginx", True)
        
        # Setup PM2 startup
        output, _, _ = self.run_command("pm2 startup", True)
        if "sudo env PATH" in output:
            startup_cmd = output.split("sudo env PATH")[1].split("\n")[0]
            self.run_command(f"sudo env PATH{startup_cmd}", False)
        
        print("\n" + "="*50)
        print("Setup completed!")
        print("="*50)
        print(f"Next.js hosting platform ready on {self.hostname}")
        print("\nTo deploy a site:")
        print("sudo /var/www/deploy-site.sh <domain> <port> <git-repo>")
        print("\nExample:")
        print("sudo /var/www/deploy-site.sh datablox.co.za 3000 https://github.com/user/nextjs-app.git")
    
    def run_setup(self):
        try:
            self.connect()
            print("Starting server setup...")
            self.setup_server()
            print("Configuring nginx...")
            self.create_nginx_config()
            print("Creating deployment tools...")
            self.create_deployment_script()
            print("Finalizing...")
            self.finalize_setup()
            
            # Optionally setup SSL for your domain
            setup_ssl = input("\nDo you want to setup SSL for datablox.co.za? (y/n): ")
            if setup_ssl.lower() == 'y':
                self.setup_ssl_for_domain("datablox.co.za")
                
        except Exception as e:
            print(f"Error: {e}")
        finally:
            self.ssh.close()

# Usage
if __name__ == "__main__":
    # Configure your server details
    server = NginxMultisiteSetup(
        hostname="75.119.141.162",
        username="root",
        key_path="/home/laptop/.ssh/id_rsa"  # Path to your private key
        #password="your-actual-password",  # Replace with your actual password
        # key_path="/path/to/your/private/key"  # Or use SSH key instead
    )
    
    server.run_setup()