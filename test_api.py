import urllib.request
import json
import ssl

ctx = ssl.create_default_context()

def get(url):
    print(f"\n--- GET {url} ---")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            print("Status:", resp.status)
            print("Headers:", dict(resp.headers))
            data = resp.read().decode('utf-8')
            print("Response body preview:", data[:500])
            return data
    except Exception as e:
        print("Error:", e)
        return None

get("https://demo.inelabteamdev.com/api/catalog?page=1&pageSize=50")
get("https://demo.inelabteamdev.com/api/layout")
