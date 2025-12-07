const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const streamersRouter = require('./routes/streamers');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// STATIC FILES - Serve frontend
// ========================================
app.use(express.static(path.join(__dirname, '..')));

// ========================================
// API ROUTES
// ========================================
app.use('/api/streamers', streamersRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ========================================
// SERVE INDEX.HTML FOR ALL OTHER ROUTES
// ========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🌟 Streamer Tracker Backend Server 🌟');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log('='.repeat(50));
  console.log('\n💡 To test the API:');
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Get streamers: http://localhost:${PORT}/api/streamers`);
  console.log('\n📝 Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});
