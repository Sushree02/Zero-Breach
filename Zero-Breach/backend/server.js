require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const investigateRoutes = require('./routes/investigate');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://zero-breach-eug8mrzfg-sushree-soumya-priyadarshini-s-projects.vercel.app';

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);

      return callback(new Error('Not allowed by CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

    credentials: false,
  })
);

// --------------------------------------------------
// SECURITY
// --------------------------------------------------

app.use(helmet());

// --------------------------------------------------
// BODY PARSING
// --------------------------------------------------

app.use(
  express.json({
    limit: '1mb',
  })
);

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: 'Too many requests. Please wait a moment and try again.',
  },
});

app.use('/api/', limiter);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'zero-breach-backend',
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/investigate', investigateRoutes);

app.use('/api/report', reportRoutes);

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy blocked this request.',
    });
  }

  res.status(500).json({
    error: 'Something went wrong. Please try again.',
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Zero Breach backend running on port ${PORT}`);
  console.log('Allowed frontend origins:');

  allowedOrigins.forEach((origin) => {
    console.log(`- ${origin}`);
  });
});