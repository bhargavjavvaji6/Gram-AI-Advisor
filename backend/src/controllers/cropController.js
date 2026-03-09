const Farmer = require('../models/Farmer');
const CropRecommendation = require('../models/CropRecommendation');
const mlService = require('../services/mlService');

// In-memory storage for demo mode
let inMemoryRecommendations = [];
let recommendationIdCounter = 1;

exports.getCropRecommendations = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    let farmer;
    
    if (isMongoConnected) {
      // Always fetch fresh farmer data from database
      farmer = await Farmer.findById(req.params.farmerId);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      
      // Check if soil report exists
      if (!farmer.soilReport || !farmer.soilReport.pH) {
        return res.status(400).json({ 
          success: false, 
          error: 'Soil report not uploaded. Please complete soil test first.' 
        });
      }
      
      console.log('Using farmer data from database:', {
        farmerId: farmer._id,
        soilPH: farmer.soilReport.pH,
        nitrogen: farmer.soilReport.nitrogen,
        waterAvailability: farmer.waterAvailability?.availability
      });
    } else {
      // In demo mode, use data from request body or create mock data
      const requestData = req.body;
      
      farmer = {
        _id: req.params.farmerId,
        soilReport: requestData.soilReport || {
          pH: 6.5,
          nitrogen: 100,
          phosphorus: 40,
          potassium: 100,
          soilType: 'Loamy'
        },
        location: requestData.location || { state: 'Demo', city: 'Demo', village: 'Demo' },
        landDetails: requestData.landDetails || { totalArea: 5, unit: 'acres' },
        waterAvailability: requestData.waterAvailability || { source: 'borewell', availability: 'medium' }
      };
      
      console.log('Using farmer data from request (demo mode):', {
        farmerId: farmer._id,
        soilPH: farmer.soilReport.pH,
        nitrogen: farmer.soilReport.nitrogen,
        waterAvailability: farmer.waterAvailability?.availability
      });
    }

    // Call ML service for crop recommendations with latest farmer data
    const mlRecommendations = await mlService.getCropRecommendations({
      soilData: farmer.soilReport,
      location: farmer.location,
      landArea: farmer.landDetails.totalArea,
      waterAvailability: farmer.waterAvailability
    });

    // Calculate land division strategy
    const landDivisionStrategy = calculateLandDivision(
      mlRecommendations.recommendations,
      farmer.landDetails.totalArea
    );

    const recommendation = {
      _id: isMongoConnected ? undefined : `rec_${recommendationIdCounter++}`,
      farmerId: farmer._id,
      recommendations: mlRecommendations.recommendations,
      landDivisionStrategy,
      factors: mlRecommendations.factors,
      analysisDate: new Date()
    };

    if (isMongoConnected) {
      const savedRec = new CropRecommendation(recommendation);
      await savedRec.save();
      res.json({ success: true, data: savedRec });
    } else {
      // In demo mode, don't accumulate old recommendations
      // Replace any existing recommendation for this farmer
      const existingIndex = inMemoryRecommendations.findIndex(r => r.farmerId === req.params.farmerId);
      if (existingIndex >= 0) {
        inMemoryRecommendations[existingIndex] = recommendation;
      } else {
        inMemoryRecommendations.push(recommendation);
      }
      res.json({ success: true, data: recommendation });
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRecommendationHistory = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const recommendations = await CropRecommendation.find({ 
        farmerId: req.params.farmerId 
      }).sort({ analysisDate: -1 });
      res.json({ success: true, data: recommendations });
    } else {
      const recommendations = inMemoryRecommendations
        .filter(r => r.farmerId === req.params.farmerId)
        .sort((a, b) => b.analysisDate - a.analysisDate);
      res.json({ success: true, data: recommendations });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

function calculateLandDivision(recommendations, totalArea) {
  // Select top crops with diversity in mind
  const topCrops = [];
  const usedTypes = new Set();
  
  // First pass: Get highest scoring crop from each type
  for (const crop of recommendations) {
    if (!usedTypes.has(crop.cropType) && topCrops.length < 5) {
      topCrops.push(crop);
      usedTypes.add(crop.cropType);
    }
  }
  
  // Second pass: Fill remaining slots with highest scoring crops
  for (const crop of recommendations) {
    if (topCrops.length >= 5) break;
    if (!topCrops.find(c => c.cropName === crop.cropName)) {
      topCrops.push(crop);
    }
  }
  
  // Take top 3-5 crops based on total area
  const numCrops = totalArea >= 5 ? 5 : totalArea >= 3 ? 4 : 3;
  const selectedCrops = topCrops.slice(0, numCrops);

  const totalScore = selectedCrops.reduce((sum, crop) => sum + crop.suitabilityScore, 0);

  return selectedCrops.map(crop => ({
    cropName: crop.cropName,
    allocatedArea: (crop.suitabilityScore / totalScore) * totalArea,
    percentage: (crop.suitabilityScore / totalScore) * 100
  }));
}
