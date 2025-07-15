const mongoose = require('mongoose');
require('dotenv').config();

let cachedConnection = null;
let isConnecting = false;

const connectDB = async () => {
  if (cachedConnection?.connection?.readyState === 1) {
    return cachedConnection;
  }
  
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (cachedConnection) return cachedConnection;
  }
  
  try {
    isConnecting = true;
    console.log('Connecting to MongoDB...');
    
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });
    
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;
