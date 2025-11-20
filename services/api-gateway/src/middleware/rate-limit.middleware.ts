import rateLimit from 'express-rate-limit';

export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      message: message || 'Rate limit exceeded. Please try again later.',
      timestamp: new Date(),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiting
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Report endpoints rate limiting
export const reportRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20, // limit each IP to 20 requests per windowMs
  'Too many report requests, please try again later.'
);
