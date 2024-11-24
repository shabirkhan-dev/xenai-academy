//------------------------------------------------
// CUSTOM ERROR HANDLING
//------------------------------------------------

import type { NextFunction, Request, Response } from 'express';

interface ErrorResponse {
  message: string;
  stack?: string;
  status?: number;
  code?: string;
}

class AppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Resource not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const statusCode = 'status' in err ? err.status : res.statusCode !== 200 ? res.statusCode : 500;

  console.error({
    message: err.message,
    stack: err.stack,
    status: statusCode,
    ...(process.env.NODE_ENV !== 'production' && {
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
      },
    }),
  });

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
    }),
    ...('code' in err && {
      code: err.code,
    }),
    status: statusCode,
  });
}

export type { ErrorResponse };




