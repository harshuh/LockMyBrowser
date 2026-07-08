
import type { Request, Response, NextFunction } from 'express';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env }         from '../envs/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, err.message)
    );
    return;
  }

  console.error('Unexpected error:', err); // to view err in consolee

  res.status(500).json(
    new ApiResponse(
      500,
      env.NODE_ENV === 'production'  
      ? 'Something went wrong :/'     // hide details in production
        : err.message,                // show details in dev
    )
  );
};