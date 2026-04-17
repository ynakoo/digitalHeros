require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/charities', require('./routes/charities'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/winners', require('./routes/winners'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown — disconnect Prisma
const server = app.listen(PORT, () => {
  console.log(`🚀 GolfGives server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
