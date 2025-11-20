/**
 * Simple logger utility
 * Can be extended to use Winston, Pino, or other logging libraries
 */
export class Logger {
  /**
   * Log info message
   */
  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  /**
   * Log error message
   */
  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }

  /**
   * Log warning message
   */
  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  /**
   * Log debug message (only in development)
   */
  static debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  /**
   * Log HTTP request
   */
  static http(method: string, url: string, statusCode?: number) {
    const status = statusCode ? `[${statusCode}]` : '';
    console.log(`[HTTP] ${new Date().toISOString()} - ${method} ${url} ${status}`);
  }
}

