const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  recommendations: [{
    cropName: { type: String, required: true },
    cropType: { type: String },
    suitabilityScore: { type: Number, min: 0, max: 100 },
    recommendedArea: { type: Number },
    expectedYield: { type: String },
    estimatedIncome: { type: Number },
    growthDuration: { type: String },
    waterRequirement: { type: String, enum: ['high', 'medium', 'low'] },
    seasonalSuitability: [String]
  }],
  landDivisionStrategy: [{
    cropName: String,
    allocatedArea: Number,
    percentage: Number
  }],
  analysisDate: { type: Date, default: Date.now },
  factors: {
    soilQuality: String,
    climateCondition: String,
    waterAvailability: String,
    marketDemand: String
  }
});

module.exports = mongoose.model('CropRecommendation', cropRecommendationSchema);
