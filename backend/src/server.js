require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const farmerRoutes = require('./routes/farmerRoutes');
const cropRoutes = require('./routes/cropRoutes');
const { verifyBucket } = require('./services/s3Service');

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

// AWS S3 health check
app.get('/health/s3', async (req, res) => {
  const { verifyBucket } = require('./services/s3Service');
  const result = await verifyBucket();
  res.json({
    service: 'AWS S3',
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    ...result
  });
});

// Database connection (optional - will work without MongoDB for demo)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.warn('MongoDB not available - running in demo mode');
    console.warn('Install MongoDB to enable data persistence');
  });

// Verify AWS S3 bucket on startup
verifyBucket().then(result => {
  if (result.success) {
    console.log('AWS S3 configured successfully');
  } else {
    console.warn('AWS S3 Warning:', result.message);
    console.warn('File uploads may not work. Check your AWS credentials and bucket name.');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API available at http://localhost:${PORT}`);
});
