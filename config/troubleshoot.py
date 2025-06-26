#!/usr/bin/env python3

import paramiko
import os
import json
import time
from datetime import datetime

class NginxTroubleshooter:
    def __init__(self, hostname=None, username=None, password=None, key_path=None, local=False):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.key_path = key_path
        self.local = local
        self.issues = []
        self.warnings = []
        
        if not local:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.connect()
    
    def connect(self):
        """Connect to remote server"""
        if self.local:
            return
        try:
            if self.key_path:
                self.ssh.connect(self.hostname, username=self.username, key_filename=self.key_path, timeout=30)
            else:
                self.ssh.connect(self.hostname, username=self.username, password=self.password, timeout=30)
            print(f"🔗 Connected to {self.hostname}")
        except Exception as e:
            print(f"❌ Failed to connect to {self.hostname}: {e}")
            exit(1)
    
    def run_command(self, cmd, capture_output=True):
        """Run shell command locally or remotely"""
        try:
            if self.local:
                import subprocess
                result = subprocess.run(cmd, shell=True, capture_output=capture_output, text=True)
                return result.returncode, result.stdout, result.stderr
            else:
                stdin, stdout, stderr = self.ssh.exec_command(cmd)
                exit_status = stdout.channel.recv_exit_status()
                output = stdout.read().decode()
                error = stderr.read().decode()
                return exit_status, output, error
        except Exception as e:
            return 1, "", str(e)
    
    def file_exists(self, path):
        """Check if file exists locally or remotely"""
        if self.local:
            return os.path.exists(path)
        else:
            code, _, _ = self.run_command(f"test -f {path}")
            return code == 0
    
    def dir_exists(self, path):
        """Check if directory exists locally or remotely"""
        if self.local:
            return os.path.exists(path)
        else:
            code, _, _ = self.run_command(f"test -d {path}")
            return code == 0
    
    def print_section(self, title):
        """Print formatted section header"""
        print(f"\n{'='*60}")
        print(f" {title}")
        print('='*60)
    
    def print_status(self, message, status="INFO"):
        """Print formatted status message"""
        symbols = {"OK": "✅", "ERROR": "❌", "WARNING": "⚠️", "INFO": "ℹ️"}
        print(f"{symbols.get(status, 'ℹ️')} {message}")
    
    def check_system_status(self):
        """Check basic system information"""
        self.print_section("SYSTEM STATUS")
        
        # System info
        code, output, _ = self.run_command("uname -a")
        if code == 0:
            self.print_status(f"System: {output.strip()}", "INFO")
        
        # Uptime
        code, output, _ = self.run_command("uptime")
        if code == 0:
            self.print_status(f"Uptime: {output.strip()}", "INFO")
        
        # Disk space
        code, output, _ = self.run_command("df -h /")
        if code == 0:
            lines = output.strip().split('\n')
            if len(lines) > 1:
                disk_info = lines[1].split()
                usage = disk_info[4] if len(disk_info) > 4 else "Unknown"
                self.print_status(f"Disk usage: {usage}", "INFO")
        
        # Memory
        code, output, _ = self.run_command("free -h")
        if code == 0:
            lines = output.strip().split('\n')
            if len(lines) > 1:
                mem_info = lines[1].split()
                if len(mem_info) > 2:
                    self.print_status(f"Memory: {mem_info[2]} used / {mem_info[1]} total", "INFO")
    
    def check_services(self):
        """Check status of required services"""
        self.print_section("SERVICE STATUS")
        
        services = ["nginx", "ufw"]
        
        for service in services:
            code, output, _ = self.run_command(f"systemctl is-active {service}")
            if code == 0 and output.strip() == "active":
                self.print_status(f"{service} service is running", "OK")
            else:
                self.print_status(f"{service} service is not running", "ERROR")
                self.issues.append(f"{service} service not active")
        
        # Check if nginx is enabled
        code, _, _ = self.run_command("systemctl is-enabled nginx")
        if code == 0:
            self.print_status("nginx is enabled on boot", "OK")
        else:
            self.print_status("nginx is not enabled on boot", "WARNING")
            self.warnings.append("nginx not enabled for auto-start")
    
    def check_nginx_config(self):
        """Check nginx configuration"""
        self.print_section("NGINX CONFIGURATION")
        
        # Test nginx config
        code, output, error = self.run_command("nginx -t")
        if code == 0:
            self.print_status("nginx configuration is valid", "OK")
        else:
            self.print_status(f"nginx configuration error: {error}", "ERROR")
            self.issues.append(f"nginx config error: {error}")
        
        # Check main config files
        config_files = [
            "/etc/nginx/nginx.conf",
            "/etc/nginx/conf.d/multisite.conf",
            "/var/www/site-template.conf"
        ]
        
        for config_file in config_files:
            if self.file_exists(config_file):
                self.print_status(f"Found: {config_file}", "OK")
            else:
                self.print_status(f"Missing: {config_file}", "WARNING")
                self.warnings.append(f"Missing config file: {config_file}")
        
        # Check sites-enabled
        code, output, _ = self.run_command("ls /etc/nginx/sites-enabled/ 2>/dev/null")
        if code == 0 and output.strip():
            sites = output.strip().split('\n')
            self.print_status(f"Active sites: {len(sites)}", "INFO")
            for site in sites:
                if site.strip():
                    self.print_status(f"  - {site.strip()}", "INFO")
        else:
            self.print_status("No sites enabled", "WARNING")
            self.warnings.append("No sites configured")
    
    def check_ports(self):
        """Check if required ports are open"""
        self.print_section("PORT STATUS")
        
        ports = [80, 443, 22]
        
        for port in ports:
            if self.local:
                try:
                    import socket
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    result = sock.connect_ex(('localhost', port))
                    sock.close()
                    
                    if result == 0:
                        self.print_status(f"Port {port} is open", "OK")
                    else:
                        self.print_status(f"Port {port} is closed", "WARNING")
                        self.warnings.append(f"Port {port} not accessible")
                except Exception as e:
                    self.print_status(f"Error checking port {port}: {e}", "ERROR")
            else:
                # For remote servers, check if services are listening
                code, output, _ = self.run_command(f"netstat -tlnp | grep ':{port}'")
                if code == 0 and output.strip():
                    self.print_status(f"Port {port} is listening", "OK")
                else:
                    self.print_status(f"Port {port} not listening", "WARNING")
                    self.warnings.append(f"Port {port} not accessible")
        
        # Check what's listening on ports
        code, output, _ = self.run_command("netstat -tlnp | grep ':80\\|:443\\|:22'")
        if code == 0 and output:
            self.print_status("Listening processes:", "INFO")
            for line in output.strip().split('\n'):
                if line.strip():
                    self.print_status(f"  {line}", "INFO")
    
    def check_firewall(self):
        """Check firewall status"""
        self.print_section("FIREWALL STATUS")
        
        code, output, _ = self.run_command("ufw status")
        if code == 0:
            if "Status: active" in output:
                self.print_status("UFW firewall is active", "OK")
                
                # Check if required ports are allowed
                required_ports = ["22", "80", "443"]
                for port in required_ports:
                    if f"{port}/tcp" in output or f"{port}" in output:
                        self.print_status(f"Port {port} is allowed in firewall", "OK")
                    else:
                        self.print_status(f"Port {port} not allowed in firewall", "WARNING")
                        self.warnings.append(f"Port {port} not in firewall rules")
            else:
                self.print_status("UFW firewall is inactive", "WARNING")
                self.warnings.append("Firewall is not active")
        else:
            self.print_status("Could not check firewall status", "ERROR")
    
    def check_ssl_certificates(self):
        """Check SSL certificates"""
        self.print_section("SSL CERTIFICATES")
        
        # Check if certbot is installed
        code, _, _ = self.run_command("which certbot")
        if code == 0:
            self.print_status("Certbot is installed", "OK")
            
            # List certificates
            code, output, _ = self.run_command("certbot certificates")
            if code == 0:
                if "No certificates found" in output:
                    self.print_status("No SSL certificates found", "INFO")
                else:
                    self.print_status("SSL certificates:", "INFO")
                    lines = output.split('\n')
                    for line in lines:
                        if "Certificate Name:" in line or "Domains:" in line or "Expiry Date:" in line:
                            self.print_status(f"  {line.strip()}", "INFO")
            else:
                self.print_status("Could not list certificates", "WARNING")
        else:
            self.print_status("Certbot is not installed", "WARNING")
            self.warnings.append("Certbot not installed - SSL not available")
    
    def check_pm2(self):
        """Check PM2 processes"""
        self.print_section("PM2 PROCESSES")
        
        code, _, _ = self.run_command("which pm2")
        if code == 0:
            self.print_status("PM2 is installed", "OK")
            
            # List PM2 processes
            code, output, _ = self.run_command("pm2 jlist")
            if code == 0:
                try:
                    processes = json.loads(output)
                    if processes:
                        self.print_status(f"PM2 processes running: {len(processes)}", "INFO")
                        for proc in processes:
                            name = proc.get('name', 'unknown')
                            status = proc.get('pm2_env', {}).get('status', 'unknown')
                            port = proc.get('pm2_env', {}).get('PORT', 'unknown')
                            self.print_status(f"  - {name}: {status} (port: {port})", "INFO")
                    else:
                        self.print_status("No PM2 processes running", "INFO")
                except json.JSONDecodeError:
                    self.print_status("Could not parse PM2 process list", "WARNING")
            else:
                self.print_status("Could not list PM2 processes", "WARNING")
        else:
            self.print_status("PM2 is not installed", "WARNING")
            self.warnings.append("PM2 not installed - process management not available")
    
    def check_directories(self):
        """Check important directories and permissions"""
        self.print_section("DIRECTORY STATUS")
        
        directories = [
            "/var/www",
            "/etc/nginx/sites-available",
            "/etc/nginx/sites-enabled",
            "/var/log/nginx"
        ]
        
        for directory in directories:
            if self.dir_exists(directory):
                # Check permissions
                code, output, _ = self.run_command(f"stat -c '%a' {directory}")
                if code == 0:
                    perms = output.strip()
                    self.print_status(f"{directory} exists (permissions: {perms})", "OK")
                else:
                    self.print_status(f"{directory} exists", "OK")
            else:
                self.print_status(f"{directory} does not exist", "ERROR")
                self.issues.append(f"Missing directory: {directory}")
        
        # Check deployment script
        if self.file_exists("/var/www/deploy-site.sh"):
            code, _, _ = self.run_command("test -x /var/www/deploy-site.sh")
            if code == 0:
                self.print_status("Deployment script exists and is executable", "OK")
            else:
                self.print_status("Deployment script exists but is not executable", "WARNING")
                self.warnings.append("Deployment script not executable")
        else:
            self.print_status("Deployment script not found", "WARNING")
            self.warnings.append("Deployment script missing")
    
    def check_logs(self):
        """Check recent logs for errors"""
        self.print_section("LOG ANALYSIS")
        
        # Check nginx error log
        code, output, _ = self.run_command("tail -n 20 /var/log/nginx/error.log")
        if code == 0 and output.strip():
            self.print_status("Recent nginx errors found:", "WARNING")
            for line in output.strip().split('\n')[-5:]:  # Show last 5 lines
                self.print_status(f"  {line}", "WARNING")
        else:
            self.print_status("No recent nginx errors", "OK")
        
        # Check system log for nginx
        code, output, _ = self.run_command("journalctl -u nginx --no-pager -n 5")
        if code == 0 and output.strip():
            self.print_status("Recent nginx service logs:", "INFO")
            for line in output.strip().split('\n'):
                if line.strip():
                    self.print_status(f"  {line}", "INFO")
    
    def test_connectivity(self):
        """Test basic connectivity"""
        self.print_section("CONNECTIVITY TEST")
        
        # Test local nginx
        code, output, _ = self.run_command("curl -s -o /dev/null -w '%{http_code}' http://localhost")
        if code == 0:
            status_code = output.strip()
            if status_code in ['200', '301', '302']:
                self.print_status(f"Local nginx responds with HTTP {status_code}", "OK")
            else:
                self.print_status(f"Local nginx responds with HTTP {status_code}", "WARNING")
        else:
            self.print_status("Local nginx not responding", "ERROR")
            self.issues.append("nginx not responding locally")
        
        # If remote, also test external connectivity
        if not self.local and self.hostname:
            code, output, _ = self.run_command(f"curl -s -o /dev/null -w '%{{http_code}}' http://{self.hostname}")
            if code == 0:
                status_code = output.strip()
                if status_code in ['200', '301', '302']:
                    self.print_status(f"External nginx responds with HTTP {status_code}", "OK")
                else:
                    self.print_status(f"External nginx responds with HTTP {status_code}", "WARNING")
            else:
                self.print_status("External nginx not responding", "WARNING")
    
    def generate_summary(self):
        """Generate troubleshooting summary"""
        self.print_section("TROUBLESHOOTING SUMMARY")
        
        if not self.issues and not self.warnings:
            self.print_status("All checks passed! System appears healthy.", "OK")
        else:
            if self.issues:
                self.print_status(f"Found {len(self.issues)} critical issues:", "ERROR")
                for issue in self.issues:
                    self.print_status(f"  - {issue}", "ERROR")
            
            if self.warnings:
                self.print_status(f"Found {len(self.warnings)} warnings:", "WARNING")
                for warning in self.warnings:
                    self.print_status(f"  - {warning}", "WARNING")
        
        # Quick fix suggestions
        if self.issues or self.warnings:
            print(f"\n📋 QUICK FIXES:")
            print("• Restart nginx: sudo systemctl restart nginx")
            print("• Check config: sudo nginx -t")
            print("• View error logs: sudo tail -f /var/log/nginx/error.log")
            print("• Check PM2 status: pm2 status")
            print("• Test deployment: sudo /var/www/deploy-site.sh")
    
    def cleanup(self):
        """Close SSH connection if remote"""
        if not self.local and hasattr(self, 'ssh'):
            self.ssh.close()
            print(f"🔌 Disconnected from {self.hostname}")
    
    def run_all_checks(self):
        """Run all troubleshooting checks"""
        location = "local" if self.local else f"remote ({self.hostname})"
        print(f"🔍 Nginx Multisite Troubleshooter - {location}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            self.check_system_status()
            self.check_services()
            self.check_nginx_config()
            self.check_ports()
            self.check_firewall()
            self.check_ssl_certificates()
            self.check_pm2()
            self.check_directories()
            self.check_logs()
            self.test_connectivity()
            self.generate_summary()
        finally:
            self.cleanup()

if __name__ == "__main__":
    import sys
    
    # Check if running locally or remotely
    if len(sys.argv) > 1 and sys.argv[1] == "--local":
        # Run locally
        troubleshooter = NginxTroubleshooter(local=True)
        troubleshooter.run_all_checks()
    else:
        # Run remotely - configure your server details here
        print("🌐 Configuring remote server connection...")
        
        # Configure your server details
        SERVER_CONFIG = {
            "hostname": "75.119.141.162",
            "username": "root",
            #"password": "your-actual-password",  # Replace with your password
            # "key_path": "/path/to/your/private/key"  # Or use SSH key
        }
        
        troubleshooter = NginxTroubleshooter(
            hostname=SERVER_CONFIG["hostname"],
            username=SERVER_CONFIG["username"],
            password=SERVER_CONFIG.get("password"),
            key_path=SERVER_CONFIG.get("key_path")
        )
        troubleshooter.run_all_checks()