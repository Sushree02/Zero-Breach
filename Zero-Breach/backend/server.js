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
// CORS
// --------------------------------------------------
// Zero Breach is a public, no-login application.
// We allow requests from any frontend origin.
// This avoids problems with changing Vercel preview URLs.

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
// ROOT ROUTE
// --------------------------------------------------

app.get('/', (req, res) => {
  res.json({
    service: 'Zero Breach Backend',
    status: 'running',
  });
});

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
// INVESTIGATION ROUTES
// --------------------------------------------------

app.use('/api/investigate', investigateRoutes);

// --------------------------------------------------
// REPORT ROUTES
// --------------------------------------------------

app.use('/api/report', reportRoutes);

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);

  res.status(500).json({
    error: 'Something went wrong. Please try again.',
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Zero Breach backend running on port ${PORT}`);
});