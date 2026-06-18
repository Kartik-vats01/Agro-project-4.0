# 🚀 FastAPI Crop Recommendation Backend - Setup Guide

## Installation

1. **Navigate to the backend directory:**
   ```powershell
   cd model_training_code
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

## Running the Backend

**Option 1: Quick Start (Development Mode)**
```powershell
python -m uvicorn app:app --reload --port 5000
```

**Option 2: Using Uvicorn Directly**
```powershell
uvicorn app:app --host 0.0.0.0 --port 5000
```

The API will be available at: `http://localhost:5000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`

## API Endpoints

### 1. Crop Recommendation
- **Endpoint**: `POST /api/recommend`
- **Request Body**:
```json
{
  "nitrogen": 90.0,
  "phosphorus": 42.0,
  "potassium": 43.0,
  "temperature": 20.0,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.0
}
```
- **Response**: Array of top 3 crop recommendations with scores and details

### 2. Disease Prediction
- **Endpoint**: `POST /api/predict`
- **Request**: Multipart form data with image file
- **Response**: Disease prediction results

## Frontend Integration

Your frontend at `frontend/` already has the correct API URLs configured:
- Crop recommendations: `http://localhost:5000/api/recommend`
- Disease prediction: `http://localhost:5000/api/predict`

### To run the frontend:
```powershell
# If using VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"
# Or in frontend directory
python -m http.server 5500
```

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure:
- FastAPI backend is running on `http://localhost:5000`
- Frontend is on a different port (e.g., `http://localhost:5500`)
- CORS middleware is enabled in `app.py` ✅

### Module Not Found
Make sure all requirements are installed:
```powershell
pip list | findstr "fastapi uvicorn numpy lightgbm"
```

### Model Files Missing
Ensure you have these files in `model_training_code/`:
- `lightgbm_model.pkl`
- `minmaxscaler_1.pkl`

## Key Changes from Flask to FastAPI

| Feature | Flask | FastAPI |
|---------|-------|---------|
| Framework | Flask | FastAPI |
| Server | Flask dev server | Uvicorn |
| Type Validation | Manual | Automatic (Pydantic) |
| CORS | flask-cors | FastAPI middleware |
| API Docs | Manual | Auto-generated (Swagger/ReDoc) |
| Async Support | Limited | Full support |

---

**Happy Farming! 🌾**
