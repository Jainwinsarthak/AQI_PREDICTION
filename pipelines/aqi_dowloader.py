import os
import datetime
import requests

# Create target storage folder
os.makedirs("bulletins", exist_ok=True)

# Generate date strings
today = datetime.date.today()
date_suffix = today.strftime("%Y%m%d")  # Formats as 20260625
today_str = today.strftime("%Y-%m-%d")    # Formats as 2026-06-25

# Build the exact URL pattern you provided
final_url = f"https://cpcb.gov.in/upload/Downloads/AQI_Bulletin_{date_suffix}.pdf"
filename = f"bulletins/CPCB_AQI_Bulletin_{today_str}.pdf"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print(f"Targeting direct URL: {final_url}")
response = requests.get(final_url, headers=HEADERS, timeout=30)
content_type = response.headers.get('Content-Type', '').lower()

# Verify the file is an actual PDF and downloaded successfully
if response.status_code == 200 and 'pdf' in content_type and len(response.content) > 10000:
    with open(filename, 'wb') as f:
        f.write(response.content)
    print(f" Success! Saved valid bulletin for {today_str}")
else:
    print(f" Today's bulletin isn't uploaded yet (Status: {response.status_code}).")
    
    # Fallback: Try downloading yesterday's file just in case the server is behind
    yesterday = today - datetime.timedelta(days=1)
    yesterday_suffix = yesterday.strftime("%Y%m%d")
    fallback_url = f"https://cpcb.gov.in/upload/Downloads/AQI_Bulletin_{yesterday_suffix}.pdf"
    
    print(f" Trying fallback to yesterday's bulletin: {fallback_url}")
    fallback_response = requests.get(fallback_url, headers=HEADERS, timeout=30)
    
    if fallback_response.status_code == 200 and 'pdf' in fallback_response.headers.get('Content-Type', '').lower():
        with open(filename, 'wb') as f:
            f.write(fallback_response.content)
        print(" Fallback successful! Saved yesterday's bulletin to prevent a broken run.")
    else:
        raise Exception("Both today's and yesterday's bulletin downloads failed.")