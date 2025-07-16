#!/usr/bin/env python3
"""
HTML to React Component Converter
Converts HTML files to React JSX components with proper return statements.

Usage:
    python html_to_jsx.py input.html output.jsx
    python html_to_jsx.py input.html  # auto-generates output name
    python html_to_jsx.py input.html -c ComponentName
"""

import re
import os
import sys
import argparse
from pathlib import Path


def html_to_jsx(html_content):
    """Convert HTML content to JSX format."""
    jsx_content = html_content
    
    # Replace class with className
    jsx_content = re.sub(r'\bclass=', 'className=', jsx_content)
    
    # Replace for with htmlFor
    jsx_content = re.sub(r'\bfor=', 'htmlFor=', jsx_content)
    
    # Convert SVG attributes to camelCase
    jsx_content = re.sub(r'fill-rule=', 'fillRule=', jsx_content)
    jsx_content = re.sub(r'clip-rule=', 'clipRule=', jsx_content)
    jsx_content = re.sub(r'stroke-linecap=', 'strokeLinecap=', jsx_content)
    jsx_content = re.sub(r'stroke-linejoin=', 'strokeLinejoin=', jsx_content)
    jsx_content = re.sub(r'stroke-width=', 'strokeWidth=', jsx_content)
    jsx_content = re.sub(r'stroke-dasharray=', 'strokeDasharray=', jsx_content)
    jsx_content = re.sub(r'stroke-dashoffset=', 'strokeDashoffset=', jsx_content)
    
    # Convert other HTML attributes
    jsx_content = re.sub(r'\btabindex=', 'tabIndex=', jsx_content)
    jsx_content = re.sub(r'\breadonly\b', 'readOnly', jsx_content)
    jsx_content = re.sub(r'\bmaxlength=', 'maxLength=', jsx_content)
    jsx_content = re.sub(r'\bautofocus\b', 'autoFocus', jsx_content)
    jsx_content = re.sub(r'\bautoplay\b', 'autoPlay', jsx_content)
    jsx_content = re.sub(r'\bautocomplete=', 'autoComplete=', jsx_content)
    jsx_content = re.sub(r'\bcolspan=', 'colSpan=', jsx_content)
    jsx_content = re.sub(r'\browspan=', 'rowSpan=', jsx_content)
    jsx_content = re.sub(r'\bcontenteditable=', 'contentEditable=', jsx_content)
    
    # Handle xlink attributes
    jsx_content = re.sub(r'xlink:href=', 'href=', jsx_content)
    jsx_content = re.sub(r'xmlns:xlink="[^"]*"', '', jsx_content)
    
    # Convert HTML comments to JSX comments
    jsx_content = re.sub(r'<!--([\s\S]*?)-->', r'{/*\1*/}', jsx_content)
    
    # Self-close void elements
    void_elements = [
        'input', 'img', 'br', 'hr', 'area', 'base', 'col', 'embed', 
        'source', 'track', 'wbr', 'meta', 'link'
    ]
    
    for element in void_elements:
        pattern = rf'<({element})([^>]*?)(?<!/)>'
        jsx_content = re.sub(pattern, r'<\1\2/>', jsx_content, flags=re.IGNORECASE)
    
    # Remove style and script blocks
    jsx_content = re.sub(r'<style[\s\S]*?>[\s\S]*?</style>', '', jsx_content, flags=re.IGNORECASE)
    jsx_content = re.sub(r'<script[\s\S]*?>[\s\S]*?</script>', '', jsx_content, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    jsx_content = re.sub(r'\n\s*\n', '\n\n', jsx_content)
    jsx_content = re.sub(r'  +', ' ', jsx_content)
    
    return jsx_content


def extract_component_content(html_content):
    """Extract the main content for the React component."""
    # Try to extract body content first
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if body_match:
        return body_match.group(1).strip()
    
    # Try to find main container divs
    container_patterns = [
        r'<div[^>]*class="[^"]*container[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]*class="[^"]*wrapper[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]*class="[^"]*main[^"]*"[^>]*>(.*?)</div>',
        r'<main[^>]*>(.*?)</main>',
        r'<article[^>]*>(.*?)</article>',
        r'<section[^>]*>(.*?)</section>'
    ]
    
    for pattern in container_patterns:
        match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    # If no specific container found, try to extract content within html tags
    html_match = re.search(r'<html[^>]*>(.*?)</html>', html_content, re.DOTALL | re.IGNORECASE)
    if html_match:
        # Remove head content
        content = re.sub(r'<head[^>]*>.*?</head>', '', html_match.group(1), flags=re.DOTALL | re.IGNORECASE)
        return content.strip()
    
    # Last resort: return the entire content
    return html_content.strip()


def generate_component_name(file_path):
    """Generate a valid React component name from file path."""
    filename = Path(file_path).stem
    
    # Convert to PascalCase
    parts = re.sub(r'[^a-zA-Z0-9]', ' ', filename).split()
    component_name = ''.join(word.capitalize() for word in parts if word)
    
    # Ensure it starts with a capital letter
    if not component_name:
        component_name = 'MyComponent'
    elif not component_name[0].isupper():
        component_name = component_name.capitalize()
    
    # Ensure it's a valid identifier
    if not re.match(r'^[A-Z][a-zA-Z0-9]*$', component_name):
        component_name = 'MyComponent'
    
    return component_name


def clean_and_indent_jsx(jsx_content, indent_level=1):
    """Clean up and properly indent JSX content."""
    lines = jsx_content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped:  # Only include non-empty lines
            # Add proper indentation
            indent = '  ' * indent_level
            cleaned_lines.append(indent + stripped)
    
    return '\n'.join(cleaned_lines)


def create_react_component(jsx_content, component_name, add_imports=True):
    """Wrap JSX content in a React component."""
    # Clean and indent the JSX content
    indented_content = clean_and_indent_jsx(jsx_content, indent_level=2)
    
    # Build the component
    component_parts = []
    
    # Add imports if requested
    if add_imports:
        component_parts.append("import React from 'react'")
        component_parts.append("")
    
    # Add component function
    component_parts.append(f"export default function {component_name}() {{")
    component_parts.append("  return (")
    
    # Handle single element vs multiple elements
    lines = [line for line in indented_content.split('\n') if line.strip()]
    if len(lines) == 1:
        # Single element - can return directly
        component_parts.append(indented_content)
    else:
        # Multiple elements - wrap in fragment
        component_parts.append("    <>")
        for line in lines:
            component_parts.append("  " + line)
        component_parts.append("    </>")
    
    component_parts.append("  )")
    component_parts.append("}")
    
    return '\n'.join(component_parts)


def convert_file(input_file_path, output_file_path, component_name=None, add_imports=True):
    """Convert an HTML file to a React JSX component."""
    try:
        # Read the HTML file
        with open(input_file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        # Extract the main content for the component
        extracted_content = extract_component_content(html_content)
        
        # Convert to JSX
        jsx_content = html_to_jsx(extracted_content)
        
        # Generate component name if not provided
        if not component_name:
            component_name = generate_component_name(input_file_path)
        
        # Create the React component
        react_component = create_react_component(jsx_content, component_name, add_imports)
        
        # Write the JSX file
        with open(output_file_path, 'w', encoding='utf-8') as file:
            file.write(react_component)
        
        print(f"✅ HTML successfully converted to React component '{component_name}' and saved to {output_file_path}")
        
    except FileNotFoundError:
        print(f"❌ Error: Input file '{input_file_path}' not found.")
        sys.exit(1)
    except PermissionError:
        print(f"❌ Error: Permission denied when trying to write to '{output_file_path}'.")
        sys.exit(1)
    except Exception as error:
        print(f"❌ Error processing the file: {error}")
        sys.exit(1)


def main():
    """Main function to handle command line arguments and file conversion."""
    parser = argparse.ArgumentParser(
        description='Convert HTML files to React JSX components',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python html_to_jsx.py index.html IndexComponent.jsx
  python html_to_jsx.py index.html  # Auto-generates component name
  python html_to_jsx.py -i index.html -o Header.jsx -c HeaderComponent
  python html_to_jsx.py index.html --no-imports  # Skip React import
        '''
    )
    
    parser.add_argument('input_file', nargs='?', help='Input HTML file path')
    parser.add_argument('output_file', nargs='?', help='Output JSX file path (optional)')
    parser.add_argument('-i', '--input', dest='input_file_flag', help='Input HTML file path')
    parser.add_argument('-o', '--output', dest='output_file_flag', help='Output JSX file path')
    parser.add_argument('-c', '--component', dest='component_name', help='Custom component name')
    parser.add_argument('--no-imports', action='store_true', help='Skip adding React import statement')
    parser.add_argument('--version', action='version', version='HTML to React Component Converter 1.0.0')
    
    args = parser.parse_args()
    
    # Determine input file
    input_file = args.input_file or args.input_file_flag
    
    if not input_file:
        print("❌ Error: No input file specified.")
        parser.print_help()
        sys.exit(1)
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Error: Input file '{input_file}' does not exist.")
        sys.exit(1)
    
    # Determine output file
    output_file = args.output_file or args.output_file_flag
    
    if not output_file:
        # Generate output filename from input filename
        input_path = Path(input_file)
        output_file = str(input_path.with_suffix('.jsx'))
        if output_file == input_file:
            # If input already has .jsx extension, add _component
            output_file = str(input_path.with_suffix('')) + '_component.jsx'
    
    # Validate component name if provided
    component_name = args.component_name
    if component_name and not re.match(r'^[A-Z][a-zA-Z0-9]*$', component_name):
        print(f"❌ Error: Component name '{component_name}' is invalid. Must start with uppercase letter and contain only letters and numbers.")
        sys.exit(1)
    
    # Determine whether to add imports
    add_imports = not args.no_imports
    
    # Perform the conversion
    print(f"🔄 Converting '{input_file}' to React component...")
    convert_file(input_file, output_file, component_name, add_imports)


if __name__ == '__main__':
    main()