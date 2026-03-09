const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const upload = require('../utils/upload');

// Authentication
router.post('/signup', farmerController.signup);
router.post('/login', farmerController.login);

// Farmer registration
router.post('/register', farmerController.registerFarmer);

// Update farmer details
router.put('/:id', farmerController.updateFarmer);

// Upload documents
router.post('/:id/documents', upload.array('documents', 5), farmerController.uploadDocuments);

// Upload soil report
router.post('/:id/soil-report', upload.single('soilReport'), farmerController.uploadSoilReport);

// Save land mapping
router.post('/:id/land-mapping', farmerController.saveLandMapping);

// Get farmer details
router.get('/:id', farmerController.getFarmer);

module.exports = router;
