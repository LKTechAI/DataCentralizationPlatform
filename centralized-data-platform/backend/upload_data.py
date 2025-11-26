import csv
import requests
from pathlib import Path

API_BASE = "http://127.0.0.1:5000"

# Map local CSV filenames to upload endpoints
UPLOAD_MAP = {
    "Manufacturing.csv": "upload/manufacturing",
    "Sales.csv": "upload/sales",
    "Field.csv": "upload/field",
    "Testing.csv": "upload/testing",
}

DATA_DIR = Path(r"D:\document\NIT Workspace\Synapse\centralized-data-platform\synthetic_data")

def send_row(endpoint, row):
    url = f"{API_BASE}/{endpoint}"
    r = requests.post(url, json=row)
    print(endpoint, "->", r.status_code, r.text)

def upload_csv(file_path, endpoint):
    print(f"Uploading {file_path.name} → {endpoint}")
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            send_row(endpoint, row)

if __name__ == "__main__":
    for filename, endpoint in UPLOAD_MAP.items():
        fp = DATA_DIR / filename
        if fp.exists():
            upload_csv(fp, endpoint)
        else:
            print("Missing:", fp)
