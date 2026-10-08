import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer demo-token"
}

def make_request(path, method="GET", body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=== TEST 1: LAUNCH CALCULATOR ===", flush=True)
    s1, r1 = make_request("/api/desktop/command", method="POST", body={
        "tool": "app_launcher",
        "action": "open",
        "parameters": {"app": "calculator"}
    })
    print(f"Status: {s1}", flush=True)
    print("Response:", json.dumps(r1, indent=2), flush=True)

    print("\n=== TEST 2: LOCK PC WITHOUT CONFIRMATION ===", flush=True)
    s2, r2 = make_request("/api/desktop/command", method="POST", body={
        "tool": "system_control",
        "action": "lock",
        "confirmed": False
    })
    print(f"Status: {s2}", flush=True)
    print("Response:", json.dumps(r2, indent=2), flush=True)

    print("\n=== TEST 3: REJECT UNCONFIGURED APP ===", flush=True)
    s3, r3 = make_request("/api/desktop/command", method="POST", body={
        "tool": "app_launcher",
        "action": "open",
        "parameters": {"app": "unconfigured_malicious_app"}
    })
    print(f"Status: {s3}", flush=True)
    print("Response:", json.dumps(r3, indent=2), flush=True)

    print("\n=== TEST 4: SYSTEM TELEMETRY ===", flush=True)
    s4, r4 = make_request("/api/desktop/telemetry", method="GET")
    print(f"Status: {s4}", flush=True)
    print("Response:", json.dumps(r4, indent=2), flush=True)

if __name__ == "__main__":
    run_tests()
