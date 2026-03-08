const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// Get crop recommendations
router.post('/recommend/:farmerId', cropController.getCropRecommendations);

// Get recommendation history
router.get('/recommendations/:farmerId', cropController.getRecommendationHistory);

module.exports = router;
