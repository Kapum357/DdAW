var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Express API is running',
    version: '1.0.0'
  });
});

// Debug route to check environment and MongoDB connection
router.get('/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    envVars: {
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJWT: !!process.env.JWT_SECRET
    }
  });
});

router.get('/status', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: 'connected',
      mongodbState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'disconnected',
      error: error.message,
      mongodbState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
