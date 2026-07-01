import subprocess
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

files = [
    "aqi_dowloader.py",
    "pdf_extractor.py",
    "state_mapping.py",
    "pollutant_cleaning.py",
    "update_master_dataset.py",
    "feature_engineering.py"
]

for file in files:
    print(f"\nRunning {file}")
    subprocess.run(["python", file], cwd=script_dir, check=True)

print("\nPipeline Completed Successfully")