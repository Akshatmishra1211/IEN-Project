import re

with open('mock_store_bundle.js', 'r', encoding='utf-8') as f:
    text = f.read()

print("Length of bundle:", len(text))

# Find product names or mock data definitions
# Look for price, stock, product details
matches = re.findall(r'(\{"id"[^}]+\})', text)
print("Product JSON matches found:", len(matches))
for m in matches[:10]:
    print("Match:", m[:100])

# Let's search for fetch calls or api calls
fetch_matches = [line for line in text.split(';') if 'fetch(' in line or 'axios' in line]
print("\nFetch statements count:", len(fetch_matches))
for fm in fetch_matches[:10]:
    print("Fetch line:", fm[:150])

# Let's search for HTML structure/classes/ids
id_matches = re.findall(r'id=["\']([^"\']+)["\']', text)
class_matches = re.findall(r'class(?:Name)?=["\']([^"\']+)["\']', text)
print("\nIDs found:", set(id_matches))
print("Sample Classes found:", list(set(class_matches))[:10])
