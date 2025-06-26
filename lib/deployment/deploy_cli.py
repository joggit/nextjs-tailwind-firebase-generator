#!/usr/bin/env python3
# lib/deployment/deploy_cli.py
"""
Command Line Interface for deployment system
"""

import argparse
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add lib directory to path for imports
sys.path.append(str(Path(__file__).parent))

from deployer import deploy_project, NginxDeployer, DeploymentConfig
from config import DeploymentConfigManager, get_deployment_template, list_deployment_templates

def create_parser():
    """Create command line argument parser"""
    parser = argparse.ArgumentParser(
        description='Deploy Next.js projects to nginx servers',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Deploy using profile
  %(prog)s --profile my-project-prod --zip project.zip

  # Deploy with inline config
  %(prog)s --zip project.zip --hostname server.com --username deploy --domain myapp.com

  # List available profiles
  %(prog)s --list-profiles

  # Create new profile
  %(prog)s --create-profile my-new-profile

  # Test connection to server
  %(prog)s --test-connection --hostname server.com --username deploy
        """)

    # Main action groups
    action_group = parser.add_mutually_exclusive_group(required=True)
    action_group.add_argument('--deploy', action='store_true', 
                             help='Deploy project (default action)')
    action_group.add_argument('--list-profiles', action='store_true',
                             help='List available deployment profiles')
    action_group.add_argument('--list-templates', action='store_true',
                             help='List available deployment templates')
    action_group.add_argument('--create-profile', type=str, metavar='NAME',
                             help='Create new deployment profile')
    action_group.add_argument('--test-connection', action='store_true',
                             help='Test SSH connection to server')

    # Deployment options
    deploy_group = parser.add_argument_group('deployment options')
    deploy_group.add_argument('--zip', '--zip-path', type=str, metavar='PATH',
                             help='Path to project zip file')
    deploy_group.add_argument('--profile', type=str, metavar='NAME',
                             help='Use deployment profile')
    deploy_group.add_argument('--config', type=str, metavar='PATH',
                             help='Path to deployment config JSON file')
    deploy_group.add_argument('--template', type=str, metavar='NAME',
                             help='Use deployment template (simple, production, etc.)')

    # Server configuration
    server_group = parser.add_argument_group('server configuration')
    server_group.add_argument('--hostname', type=str, metavar='HOST',
                             help='Server hostname')
    server_group.add_argument('--username', type=str, metavar='USER',
                             help='SSH username')
    server_group.add_argument('--password', type=str, metavar='PASS',
                             help='SSH password (not recommended)')
    server_group.add_argument('--private-key', type=str, metavar='PATH',
                             help='Path to SSH private key')
    server_group.add_argument('--port', type=int, metavar='PORT', default=22,
                             help='SSH port (default: 22)')

    # Project configuration
    project_group = parser.add_argument_group('project configuration')
    project_group.add_argument('--project-name', type=str, metavar='NAME',
                              help='Project name for deployment')
    project_group.add_argument('--domain', type=str, metavar='DOMAIN',
                              help='Domain name for the project')
    project_group.add_argument('--port-number', type=int, metavar='PORT',
                              help='Application port number (default: 3000)')
    project_group.add_argument('--deploy-path', type=str, metavar='PATH',
                              help='Deployment path on server (default: /var/www)')

    # Features
    feature_group = parser.add_argument_group('features')
    feature_group.add_argument('--ssl', action='store_true',
                              help='Enable SSL with Let\'s Encrypt')
    feature_group.add_argument('--ssl-email', type=str, metavar='EMAIL',
                              help='Email for SSL certificate')
    feature_group.add_argument('--no-pm2', action='store_true',
                              help='Don\'t use PM2 process manager')
    feature_group.add_argument('--pm2-instances', type=int, metavar='N',
                              help='Number of PM2 instances (default: 1)')

    # Environment variables
    env_group = parser.add_argument_group('environment variables')
    env_group.add_argument('--env', action='append', metavar='KEY=VALUE',
                          help='Environment variable (can be used multiple times)')
    env_group.add_argument('--env-file', type=str, metavar='PATH',
                          help='Load environment variables from file')

    # Output options
    output_group = parser.add_argument_group('output options')
    output_group.add_argument('--verbose', '-v', action='store_true',
                             help='Verbose output')
    output_group.add_argument('--quiet', '-q', action='store_true',
                             help='Quiet output (errors only)')
    output_group.add_argument('--json-output', action='store_true',
                             help='Output results in JSON format')
    output_group.add_argument('--log-file', type=str, metavar='PATH',
                             help='Save deployment logs to file')

    return parser

def load_config_from_file(config_path):
    """Load deployment configuration from JSON file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in config file: {e}", file=sys.stderr)
        sys.exit(1)

def parse_environment_variables(env_list, env_file=None):
    """Parse environment variables from command line and file"""
    env_vars = {}
    
    # Load from file if specified
    if env_file:
        try:
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
        except FileNotFoundError:
            print(f"❌ Environment file not found: {env_file}", file=sys.stderr)
            sys.exit(1)
    
    # Parse command line env vars
    if env_list:
        for env_var in env_list:
            if '=' not in env_var:
                print(f"❌ Invalid environment variable format: {env_var}", file=sys.stderr)
                sys.exit(1)
            key, value = env_var.split('=', 1)
            env_vars[key.strip()] = value.strip()
    
    return env_vars

def build_deployment_config(args):
    """Build deployment configuration from command line arguments"""
    config_manager = DeploymentConfigManager()
    
    # Start with profile or template
    if args.profile:
        try:
            config = config_manager.create_deployment_config(args.profile, args.project_name or 'unnamed-project')
        except ValueError as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)
    elif args.template:
        template = get_deployment_template(args.template)
        config = template['config'].copy()
    else:
        config = {}

    # Override with command line arguments
    if args.hostname:
        config['hostname'] = args.hostname
    if args.username:
        config['username'] = args.username
    if args.password:
        config['password'] = args.password
    if args.private_key:
        config['private_key_path'] = args.private_key
    if args.port:
        config['port'] = args.port
    if args.project_name:
        config['project_name'] = args.project_name
    if args.domain:
        config['domain'] = args.domain
    if args.port_number:
        config['port_number'] = args.port_number
    if args.deploy_path:
        config['deploy_path'] = args.deploy_path
    if args.ssl:
        config['enable_ssl'] = True
    if args.ssl_email:
        config['ssl_email'] = args.ssl_email
    if args.no_pm2:
        config['use_pm2'] = False
    if args.pm2_instances:
        config['pm2_instances'] = args.pm2_instances

    # Add environment variables
    env_vars = parse_environment_variables(args.env, args.env_file)
    if env_vars:
        config['environment_vars'] = env_vars

    return config

def list_deployment_profiles():
    """List available deployment profiles"""
    config_manager = DeploymentConfigManager()
    
    print("Available Deployment Profiles:")
    print("=" * 40)
    
    profiles = config_manager.list_deployment_profiles()
    if not profiles:
        print("No deployment profiles found.")
        print("Run with --create-profile to create one.")
        return
    
    for profile_name in profiles:
        profile = config_manager.get_deployment_profile(profile_name)
        if profile:
            print(f"\n📋 {profile.name}")
            print(f"   Profile ID: {profile_name}")
            print(f"   Server: {profile.server_profile}")
            print(f"   Domain: {profile.domain}")
            print(f"   Port: {profile.port_number}")
            print(f"   SSL: {'Yes' if profile.enable_ssl else 'No'}")

def list_deployment_templates():
    """List available deployment templates"""
    print("Available Deployment Templates:")
    print("=" * 40)
    
    templates = list_deployment_templates()
    for template in templates:
        print(f"\n🛠️  {template['name']} ({template['id']})")
        print(f"   {template['description']}")

def create_deployment_profile(profile_name):
    """Interactive profile creation"""
    config_manager = DeploymentConfigManager()
    
    print(f"Creating deployment profile: {profile_name}")
    print("=" * 40)
    
    # Get server profiles
    server_profiles = config_manager.list_server_profiles()
    if not server_profiles:
        print("❌ No server profiles found. Please create server profiles first.")
        sys.exit(1)
    
    print("\nAvailable server profiles:")
    for i, server_name in enumerate(server_profiles, 1):
        server = config_manager.get_server_profile(server_name)
        print(f"{i}. {server.name} ({server.hostname})")
    
    while True:
        try:
            choice = int(input("\nSelect server profile (number): ")) - 1
            if 0 <= choice < len(server_profiles):
                selected_server = server_profiles[choice]
                break
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Get deployment details
    domain = input("Domain name: ").strip()
    port_str = input("Port number (default: 3000): ").strip()
    port_number = int(port_str) if port_str else 3000
    
    ssl_choice = input("Enable SSL? (y/N): ").strip().lower()
    enable_ssl = ssl_choice in ['y', 'yes']
    
    ssl_email = ""
    if enable_ssl:
        ssl_email = input("SSL email address: ").strip()
    
    # Create profile
    from config import DeploymentProfile
    profile = DeploymentProfile(
        name=profile_name,
        server_profile=selected_server,
        domain=domain,
        port_number=port_number,
        enable_ssl=enable_ssl,
        ssl_email=ssl_email if ssl_email else None
    )
    
    config_manager.save_deployment_profile(profile)
    print(f"✅ Deployment profile '{profile_name}' created successfully!")

def test_ssh_connection(args):
    """Test SSH connection to server"""
    if not args.hostname or not args.username:
        print("❌ Hostname and username are required for connection test", file=sys.stderr)
        sys.exit(1)
    
    config = {
        'hostname': args.hostname,
        'username': args.username,
        'port': args.port,
    }
    
    if args.password:
        config['password'] = args.password
    elif args.private_key:
        config['private_key_path'] = args.private_key
    else:
        # Try default SSH key
        default_key = Path.home() / '.ssh' / 'id_rsa'
        if default_key.exists():
            config['private_key_path'] = str(default_key)
        else:
            print("❌ No authentication method provided", file=sys.stderr)
            sys.exit(1)
    
    print(f"🔌 Testing connection to {args.username}@{args.hostname}:{args.port}")
    
    try:
        deployment_config = DeploymentConfig(**config, project_name='test', domain='test.com')
        deployer = NginxDeployer(deployment_config)
        
        if deployer.connect():
            print("✅ SSH connection successful!")
            
            # Test basic commands
            print("🔍 Testing basic commands...")
            try:
                deployer.execute_command('whoami')
                deployer.execute_command('pwd')
                deployer.execute_command('uname -a')
                print("✅ Basic commands working!")
            except Exception as e:
                print(f"⚠️  Command execution test failed: {e}")
            
            deployer.disconnect()
        else:
            print("❌ SSH connection failed!")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Connection test failed: {e}", file=sys.stderr)
        sys.exit(1)

def save_deployment_log(log_entries, log_file):
    """Save deployment log to file"""
    try:
        with open(log_file, 'w') as f:
            f.write(f"Deployment Log - {datetime.now().isoformat()}\n")
            f.write("=" * 60 + "\n\n")
            for entry in log_entries:
                f.write(f"{entry}\n")
        print(f"📄 Deployment log saved to: {log_file}")
    except Exception as e:
        print(f"⚠️  Failed to save log file: {e}", file=sys.stderr)

def main():
    """Main CLI function"""
    parser = create_parser()
    args = parser.parse_args()
    
    # Handle different actions
    if args.list_profiles:
        list_deployment_profiles()
        return
    
    if args.list_templates:
        list_deployment_templates()
        return
    
    if args.create_profile:
        create_deployment_profile(args.create_profile)
        return
    
    if args.test_connection:
        test_ssh_connection(args)
        return
    
    # Default action is deploy
    if not args.zip:
        print("❌ Project zip file is required for deployment", file=sys.stderr)
        parser.print_help()
        sys.exit(1)
    
    if not os.path.exists(args.zip):
        print(f"❌ Project zip file not found: {args.zip}", file=sys.stderr)
        sys.exit(1)
    
    # Build deployment configuration
    if args.config:
        config = load_config_from_file(args.config)
    else:
        config = build_deployment_config(args)
    
    # Validate required fields
    required_fields = ['hostname', 'username', 'domain']
    missing_fields = [field for field in required_fields if not config.get(field)]
    
    if missing_fields:
        print(f"❌ Missing required fields: {', '.join(missing_fields)}", file=sys.stderr)
        print("Use --profile, --config, or provide individual options", file=sys.stderr)
        sys.exit(1)
    
    # Set defaults
    if 'project_name' not in config:
        config['project_name'] = Path(args.zip).stem
    
    # Configure output verbosity
    if args.quiet:
        import logging
        logging.getLogger().setLevel(logging.ERROR)
    elif args.verbose:
        import logging
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Start deployment
    print(f"🚀 Starting deployment of {config['project_name']}")
    print(f"📦 Project: {args.zip}")
    print(f"🌐 Target: {config['domain']} ({config['hostname']})")
    print("=" * 60)
    
    try:
        result = deploy_project(config, args.zip)
        
        # Handle output
        if args.json_output:
            print(json.dumps(result, indent=2))
        else:
            if result['success']:
                print("\n✅ Deployment completed successfully!")
                if 'url' in result:
                    print(f"🌐 Your site is available at: {result['url']}")
                if 'duration' in result:
                    print(f"⏱️  Deployment took: {result['duration']:.1f} seconds")
            else:
                print(f"\n❌ Deployment failed: {result['error']}")
        
        # Save log if requested
        if args.log_file and 'log' in result:
            save_deployment_log(result['log'], args.log_file)
        
        # Print log to console if verbose
        if args.verbose and 'log' in result:
            print("\n📋 Deployment Log:")
            print("-" * 40)
            for entry in result['log']:
                print(entry)
        
        # Exit with appropriate code
        sys.exit(0 if result['success'] else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Deployment cancelled by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()