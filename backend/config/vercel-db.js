const mongoose = require('mongoose');

// Global cached connection
let cachedConnection = null;
let connectionPromise = null;

/**
 * MongoDB connection optimized for Vercel serverless environment
 */
const connectToMongoDB = async () => {
  // If we already have a connection and it's ready, use it
  if (cachedConnection?.connection?.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  // If a connection attempt is in progress, wait for it
  if (connectionPromise) {
    console.log('Connection attempt in progress, waiting...');
    try {
      return await connectionPromise;
    } catch (error) {
      // Previous connection attempt failed, we'll try again
      connectionPromise = null;
    }
  }

  // Start a new connection attempt
  console.log('Initiating new MongoDB connection...');
  
  // Store the connection promise to prevent multiple simultaneous connection attempts
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,         // Disable mongoose buffering
    serverSelectionTimeoutMS: 5000, // Shorter server selection timeout
    connectTimeoutMS: 10000,       // Shorter connection timeout
    socketTimeoutMS: 30000,        // Socket timeout
    maxPoolSize: 5,                // Smaller connection pool for serverless
  });

  try {
    // Wait for the connection
    cachedConnection = await connectionPromise;
    console.log('Successfully connected to MongoDB');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset connection promise so next request can try again
    connectionPromise = null;
    // Re-throw to let caller handle it
    throw error;
  }
};

module.exports = connectToMongoDB;