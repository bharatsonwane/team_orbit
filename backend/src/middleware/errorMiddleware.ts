import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HttpError } from '../utils/httpError';

/**
 * 404 Not Found middleware
 * This should be placed after all routes but before the error handler
 */
export const routeNotFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new HttpError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global error middleware
 * This should be the last middleware in the application
 */
export const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // ✅ Comprehensive logging
  logger.error('Global error handler:', {
    statusCode,
    message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // ✅ Prevent double responses
  if (res.headersSent) {
    return next(err);
  }

  // ✅ Clean response - just message (as you suggested)
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};
