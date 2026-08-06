import os
import datetime
import requests

from config import BULLETIN_URL, BULLETS_DIR, HEADERS


def download_bulletin():
    os.makedirs(BULLETS_DIR, exist_ok=True)

    today = datetime.date.today()
    date_suffix = today.strftime("%Y%m%d")
    today_str   = today.strftime("%Y-%m-%d")

    url      = BULLETIN_URL.format(date_suffix=date_suffix)
    out_path = os.path.join(BULLETS_DIR, f"CPCB_AQI_Bulletin_{today_str}.pdf")

    print(f"Downloading: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=30)
    ct   = resp.headers.get("Content-Type", "").lower()

    if resp.status_code == 200 and "pdf" in ct and len(resp.content) > 10000:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        print(f"Saved bulletin for {today_str}")
        return out_path

    # Fallback to yesterday's bulletin if today's isn't up yet
    print(f"Today's bulletin not available (status {resp.status_code}). Trying yesterday...")
    yesterday        = today - datetime.timedelta(days=1)
    fallback_url     = BULLETIN_URL.format(date_suffix=yesterday.strftime("%Y%m%d"))

    fb_resp = requests.get(fallback_url, headers=HEADERS, timeout=30)
    fb_ct   = fb_resp.headers.get("Content-Type", "").lower()

    if fb_resp.status_code == 200 and "pdf" in fb_ct:
        with open(out_path, "wb") as f:
            f.write(fb_resp.content)
        print("Fallback successful — saved yesterday's bulletin.")
        return out_path

    raise Exception("Both today's and yesterday's bulletin downloads failed.")


if __name__ == "__main__":
    download_bulletin()
