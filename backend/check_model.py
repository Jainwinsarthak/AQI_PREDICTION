import joblib
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
obj = joblib.load(
    os.path.join(project_root, "models", "aqi_production_model.pkl")
)

print(type(obj))