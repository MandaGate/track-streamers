const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const streamersRouter = require('./routes/streamers');

const app = express();
const PORT = process.env.PORT || 3000;
const whitelist = ['streamers_coins_client.youmrabti.com'];

// ========================================
// MIDDLEWARE
// ========================================
// CORS configuration - Allow all localhost ports (for Angular dev server on 4200, etc.)
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            const parsedUrl = new URL(`${origin}`);

            // Allow any localhost or 127.0.0.1 on any port
            if (
                whitelist.includes(parsedUrl.hostname) ||
                origin.match(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)
            ) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);
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
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
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
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
