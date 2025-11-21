import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import generateRoute from './api/routes/generate.js';
import generateContinuationRoute from './api/routes/generateContinuation.js';
import generatePlusRoute from './api/routes/generate.plus.js';
import generateNewContRoute from './api/routes/generate.newcont.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration - restrict in production for security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (direct browser access, mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In production, restrict to allowed origins
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.ALLOWED_ORIGIN, // Set this in App Platform: https://your-app-name.ondigitalocean.app
        // Allow DigitalOcean App Platform domains (wildcard pattern)
        /^https:\/\/.*\.ondigitalocean\.app$/,
        /^https:\/\/.*\.ondigitalocean\.app\/?$/
      ].filter(Boolean);
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        // Log for debugging (remove in production if too verbose)
        console.log(`[CORS] Blocked origin: ${origin}, Allowed: ${JSON.stringify(allowedOrigins)}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow all origins
      callback(null, true);
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// API Routes (before static files)
app.use('/api', generateRoute);
app.use('/api', generateContinuationRoute);
app.use('/api', generatePlusRoute);
app.use('/api', generateNewContRoute);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Catch all handler - send React app for any route not handled above
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log(`Serving React app from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Verify build directory exists before starting server
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

if (!fs.existsSync(buildDir) || !fs.existsSync(indexPath)) {
  console.error('ERROR: Build directory not found!');
  console.error(`Expected build directory: ${buildDir}`);
  console.error(`Expected index.html at: ${indexPath}`);
  console.error('');
  console.error('This usually means:');
  console.error('1. The React build step failed during deployment');
  console.error('2. Check Build Logs in DigitalOcean App Platform');
  console.error('3. Ensure "npm run build" completes successfully');
  console.error('');
  console.error('Server will start but will return errors for frontend requests.');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Build directory: ${buildDir}`);
  if (fs.existsSync(indexPath)) {
    console.log('✓ Build directory found - frontend ready');
  } else {
    console.log('✗ Build directory missing - frontend will not work');
  }
});