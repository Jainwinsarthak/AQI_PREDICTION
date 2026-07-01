import pdfplumber
import pandas as pd
import os
import re
from glob import glob

# Latest PDF
pipelines_dir = os.path.dirname(os.path.abspath(__file__))
pdf_files = glob(
    os.path.join(pipelines_dir, "bulletins", "*.pdf")
)

if not pdf_files:
    raise Exception("No PDF found")

latest_pdf = max(
    pdf_files,
    key=os.path.getctime
)

print("Processing:", latest_pdf)

all_data = []

match = re.search(
    r"(\d{4}-\d{2}-\d{2})",
    os.path.basename(latest_pdf)
)

report_date = match.group(1)

with pdfplumber.open(latest_pdf) as pdf:

    for page in pdf.pages:

        tables = page.extract_tables()

        for table in tables:

            if not table:
                continue

            for row in table[1:]:

                try:

                    if row is None:
                        continue

                    if len(row) < 6:
                        continue

                    city = str(row[1]).strip()

                    air_quality = str(
                        row[2]
                    ).replace(
                        "\n",
                        " "
                    )

                    aqi_value = int(
                        float(row[3])
                    )

                    pollutant = str(
                        row[4]
                    ).replace(
                        "\n",
                        " "
                    )

                    all_data.append(
                        {
                            "date": report_date,
                            "area": city,
                            "prominent_pollutants": pollutant,
                            "aqi_value": aqi_value,
                            "air_quality_status": air_quality
                        }
                    )

                except:
                    continue

df = pd.DataFrame(all_data)

df.drop_duplicates(
    subset=["date", "area"],
    inplace=True
)

df.to_csv(
    "aqi_extracted_2025_2026.csv",
    index=False
)

print("Saved Successfully")
print(df.shape)