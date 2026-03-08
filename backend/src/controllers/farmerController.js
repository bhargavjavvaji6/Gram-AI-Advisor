const Farmer = require('../models/Farmer');
const s3Service = require('../services/s3Service');

// In-memory storage for demo mode (when MongoDB is not available)
let inMemoryFarmers = [];
let farmerIdCounter = 1;

exports.registerFarmer = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = new Farmer(req.body);
      await farmer.save();
      res.status(201).json({ success: true, data: farmer });
    } else {
      // Use in-memory storage
      const farmer = {
        _id: `farmer_${farmerIdCounter++}`,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryFarmers.push(farmer);
      res.status(201).json({ success: true, data: farmer });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateFarmer = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = await Farmer.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      res.json({ success: true, data: farmer });
    } else {
      // Use in-memory storage
      const farmerIndex = inMemoryFarmers.findIndex(f => f._id === req.params.id);
      if (farmerIndex === -1) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      inMemoryFarmers[farmerIndex] = {
        ...inMemoryFarmers[farmerIndex],
        ...req.body,
        updatedAt: new Date()
      };
      res.json({ success: true, data: inMemoryFarmers[farmerIndex] });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = await Farmer.findById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }

      const uploadedDocs = await Promise.all(
        req.files.map(file => s3Service.uploadFile(file, 'documents'))
      );

      farmer.documents.push(...uploadedDocs);
      await farmer.save();

      res.json({ success: true, data: farmer.documents });
    } else {
      // In-memory mode - simulate document upload
      const farmerIndex = inMemoryFarmers.findIndex(f => f._id === req.params.id);
      if (farmerIndex === -1) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      
      const uploadedDocs = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `demo://${file.originalname}`,
        uploadedAt: new Date()
      }));
      
      if (!inMemoryFarmers[farmerIndex].documents) {
        inMemoryFarmers[farmerIndex].documents = [];
      }
      inMemoryFarmers[farmerIndex].documents.push(...uploadedDocs);
      
      res.json({ success: true, data: inMemoryFarmers[farmerIndex].documents });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.uploadSoilReport = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = await Farmer.findById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }

      const uploadedFile = await s3Service.uploadFile(req.file, 'soil-reports');
      
      farmer.soilReport = {
        reportUrl: uploadedFile.fileUrl,
        uploadedAt: Date.now(),
        ...req.body
      };
      await farmer.save();

      res.json({ success: true, data: farmer.soilReport });
    } else {
      // In-memory mode
      const farmerIndex = inMemoryFarmers.findIndex(f => f._id === req.params.id);
      if (farmerIndex === -1) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      
      inMemoryFarmers[farmerIndex].soilReport = {
        reportUrl: `demo://${req.file.originalname}`,
        uploadedAt: new Date(),
        ...req.body
      };
      
      res.json({ success: true, data: inMemoryFarmers[farmerIndex].soilReport });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.saveLandMapping = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = await Farmer.findById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }

      farmer.landMapping = req.body;
      await farmer.save();

      res.json({ success: true, data: farmer.landMapping });
    } else {
      // In-memory mode
      const farmerIndex = inMemoryFarmers.findIndex(f => f._id === req.params.id);
      if (farmerIndex === -1) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      
      inMemoryFarmers[farmerIndex].landMapping = req.body;
      
      res.json({ success: true, data: inMemoryFarmers[farmerIndex].landMapping });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFarmer = async (req, res) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    if (isMongoConnected) {
      const farmer = await Farmer.findById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      res.json({ success: true, data: farmer });
    } else {
      // In-memory mode
      const farmer = inMemoryFarmers.find(f => f._id === req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      res.json({ success: true, data: farmer });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
