from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import pickle
import os

# Load model and MinMaxScaler
model_path = os.path.join(os.path.dirname(__file__), 'lightgbm_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), 'minmaxscaler_1.pkl')

model = pickle.load(open(model_path, 'rb'))
ms = pickle.load(open(scaler_path, 'rb'))

# Initialize FastAPI app
app = FastAPI(title="AgriMitra API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (configure as needed for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crop dictionary
crop_dict = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya",
    7: "Orange", 8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes",
    12: "Mango", 13: "Banana", 14: "Pomegranate", 15: "Lentil", 16: "Blackgram",
    17: "Mungbean", 18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans",
    21: "Chickpea", 22: "Coffee"
}

# Request model
class RecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# Response model
class CropRecommendation(BaseModel):
    name: str
    suitabilityScore: float
    profitCategory: str
    estimatedPrice: int
    growingPeriod: int
    marketTrend: str
    icon: str

@app.get("/")
def read_root():
    return {"message": "AgriMitra API is running"}

@app.post("/api/recommend", response_model=List[CropRecommendation])
def get_recommendation(data: RecommendationRequest):
    try:
        # Extract input features
        N = data.nitrogen
        P = data.phosphorus
        K = data.potassium
        temp = data.temperature
        humidity = data.humidity
        ph = data.ph
        rainfall = data.rainfall

        # Prepare and scale input
        features = np.array([[N, P, K, temp, humidity, ph, rainfall]])
        scaled_features = ms.transform(features)

        # Predict probabilities
        probs = model.predict_proba(scaled_features)[0]

        # Get top 3 crops
        top_indices = np.argsort(probs)[::-1][:3]

        recommendations = []
        for idx in top_indices:
            crop_name = crop_dict.get(idx + 1, "Unknown Crop")
            recommendations.append({
                "name": crop_name,
                "suitabilityScore": round(probs[idx] * 100, 2),
                "profitCategory": "High" if probs[idx] > 0.6 else ("Medium" if probs[idx] > 0.3 else "Low"),
                "estimatedPrice": int(np.random.randint(1500, 4000)),
                "growingPeriod": int(np.random.randint(3, 7)),
                "marketTrend": np.random.choice(["Rising", "Stable", "Declining"]),
                "icon": "🌾"
            })

        return recommendations

    except Exception as e:
        print("Error in /api/recommend:", e)
        raise ValueError(f"Prediction error: {str(e)}")

@app.post("/api/predict")
def predict_disease(image: bytes):
    """
    Disease prediction endpoint - extend as needed
    """
    try:
        return {
            "disease": "Disease detection not yet implemented",
            "confidence": "0%",
            "severity": "Unknown"
        }
    except Exception as e:
        print("Error in /api/predict:", e)
        raise ValueError(f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
