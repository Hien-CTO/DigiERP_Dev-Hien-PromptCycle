import dotenv from 'dotenv';
import app from './app';
import { ServiceRegistry } from './services/service-registry';
import { Logger } from './utils/logger';

/**
 * Load environment variables
 * Priority: .env.local > ../../.env > .env
 */
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env' }); // Load from root .env if exists
dotenv.config({ path: '.env' }); // Fallback to local .env

/**
 * Server configuration
 */
const port = process.env.PORT || 4000;

/**
 * Start server
 */
app.listen(port, () => {
  Logger.info(`🚀 API Gateway is running on port ${port}`);
  Logger.info(`📊 Health check: http://localhost:${port}/health`);
  Logger.info(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
  Logger.info(`🔧 Services registered: ${ServiceRegistry.getAll().map(s => s.name).join(', ')}`);
  
  Logger.info('\n📋 Backend Services Documentation:');
  ServiceRegistry.getAll().forEach(service => {
    Logger.info(`   • ${service.name}: ${service.url}/api/v1/docs`);
  });
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
