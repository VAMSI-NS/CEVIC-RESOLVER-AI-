import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config/env';
import complaintRoutes from '../routes/complaintRoutes';
import dashboardRoutes from '../routes/dashboardRoutes';
import authRoutes from '../routes/authRoutes';
import { isConnectedToPostgres } from '../database/db';

const app = express();

// ============================================================
// Middleware Configuration
// ============================================================

// CORS configuration (supports localhost, Vercel frontend, or wildcard in dev)
const corsOptions: cors.CorsOptions = {
  origin: config.corsOrigin === '*' 
    ? true 
    : (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (config.corsOrigin === '*' || origin === config.corsOrigin || origin.includes('localhost') || origin.includes('vercel.app')) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev to avoid CORS blocking
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// API Routes
// ============================================================

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    database: isConnectedToPostgres() ? 'PostgreSQL (Connected)' : 'Local SQL Persistence',
    uptime: process.uptime(),
  });
});

// Mount resource routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root test route
app.get('/', (_req: Request, res: Response) => {
  res.send('CivicResolve AI Backend API is running. Check /api/health');
});

// 404 Catch-All for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[App] Unhandled exception:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
});

export default app;