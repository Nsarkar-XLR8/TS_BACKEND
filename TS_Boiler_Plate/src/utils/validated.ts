import type { Request } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";

/**
 * ELITE UTILITIES: Validation Accessors
 *
 * These helpers provide type-safe access to data that has been processed by
 * the `validateRequest` middleware. They ensure that controllers don't
 * accidentally access unvalidated or raw request data.
 */

/**
 * Internal helper to throw a developer-centric error if validation was bypassed.
 */
function throwDeveloperError(part: string): never {
    throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, "Validation middleware missing", [
        {
            path: "server",
            message: `Attempted to access validated ${part}, but validateRequest() was not applied to this route.`
        }
    ]);
}

/**
 * Extracts the validated body from the request.
 * Ensure you pass the expected type as a generic.
 *
 * @example const { email } = getBody<LoginDTO>(req);
 */
export function getBody<T>(req: Request): T {
    if (!req.validated) throwDeveloperError("body");
    return req.validated.body as T;
}

/**
 * Extracts the validated query parameters from the request.
 */
export function getQuery<T>(req: Request): T {
    if (!req.validated) throwDeveloperError("query");
    return req.validated.query as T;
}

/**
 * Extracts the validated URL parameters from the request.
 */
export function getParams<T>(req: Request): T {
    if (!req.validated) throwDeveloperError("params");
    return req.validated.params as T;
}
