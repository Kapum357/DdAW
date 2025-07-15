const mongoose = require('mongoose');

let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  console.log('Creating new database connection');
  
  // These settings are crucial for serverless environments
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false, // Disable mongoose buffering
    serverSelectionTimeoutMS: 5000, // Keep server selection timeout low
    socketTimeoutMS: 45000, // But keep socket timeout higher
    maxPoolSize: 10, // Limit connections in the pool
    maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
    connectTimeoutMS: 10000, // Connection timeout
  });

  cachedConnection = connection;
  return connection;
};

module.exports = connectToDatabase;