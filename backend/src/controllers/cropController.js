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
      farmer = await Farmer.findById(req.params.farmerId);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      if (!farmer.soilReport || !farmer.soilReport.reportUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Soil report not uploaded' 
        });
      }
    } else {
      // In demo mode, create mock farmer data
      farmer = {
        _id: req.params.farmerId,
        soilReport: req.body.soilReport || {
          pH: 6.5,
          nitrogen: 250,
          phosphorus: 30,
          potassium: 200,
          soilType: 'Loamy'
        },
        location: req.body.location || { state: 'Demo', city: 'Demo', village: 'Demo' },
        landDetails: req.body.landDetails || { totalArea: 5, unit: 'acres' },
        waterAvailability: req.body.waterAvailability || { source: 'borewell', availability: 'medium' }
      };
    }

    // Call ML service for crop recommendations
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
      inMemoryRecommendations.push(recommendation);
      res.json({ success: true, data: recommendation });
    }
  } catch (error) {
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
  const topCrops = recommendations
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 3);

  const totalScore = topCrops.reduce((sum, crop) => sum + crop.suitabilityScore, 0);

  return topCrops.map(crop => ({
    cropName: crop.cropName,
    allocatedArea: (crop.suitabilityScore / totalScore) * totalArea,
    percentage: (crop.suitabilityScore / totalScore) * 100
  }));
}
