with open('mock_store_bundle.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find occurrences of "Reveal price" or aria-label
lines = text.split(';')
for i, l in enumerate(lines):
    if 'reveal price' in l.lower() or 'aria-label' in l.lower() or 'disabled' in l.lower():
        if len(l) < 400:
            print(f"Line {i}: {l}\n")
