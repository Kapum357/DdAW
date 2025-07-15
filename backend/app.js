const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const connectToMongoDB = require('./config/vercel-db');

// Import security middleware
const { limiter, securityHeaders, sanitizeInput } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const indexRouter = require('./routes/index');
const userRoutes = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const inventoryRouter = require('./routes/inventory');

// Initialize express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Don't try to connect immediately in serverless environment
if (process.env.NODE_ENV !== 'production') {
  connectToMongoDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
      console.error('Initial MongoDB connection failed:', err);
      // Don't crash the app, we'll retry on each request
    });
}

// Apply security middlewares
app.use(limiter);
app.use(securityHeaders);
app.use(sanitizeInput);

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',                          // Local frontend
      'https://backend-kapum357s-projects.vercel.app',  // Vercel backend
      'https://kapum357.github.io'                      // GitHub Pages frontend
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/', indexRouter);
app.use('/api/users', userRoutes);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok'});
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(errorHandler);

// Export only the Express app
module.exports = app;
