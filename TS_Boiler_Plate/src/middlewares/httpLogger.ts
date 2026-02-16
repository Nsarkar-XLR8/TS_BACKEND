/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from './../config/logger.js';
import pino from "pino-http";
import { randomUUID } from "node:crypto";

const pinoHttp = (pino as any).default || pino;

export const httpLogger = pinoHttp({
    logger,

    genReqId: (req: any, res: any) => {
        const headerId = req.headers["x-request-id"];
        const incoming = Array.isArray(headerId) ? headerId[0] : headerId;

        // Prefer already-attached requestId (from your requestId middleware)
        const existing = req.requestId as string | undefined;

        let id: string;
        if (typeof incoming === "string" && incoming.length > 0) {
            id = incoming;
        } else if (typeof existing === "string" && existing.length > 0) {
            id = existing;
        } else {
            id = randomUUID();
        }

        req.requestId = id;
        res.setHeader("x-request-id", id);
        return id;
    },

    customProps: (req: any) => ({
        requestId: req.requestId,
        userId: req.user?.userId || req.user?._id,
    }),

    serializers: {
        req(req: any) {
            return {
                method: req.method,
                url: req.url,
                requestId: req.requestId,
                contentLength: req.headers["content-length"],
            };
        },
        res(res: any) {
            return { statusCode: res.statusCode };
        },
    },
});
