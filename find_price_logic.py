import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('mock_store_bundle.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Look around line 3180
lines = text.split(';')
print(f"Total statements: {len(lines)}")

for i in range(3170, min(3300, len(lines))):
    print(f"Line {i}: {lines[i][:200]}")
