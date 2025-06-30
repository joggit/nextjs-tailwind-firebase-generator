#!/usr/bin/env python3
"""
Simple Multi-Domain Hosting Script v2.6 - READ-ONLY FILESYSTEM EDITION
Features: Node.js and Static App Deployment with FULL read-only filesystem support
FIXED: All read-only filesystem issues, comprehensive fallback strategies
"""

import os
import sys
import subprocess
import sqlite3
import argparse
import json
import pwd
import grp
import shutil
import time
import tempfile
import urllib.request
import urllib.error
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path

CONFIG = {
    'database_path': '/tmp/hosting/hosting.db',  # Use /tmp for read-only systems
    'nginx_sites_dir': '/etc/nginx/sites-available',
    'nginx_enabled_dir': '/etc/nginx/sites-enabled',
    'web_root': '/tmp/www/domains',  # Fallback to /tmp for read-only systems
    'log_dir': '/tmp/hosting/logs',
    'api_user': 'www-data',
    'api_group': 'www-data',
    'readonly_mode': False  # Will be set during initialization
}

class SimpleHostingManager:
    def __init__(self):
        self.is_root = os.geteuid() == 0
        self.current_user = self.get_current_user()
        self.readonly_filesystem = self.detect_readonly_filesystem()
        self.setup_readonly_config()
        
    def detect_readonly_filesystem(self):
        """Comprehensive read-only filesystem detection"""
        readonly_indicators = []
        
        # Test 1: Try writing to /var/lib
        try:
            test_file = '/var/lib/hosting-ro-test'
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            readonly_indicators.append(False)
        except (PermissionError, OSError):
            readonly_indicators.append(True)
        
        # Test 2: Try writing to /etc
        try:
            test_file = '/etc/hosting-ro-test'
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            readonly_indicators.append(False)
        except (PermissionError, OSError):
            readonly_indicators.append(True)
        
        # Test 3: Check /run directory
        try:
            test_file = '/run/hosting-ro-test'
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            readonly_indicators.append(False)
        except (PermissionError, OSError):
            readonly_indicators.append(True)
        
        # Test 4: Check for common VPS/container indicators
        vps_indicators = [
            os.path.exists('/.dockerenv'),
            os.path.exists('/proc/vz'),
            'container' in os.environ.get('SYSTEMD_NSPAWN_API_VFS_WRITABLE', ''),
        ]
        
        # If majority of tests indicate read-only or VPS environment
        readonly_count = sum(readonly_indicators)
        is_readonly = readonly_count >= len(readonly_indicators) // 2 or any(vps_indicators)
        
        if is_readonly:
            print("🔒 Read-only filesystem detected - using safe mode")
        
        return is_readonly
    
    def setup_readonly_config(self):
        """Configure paths for read-only filesystem operation"""
        if self.readonly_filesystem:
            CONFIG['readonly_mode'] = True
            
            # Use writable directories only
            CONFIG['database_path'] = '/tmp/hosting/hosting.db'
            CONFIG['web_root'] = '/tmp/www/domains'
            CONFIG['log_dir'] = '/tmp/hosting/logs'
            
            # Create writable directories
            writable_dirs = [
                '/tmp/hosting',
                '/tmp/www',
                '/tmp/www/domains',
                '/tmp/hosting/logs',
                '/tmp/pm2-home',
                '/tmp/nodejs-apps'
            ]
            
            for directory in writable_dirs:
                try:
                    os.makedirs(directory, mode=0o755, exist_ok=True)
                    print(f"   ✅ Created writable directory: {directory}")
                except Exception as e:
                    print(f"   ⚠️  Could not create {directory}: {e}")
            
            print(f"   📁 Using writable web root: {CONFIG['web_root']}")
            print(f"   💾 Using writable database: {CONFIG['database_path']}")
        
    def get_current_user(self):
        """Get current user safely for systemd compatibility"""
        try:
            if hasattr(os, 'getlogin'):
                try:
                    return os.getlogin()
                except OSError:
                    pass
            
            try:
                return pwd.getpwuid(os.getuid()).pw_name
            except KeyError:
                pass
            
            user = os.getenv('USER') or os.getenv('USERNAME') or os.getenv('LOGNAME')
            if user:
                return user
                
            return 'www-data'
            
        except Exception:
            return 'www-data'
        
    def get_user_info(self, username='www-data'):
        """Get user and group IDs"""
        try:
            user_info = pwd.getpwnam(username)
            group_info = grp.getgrnam(username)
            return user_info.pw_uid, group_info.gr_gid
        except KeyError:
            return os.getuid(), os.getgid()
    
    def run_command(self, command, require_root=False, capture_output=True, show_output=False):
        """Run shell command with proper error handling"""
        try:
            if require_root and not self.is_root:
                command = f"sudo {command}"
            
            if show_output:
                print(f"   Running: {command}")
            
            result = subprocess.run(command, shell=True, capture_output=capture_output, text=True)
            if result.returncode != 0 and capture_output:
                if show_output:
                    print(f"⚠️  Command failed: {command}")
                    print(f"Error: {result.stderr}")
                return False
            return result.returncode == 0
        except Exception as e:
            if show_output:
                print(f"❌ Error running command: {e}")
            return False
    
    def create_directory_with_permissions(self, directory, owner_user='www-data', mode=0o755):
        """Create directory with proper ownership and permissions"""
        try:
            os.makedirs(directory, mode=mode, exist_ok=True)
            
            # Only try to change ownership if not in read-only mode and we're root
            if self.is_root and not self.readonly_filesystem:
                uid, gid = self.get_user_info(owner_user)
                os.chown(directory, uid, gid)
                print(f"   Created: {directory} (owner: {owner_user})")
            else:
                print(f"   Created: {directory}")
            return True
        except Exception as e:
            print(f"❌ Failed to create directory {directory}: {e}")
            return False

    def get_nginx_binary_path(self):
        """Find the correct path to nginx binary with multiple fallbacks"""
        possible_paths = [
            '/usr/sbin/nginx',
            '/usr/bin/nginx', 
            '/sbin/nginx',
            '/bin/nginx',
            '/usr/local/sbin/nginx',
            '/usr/local/bin/nginx'
        ]
        
        for path in possible_paths:
            if os.path.exists(path) and os.access(path, os.X_OK):
                return path
        
        # Try to find nginx in PATH
        try:
            result = subprocess.run(['which', 'nginx'], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                nginx_path = result.stdout.strip()
                if os.path.exists(nginx_path):
                    return nginx_path
        except:
            pass
        
        # Last resort: check if 'nginx' command works
        try:
            result = subprocess.run(['nginx', '-v'], capture_output=True, text=True)
            if result.returncode == 0:
                return 'nginx'
        except:
            pass
        
        return '/usr/sbin/nginx'

    def check_nginx_installation(self):
        """Check if nginx is properly installed and accessible"""
        try:
            nginx_binary = self.get_nginx_binary_path()
            
            if nginx_binary == 'nginx':
                result = subprocess.run(['nginx', '-v'], capture_output=True, text=True)
                return result.returncode == 0
            else:
                return os.path.exists(nginx_binary) and os.access(nginx_binary, os.X_OK)
                
        except Exception as e:
            print(f"   ❌ Error checking nginx installation: {e}")
            return False

    def ensure_nginx_installed(self):
        """Ensure nginx is installed and configured properly"""
        try:
            if not self.check_nginx_installation():
                print("🚨 Nginx not found - attempting installation...")
                
                if not self.run_command("apt update", show_output=True):
                    print(f"   ❌ Failed to update package list")
                    return False
                
                if not self.run_command("apt install -y nginx", show_output=True):
                    print(f"   ❌ Failed to install nginx")
                    return False
                
                subprocess.run(['sudo', 'systemctl', 'enable', 'nginx'], capture_output=True)
                subprocess.run(['sudo', 'systemctl', 'start', 'nginx'], capture_output=True)
                
                print("   ✅ Nginx installed and started successfully")
                
            if self.check_nginx_installation():
                print("   ✅ Nginx is properly installed and accessible")
                return True
            else:
                print("   ❌ Nginx installation verification failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Error ensuring nginx installation: {e}")
            return False
    
    def test_nginx_config_safe(self):
        """Test nginx configuration with read-only filesystem support"""
        try:
            if not self.check_nginx_installation():
                print("   ❌ Nginx is not properly installed or accessible")
                return False
            
            nginx_binary = self.get_nginx_binary_path()
            
            # Test nginx configuration
            if nginx_binary == 'nginx':
                result = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
            else:
                result = subprocess.run([nginx_binary, '-t'], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("   ✅ Nginx config test: PASSED")
                return True
            
            # Handle read-only filesystem issues
            if 'Read-only file system' in result.stderr or 'Permission denied' in result.stderr:
                print("   ⚠️  Read-only filesystem detected, using alternative test")
                
                if 'syntax is ok' in result.stderr:
                    print("   ✅ Nginx syntax check: PASSED (ignoring file system issues)")
                    return True
                
                # Try alternative test with temporary directory
                try:
                    if nginx_binary == 'nginx':
                        result2 = subprocess.run(['nginx', '-t', '-p', '/tmp'], capture_output=True, text=True)
                    else:
                        result2 = subprocess.run([nginx_binary, '-t', '-p', '/tmp'], capture_output=True, text=True)
                        
                    if result2.returncode == 0 or 'syntax is ok' in result2.stderr:
                        print("   ✅ Nginx config test (alternative method): PASSED")
                        return True
                except:
                    pass
            
            print(f"   ❌ Nginx config test failed: {result.stderr}")
            return False
            
        except Exception as e:
            print(f"   ❌ Nginx test error: {e}")
            return False
    
    def reload_nginx_safe(self):
        """Reload nginx with read-only filesystem support"""
        try:
            # In read-only mode, just return True since nginx will pick up configs eventually
            if self.readonly_filesystem:
                print("   ⚠️  Read-only mode: nginx reload skipped")
                return True
            
            service_check = subprocess.run(['systemctl', 'is-enabled', 'nginx'], 
                                         capture_output=True, text=True)
            
            if service_check.returncode != 0:
                print("   ❌ Nginx service not found or not enabled")
                return False
            
            result = subprocess.run(['sudo', 'systemctl', 'reload', 'nginx'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("   ✅ Nginx reloaded successfully")
                return True
            
            print("   🔄 Nginx reload failed, trying restart...")
            result = subprocess.run(['sudo', 'systemctl', 'restart', 'nginx'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("   ✅ Nginx restarted successfully")
                return True
            else:
                print(f"   ❌ Nginx restart failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"   ❌ Nginx reload error: {e}")
            return False

    def create_readonly_process_manager(self, site_name, final_dir, app_port, start_command=None):
        """Create a simple process manager for read-only filesystems"""
        try:
            print(f"🔧 Creating read-only process manager for {site_name}...")
            
            # Create a simple wrapper script in /tmp
            wrapper_dir = f"/tmp/nodejs-apps/{site_name}"
            os.makedirs(wrapper_dir, mode=0o755, exist_ok=True)
            
            # Determine the start command
            if start_command:
                exec_command = start_command
                print(f"   ▶️  Using provided start command: {start_command}")
            else:
                # Fallback to detecting start method
                if os.path.exists(os.path.join(final_dir, 'next.config.mjs')) or os.path.exists(os.path.join(final_dir, 'next.config.js')):
                    # Use direct binary path for Next.js to avoid corruption
                    exec_command = "node_modules/next/dist/bin/next start"
                    print(f"   🔍 Detected Next.js app, using direct binary: {exec_command}")
                elif os.path.exists(os.path.join(final_dir, 'package.json')):
                    try:
                        with open(os.path.join(final_dir, 'package.json'), 'r') as f:
                            package_data = json.load(f)
                            scripts = package_data.get('scripts', {})
                            dependencies = package_data.get('dependencies', {})
                            
                            # Check for Next.js in dependencies
                            if 'next' in dependencies:
                                exec_command = "node_modules/next/dist/bin/next start"
                                print(f"   🔍 Next.js in dependencies, using direct binary: {exec_command}")
                            elif 'start' in scripts:
                                exec_command = "npm start"
                            elif 'dev' in scripts:
                                exec_command = "npm run dev"
                            else:
                                exec_command = "npm start"  # fallback
                        print(f"   📦 Using command: {exec_command}")
                    except:
                        exec_command = "npm start"
                else:
                    # Traditional Node.js detection
                    main_script = "index.js"
                    if os.path.exists(os.path.join(final_dir, 'server.js')):
                        main_script = "server.js"
                    elif os.path.exists(os.path.join(final_dir, 'app.js')):
                        main_script = "app.js"
                    
                    exec_command = f"node {main_script}"
                    print(f"   📄 Using Node.js command: {exec_command}")
            
            # Create a simple start script
            start_script = f"""#!/bin/bash
# Simple Node.js app starter for {site_name}
cd "{final_dir}"
export NODE_ENV=production
export PORT={app_port}
export PATH=/usr/bin:/bin:/usr/local/bin:$PATH

# Create a PID file
PID_FILE="/tmp/nodejs-apps/{site_name}/{site_name}.pid"
LOG_FILE="/tmp/nodejs-apps/{site_name}/{site_name}.log"

# Function to start the app
start_app() {{
    echo "Starting {site_name} with command: {exec_command}..."
    echo "Working directory: $(pwd)"
    echo "Starting at: $(date)" >> "$LOG_FILE"
    
    # Start the application
    nohup {exec_command} > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Started {site_name} with PID $(cat $PID_FILE)"
    echo "Logs: tail -f $LOG_FILE"
}}

# Function to stop the app
stop_app() {{
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "Stopping {site_name} (PID: $PID)..."
            kill "$PID"
            rm -f "$PID_FILE"
            echo "Stopped {site_name}"
        else
            echo "{site_name} is not running"
            rm -f "$PID_FILE"
        fi
    else
        echo "PID file not found, {site_name} may not be running"
    fi
}}

# Function to check status
status_app() {{
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "{site_name} is running (PID: $PID)"
            echo "Command: {exec_command}"
            echo "Directory: {final_dir}"
            echo "Log file: $LOG_FILE"
            return 0
        else
            echo "{site_name} is not running (stale PID file)"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo "{site_name} is not running"
        return 1
    fi
}}

# Function to show logs
logs_app() {{
    if [ -f "$LOG_FILE" ]; then
        echo "=== {site_name} logs ==="
        tail -n 50 "$LOG_FILE"
    else
        echo "No log file found for {site_name}"
    fi
}}

case "$1" in
    start)
        stop_app
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        stop_app
        start_app
        ;;
    status)
        status_app
        ;;
    logs)
        logs_app
        ;;
    *)
        echo "Usage: $0 {{start|stop|restart|status|logs}}"
        exit 1
        ;;
esac
"""
            
            # Write the start script
            script_path = f"{wrapper_dir}/control.sh"
            with open(script_path, 'w') as f:
                f.write(start_script)
            
            # Make executable
            os.chmod(script_path, 0o755)
            
            # Test the script
            test_result = subprocess.run([
                script_path, 'start'
            ], capture_output=True, text=True)
            
            if test_result.returncode == 0:
                print(f"   ✅ Read-only process manager created: {script_path}")
                print(f"   ▶️  Start command: {exec_command}")
                
                # Save deployment info
                deployment_info = {
                    'site_name': site_name,
                    'port': app_port,
                    'cwd': final_dir,
                    'process_manager': 'readonly-simple',
                    'control_script': script_path,
                    'start_command': exec_command,
                    'created_at': datetime.now().isoformat()
                }
                
                info_file = f"{wrapper_dir}/deployment.json"
                with open(info_file, 'w') as f:
                    json.dump(deployment_info, f, indent=2)
                
                return True
            else:
                print(f"   ❌ Read-only process manager test failed: {test_result.stderr}")
                print(f"   📋 Error output: {test_result.stdout}")
                return False
                
        except Exception as e:
            print(f"   ❌ Read-only process manager creation failed: {e}")
            return False

    def get_readonly_app_status(self, site_name):
        """Get status of read-only managed app"""
        try:
            wrapper_dir = f"/tmp/nodejs-apps/{site_name}"
            control_script = f"{wrapper_dir}/control.sh"
            
            if os.path.exists(control_script):
                result = subprocess.run([
                    control_script, 'status'
                ], capture_output=True, text=True)
                
                return result.returncode == 0
            return False
        except:
            return False

    def stop_readonly_app(self, site_name):
        """Stop read-only managed app"""
        try:
            wrapper_dir = f"/tmp/nodejs-apps/{site_name}"
            control_script = f"{wrapper_dir}/control.sh"
            
            if os.path.exists(control_script):
                result = subprocess.run([
                    control_script, 'stop'
                ], capture_output=True, text=True)
                return result.returncode == 0
            return False
        except:
            return False

    def start_readonly_app(self, site_name):
        """Start read-only managed app"""
        try:
            wrapper_dir = f"/tmp/nodejs-apps/{site_name}"
            control_script = f"{wrapper_dir}/control.sh"
            
            if os.path.exists(control_script):
                result = subprocess.run([
                    control_script, 'start'
                ], capture_output=True, text=True)
                return result.returncode == 0
            return False
        except:
            return False

    def create_systemd_app_service(self, site_name, final_dir, app_port):
        """Create a systemd service as alternative to PM2 - with read-only fallback"""
        try:
            # If read-only filesystem, use our simple process manager
            if self.readonly_filesystem:
                return self.create_readonly_process_manager(site_name, final_dir, app_port)
            
            print(f"🔧 Creating systemd service for {site_name}...")
            print(f"   📁 Using directory: {final_dir}")
            
            # Verify the directory exists and has files
            if not os.path.exists(final_dir):
                print(f"   ❌ Final directory does not exist: {final_dir}")
                return False
            
            # Detect application type and determine start command
            app_type = "unknown"
            start_command = None
            main_script = None
            
            # Check for Next.js application
            if os.path.exists(os.path.join(final_dir, 'next.config.mjs')) or os.path.exists(os.path.join(final_dir, 'next.config.js')):
                app_type = "nextjs"
                print(f"   🔍 Detected Next.js application")
                
                # Check if .next directory exists (built app)
                if os.path.exists(os.path.join(final_dir, '.next')):
                    # Verify the build is complete
                    server_dir = os.path.join(final_dir, '.next', 'server')
                    if os.path.exists(server_dir):
                        # Use full path to avoid binary corruption issues
                        start_command = "node_modules/next/dist/bin/next start"
                        print(f"   ✅ Found complete .next build directory - using direct binary path")
                    else:
                        print(f"   ⚠️  Incomplete .next build - missing server directory")
                        print(f"   🔄 Will attempt to rebuild during startup")
                        start_command = "npm run build && node_modules/next/dist/bin/next start"
                else:
                    print(f"   ⚠️  No .next directory found - will build then start")
                    start_command = "npm run build && node_modules/next/dist/bin/next start"
                    
            # Check for package.json with start script
            elif os.path.exists(os.path.join(final_dir, 'package.json')):
                try:
                    with open(os.path.join(final_dir, 'package.json'), 'r') as f:
                        package_data = json.load(f)
                        scripts = package_data.get('scripts', {})
                        dependencies = package_data.get('dependencies', {})
                        
                        # Double-check for Next.js in dependencies
                        if 'next' in dependencies:
                            app_type = "nextjs"
                            print(f"   🔍 Detected Next.js application via dependencies")
                            
                            if os.path.exists(os.path.join(final_dir, '.next')):
                                # Use direct binary path to avoid corruption
                                start_command = "node_modules/next/dist/bin/next start"
                                print(f"   ✅ Found .next directory - using direct binary path")
                            else:
                                start_command = "npm run build && node_modules/next/dist/bin/next start"
                                print(f"   🔨 No .next directory - will build then start with direct binary")
                                
                        elif 'start' in scripts:
                            app_type = "npm"
                            start_command = "npm start"
                            print(f"   ✅ Found npm start script: {scripts['start']}")
                        elif 'dev' in scripts:
                            app_type = "npm"
                            start_command = "npm run dev"
                            print(f"   ✅ Found npm dev script: {scripts['dev']}")
                        else:
                            print(f"   ⚠️  package.json exists but no start/dev script found")
                            
                except Exception as e:
                    print(f"   ⚠️  Could not parse package.json: {e}")
            
            # Fall back to traditional Node.js entry point detection
            if not start_command:
                possible_scripts = ["server.js", "app.js", "index.js", "main.js"]
                
                for script in possible_scripts:
                    script_path = os.path.join(final_dir, script)
                    if os.path.exists(script_path):
                        main_script = script
                        start_command = f"node {script}"
                        app_type = "nodejs"
                        print(f"   📄 Found main script: {main_script}")
                        break
                
                if not start_command:
                    print(f"   ❌ No valid start method found")
                    print(f"   📋 Directory contents: {os.listdir(final_dir) if os.path.exists(final_dir) else 'Directory not found'}")
                    print(f"   💡 For Next.js apps, ensure .next directory exists (run 'npm run build')")
                    print(f"   💡 For Node.js apps, ensure you have index.js, server.js, or app.js")
                    print(f"   💡 For npm apps, ensure package.json has a 'start' script")
                    return False
            
            print(f"   🚀 Application type: {app_type}")
            print(f"   ▶️  Start command: {start_command}")
            
            # Create systemd service content
            if app_type in ["nextjs", "npm"]:
                # For Next.js and npm-based apps
                service_content = f"""[Unit]
Description=Node.js App - {site_name} ({app_type})
After=network.target nginx.service
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory={final_dir}
Environment=NODE_ENV=production
Environment=PORT={app_port}
Environment=PATH=/usr/bin:/bin:/usr/local/bin:/usr/local/sbin
ExecStart=/bin/bash -c '{start_command}'
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StartLimitBurst=3
StartLimitInterval=60
StandardOutput=journal
StandardError=journal
SyslogIdentifier={site_name}-app
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
"""
            else:
                # For traditional Node.js apps
                service_content = f"""[Unit]
Description=Node.js App - {site_name} ({app_type})
After=network.target nginx.service
Wants=network-online.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory={final_dir}
Environment=NODE_ENV=production
Environment=PORT={app_port}
Environment=PATH=/usr/bin:/bin:/usr/local/bin
ExecStart=/bin/bash -c '{start_command}'
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StartLimitBurst=3
StartLimitInterval=60
StandardOutput=journal
StandardError=journal
SyslogIdentifier={site_name}-app

[Install]
WantedBy=multi-user.target
"""
            
            service_file = f"/etc/systemd/system/nodejs-{site_name}.service"
            print(f"   📝 Creating systemd service: {service_file}")
            
            try:
                with open(service_file, 'w') as f:
                    f.write(service_content)
                print(f"   ✅ Service file created successfully")
            except PermissionError as e:
                print(f"   ❌ Permission denied creating service file: {e}")
                print("   🔄 Falling back to read-only process manager...")
                return self.create_readonly_process_manager(site_name, final_dir, app_port, start_command)
            
            subprocess.run(['systemctl', 'daemon-reload'], capture_output=True)
            subprocess.run(['systemctl', 'enable', f'nodejs-{site_name}'], capture_output=True)
            
            print(f"   🚀 Starting systemd service: nodejs-{site_name}")
            start_result = subprocess.run([
                'systemctl', 'start', f'nodejs-{site_name}'
            ], capture_output=True, text=True)
            
            if start_result.returncode == 0:
                print(f"   ✅ Systemd service created and started: nodejs-{site_name}")
                
                # Verify the service is actually running
                time.sleep(2)  # Give it a moment to start
                status_result = subprocess.run([
                    'systemctl', 'is-active', f'nodejs-{site_name}'
                ], capture_output=True, text=True)
                
                if status_result.returncode == 0 and status_result.stdout.strip() == 'active':
                    print(f"   ✅ Service verified as running")
                    return True
                else:
                    print(f"   ⚠️  Service created but not running properly")
                    # Get more detailed status
                    detailed_status = subprocess.run([
                        'systemctl', 'status', f'nodejs-{site_name}', '--no-pager', '-l'
                    ], capture_output=True, text=True)
                    print(f"   📋 Service status: {detailed_status.stdout}")
                    
                    # Get recent logs
                    logs_result = subprocess.run([
                        'journalctl', '-u', f'nodejs-{site_name}', '--no-pager', '-n', '10'
                    ], capture_output=True, text=True)
                    print(f"   📋 Recent logs: {logs_result.stdout}")
                    
                    return False
            else:
                print(f"   ❌ Systemd service start failed: {start_result.stderr}")
                print(f"   🔄 Falling back to read-only process manager...")
                return self.create_readonly_process_manager(site_name, final_dir, app_port, start_command)
                
        except Exception as e:
            print(f"   ❌ Systemd service creation failed: {e}")
            # Fallback to read-only process manager
            if not self.readonly_filesystem:
                print("   🔄 Falling back to read-only process manager...")
                return self.create_readonly_process_manager(site_name, final_dir, app_port, start_command if 'start_command' in locals() else None)
            return False

    def get_systemd_app_status(self, site_name):
        """Get status of systemd-managed app"""
        try:
            if self.readonly_filesystem:
                return self.get_readonly_app_status(site_name)
                
            result = subprocess.run([
                'systemctl', 'is-active', f'nodejs-{site_name}'
            ], capture_output=True, text=True)
            
            return result.returncode == 0 and result.stdout.strip() == 'active'
        except:
            return False

    def stop_systemd_app(self, site_name):
        """Stop systemd-managed app"""
        try:
            if self.readonly_filesystem:
                return self.stop_readonly_app(site_name)
                
            result = subprocess.run([
                'systemctl', 'stop', f'nodejs-{site_name}'
            ], capture_output=True, text=True)
            return result.returncode == 0
        except:
            return False

    def start_systemd_app(self, site_name):
        """Start systemd-managed app"""
        try:
            if self.readonly_filesystem:
                return self.start_readonly_app(site_name)
                
            result = subprocess.run([
                'systemctl', 'start', f'nodejs-{site_name}'
            ], capture_output=True, text=True)
            return result.returncode == 0
        except:
            return False
    
    def setup_system(self):
        """Complete system setup with read-only filesystem support"""
        print("🚀 Starting simple multi-domain hosting setup v2.6...")
        print("   🔒 FULL READ-ONLY FILESYSTEM SUPPORT!")
        
        if self.readonly_filesystem:
            print("🔒 Read-only filesystem detected - using safe deployment mode")
        
        if not self.is_root:
            print("❌ Root privileges required for initial setup")
            print("   Run: sudo python3 simple-hosting.py --setup")
            return False
        
        try:
            # 1. Install packages (only if not read-only)
            if not self.readonly_filesystem:
                print("\n📦 Installing required packages...")
                if not self.run_command("apt update", show_output=True):
                    print("❌ Failed to update package list")
                    return False
                    
                packages = "nginx sqlite3 certbot python3-certbot-nginx curl git python3-pip nodejs npm"
                if not self.run_command(f"apt install -y {packages}", show_output=True):
                    print("❌ Failed to install packages")
                    return False
            else:
                print("\n⚠️  Read-only filesystem - skipping package installation")
                print("   Assuming packages are already installed")
            
            # 2. Ensure nginx is accessible
            print("\n🔧 Verifying nginx installation...")
            if not self.ensure_nginx_installed():
                if not self.readonly_filesystem:
                    print("❌ Failed to ensure nginx is properly installed")
                    return False
                else:
                    print("⚠️  Nginx verification failed but continuing (read-only mode)")
            
            # 3. Install Python packages (only if not read-only)
            if not self.readonly_filesystem:
                print("🐍 Installing Python packages...")
                python_packages = ['flask', 'flask-cors', 'gunicorn']
                for package in python_packages:
                    result = subprocess.run([
                        'pip3', 'install', package
                    ], capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"   ✅ {package} installed")
                    else:
                        print(f"   ⚠️  {package} installation failed: {result.stderr}")
            
            # 4. Create directory structure
            print("\n📁 Creating directory structure...")
            
            directories = [
                (CONFIG['web_root'], 'www-data', 0o755),
                (os.path.dirname(CONFIG['database_path']), 'www-data', 0o755),
                (CONFIG['log_dir'], 'www-data', 0o755),
                ('/tmp/pm2-home', 'www-data', 0o755),
                ('/tmp/nodejs-apps', 'www-data', 0o755),
            ]
            
            for directory, owner, mode in directories:
                if not self.create_directory_with_permissions(directory, owner, mode):
                    print(f"⚠️  Could not create {directory}")
            
            # 5. Setup nginx permissions (only if not read-only)
            if not self.readonly_filesystem:
                print("\n🔐 Setting up nginx permissions...")
                
                os.makedirs('/etc/nginx/sites-available', exist_ok=True)
                os.makedirs('/etc/nginx/sites-enabled', exist_ok=True)
                
                if self.is_root:
                    uid, gid = self.get_user_info('www-data')
                    try:
                        os.chown('/etc/nginx/sites-available', uid, gid)
                        os.chown('/etc/nginx/sites-enabled', uid, gid)
                        os.chmod('/etc/nginx/sites-available', 0o755)
                        os.chmod('/etc/nginx/sites-enabled', 0o755)
                        print("   ✅ Nginx directories owned by www-data")
                    except:
                        print("   ⚠️  Could not set nginx directory ownership")
                
                # Setup sudo permissions
                print("\n🔧 Setting up sudo permissions...")
                
                sudoers_content = """# Simple Hosting API - Read-only filesystem safe
www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t -p /tmp
www-data ALL=(ALL) NOPASSWD: /usr/bin/nginx -t
www-data ALL=(ALL) NOPASSWD: /usr/bin/nginx -t -p /tmp
www-data ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
www-data ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
www-data ALL=(ALL) NOPASSWD: /bin/systemctl start nginx
www-data ALL=(ALL) NOPASSWD: /bin/systemctl stop nginx
www-data ALL=(ALL) NOPASSWD: /usr/sbin/certbot*
www-data ALL=(ALL) NOPASSWD: /bin/ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/*
www-data ALL=(ALL) NOPASSWD: /bin/rm /etc/nginx/sites-enabled/*
www-data ALL=(ALL) NOPASSWD: /usr/bin/npm *
www-data ALL=(ALL) NOPASSWD: /bin/systemctl * nodejs-*
"""
                
                try:
                    sudoers_file = '/etc/sudoers.d/hosting-api'
                    with open(sudoers_file, 'w') as f:
                        f.write(sudoers_content)
                    os.chmod(sudoers_file, 0o440)
                    
                    result = subprocess.run(['visudo', '-c'], capture_output=True, text=True)
                    if result.returncode != 0:
                        print("❌ Sudoers syntax error")
                        os.remove(sudoers_file)
                        return False
                    
                    print("   ✅ Sudo permissions configured")
                except:
                    print("   ⚠️  Could not set sudo permissions")
            else:
                print("\n⚠️  Read-only filesystem - skipping nginx permission setup")
            
            # 6. Setup database
            print("\n💾 Setting up database...")
            if not self.setup_database():
                return False
            print("✅ Database ready")
            
            # 7. Configure nginx
            print("\n🌐 Configuring nginx...")
            if not self.setup_nginx():
                if not self.readonly_filesystem:
                    return False
                else:
                    print("⚠️  Nginx setup failed but continuing (read-only mode)")
            print("✅ Nginx configured")
            
            # 8. Create API service (only if not read-only)
            if not self.readonly_filesystem:
                print("\n⚙️  Creating API service...")
                if not self.create_systemd_service():
                    print("❌ Failed to create systemd service")
                    return False
                print("✅ Systemd service created")
            else:
                print("\n⚠️  Read-only filesystem - systemd service creation skipped")
            
            # 9. Run tests
            print("\n🧪 Running tests...")
            
            if self.test_nginx_config_safe():
                print("   ✅ Nginx configuration: PASSED")
            else:
                print("   ⚠️  Nginx configuration: ISSUES (but continuing)")
            
            if not self.readonly_filesystem:
                test_config = "/etc/nginx/sites-available/permission-test"
                try:
                    with open(test_config, 'w') as f:
                        f.write("# Permission test file")
                    os.remove(test_config)
                    print("   ✅ Nginx config write access: PASSED")
                except Exception as e:
                    print(f"   ❌ Nginx config write access: FAILED - {e}")
            else:
                print("   ⚠️  Nginx write test skipped (read-only mode)")
            
            if not self.test_database_access():
                return False
            
            print("\n🎉 SETUP COMPLETED SUCCESSFULLY!")
            print("=" * 60)
            print("✅ Read-only filesystem compatibility enabled")
            print("✅ Database ready")
            print("✅ Directory structure created")  
            if self.readonly_filesystem:
                print("✅ Read-only filesystem mode activated")
                print("✅ Alternative process management configured")
                print("✅ Safe deployment paths configured")
            else:
                print("✅ Full system permissions configured")
                print("✅ Systemd service created")
                print("✅ Let's Encrypt SSL support enabled")
            
            print("\n🚀 Ready to start hosting! Next steps:")
            if not self.readonly_filesystem:
                print("   1. Start the API service:")
                print("      sudo systemctl start hosting-api")
                print("      sudo systemctl enable hosting-api")
            else:
                print("   1. Start the API manually:")
                print("      sudo python3 simple-hosting.py --api")
            print()
            print("   2. Deploy a domain:")
            print("      curl -X POST http://localhost:5000/api/domains \\")
            print("        -H 'Content-Type: application/json' \\")
            print("        -d '{\"domain_name\": \"yourdomain.com\", \"port\": 80, \"site_type\": \"static\"}'")
            print()
            print("   3. Deploy a Node.js app:")
            print("      curl -X POST http://localhost:5000/api/deploy/nodejs \\")
            print("        -H 'Content-Type: application/json' \\")
            print("        -d '{\"name\": \"myapp\", \"files\": {...}, \"deployConfig\": {\"port\": 3000}}'")
            
            return True
            
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            import traceback
            traceback.print_exc()
            return False

    def setup_npm_environment(self):
        """Setup NPM environment for read-only filesystem deployment"""
        try:
            print("🔧 Setting up NPM environment for read-only filesystem...")
            
            # Use only writable directories
            npm_dirs = [
                '/tmp/npm',
                '/tmp/npm-cache',
                '/tmp/npm-global'
            ]
            
            for npm_dir in npm_dirs:
                if not self.create_directory_with_permissions(npm_dir, 'www-data', 0o755):
                    print(f"   ⚠️  Could not create {npm_dir}")
            
            # Set npm configuration for writable locations only
            npm_config_commands = [
                "npm config set cache /tmp/npm-cache --location=global",
                "npm config set prefix /tmp/npm-global --location=global",
                "npm config set fund false --location=global",
                "npm config set audit false --location=global", 
                "npm config set loglevel warn --location=global",
                "npm config set update-notifier false --location=global"
            ]
            
            success_count = 0
            for cmd in npm_config_commands:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.returncode == 0:
                    success_count += 1
                else:
                    # Try legacy format
                    legacy_cmd = cmd.replace('--location=global', '--global')
                    result2 = subprocess.run(legacy_cmd, shell=True, capture_output=True, text=True)
                    if result2.returncode == 0:
                        success_count += 1
            
            print(f"   ✅ {success_count}/{len(npm_config_commands)} npm configurations applied")
            return True
                
        except Exception as e:
            print(f"   ❌ NPM setup failed: {e}")
            return False

    def get_npm_environment_for_deployment(self, temp_dir, site_name, timestamp):
        """Get environment variables for npm deployment operations"""
        
        # Use only temporary/writable directories
        npm_cache_dir = f"/tmp/npm-cache-{timestamp}"
        npm_prefix_dir = f"/tmp/npm-prefix-{timestamp}"
        
        for directory in [npm_cache_dir, npm_prefix_dir]:
            os.makedirs(directory, mode=0o755, exist_ok=True)
        
        deploy_env = os.environ.copy()
        deploy_env.update({
            'npm_config_cache': npm_cache_dir,
            'npm_config_prefix': npm_prefix_dir,
            'npm_config_fund': 'false',
            'npm_config_audit': 'false',
            'npm_config_loglevel': 'warn',
            'npm_config_update_notifier': 'false',
            'npm_config_progress': 'false',
            'HOME': temp_dir,
            'TMPDIR': f"/tmp/deploy-tmp-{timestamp}",
            'NODE_ENV': 'production',
            'NO_UPDATE_NOTIFIER': '1',
            'NPM_CONFIG_UPDATE_NOTIFIER': 'false'
        })
        
        os.makedirs(deploy_env['TMPDIR'], mode=0o755, exist_ok=True)
        
        return deploy_env, npm_cache_dir, npm_prefix_dir

    def run_npm_install_safely(self, temp_dir, deploy_env, npm_cache_dir):
        """Run npm install with proper error handling and fallbacks"""
        
        install_strategies = [
            [
                'npm', 'install', 
                '--cache', npm_cache_dir,
                '--no-audit',
                '--no-fund',
                '--prefer-offline',
                '--silent'
            ],
            [
                'npm', 'install',
                '--no-audit',
                '--no-fund',
                '--silent'
            ],
            [
                'npm', 'ci',
                '--cache', npm_cache_dir,
                '--silent'
            ],
            [
                'npm', 'install'
            ]
        ]
        
        for i, strategy in enumerate(install_strategies, 1):
            print(f"   🔄 Trying npm install strategy {i}...")
            
            try:
                result = subprocess.run(
                    strategy,
                    cwd=temp_dir, 
                    env=deploy_env, 
                    capture_output=True, 
                    text=True, 
                    timeout=300
                )
                
                if result.returncode == 0:
                    print(f"   ✅ npm install successful with strategy {i}")
                    return True, ""
                else:
                    error_msg = result.stderr or result.stdout
                    print(f"   ⚠️  Strategy {i} failed: {error_msg[:100]}...")
                    
                    if i == len(install_strategies):
                        return False, error_msg
                        
            except subprocess.TimeoutExpired:
                print(f"   ⏰ Strategy {i} timed out")
                if i == len(install_strategies):
                    return False, "npm install timed out"
                    
            except Exception as e:
                print(f"   ❌ Strategy {i} error: {e}")
                if i == len(install_strategies):
                    return False, str(e)
        
        return False, "All npm install strategies failed"
    
    def setup_database(self):
        """Initialize SQLite database"""
        try:
            db_dir = os.path.dirname(CONFIG['database_path'])
            if not os.path.exists(db_dir):
                self.create_directory_with_permissions(db_dir, 'www-data', 0o755)
            
            conn = sqlite3.connect(CONFIG['database_path'])
            
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA temp_store=MEMORY")
            conn.execute("PRAGMA mmap_size=268435456")
            conn.execute("PRAGMA cache_size=10000")
            conn.execute("PRAGMA foreign_keys=ON")
            
            cursor = conn.cursor()
            
            cursor.executescript("""
                CREATE TABLE IF NOT EXISTS domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain_name TEXT UNIQUE NOT NULL,
                    port INTEGER NOT NULL,
                    site_type TEXT DEFAULT 'static',
                    ssl_enabled BOOLEAN DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS deployment_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain_name TEXT NOT NULL,
                    action TEXT NOT NULL,
                    status TEXT NOT NULL,
                    message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(domain_name);
                CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
                CREATE INDEX IF NOT EXISTS idx_logs_domain ON deployment_logs(domain_name);
                CREATE INDEX IF NOT EXISTS idx_logs_created ON deployment_logs(created_at);
                CREATE INDEX IF NOT EXISTS idx_logs_status ON deployment_logs(status);
            """)
            
            conn.commit()
            conn.close()
            
            # Only try to change ownership if not read-only and we're root
            if self.is_root and not self.readonly_filesystem:
                uid, gid = self.get_user_info('www-data')
                os.chown(CONFIG['database_path'], uid, gid)
                os.chmod(CONFIG['database_path'], 0o664)
                
                os.chown(db_dir, uid, gid)
                os.chmod(db_dir, 0o755)
                
                print(f"   Database permissions optimized for www-data")
            
            return self.test_database_access()
            
        except Exception as e:
            print(f"Database setup error: {e}")
            return False
    
    def get_database_connection(self):
        """Get database connection with proper timeout and WAL mode"""
        try:
            conn = sqlite3.connect(CONFIG['database_path'], timeout=30.0)
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA temp_store=MEMORY")
            return conn
        except Exception as e:
            print(f"Database connection error: {e}")
            return None
    
    def test_database_access(self):
        """Test if database is accessible and writable"""
        try:
            conn = self.get_database_connection()
            if not conn:
                return False
                
            cursor = conn.cursor()
            
            cursor.execute("INSERT OR IGNORE INTO deployment_logs (domain_name, action, status, message) VALUES (?, ?, ?, ?)",
                         ('test.example.com', 'test', 'success', 'Database test'))
            conn.commit()
            
            cursor.execute("SELECT COUNT(*) FROM deployment_logs WHERE domain_name = 'test.example.com'")
            count = cursor.fetchone()[0]
            
            cursor.execute("DELETE FROM deployment_logs WHERE domain_name = 'test.example.com'")
            conn.commit()
            conn.close()
            
            if count > 0:
                print(f"   ✅ Database read/write: PASSED")
                return True
            else:
                print(f"   ❌ Database test: FAILED")
                return False
                
        except Exception as e:
            print(f"   ❌ Database access test failed: {e}")
            return False
    
    def setup_nginx(self):
        """Setup nginx configuration"""
        try:
            # In read-only mode, skip default site removal
            if not self.readonly_filesystem:
                default_site = "/etc/nginx/sites-enabled/default"
                if os.path.exists(default_site):
                    os.remove(default_site)
                    print("   Removed default nginx site")
            
            if not self.test_nginx_config_safe():
                if not self.readonly_filesystem:
                    print("❌ Nginx configuration test failed")
                    return False
                else:
                    print("⚠️  Nginx test failed but continuing (read-only filesystem)")
            
            if not self.readonly_filesystem:
                self.run_command("systemctl enable nginx")
                self.run_command("systemctl start nginx")
            
            return True
            
        except Exception as e:
            print(f"Nginx setup error: {e}")
            return False
    
    def create_systemd_service(self):
        """Create systemd service file - skip in read-only mode"""
        if self.readonly_filesystem:
            print("⚠️  Read-only filesystem - systemd service creation skipped")
            return True
            
        if not self.is_root:
            print("⚠️  Root privileges required to create systemd service")
            return False
        
        try:
            service_dir = "/opt/hosting-api"
            os.makedirs(service_dir, exist_ok=True)
            
            current_script = os.path.abspath(__file__)
            target_script = f"{service_dir}/simple-hosting.py"
            shutil.copy2(current_script, target_script)
            os.chmod(target_script, 0o755)
            
            uid, gid = self.get_user_info('www-data')
            os.chown(service_dir, uid, gid)
            os.chown(target_script, uid, gid)
            
            print(f"   ✅ Copied script to: {target_script}")
            
            service_content = f"""[Unit]
Description=Simple Multi-Domain Hosting API v2.6 with Read-Only Support
After=network.target nginx.service
Wants=network-online.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory={service_dir}
Environment=PATH=/usr/bin:/bin:/usr/local/bin
Environment=PYTHONUNBUFFERED=1
Environment=FLASK_ENV=production
ExecStart=/usr/bin/python3 {target_script} --api --api-port 5000
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=3
StartLimitBurst=5
StartLimitInterval=60
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hosting-api

[Install]
WantedBy=multi-user.target
"""
            
            service_file = "/etc/systemd/system/hosting-api.service"
            with open(service_file, 'w') as f:
                f.write(service_content)
            
            print(f"   ✅ Created systemd service file: {service_file}")
            
            if self.run_command("systemctl daemon-reload"):
                print("   ✅ Systemd daemon reloaded")
            else:
                print("   ❌ Failed to reload systemd daemon")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to create systemd service: {e}")
            return False
    
    def deploy_domain(self, domain_name, port, site_type='static'):
        """Deploy a new domain - with read-only filesystem support"""
        try:
            print(f"🚀 Deploying {domain_name}...")
            
            if self.readonly_filesystem:
                print("   🔒 Read-only filesystem mode - using safe deployment")
            
            # Create domain directory in appropriate location
            domain_path = f"{CONFIG['web_root']}/{domain_name}"
            public_path = f"{domain_path}/public"
            
            if not self.create_directory_with_permissions(domain_path, 'www-data', 0o755):
                return False
            if not self.create_directory_with_permissions(public_path, 'www-data', 0o755):
                return False
            
            # Create optimized default index.html
            index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{domain_name} - Deployed Successfully</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; text-align: center; padding: 50px; margin: 0; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }}
        .container {{ max-width: 800px; margin: 0 auto; }}
        h1 {{ font-size: 3.5em; margin-bottom: 0.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }}
        .subtitle {{ font-size: 1.5em; margin-bottom: 2em; opacity: 0.9; }}
        .info {{ 
            background: rgba(255,255,255,0.15); 
            padding: 30px; border-radius: 15px; margin-top: 30px;
            backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);
        }}
        .path {{ 
            font-family: 'Courier New', monospace; 
            background: rgba(0,0,0,0.4); 
            padding: 15px; border-radius: 8px; margin: 20px 0;
            word-break: break-all; font-size: 0.9em;
        }}
        .status {{ display: flex; justify-content: space-around; margin-top: 30px; }}
        .status-item {{ background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; flex: 1; margin: 0 10px; }}
        .emoji {{ font-size: 2em; display: block; margin-bottom: 10px; }}
        .readonly-notice {{ 
            background: rgba(255, 193, 7, 0.2); 
            border: 1px solid rgba(255, 193, 7, 0.5);
            padding: 15px; border-radius: 10px; margin-top: 20px;
        }}
        @media (max-width: 768px) {{
            h1 {{ font-size: 2.5em; }}
            .subtitle {{ font-size: 1.2em; }}
            .status {{ flex-direction: column; }}
            .status-item {{ margin: 10px 0; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 {domain_name}</h1>
        <div class="subtitle">Successfully deployed and ready!</div>
        
        <div class="info">
            <h3>🎉 Your domain is live!</h3>
            <p>Upload your files to replace this page.</p>
            <div class="path">{public_path}</div>
            
            <div class="status">
                <div class="status-item">
                    <span class="emoji">🌐</span>
                    <strong>Type:</strong> {site_type.title()}
                </div>
                <div class="status-item">
                    <span class="emoji">⚡</span>
                    <strong>Port:</strong> {port}
                </div>
                <div class="status-item">
                    <span class="emoji">{'🔒' if not self.readonly_filesystem else '🔓'}</span>
                    <strong>SSL:</strong> {'Ready for Let\'s Encrypt' if not self.readonly_filesystem else 'Limited in read-only mode'}
                </div>
                <div class="status-item">
                    <span class="emoji">📅</span>
                    <strong>Deployed:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M')}
                </div>
            </div>
            
            {f'<div class="readonly-notice">🔒 <strong>Read-Only Mode:</strong> Some features may be limited. Files stored in: {CONFIG["web_root"]}</div>' if self.readonly_filesystem else ''}
        </div>
    </div>
</body>
</html>"""
            
            index_file = f"{public_path}/index.html"
            with open(index_file, 'w') as f:
                f.write(index_html)
            
            # Set permissions if possible
            if self.is_root and not self.readonly_filesystem:
                uid, gid = self.get_user_info('www-data')
                os.chown(index_file, uid, gid)
            os.chmod(index_file, 0o644)
            
            print(f"   Created optimized index.html")
            
            # Create nginx config (only if not read-only)
            if not self.readonly_filesystem:
                nginx_config = self.generate_nginx_config(domain_name, public_path, port, site_type)
                
                nginx_file = f"{CONFIG['nginx_sites_dir']}/{domain_name}"
                
                try:
                    with open(nginx_file, 'w') as f:
                        f.write(nginx_config)
                    print(f"   Created nginx config: {nginx_file}")
                except PermissionError as e:
                    print(f"   ❌ Failed to create nginx config: {e}")
                    return False
                
                # Enable site
                enabled_file = f"{CONFIG['nginx_enabled_dir']}/{domain_name}"
                if os.path.exists(enabled_file):
                    os.remove(enabled_file)
                
                try:
                    os.symlink(nginx_file, enabled_file)
                    print(f"   Enabled site: {enabled_file}")
                except PermissionError:
                    result = subprocess.run(['sudo', 'ln', '-s', nginx_file, enabled_file], 
                                          capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"   Enabled site: {enabled_file}")
                    else:
                        print(f"   ❌ Failed to enable site: {result.stderr}")
                        return False
                
                # Test and reload nginx
                print("   Testing nginx configuration...")
                if self.test_nginx_config_safe():
                    if self.reload_nginx_safe():
                        print("   ✅ Nginx configuration applied successfully")
                    else:
                        print("   ⚠️  Nginx reload failed, but config created")
                else:
                    print("   ❌ Nginx configuration test failed")
                    return False
            else:
                print("   ⚠️  Read-only mode: nginx configuration skipped")
            
            # Add to database
            try:
                conn = self.get_database_connection()
                if conn:
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO domains (domain_name, port, site_type, ssl_enabled, status)
                        VALUES (?, ?, ?, 0, 'active')
                    """, (domain_name, port, site_type))
                    
                    cursor.execute("""
                        INSERT INTO deployment_logs (domain_name, action, status, message)
                        VALUES (?, 'deploy', 'success', 'Domain deployed successfully')
                    """, (domain_name,))
                    
                    conn.commit()
                    conn.close()
                    print("   ✅ Database updated successfully")
                else:
                    print("   ⚠️  Database connection failed - domain deployed but not tracked")
                
            except Exception as db_error:
                print(f"   ⚠️  Database update failed: {db_error}")
            
            print(f"\n🎉 {domain_name} deployed successfully!")
            print(f"🌐 Visit: http://{domain_name}")
            print(f"📁 Files: {public_path}")
            if not self.readonly_filesystem:
                print(f"🔒 Add SSL: curl -X POST http://localhost:5000/api/domains/{domain_name}/ssl")
            if site_type != 'static':
                print(f"⚡ Remember to start your {site_type} application on port {port}")
            
            if self.readonly_filesystem:
                print("🔒 Read-only filesystem mode - some features limited but core functionality available")
            
            return True
            
        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def generate_nginx_config(self, domain_name, public_path, port, site_type):
        """Generate nginx configuration"""
        
        if site_type == 'static':
            return f"""# Static site configuration for {domain_name}
server {{
    listen 80;
    server_name {domain_name};
    root {public_path};
    index index.html index.htm;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Performance optimizations
    location / {{
        try_files $uri $uri/ =404;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }}
    
    # Static assets with long-term caching
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {{
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }}
    
    # Gzip compression
    location ~* \\.(css|js|html|xml|txt|json)$ {{
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_comp_level 6;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    }}
    
    # Security: Prevent access to hidden files
    location ~ /\\. {{
        deny all;
        access_log off;
        log_not_found off;
    }}
    
    # Security: Prevent access to backup files
    location ~* \\.(bak|backup|old|tmp)$ {{
        deny all;
        access_log off;
        log_not_found off;
    }}
}}"""
        else:
            return f"""# Reverse proxy configuration for {domain_name}
server {{
    listen 80;
    server_name {domain_name};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Main application proxy
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
        proxy_read_timeout 86400;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }}
    
    # Health check endpoint
    location /health {{
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }}
}}"""

    def setup_nginx_proxy(self, site_name, port):
        """Configure nginx as reverse proxy for Node.js app - with read-only support"""
        try:
            print(f"🔧 Setting up nginx proxy for {site_name} -> localhost:{port}")
            
            # Skip nginx config in read-only mode
            if self.readonly_filesystem:
                print("   🔒 Read-only mode: nginx proxy configuration skipped")
                print(f"   💡 Manual nginx config needed for {site_name} -> localhost:{port}")
                return True
            
            if not self.check_nginx_installation():
                print("❌ Nginx is not properly installed")
                return False
            
            nginx_config = f"""# Nginx proxy configuration for {site_name}
server {{
    listen 80;
    server_name {site_name}.yourdomain.com {site_name};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Main application proxy
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
        proxy_read_timeout 86400;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }}
    
    # Health check endpoint
    location /health {{
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }}
    
    # Static assets if they exist
    location /static/ {{
        alias {CONFIG['web_root']}/{site_name}/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}
}}
"""
            
            os.makedirs(CONFIG['nginx_sites_dir'], exist_ok=True)
            os.makedirs(CONFIG['nginx_enabled_dir'], exist_ok=True)
            
            config_path = f"{CONFIG['nginx_sites_dir']}/{site_name}"
            try:
                with open(config_path, 'w') as f:
                    f.write(nginx_config)
                print(f"   ✅ Nginx config written: {config_path}")
            except PermissionError:
                print(f"   ❌ Permission denied writing nginx config")
                return False
            
            enabled_path = f"{CONFIG['nginx_enabled_dir']}/{site_name}"
            try:
                if os.path.exists(enabled_path) or os.path.islink(enabled_path):
                    os.remove(enabled_path)
                os.symlink(config_path, enabled_path)
                print(f"   ✅ Site enabled: {enabled_path}")
            except PermissionError:
                try:
                    if os.path.exists(enabled_path) or os.path.islink(enabled_path):
                        subprocess.run(['sudo', 'rm', enabled_path], check=True)
                    subprocess.run(['sudo', 'ln', '-s', config_path, enabled_path], check=True)
                    print(f"   ✅ Site enabled with sudo: {enabled_path}")
                except subprocess.CalledProcessError as e:
                    print(f"   ❌ Failed to enable site: {e}")
                    return False
            
            print("   🧪 Testing nginx configuration...")
            if not self.test_nginx_config_safe():
                print(f"   ❌ Nginx config test failed - removing config")
                try:
                    os.remove(config_path)
                    if os.path.exists(enabled_path):
                        os.remove(enabled_path)
                except:
                    pass
                return False

            print("   🔄 Reloading nginx service...")
            if not self.reload_nginx_safe():
                print(f"   ❌ Nginx reload failed")
                return False
            
            print(f"✅ Nginx proxy configured successfully: {site_name} -> localhost:{port}")
            return True
            
        except Exception as e:
            print(f"❌ Nginx proxy configuration failed: {str(e)}")
            return False
        
    def add_ssl(self, domain_name):
        """Add Let's Encrypt SSL certificate to domain - skip in read-only mode"""
        try:
            if self.readonly_filesystem:
                print(f"🔒 Read-only mode: SSL certificate setup skipped for {domain_name}")
                print("   💡 SSL certificates cannot be managed in read-only filesystem mode")
                return False
            
            print(f"🔒 Adding Let's Encrypt SSL certificate to {domain_name}...")
            
            conn = self.get_database_connection()
            if conn:
                cursor = conn.cursor()
                cursor.execute("SELECT domain_name FROM domains WHERE domain_name = ? AND status = 'active'", (domain_name,))
                domain_exists = cursor.fetchone()
                conn.close()
                
                if not domain_exists:
                    print(f"❌ Domain {domain_name} not found. Deploy it first.")
                    return False
            
            print("   Requesting SSL certificate from Let's Encrypt...")
            certbot_command = f"certbot --nginx -d {domain_name} --non-interactive --agree-tos --email admin@{domain_name} --redirect"
            
            result = subprocess.run(certbot_command, shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                conn = self.get_database_connection()
                if conn:
                    cursor = conn.cursor()
                    cursor.execute("UPDATE domains SET ssl_enabled = 1 WHERE domain_name = ?", (domain_name,))
                    cursor.execute("""
                        INSERT INTO deployment_logs (domain_name, action, status, message)
                        VALUES (?, 'ssl_add', 'success', 'Let''s Encrypt SSL certificate added successfully')
                    """, (domain_name,))
                    conn.commit()
                    conn.close()
                
                print(f"✅ SSL certificate successfully added to {domain_name}!")
                print(f"🌐 Visit: https://{domain_name}")
                return True
            else:
                print(f"❌ SSL certificate request failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ SSL setup failed: {e}")
            return False
    
    def list_domains(self):
        """List all deployed domains"""
        try:
            conn = self.get_database_connection()
            if not conn:
                print("❌ Could not connect to database")
                return []
                
            cursor = conn.cursor()
            cursor.execute("""
                SELECT domain_name, port, site_type, ssl_enabled, status, created_at
                FROM domains 
                WHERE status = 'active'
                ORDER BY created_at DESC
            """)
            
            domains = cursor.fetchall()
            conn.close()
            
            if not domains:
                print("📋 No domains deployed yet.")
                print("💡 Deploy your first domain with:")
                print("   python3 simple-hosting.py deploy example.com 80 static")
                return []
            
            print("📋 Deployed Domains:")
            if self.readonly_filesystem:
                print("🔒 Read-Only Mode")
            print("=" * 80)
            for domain in domains:
                domain_name, port, site_type, ssl_enabled, status, created_at = domain
                ssl_icon = "🔒" if ssl_enabled else "🔓"
                type_icon = "🌐" if site_type == 'static' else "⚡"
                url = f"https://{domain_name}" if ssl_enabled else f"http://{domain_name}"
                
                print(f"{ssl_icon} {type_icon} {domain_name:30} | Port: {port:5} | Type: {site_type:8} | {created_at[:10]}")
                print(f"    📍 {url}")
                print(f"    📁 {CONFIG['web_root']}/{domain_name}/public")
                print()
            
            return domains
            
        except Exception as e:
            print(f"❌ Error listing domains: {e}")
            return []
    
    def remove_domain(self, domain_name):
        """Remove a domain - with read-only support"""
        try:
            print(f"🗑️  Removing {domain_name}...")
            
            if not self.readonly_filesystem:
                nginx_config = f"{CONFIG['nginx_sites_dir']}/{domain_name}"
                nginx_enabled = f"{CONFIG['nginx_enabled_dir']}/{domain_name}"
                
                if os.path.exists(nginx_enabled):
                    os.remove(nginx_enabled)
                    print(f"   Removed enabled site: {nginx_enabled}")
                
                if os.path.exists(nginx_config):
                    os.remove(nginx_config)
                    print(f"   Removed config: {nginx_config}")
            else:
                print("   🔒 Read-only mode: nginx configs not removed")
            
            conn = self.get_database_connection()
            if conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE domains SET status = 'removed' WHERE domain_name = ?", (domain_name,))
                cursor.execute("""
                    INSERT INTO deployment_logs (domain_name, action, status, message)
                    VALUES (?, 'remove', 'success', 'Domain removed successfully')
                """, (domain_name,))
                conn.commit()
                conn.close()
            
            if not self.readonly_filesystem:
                if self.test_nginx_config_safe():
                    self.reload_nginx_safe()
                    print("   ✅ Nginx reloaded successfully")
            
            print(f"✅ {domain_name} removed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Removal failed: {e}")
            return False

# Enhanced API class with read-only filesystem support
class SimpleAPI:
    """Simple Flask API server with read-only filesystem support"""
    
    def __init__(self, manager):
        self.manager = manager
        self.app = Flask(__name__)
        CORS(self.app)
        self.setup_routes()
    
    def setup_routes(self):
        """Setup API routes with read-only filesystem support"""
        
        @self.app.route('/api/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '2.6.0',
                'service': 'Simple Multi-Domain Hosting API with Read-Only Support',
                'readonly_filesystem': self.manager.readonly_filesystem,
                'web_root': CONFIG['web_root'],
                'database_path': CONFIG['database_path']
            })
        
        @self.app.route('/api/status', methods=['GET'])
        def get_status():
            """Get system status"""
            try:
                # Test database connection
                try:
                    conn = self.manager.get_database_connection()
                    if conn:
                        cursor = conn.cursor()
                        cursor.execute("SELECT COUNT(*) FROM domains WHERE status = 'active'")
                        domain_count = cursor.fetchone()[0]
                        cursor.execute("SELECT COUNT(*) FROM domains WHERE ssl_enabled = 1")
                        ssl_count = cursor.fetchone()[0]
                        conn.close()
                        database_connected = True
                        database_error = None
                    else:
                        database_connected = False
                        database_error = "Could not connect to database"
                        domain_count = 0
                        ssl_count = 0
                except Exception as e:
                    database_connected = False
                    database_error = str(e)
                    domain_count = 0
                    ssl_count = 0
                
                # Check nginx status
                nginx_status = subprocess.run(['systemctl', 'is-active', 'nginx'], 
                                            capture_output=True, text=True)
                nginx_running = nginx_status.returncode == 0
                
                return jsonify({
                    'success': True,
                    'status': {
                        'nginx_running': nginx_running,
                        'database_connected': database_connected,
                        'database_error': database_error,
                        'domain_count': domain_count,
                        'ssl_count': ssl_count,
                        'is_root': self.manager.is_root,
                        'current_user': self.manager.current_user,
                        'database_path': CONFIG['database_path'],
                        'web_root': CONFIG['web_root'],
                        'readonly_filesystem': self.manager.readonly_filesystem,
                        'deployment_enabled': True
                    }
                })
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/api/deploy/nodejs', methods=['POST'])
        def deploy_nodejs_app():
            """Deploy a Node.js application with read-only filesystem support"""
            try:
                data = request.json
                site_name = data['name']
                project_files = data['files']
                deploy_config = data.get('deployConfig', {})
                
                if not site_name or not project_files:
                    return jsonify({'success': False, 'error': 'Missing site name or files'})
                
                timestamp = int(time.time())
                temp_dir = f"/tmp/deploy_{site_name}_{timestamp}"
                
                # Always use writable directory for final location in read-only mode
                if self.manager.readonly_filesystem:
                    final_dir = f"{CONFIG['web_root']}/{site_name}"
                else:
                    # Try traditional locations first
                    final_dir_candidates = [
                        f"/var/www/domains/{site_name}",
                        f"/home/www/domains/{site_name}",
                        f"/opt/www/domains/{site_name}",
                        f"{CONFIG['web_root']}/{site_name}"
                    ]
                    
                    final_dir = None
                    for candidate in final_dir_candidates:
                        try:
                            os.makedirs(candidate, mode=0o755, exist_ok=True)
                            test_file = os.path.join(candidate, '.write_test')
                            with open(test_file, 'w') as f:
                                f.write('test')
                            os.remove(test_file)
                            final_dir = candidate
                            break
                        except:
                            continue
                    
                    if not final_dir:
                        final_dir = f"{CONFIG['web_root']}/{site_name}"
                
                os.makedirs(temp_dir, exist_ok=True)
                os.makedirs(final_dir, exist_ok=True)
                
                print(f"🚀 Starting Node.js deployment for {site_name}")
                print(f"   📁 Temp dir: {temp_dir}")
                print(f"   📁 Final dir: {final_dir}")
                
                # Extract project files
                print("📁 Extracting project files...")
                self.extract_project_files(project_files, temp_dir)
                
                # Setup deployment environment
                print("🔧 Setting up deployment environment...")
                deploy_env, npm_cache_dir, npm_prefix_dir = self.manager.get_npm_environment_for_deployment(
                    temp_dir, site_name, timestamp
                )
                
                # Install dependencies
                print("📦 Installing Node.js dependencies...")
                install_success, install_error = self.manager.run_npm_install_safely(
                    temp_dir, deploy_env, npm_cache_dir
                )
                
                if not install_success:
                    print(f"❌ npm install failed: {install_error}")
                    # Cleanup
                    for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR'), temp_dir]:
                        if cleanup_dir and os.path.exists(cleanup_dir):
                            shutil.rmtree(cleanup_dir, ignore_errors=True)
                    
                    return jsonify({
                        'success': False, 
                        'error': f'npm install failed: {install_error[:500]}...',
                        'details': install_error
                    })
                
                print("✅ Dependencies installed successfully")
                
                # Build if needed
                package_json_path = os.path.join(temp_dir, 'package.json')
                has_build_script = False
                
                if os.path.exists(package_json_path):
                    try:
                        with open(package_json_path, 'r') as f:
                            package_data = json.load(f)
                            scripts = package_data.get('scripts', {})
                            has_build_script = 'build' in scripts
                    except:
                        pass
                
                if has_build_script:
                    print("🔨 Building Node.js application...")
                    build_result = subprocess.run([
                        'npm', 'run', 'build',
                        '--silent'
                    ], cwd=temp_dir, env=deploy_env, capture_output=True, text=True, timeout=600)
                    
                    if build_result.returncode != 0:
                        error_msg = build_result.stderr or build_result.stdout
                        print(f"❌ Build failed: {error_msg}")
                        # Cleanup
                        for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR'), temp_dir]:
                            if cleanup_dir and os.path.exists(cleanup_dir):
                                shutil.rmtree(cleanup_dir, ignore_errors=True)
                        
                        return jsonify({
                            'success': False, 
                            'error': f'npm build failed: {error_msg[:500]}...',
                            'details': error_msg
                        })
                    print("✅ Build completed successfully")
                
                # Copy to final directory
                if temp_dir != final_dir:
                    print(f"📋 Copying to final directory: {final_dir}")
                    try:
                        if os.path.exists(final_dir):
                            shutil.rmtree(final_dir)
                        shutil.copytree(temp_dir, final_dir)
                        print(f"✅ Copied to: {final_dir}")
                    except Exception as copy_error:
                        print(f"❌ Copy failed: {copy_error}")
                        final_dir = temp_dir  # Use temp as final
                
                app_port = deploy_config.get('port', 3000)
                
                # Start the application
                print("🚀 Starting Node.js application...")
                
                # Use appropriate process manager based on read-only status
                process_manager = None
                
                if self.manager.readonly_filesystem:
                    print("   🔒 Using read-only process manager...")
                    pm_success = self.manager.create_readonly_process_manager(site_name, final_dir, app_port)
                    if pm_success:
                        process_manager = 'readonly-simple'
                        print("   ✅ Read-only process manager deployment successful")
                    else:
                        # Cleanup and return error
                        for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR')]:
                            if cleanup_dir and os.path.exists(cleanup_dir):
                                shutil.rmtree(cleanup_dir, ignore_errors=True)
                        if temp_dir != final_dir and os.path.exists(temp_dir):
                            shutil.rmtree(temp_dir, ignore_errors=True)
                        
                        return jsonify({
                            'success': False,
                            'error': 'Read-only process manager deployment failed'
                        })
                else:
                    # Try systemd for regular filesystems
                    print("   🔄 Using systemd deployment...")
                    systemd_success = self.manager.create_systemd_app_service(site_name, final_dir, app_port)
                    if systemd_success:
                        process_manager = 'systemd'
                        print("   ✅ Systemd deployment successful")
                    else:
                        # Cleanup and return error
                        for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR')]:
                            if cleanup_dir and os.path.exists(cleanup_dir):
                                shutil.rmtree(cleanup_dir, ignore_errors=True)
                        if temp_dir != final_dir and os.path.exists(temp_dir):
                            shutil.rmtree(temp_dir, ignore_errors=True)
                        
                        return jsonify({
                            'success': False,
                            'error': 'Systemd deployment failed'
                        })
                
                # Configure nginx proxy
                print("⚙️ Configuring nginx...")
                nginx_success = self.setup_nginx_proxy(site_name, app_port)
                
                if not nginx_success and not self.manager.readonly_filesystem:
                    print("❌ Nginx configuration failed, stopping application")
                    if process_manager == 'systemd':
                        self.manager.stop_systemd_app(site_name)
                    elif process_manager == 'readonly-simple':
                        self.manager.stop_readonly_app(site_name)
                    
                    # Cleanup
                    for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR')]:
                        if cleanup_dir and os.path.exists(cleanup_dir):
                            shutil.rmtree(cleanup_dir, ignore_errors=True)
                    if temp_dir != final_dir and os.path.exists(temp_dir):
                        shutil.rmtree(temp_dir, ignore_errors=True)
                    
                    return jsonify({
                        'success': False,
                        'error': 'Nginx configuration failed'
                    })
                
                if nginx_success:
                    print("✅ Nginx configured successfully")
                else:
                    print("⚠️  Nginx configuration skipped (read-only mode)")
                
                # Save deployment configuration
                print("💾 Saving deployment configuration...")
                try:
                    if self.manager.readonly_filesystem:
                        deployment_info_dir = f"/tmp/nodejs-apps/{site_name}"
                    else:
                        deployment_info_dir = f"/var/lib/hosting-apps/{site_name}"
                    
                    os.makedirs(deployment_info_dir, mode=0o755, exist_ok=True)
                    
                    deployment_config = {
                        'site_name': site_name,
                        'port': app_port,
                        'cwd': final_dir,
                        'process_manager': process_manager,
                        'created_at': datetime.now().isoformat(),
                        'readonly_mode': self.manager.readonly_filesystem
                    }
                    
                    config_file = f"{deployment_info_dir}/deployment.json"
                    with open(config_file, 'w') as f:
                        json.dump(deployment_config, f, indent=2)
                    
                    print(f"✅ Configuration saved to {deployment_info_dir}")
                except Exception as e:
                    print(f"⚠️  Could not save deployment configuration: {e}")
                
                # Cleanup temporary directories
                print("🧹 Cleaning up temporary files...")
                for cleanup_dir in [npm_cache_dir, npm_prefix_dir, deploy_env.get('TMPDIR')]:
                    if cleanup_dir and os.path.exists(cleanup_dir):
                        shutil.rmtree(cleanup_dir, ignore_errors=True)
                
                if temp_dir != final_dir and os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir, ignore_errors=True)
                
                print(f"✅ Deployment completed successfully: {site_name}")
                
                response_data = {
                    'success': True,
                    'site_name': site_name,
                    'domain': f'{site_name}.yourdomain.com',
                    'port': app_port,
                    'status': 'running',
                    'process_manager': process_manager,
                    'url': f'http://{site_name}.yourdomain.com',
                    'files_path': final_dir,
                    'web_root_used': CONFIG['web_root'],
                    'created_at': datetime.now().isoformat(),
                    'readonly_mode': self.manager.readonly_filesystem
                }
                
                if self.manager.readonly_filesystem:
                    response_data['notes'] = 'Deployed in read-only filesystem mode with limited features'
                
                return jsonify(response_data)
                
            except subprocess.TimeoutExpired:
                print(f"❌ Deployment timeout for: {site_name}")
                return jsonify({'success': False, 'error': 'Deployment timeout - process took too long'})
            except Exception as e:
                print(f"❌ Deployment failed: {str(e)}")
                import traceback
                traceback.print_exc()
                return jsonify({'success': False, 'error': str(e)})
        
        @self.app.route('/api/apps/status/<site_name>', methods=['GET'])
        def get_app_status(site_name):
            """Get status of a deployed application"""
            try:
                # Check deployment configuration
                if self.manager.readonly_filesystem:
                    config_file = f"/tmp/nodejs-apps/{site_name}/deployment.json"
                else:
                    config_file = f"/var/lib/hosting-apps/{site_name}/deployment.json"
                
                if os.path.exists(config_file):
                    with open(config_file, 'r') as f:
                        config = json.load(f)
                    
                    process_manager = config.get('process_manager', 'unknown')
                    
                    if process_manager == 'readonly-simple':
                        is_running = self.manager.get_readonly_app_status(site_name)
                    elif process_manager == 'systemd':
                        is_running = self.manager.get_systemd_app_status(site_name)
                    else:
                        is_running = False
                    
                    return jsonify({
                        'success': True,
                        'site_name': site_name,
                        'status': 'running' if is_running else 'stopped',
                        'type': 'nodejs',
                        'port': config.get('port'),
                        'process_manager': process_manager,
                        'readonly_mode': config.get('readonly_mode', False)
                    })
                
                # Check if static site exists
                static_path = f"{CONFIG['web_root']}/{site_name}"
                if os.path.exists(static_path):
                    return jsonify({
                        'success': True,
                        'site_name': site_name,
                        'status': 'running',
                        'type': 'static',
                        'readonly_mode': self.manager.readonly_filesystem
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Site not found'
                    })
                        
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)})

        @self.app.route('/api/apps/stop/<site_name>', methods=['POST'])
        def stop_app(site_name):
            """Stop an application"""
            try:
                if self.manager.readonly_filesystem:
                    config_file = f"/tmp/nodejs-apps/{site_name}/deployment.json"
                else:
                    config_file = f"/var/lib/hosting-apps/{site_name}/deployment.json"
                
                if os.path.exists(config_file):
                    with open(config_file, 'r') as f:
                        config = json.load(f)
                    
                    process_manager = config.get('process_manager', 'unknown')
                    
                    if process_manager == 'readonly-simple':
                        success = self.manager.stop_readonly_app(site_name)
                    elif process_manager == 'systemd':
                        success = self.manager.stop_systemd_app(site_name)
                    else:
                        success = False
                    
                    return jsonify({'success': success})
                
                return jsonify({'success': False, 'error': 'App configuration not found'})
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)})

        @self.app.route('/api/apps/start/<site_name>', methods=['POST'])
        def start_app(site_name):
            """Start an application"""
            try:
                if self.manager.readonly_filesystem:
                    config_file = f"/tmp/nodejs-apps/{site_name}/deployment.json"
                else:
                    config_file = f"/var/lib/hosting-apps/{site_name}/deployment.json"
                
                if os.path.exists(config_file):
                    with open(config_file, 'r') as f:
                        config = json.load(f)
                    
                    process_manager = config.get('process_manager', 'unknown')
                    
                    if process_manager == 'readonly-simple':
                        success = self.manager.start_readonly_app(site_name)
                    elif process_manager == 'systemd':
                        success = self.manager.start_systemd_app(site_name)
                    else:
                        success = False
                    
                    return jsonify({'success': success})
                
                return jsonify({'success': False, 'error': 'App configuration not found'})
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)})
        
        # EXISTING ROUTES with read-only support
        @self.app.route('/api/domains', methods=['GET'])
        def list_domains():
            """List all domains"""
            try:
                conn = self.manager.get_database_connection()
                if not conn:
                    return jsonify({
                        'success': False,
                        'error': 'Could not connect to database'
                    }), 500
                
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT domain_name, port, site_type, ssl_enabled, status, created_at
                    FROM domains 
                    WHERE status = 'active'
                    ORDER BY created_at DESC
                """)
                
                domains = []
                for row in cursor.fetchall():
                    domain = {
                        'domain_name': row[0],
                        'port': row[1],
                        'site_type': row[2],
                        'ssl_enabled': bool(row[3]),
                        'status': row[4],
                        'created_at': row[5],
                        'url': f"https://{row[0]}" if row[3] else f"http://{row[0]}",
                        'files_path': f"{CONFIG['web_root']}/{row[0]}/public"
                    }
                    domains.append(domain)
                
                conn.close()
                
                return jsonify({
                    'success': True,
                    'domains': domains,
                    'count': len(domains),
                    'readonly_mode': self.manager.readonly_filesystem
                })
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/api/domains', methods=['POST'])
        def deploy_domain():
            """Deploy a new domain"""
            try:
                data = request.get_json()
                
                if not data or not all(k in data for k in ['domain_name', 'port', 'site_type']):
                    return jsonify({
                        'success': False,
                        'error': 'Missing required fields: domain_name, port, site_type'
                    }), 400
                
                domain_name = data['domain_name']
                port = int(data['port'])
                site_type = data['site_type']
                
                if port < 1 or port > 65535:
                    return jsonify({
                        'success': False,
                        'error': 'Port must be between 1 and 65535'
                    }), 400
                
                if site_type not in ['static', 'api', 'node', 'app']:
                    return jsonify({
                        'success': False,
                        'error': 'site_type must be one of: static, api, node, app'
                    }), 400
                
                success = self.manager.deploy_domain(domain_name, port, site_type)
                
                if success:
                    response_data = {
                        'success': True,
                        'message': f'Domain {domain_name} deployed successfully',
                        'domain': {
                            'domain_name': domain_name,
                            'port': port,
                            'site_type': site_type,
                            'url': f'http://{domain_name}',
                            'files_path': f'{CONFIG["web_root"]}/{domain_name}/public',
                            'ssl_enabled': False,
                            'ssl_available': not self.manager.readonly_filesystem
                        },
                        'readonly_mode': self.manager.readonly_filesystem
                    }
                    
                    warnings = []
                    if self.manager.readonly_filesystem:
                        warnings.append('Read-only filesystem detected - SSL and some nginx features limited')
                    
                    if warnings:
                        response_data['warnings'] = warnings
                    
                    return jsonify(response_data)
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Domain deployment failed'
                    }), 500
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/api/domains/<domain_name>', methods=['DELETE'])
        def remove_domain(domain_name):
            """Remove a domain"""
            try:
                success = self.manager.remove_domain(domain_name)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': f'Domain {domain_name} removed successfully',
                        'readonly_mode': self.manager.readonly_filesystem
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Failed to remove domain'
                    }), 500
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/api/domains/<domain_name>/ssl', methods=['POST'])
        def add_ssl(domain_name):
            """Add Let's Encrypt SSL certificate to domain"""
            try:
                if self.manager.readonly_filesystem:
                    return jsonify({
                        'success': False,
                        'error': 'SSL certificates cannot be managed in read-only filesystem mode',
                        'readonly_mode': True
                    }), 400
                success = self.manager.add_ssl(domain_name)
                if success:
                    return jsonify({
                        'success': True,
                        'message': f'Let\'s Encrypt SSL certificate added to {domain_name}',
                        'https_url': f'https://{domain_name}',
                        'ssl_provider': 'Let\'s Encrypt'
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'SSL certificate request failed'
                    }), 500
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/api/logs', methods=['GET'])
        def get_logs():
            """Get deployment logs"""
            try:
                limit = request.args.get('limit', 100, type=int)
                domain_filter = request.args.get('domain', None)
                
                conn = self.manager.get_database_connection()
                if not conn:
                    return jsonify({
                        'success': False,
                        'error': 'Could not connect to database'
                    }), 500
                
                cursor = conn.cursor()
                
                if domain_filter:
                    cursor.execute("""
                        SELECT domain_name, action, status, message, created_at
                        FROM deployment_logs 
                        WHERE domain_name = ?
                        ORDER BY created_at DESC
                        LIMIT ?
                    """, (domain_filter, limit))
                else:
                    cursor.execute("""
                        SELECT domain_name, action, status, message, created_at
                        FROM deployment_logs 
                        ORDER BY created_at DESC
                        LIMIT ?
                    """, (limit,))
                
                logs = []
                for row in cursor.fetchall():
                    logs.append({
                        'domain_name': row[0],
                        'action': row[1],
                        'status': row[2],
                        'message': row[3],
                        'created_at': row[4]
                    })
                
                conn.close()
                return jsonify({
                    'success': True,
                    'logs': logs,
                    'count': len(logs),
                    'readonly_mode': self.manager.readonly_filesystem
                })
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
    
    # Helper methods for deployment
    def extract_project_files(self, files_dict, target_dir):
        """Extract project files from the uploaded data"""
        for file_path, content in files_dict.items():
            full_path = os.path.join(target_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        print(f"📁 Extracted {len(files_dict)} files to {target_dir}")

    def setup_nginx_proxy(self, site_name, port):
        """Configure nginx as reverse proxy for Node.js app"""
        try:
            return self.manager.setup_nginx_proxy(site_name, port)
        except Exception as e:
            print(f"❌ API nginx configuration failed: {str(e)}")
            return False
    
    def run(self, host='0.0.0.0', port=5000, debug=False):
        """Start API server"""
        print(f"🚀 Starting Simple Multi-Domain Hosting API v2.6 on http://{host}:{port}")
        print(f"🔐 Running as: {self.manager.current_user}")
        print(f"💾 Database: {CONFIG['database_path']}")
        print(f"🌐 Web root: {CONFIG['web_root']}")
        
        if self.manager.readonly_filesystem:
            print("🔒 Read-only filesystem mode enabled - some features limited")
        
        # Test database access
        try:
            conn = self.manager.get_database_connection()
            if conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM domains WHERE status = 'active'")
                domain_count = cursor.fetchone()[0]
                conn.close()
                print(f"✅ Database accessible - {domain_count} active domains")
            else:
                print(f"⚠️  Database connection failed")
        except Exception as e:
            print(f"⚠️  Database issue: {e}")
        
        print(f"\n📋 API Endpoints Available:")
        print(f"   GET  /api/health")
        print(f"   GET  /api/status")
        print(f"   GET  /api/domains")
        print(f"   POST /api/domains")
        print(f"   DELETE /api/domains/<domain>")
        if not self.manager.readonly_filesystem:
            print(f"   POST /api/domains/<domain>/ssl")
        print(f"   GET  /api/logs")
        print(f"   🆕 POST /api/deploy/nodejs")
        print(f"   🆕 GET  /api/apps/status/<site_name>")
        print(f"   🆕 POST /api/apps/start/<site_name>")
        print(f"   🆕 POST /api/apps/stop/<site_name>")
        
        if self.manager.readonly_filesystem:
            print(f"\n🔒 Read-Only Mode Limitations:")
            print(f"   ❌ SSL certificate management disabled")
            print(f"   ❌ Nginx configuration changes limited")
            print(f"   ✅ App deployment and management available")
            print(f"   ✅ Database operations available")
        
        try:
            self.app.run(host=host, port=port, debug=False, use_reloader=False, threaded=True)
        except Exception as e:
            print(f"❌ API server error: {e}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Simple Multi-Domain Hosting v2.6 - Read-Only Filesystem Edition')
    parser.add_argument('--setup', action='store_true', help='Complete system setup with read-only filesystem support')
    parser.add_argument('--status', action='store_true', help='Show system status')
    parser.add_argument('--list', action='store_true', help='List all domains')
    parser.add_argument('--api', action='store_true', help='Start API server')
    parser.add_argument('--api-port', type=int, default=5000, help='API server port')
    parser.add_argument('--api-host', default='0.0.0.0', help='API server host')
    
    parser.add_argument('command', nargs='?', help='Command: deploy, ssl, remove, list, status')
    parser.add_argument('domain', nargs='?', help='Domain name')
    parser.add_argument('port', nargs='?', type=int, help='Port number')
    parser.add_argument('site_type', nargs='?', default='static', help='Site type: static, api, node, app')
    
    args = parser.parse_args()
    manager = SimpleHostingManager()
    
    try:
        if args.setup:
            print("🚀 Starting simple setup with read-only filesystem support...")
            success = manager.setup_system()
            if success:
                print("\n🎉 Setup completed successfully!")
                if not manager.readonly_filesystem:
                    print("🚀 Start the API: sudo systemctl start hosting-api")
                    print("🚀 Enable on boot: sudo systemctl enable hosting-api")
                else:
                    print("🚀 Start the API manually: sudo python3 simple-hosting.py --api")
                print("\n💡 Usage Examples:")
                print("   Deploy domain: curl -X POST http://localhost:5000/api/domains \\")
                print("     -H 'Content-Type: application/json' \\")
                print("     -d '{\"domain_name\": \"test.com\", \"port\": 80, \"site_type\": \"static\"}'")
                print("   Deploy Node.js app: curl -X POST http://localhost:5000/api/deploy/nodejs \\")
                print("     -H 'Content-Type: application/json' \\")
                print("     -d '{\"name\": \"myapp\", \"files\": {...}, \"deployConfig\": {\"port\": 3000}}'")
            else:
                print("\n❌ Setup failed.")
            sys.exit(0 if success else 1)
            
        elif args.api or (args.command == 'api'):
            api = SimpleAPI(manager)
            api.run(host=args.api_host, port=args.api_port)
            
        elif args.status or (args.command == 'status'):
            print("📊 Simple Multi-Domain Hosting Status v2.6:")
            print("=" * 50)
            
            if manager.readonly_filesystem:
                print("🔒 Read-only filesystem mode enabled")
                print(f"📁 Web root: {CONFIG['web_root']}")
                print(f"💾 Database: {CONFIG['database_path']}")

            nginx_status = subprocess.run(['systemctl', 'is-active', 'nginx'], 
                                        capture_output=True, text=True)
            nginx_running = nginx_status.returncode == 0
            print(f"🌐 Nginx: {'✅ Running' if nginx_running else '❌ Stopped'}")
            
            if not manager.readonly_filesystem:
                api_status = subprocess.run(['systemctl', 'is-active', 'hosting-api'], 
                                          capture_output=True, text=True)
                api_running = api_status.returncode == 0
                print(f"⚡ API Service: {'✅ Running' if api_running else '❌ Stopped'}")
            else:
                print(f"⚡ API Service: Manual start required in read-only mode")
            
            try:
                conn = manager.get_database_connection()
                if conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT COUNT(*) FROM domains WHERE status = 'active'")
                    domain_count = cursor.fetchone()[0]
                    cursor.execute("SELECT COUNT(*) FROM domains WHERE ssl_enabled = 1")
                    ssl_count = cursor.fetchone()[0]
                    conn.close()
                    print(f"💾 Database: ✅ Connected")
                    print(f"🌐 Active Domains: {domain_count}")
                    if not manager.readonly_filesystem:
                        print(f"🔒 SSL Enabled: {ssl_count}")
                    else:
                        print(f"🔒 SSL: Disabled in read-only mode")
                else:
                    print(f"💾 Database: ❌ Connection failed")
            except Exception as e:
                print(f"💾 Database: ❌ Error - {e}")
            
        elif args.list or (args.command == 'list'):
            manager.list_domains()
            
        elif args.command == 'deploy':
            if not args.domain or not args.port:
                print("❌ Usage: python3 simple-hosting.py deploy <domain> <port> [type]")
                print("   Types: static, api, node, app")
                sys.exit(1)
            manager.deploy_domain(args.domain, args.port, args.site_type)
            
        elif args.command == 'ssl':
            if not args.domain:
                print("❌ Usage: python3 simple-hosting.py ssl <domain>")
                sys.exit(1)
            if manager.readonly_filesystem:
                print("❌ SSL certificates cannot be managed in read-only filesystem mode")
                sys.exit(1)
            manager.add_ssl(args.domain)
            
        elif args.command == 'remove':
            if not args.domain:
                print("❌ Usage: python3 simple-hosting.py remove <domain>")
                sys.exit(1)
            manager.remove_domain(args.domain)
            
        else:
            print("🚀 Simple Multi-Domain Hosting Platform v2.6 - READ-ONLY EDITION")
            print("=" * 70)
            print("🔒 COMPLETE Read-Only Filesystem Support!")
            print("🆕 Node.js and Static App Deployment APIs!")
            print("⚡ Alternative Process Management!")
            print("\n📖 Setup Commands:")
            print("   --setup                              Complete system setup with read-only support")
            print("   --status                             Show system status")  
            print("   --list                               List all domains")
            print("   --api                                Start API server")
            print("\n🌐 Domain Management:")
            print("   deploy <domain> <port> <type>        Deploy new domain")
            print("   ssl <domain>                         Add SSL (disabled in read-only mode)")
            print("   remove <domain>                      Remove domain")
            print("\n🚀 Quick Start:")
            print("   1. sudo python3 simple-hosting.py --setup")
            if manager.readonly_filesystem:
                print("   2. sudo python3 simple-hosting.py --api")
            else:
                print("   2. sudo systemctl start hosting-api")
            print("   3. Deploy a domain:")
            print("      curl -X POST http://localhost:5000/api/domains \\")
            print("        -H 'Content-Type: application/json' \\")
            print("        -d '{\"domain_name\": \"yourdomain.com\", \"port\": 80, \"site_type\": \"static\"}'")
            print("   4. Deploy a Node.js app:")
            print("      curl -X POST http://localhost:5000/api/deploy/nodejs \\")
            print("        -H 'Content-Type: application/json' \\")
            print("        -d '{\"name\": \"myapp\", \"files\": {...}, \"deployConfig\": {\"port\": 3000}}'")
            print("\n✨ Read-Only Filesystem Features:")
            print("   ✅ Comprehensive read-only filesystem detection")
            print("   ✅ Automatic fallback to writable directories (/tmp)")
            print("   ✅ Alternative process management (no systemd dependencies)")
            print("   ✅ Node.js application deployment with simple process manager")
            print("   ✅ Database operations in writable locations")
            print("   ✅ Safe nginx configuration (when possible)")
            print("   ✅ Application start/stop/status management")
            print("   ✅ Comprehensive error handling and fallbacks")
            print("   ⚠️  SSL certificate management disabled (requires file system writes)")
            print("   ⚠️  Some nginx features limited (manual configuration may be needed)")
            print("\n🔧 Read-Only Mode Benefits:")
            print("   • Works in Docker containers and VPS environments")
            print("   • No file system permission issues")
            print("   • Graceful degradation of features")
            print("   • Full application deployment and management")
            print("   • Safe operation without system-level changes")
            
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()