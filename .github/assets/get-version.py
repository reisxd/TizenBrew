import xml.etree.ElementTree as ET
import os
import sys

if len(sys.argv) < 2:
    print("Usage: python your_script.py path/to/your/file.xml")
    sys.exit(1)

xml_file = sys.argv[1]

print(f"XML file name: {xml_file}")

tree = ET.parse(xml_file)
root = tree.getroot()

version = root.attrib.get('version')

print(f"Version found: {version}")

with open(os.getenv('GITHUB_OUTPUT'), 'a') as github_output:
    github_output.write(f'version={version}\n')
