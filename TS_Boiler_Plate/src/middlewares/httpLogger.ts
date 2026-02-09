import { logger } from './../config/logger';
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";


export const httpLogger = pinoHttp({
    logger,

    genReqId: (req, res) => {
        const headerId = req.headers["x-request-id"];
        const incoming = Array.isArray(headerId) ? headerId[0] : headerId;

        // Prefer already-attached requestId (from your requestId middleware)
        const existing = (req as any).requestId as string | undefined;

        const id = (typeof incoming === "string" && incoming.length > 0)
            ? incoming
            : (typeof existing === "string" && existing.length > 0)
                ? existing
                : randomUUID();

        (req as any).requestId = id;
        res.setHeader("x-request-id", id);
        return id;
    },

    customProps: (req) => ({
        requestId: (req as any).requestId,
    }),

    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                requestId: (req as any).requestId,
            };
        },
        res(res) {
            return { statusCode: res.statusCode };
        },
    },
});
