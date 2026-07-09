
import type { Request, Response, NextFunction } from 'express';
import  {type ZodType, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type RequestPart = 'body' | 'query' | 'params';


export const validate = (
  schema : ZodType,
  part   : RequestPart = 'body',
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {

      const parsed = schema.parse(req[part]);
      req[part]    = parsed;

      next();

    } catch (err) {
      if (err instanceof ZodError) {

        // Format Zod errors into readable messages
        const errors = err.issues.map((e) => ({
          field  : e.path.join('.'),
          message: e.message,
        }));

        next(
          new ApiError(
            400,
            `Validation failed: ${errors.map((e) => `${e.field} — ${e.message}`).join(' | ')}`
          )
        );
        return;
      }
      next(err);
    }
  };
};