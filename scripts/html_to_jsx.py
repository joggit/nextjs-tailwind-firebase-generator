import sys
import os
from bs4 import BeautifulSoup
import re

SELF_CLOSING_TAGS = {
    'area', 'base', 'br', 'col', 'embed', 'hr',
    'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
}

def convert_style_attr(style_str):
    style_dict = {}
    for item in style_str.split(';'):
        if ':' in item:
            prop, value = item.split(':', 1)
            js_key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), prop.strip())
            style_dict[js_key] = value.strip()
    return style_dict

def style_dict_to_jsx(style_dict):
    return '{ ' + ', '.join(f'{k}: "{v}"' for k, v in style_dict.items()) + ' }'

def convert_element_to_jsx(tag):
    if isinstance(tag, str):
        return tag
    if tag.name is None:
        return tag.string or ''
    
    tag_name = tag.name
    attrs = []

    for attr, value in tag.attrs.items():
        if attr == 'class':
            attrs.append(f'className="{ " ".join(value) if isinstance(value, list) else value }"')
        elif attr == 'style':
            style_obj = convert_style_attr(value)
            attrs.append(f'style={style_dict_to_jsx(style_obj)}')
        elif value is None:
            attrs.append(attr)
        else:
            attrs.append(f'{attr}="{value}"')

    attr_str = ' ' + ' '.join(attrs) if attrs else ''

    if tag_name in SELF_CLOSING_TAGS and not tag.contents:
        return f'<{tag_name}{attr_str} />'

    children = ''.join(convert_element_to_jsx(child) for child in tag.contents)
    return f'<{tag_name}{attr_str}>{children}</{tag_name}>'

def html_to_jsx(html):
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.body or soup
    jsx_parts = [convert_element_to_jsx(child) for child in body.contents]
    return '\n'.join(jsx_parts)

def convert_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as infile:
        html = infile.read()
    jsx = html_to_jsx(html)
    with open(output_path, 'w', encoding='utf-8') as outfile:
        outfile.write(jsx)
    print(f"✅ JSX saved to: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_html_to_jsx.py input.html [output.jsx]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(input_file)[0] + ".jsx"

    convert_file(input_file, output_file)
    