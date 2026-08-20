import app from './app';
import { config } from '../config/env';
import { initDatabase, isConnectedToPostgres } from '../database/db';

async function startServer() {
  try {
    console.log('----------------------------------------------------');
    console.log('   CivicResolve AI - Backend Server Starting        ');
    console.log('----------------------------------------------------');

    // Initialize Database connection and schema
    await initDatabase();

    const server = app.listen(config.port, () => {
      const dbType = isConnectedToPostgres() ? 'PostgreSQL (Live Pool)' : 'Local SQL Persistent Storage';
      console.log(`[Server] ? Listening on http://localhost:${config.port}`);
      console.log(`[Server] ? Database: ${dbType}`);
      console.log(`[Server] ? Health check: http://localhost:${config.port}/api/health`);
      console.log(`[Server] ? Complaints API: http://localhost:${config.port}/api/complaints`);
      console.log(`[Server] ? Dashboard API: http://localhost:${config.port}/api/dashboard/stats`);
      console.log('----------------------------------------------------');
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  }
}

startServer();