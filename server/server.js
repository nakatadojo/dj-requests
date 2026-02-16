import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize database (this runs schema)
import './db/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import requestsRoutes from './routes/requests.js';
import blocklistRoutes from './routes/blocklist.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import WebSocket
import { initWebSocket } from './websocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - MUST come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/blocklist', blocklistRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // Only serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(clientBuildPath, 'index.html'));
  });
}

// Error handling - MUST come after all routes
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`\n🎵 DJ Request App Server`);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ WebSocket ready at ws://localhost:${PORT}/ws\n`);
});

export default app;
