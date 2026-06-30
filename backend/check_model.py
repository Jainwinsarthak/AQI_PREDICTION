import joblib

obj = joblib.load(
    r"C:\Users\sarth\Desktop\Final_AQI_project\models\aqi_production_model.pkl"
)

print(type(obj))