from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Crop Recommendation ML Service")

class SoilData(BaseModel):
    pH: float
    nitrogen: float
    phosphorus: float
    potassium: float
    organicCarbon: Optional[float] = None
    soilType: Optional[str] = None

class Location(BaseModel):
    state: str
    city: str
    village: str

class WaterAvailability(BaseModel):
    source: str
    availability: str

class FarmerData(BaseModel):
    soilData: SoilData
    location: Location
    landArea: float
    waterAvailability: WaterAvailability

class CropRecommendation(BaseModel):
    cropName: str
    cropType: str
    suitabilityScore: float
    waterRequirement: str
    growthDuration: str
    seasonalSuitability: List[str]

@app.post("/predict")
async def predict_crops(data: FarmerData):
    """
    Predict suitable crops based on soil, location, and water data
    """
    try:
        recommendations = calculate_crop_suitability(data)
        
        return {
            "recommendations": recommendations,
            "factors": {
                "soilQuality": assess_soil_quality(data.soilData),
                "climateCondition": "Moderate",
                "waterAvailability": data.waterAvailability.availability,
                "marketDemand": "Good"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_crop_suitability(data: FarmerData) -> List[dict]:
    crops = [
        {
            "cropName": "Rice",
            "cropType": "Cereal",
            "suitabilityScore": calculate_score("rice", data),
            "waterRequirement": "high",
            "growthDuration": "120-150 days",
            "seasonalSuitability": ["Kharif", "Rabi"]
        },
        {
            "cropName": "Paddy",
            "cropType": "Cereal",
            "suitabilityScore": calculate_score("paddy", data),
            "waterRequirement": "high",
            "growthDuration": "120-140 days",
            "seasonalSuitability": ["Kharif"]
        },
        {
            "cropName": "Black Gram (Urad Dal)",
            "cropType": "Pulse",
            "suitabilityScore": calculate_score("urad", data),
            "waterRequirement": "medium",
            "growthDuration": "70-90 days",
            "seasonalSuitability": ["Kharif", "Rabi", "Summer"]
        },
        {
            "cropName": "Chickpeas (Channa)",
            "cropType": "Pulse",
            "suitabilityScore": calculate_score("chickpea", data),
            "waterRequirement": "low",
            "growthDuration": "100-120 days",
            "seasonalSuitability": ["Rabi"]
        },
        {
            "cropName": "Corn",
            "cropType": "Cereal",
            "suitabilityScore": calculate_score("corn", data),
            "waterRequirement": "medium",
            "growthDuration": "80-110 days",
            "seasonalSuitability": ["Kharif", "Rabi"]
        }
    ]
    
    return sorted(crops, key=lambda x: x["suitabilityScore"], reverse=True)

def calculate_score(crop_type: str, data: FarmerData) -> float:
    score = 50.0
    soil = data.soilData
    water = data.waterAvailability.availability
    
    # pH suitability
    if 6.0 <= soil.pH <= 7.5:
        score += 20
    elif 5.5 <= soil.pH <= 8.0:
        score += 10
    
    # Water requirement matching
    if crop_type in ["rice", "paddy"]:
        score += 20 if water == "high" else 5
    elif crop_type == "chickpea":
        score += 15 if water in ["low", "medium"] else 5
    else:
        score += 15 if water == "medium" else 10
    
    # Nutrient levels
    if soil.nitrogen > 200:
        score += 10
    if soil.phosphorus > 20:
        score += 5
    if soil.potassium > 150:
        score += 5
    
    return min(score, 100.0)

def assess_soil_quality(soil: SoilData) -> str:
    avg_nutrient = (soil.nitrogen + soil.phosphorus + soil.potassium) / 3
    if avg_nutrient > 150:
        return "Excellent"
    elif avg_nutrient > 100:
        return "Good"
    elif avg_nutrient > 50:
        return "Fair"
    return "Poor"

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
