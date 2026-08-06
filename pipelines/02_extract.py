import os
import re
import pandas as pd
import pdfplumber
from glob import glob

from config import BULLETS_DIR, RAW_EXTRACTED_CSV


def get_latest_pdf():
    pdf_files = glob(os.path.join(BULLETS_DIR, "*.pdf"))
    if not pdf_files:
        raise Exception("No PDF found in bulletins/")
    return max(pdf_files, key=os.path.getctime)


def extract_date_from_filename(filename):
    m = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(filename))
    if m is None:
        raise Exception(
            f"Could not extract date from '{os.path.basename(filename)}'. "
            "Expected format: CPCB_AQI_Bulletin_YYYY-MM-DD.pdf"
        )
    return m.group(1)


def parse_pdf(pdf_path):
    report_date = extract_date_from_filename(pdf_path)
    rows = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table:
                    continue
                for row in table[1:]:  # skip header
                    try:
                        if row is None or len(row) < 6:
                            continue
                        city         = str(row[1]).strip()
                        air_quality  = str(row[2]).replace("\n", " ")
                        aqi_value    = int(float(row[3]))
                        pollutant    = str(row[4]).replace("\n", " ")
                        rows.append({
                            "date": report_date,
                            "area": city,
                            "prominent_pollutants": pollutant,
                            "aqi_value": aqi_value,
                            "air_quality_status": air_quality,
                        })
                    except Exception as e:
                        print(f"WARNING: Skipped row — {e} | Row: {row}")

    df = pd.DataFrame(rows)
    df.drop_duplicates(subset=["date", "area"], inplace=True)
    return df


def extract_pdf_to_csv(pdf_path=None):
    if pdf_path is None:
        pdf_path = get_latest_pdf()

    print(f"Processing: {pdf_path}")
    df = parse_pdf(pdf_path)
    df.to_csv(RAW_EXTRACTED_CSV, index=False)
    print(f"Saved {df.shape[0]} rows to: {RAW_EXTRACTED_CSV}")
    return df


if __name__ == "__main__":
    extract_pdf_to_csv()
