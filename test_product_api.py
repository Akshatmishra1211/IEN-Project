import urllib.request
import json
import ssl

ctx = ssl.create_default_context()

def test_endpoint(url):
    print(f"\n--- GET {url} ---")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            print("Status:", resp.status)
            data = resp.read().decode('utf-8')
            print("Response:", data)
            return data
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code, e.reason)
        print("Error Body:", e.read().decode('utf-8'))
    except Exception as e:
        print("Error:", e)

test_endpoint("https://demo.inelabteamdev.com/api/product/155")
test_endpoint("https://demo.inelabteamdev.com/api/product/nordkraft-recovery-slide-mini")
