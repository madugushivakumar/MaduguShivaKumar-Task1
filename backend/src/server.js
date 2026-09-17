const app = require('./app');
const { env } = require('./config/env.config');
const { checkConnection, closePool } = require('./config/db.config');

const server = app.listen(env.PORT, async () => {
  console.log(`==================================================`);
  console.log(`🚀 Joineazy Backend API Server Started`);
  console.log(`📍 Environment : ${env.NODE_ENV}`);
  console.log(`🌐 URL         : http://localhost:${env.PORT}`);
  console.log(`🩺 Health API  : http://localhost:${env.PORT}/api/health`);
  console.log(`==================================================`);

  // Initial PostgreSQL connection verification
  const isDbConnected = await checkConnection();
  if (isDbConnected) {
    console.log('✅ PostgreSQL database connection established successfully.');
  } else {
    console.warn(
      '⚠️  PostgreSQL connection pending or offline. (Will retry on queries or when DB container starts).'
    );
  }
});

// Server listen error handler (e.g. EADDRINUSE)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ [Server Error] Port ${env.PORT} is already in use by another process.`);
    console.error(`👉 To free port ${env.PORT} on Windows PowerShell, run:`);
    console.error(`   Get-NetTCPConnection -LocalPort ${env.PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  } else {
    console.error('[Server] Fatal server error:', error);
    process.exit(1);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await closePool();
    } catch (err) {
      console.error('[Server] Error closing database pool:', err.message);
    }
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception thrown:', error);
  process.exit(1);
});
