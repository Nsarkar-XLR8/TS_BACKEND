import type { RequestHandler } from "express";

function sanitize(input: unknown): void {
    if (!input || typeof input !== "object") return;

    // Arrays: sanitize each element
    if (Array.isArray(input)) {
        for (const v of input) sanitize(v);
        return;
    }

    // Objects
    const obj = input as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
        // Block Mongo operators & dot-notation injection
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }
        sanitize(obj[key]);
    }
}

export const mongoSanitize: RequestHandler = (req, _res, next) => {
    sanitize(req.body);
    sanitize(req.params);
    // Express 5: req.query is a getter but the returned object is still mutable;
    // we avoid re-assigning req.query, only mutate/delete keys.
    sanitize(req.query as unknown);
    next();
};
