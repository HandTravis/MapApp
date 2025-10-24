import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase, closeDatabase } from './lib/db';
import { healthHandler, readyHandler } from './health';
import { createPin, getNearbyPins } from './routes/pins';
import { searchPOIs } from './routes/search';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health endpoints
app.get('/healthz', healthHandler);
app.get('/readyz', readyHandler);

// API routes
app.post('/pins', createPin);
app.get('/pins', getNearbyPins);
app.get('/search', searchPOIs);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/healthz`);
      console.log(`Ready check: http://localhost:${port}/readyz`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
