import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import { generalRateLimit } from './middleware/rate-limit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import routes from './routes';
import { ServiceRegistry } from './services/service-registry';
import { ProxyService } from './services/proxy.service';
import { Logger } from './utils/logger';

/**
 * Initialize services
 */
Logger.info('Initializing services...');
ServiceRegistry.initialize();
ProxyService.initialize();
Logger.info('Services initialized successfully');

/**
 * Create Express application
 */
const app = express();

/**
 * Middleware setup
 */
// Configure helmet to allow static files (images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3001", "http://localhost:4000"],
    },
  },
})); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true' || process.env.CORS_CREDENTIALS !== 'false',
}));
app.use(compression()); // Gzip compression
app.use(morgan('combined')); // HTTP request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting - exclude static files
app.use((req, res, next) => {
  // Skip rate limiting for static files
  if (req.path.startsWith('/uploads/')) {
    return next();
  }
  // Apply rate limiting for other routes
  generalRateLimit(req, res, next);
});

/**
 * Swagger API Documentation
 */
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DigiERP API Gateway Documentation',
  customfavIcon: '/favicon.ico',
}));

/**
 * Mount all routes
 */
app.use('/', routes);

/**
 * 404 handler - must be after all routes
 */
app.use('*', notFoundHandler);

/**
 * Global error handler - must be last
 */
app.use(errorHandler);

export default app;

