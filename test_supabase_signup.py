import requests
import json

url = "https://hjwvqacanlkfyowcwtoj.supabase.co/auth/v1/signup"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqd3ZxYWNhbmxrZnlvd2N3dG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTYyODcsImV4cCI6MjA5ODY3MjI4N30.6LZr8OyaDV1ru7XSWpitYk5I5IrJgHC4yHny30FFthE",
    "Content-Type": "application/json"
}

payload = {
    "email": "test_user_ai_signup_3@example.com",
    "password": "Shayari@134",
    "data": {
        "full_name": "Test User 3",
        "role": "ATHLETE",
        "phone": "+919876543210"
    }
}

print("Sending request to Supabase signup...")
res = requests.post(url, headers=headers, json=payload)
print(f"Status Code: {res.status_code}")
print("Response Body:")
try:
    print(json.dumps(res.json(), indent=2))
except Exception:
    print(res.text)
