require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const investigateRoutes = require('./routes/investigate');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '1mb' }));

// Basic rate limiting to protect the free-tier API keys the app depends on
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'zero-breach-backend' });
});

app.use('/api/investigate', investigateRoutes);
app.use('/api/report', reportRoutes);

// Fallback error handler - never leak raw errors to the client
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Zero Breach backend running on http://localhost:${PORT}`);
});
