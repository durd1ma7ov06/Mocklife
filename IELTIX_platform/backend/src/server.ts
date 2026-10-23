import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initDb, getDbStatus } from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Health check endpoint with PostgreSQL diagnostics
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MockLife API Backend',
    version: '1.0.0',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Ichki server xatoligi yuz berdi',
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 MockLife Backend running at http://localhost:${PORT}`);
  // Initialize PostgreSQL pool & auto-migrations
  await initDb();
});

