import type { Request } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";


function missing(part: "body" | "query" | "params") {
    return AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, "Validation middleware not applied", [
        { path: "server", message: `Missing validated.${part}. Ensure validateRequest() runs before handler.` }
    ]);
}

export function getBody<T>(req: Request): T {
    if (!req.validated || req.validated.body === undefined) throw missing("body");
    return req.validated.body as T;
}

export function getQuery<T>(req: Request): T {
    if (!req.validated || req.validated.query === undefined) throw missing("query");
    return req.validated.query as T;
}

export function getParams<T>(req: Request): T {
    if (!req.validated || req.validated.params === undefined) throw missing("params");
    return req.validated.params as T;
}

