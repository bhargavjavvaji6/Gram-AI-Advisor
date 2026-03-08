# Farmer Crop Recommendation Application

## Overview
An intelligent application to help farmers make data-driven decisions about crop selection based on soil quality, location, and water availability.

## Features

### 1. Farmer Registration
- State, City, Village/Town selection
- Personal details (Name, Phone Number)
- Land details (Acres/Cents)
- Land ownership verification
- Document upload (land documents)

### 2. Land Mapping
- Interactive map integration (Google Earth-like)
- Scan and mark land boundaries
- Geographic location identification

### 3. Soil Analysis
- Upload soil lab test reports
- Soil quality assessment
- Water availability analysis

### 4. Crop Recommendation
- AI-powered crop suggestions based on:
  - Soil quality
  - Location and climate
  - Water availability
  - Market demand
- Support for multiple crops: Rice, Paddy, Black Gram (Urad Dal), Chickpeas (Channa), Corn, etc.

### 5. Land Division Strategy
- Recommend dividing land for multiple crops
- Optimize income by diversifying cultivation
- Example: 5 acres → 2.5 acres Urad Dal + 2.5 acres Paddy

## Technology Stack
- Backend: Node.js with Express
- Frontend: React
- Database: MongoDB
- Map Integration: Google Maps API / Mapbox
- Cloud Storage: AWS S3 (for documents)
- ML Model: Python-based crop recommendation engine

## Project Structure
```
farmer-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── ml-model/
│   ├── crop_recommendation.py
│   └── requirements.txt
└── README.md
```

## Getting Started
Instructions will be added as development progresses.
