const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env.config');
const { loggerMiddleware } = require('./middleware/logger.middleware');
const { errorHandlerMiddleware } = require('./middleware/error.middleware');
const { notFoundMiddleware } = require('./middleware/notFound.middleware');
const apiRouter = require('./routes/api.router');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        env.isDevelopment ||
        origin === env.FRONTEND_URL ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(loggerMiddleware);

// API Routes
app.use('/api', apiRouter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Joineazy Student, Group & Assignment Management System API',
    version: '1.0.0',
    phase: 'Phase 1 - Foundation',
    healthCheck: '/api/health',
    status: 'active',
  });
});

// 404 Catch-All Handler
app.use(notFoundMiddleware);

// Centralized Error Handler
app.use(errorHandlerMiddleware);

module.exports = app;
