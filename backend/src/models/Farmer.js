const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  personalDetails: {
    name: { type: String, required: true },
    phoneNumber: { type: String },
    phone: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String }
  },
  location: {
    state: { type: String, required: true },
    city: { type: String, required: true },
    village: { type: String, required: true }
  },
  landDetails: {
    totalArea: { type: Number, required: true },
    unit: { type: String, enum: ['acres', 'cents'], default: 'acres' },
    isOwner: { type: Boolean, required: true },
    ownerName: { type: String }
  },
  documents: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  landMapping: {
    coordinates: [{
      lat: Number,
      lng: Number
    }],
    mapImageUrl: String
  },
  soilReport: {
    reportUrl: String,
    uploadedAt: Date,
    soilType: String,
    pH: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicCarbon: Number
  },
  waterAvailability: {
    source: { type: String, enum: ['borewell', 'canal', 'river', 'rain', 'mixed'] },
    availability: { type: String, enum: ['high', 'medium', 'low'] }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', farmerSchema);
