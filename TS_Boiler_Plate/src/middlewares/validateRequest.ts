import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';
import catchAsync from '../utils/catchAsync.js';

/**
 * ELITE MIDDLEWARE:
 * Matches the schema structure { body, query, params } directly 
 * against the Express request object.
 */
const validateRequest = (schema: ZodObject) => {
    return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Attach parsed data to req.validated for type-safe access in controllers
        req.validated = {
            body: parsed.body,
            query: parsed.query,
            params: parsed.params,
        };

        next();
    });
};

export default validateRequest;





