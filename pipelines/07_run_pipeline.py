import os
import sys
import subprocess

script_dir = os.path.dirname(os.path.abspath(__file__))

# Execution order matches the file numbers
STEPS = [
    "01_download.py",
    "02_extract.py",
    "03_preprocess.py",
    "04_merge.py",
    "05_features.py",
    "06_train.py",
]


def run_pipeline():
    print("=" * 55)
    print("  AQI PIPELINE — daily update")
    print("=" * 55)

    for script in STEPS:
        print(f"\n[STEP] {script}")
        print("-" * 40)
        try:
            subprocess.run(["python", script], cwd=script_dir, check=True)
        except subprocess.CalledProcessError:
            print(f"\n[ERROR] {script} failed. Stopping pipeline.")
            sys.exit(1)

    print("\n" + "=" * 55)
    print("  Pipeline completed successfully.")
    print("=" * 55)


if __name__ == "__main__":
    run_pipeline()