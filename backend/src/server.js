require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const farmerRoutes = require('./routes/farmerRoutes');
const cropRoutes = require('./routes/cropRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/crops', cropRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Farmer App API is running' });
});

// Database connection (optional - will work without MongoDB for demo)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.warn('MongoDB not available - running in demo mode');
    console.warn('Install MongoDB to enable data persistence');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API available at http://localhost:${PORT}`);
});
