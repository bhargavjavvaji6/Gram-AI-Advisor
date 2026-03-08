const axios = require('axios');
const { cropDatabase } = require('../data/cropDatabase');

exports.getCropRecommendations = async (farmerData) => {
  try {
    const response = await axios.post(
      `${process.env.ML_MODEL_API_URL}/predict`,
      farmerData
    );

    return response.data;
  } catch (error) {
    // Fallback to rule-based recommendations using comprehensive crop database
    return getRuleBasedRecommendations(farmerData);
  }
};

function getRuleBasedRecommendations(farmerData) {
  const { soilData, waterAvailability } = farmerData;
  
  // Calculate suitability for all crops in database
  const recommendations = cropDatabase.map(crop => {
    const score = calculateCropSuitability(crop, soilData, waterAvailability);
    
    return {
      cropName: crop.name,
      cropType: crop.type,
      suitabilityScore: score,
      waterRequirement: crop.waterNeed,
      growthDuration: crop.duration,
      seasonalSuitability: crop.season,
      estimatedYield: getEstimatedYield(crop, score),
      marketDemand: getMarketDemand(crop.type)
    };
  });

  // Sort by suitability score and return top recommendations
  const sortedRecommendations = recommendations
    .filter(r => r.suitabilityScore >= 40) // Only show crops with 40%+ suitability
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return {
    recommendations: sortedRecommendations,
    totalCropsAnalyzed: cropDatabase.length,
    suitableCropsCount: sortedRecommendations.length,
    factors: {
      soilQuality: getSoilQuality(soilData),
      climateCondition: 'Moderate',
      waterAvailability: waterAvailability?.availability || 'medium',
      marketDemand: 'Good'
    }
  };
}

function calculateCropSuitability(crop, soilData, waterAvailability) {
  let score = 0;
  
  // pH suitability (30 points max)
  const pH = soilData.pH || 6.5;
  if (pH >= crop.pHMin && pH <= crop.pHMax) {
    score += 30;
  } else if (pH >= crop.pHMin - 0.5 && pH <= crop.pHMax + 0.5) {
    score += 20;
  } else if (pH >= crop.pHMin - 1.0 && pH <= crop.pHMax + 1.0) {
    score += 10;
  }

  // Water availability matching (25 points max)
  const waterLevel = waterAvailability?.availability || 'medium';
  if (crop.waterNeed === 'high' && waterLevel === 'high') score += 25;
  else if (crop.waterNeed === 'medium' && waterLevel === 'medium') score += 25;
  else if (crop.waterNeed === 'low' && waterLevel === 'low') score += 25;
  else if (crop.waterNeed === 'high' && waterLevel === 'medium') score += 15;
  else if (crop.waterNeed === 'medium' && waterLevel === 'high') score += 20;
  else if (crop.waterNeed === 'low' && waterLevel === 'medium') score += 20;
  else if (crop.waterNeed === 'medium' && waterLevel === 'low') score += 10;
  else score += 5;

  // Nitrogen suitability (15 points max)
  const nitrogen = soilData.nitrogen || 100;
  if (nitrogen >= crop.nMin) score += 15;
  else if (nitrogen >= crop.nMin * 0.7) score += 10;
  else if (nitrogen >= crop.nMin * 0.5) score += 5;

  // Phosphorus suitability (15 points max)
  const phosphorus = soilData.phosphorus || 30;
  if (phosphorus >= crop.pMin) score += 15;
  else if (phosphorus >= crop.pMin * 0.7) score += 10;
  else if (phosphorus >= crop.pMin * 0.5) score += 5;

  // Potassium suitability (15 points max)
  const potassium = soilData.potassium || 100;
  if (potassium >= crop.kMin) score += 15;
  else if (potassium >= crop.kMin * 0.7) score += 10;
  else if (potassium >= crop.kMin * 0.5) score += 5;

  return Math.min(Math.round(score), 100);
}

function getEstimatedYield(crop, suitabilityScore) {
  // Estimate yield based on crop type and suitability
  const yieldMap = {
    'Cereal': { base: 25, unit: 'quintals/acre' },
    'Pulse': { base: 8, unit: 'quintals/acre' },
    'Oilseed': { base: 10, unit: 'quintals/acre' },
    'Vegetable': { base: 100, unit: 'quintals/acre' },
    'Fruit': { base: 80, unit: 'quintals/acre' },
    'Cash Crop': { base: 300, unit: 'quintals/acre' },
    'Spice': { base: 15, unit: 'quintals/acre' },
    'Fodder': { base: 200, unit: 'quintals/acre' },
    'Fiber': { base: 12, unit: 'quintals/acre' },
    'Medicinal': { base: 20, unit: 'quintals/acre' },
    'Flower': { base: 50, unit: 'quintals/acre' }
  };

  const yieldInfo = yieldMap[crop.type] || { base: 20, unit: 'quintals/acre' };
  const estimatedYield = Math.round((yieldInfo.base * suitabilityScore) / 100);
  
  return `${estimatedYield} ${yieldInfo.unit}`;
}

function getMarketDemand(cropType) {
  const demandMap = {
    'Cereal': 'High',
    'Pulse': 'High',
    'Oilseed': 'High',
    'Vegetable': 'Very High',
    'Fruit': 'High',
    'Cash Crop': 'Very High',
    'Spice': 'High',
    'Fodder': 'Medium',
    'Fiber': 'Medium',
    'Medicinal': 'Growing',
    'Flower': 'High'
  };

  return demandMap[cropType] || 'Good';
}

function getSoilQuality(soilData) {
  const avgNutrient = (soilData.nitrogen + soilData.phosphorus + soilData.potassium) / 3;
  if (avgNutrient > 150) return 'Excellent';
  if (avgNutrient > 100) return 'Good';
  if (avgNutrient > 50) return 'Fair';
  return 'Poor';
}
