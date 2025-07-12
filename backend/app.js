const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');

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

// Connect to MongoDB
connectDB();

// Apply security middlewares
app.use(limiter);
app.use(securityHeaders);
app.use(sanitizeInput);

// view engine setup (if needed)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.NODE_ENV === 'production' ? 'https://frontend-kapum-2.vercel.app' : 'http://localhost:5173'
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

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(errorHandler);

// Create HTTP server
const server = require('http').createServer(app);

// Export both app and server
module.exports = { app, server };
