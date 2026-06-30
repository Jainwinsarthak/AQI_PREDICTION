import subprocess

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
    subprocess.run(["python", file], check=True)

print("\nPipeline Completed Successfully")