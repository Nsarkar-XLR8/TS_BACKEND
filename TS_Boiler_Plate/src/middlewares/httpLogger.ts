import pinoHttp from "pino-http";
import logger from '../config/logger';


export const httpLogger = pinoHttp({
    logger,

    // Put requestId into every log line
    genReqId: (req, res) => {
        const headerId = req.headers["x-request-id"];
        const id = (Array.isArray(headerId) ? headerId[0] : headerId) ?? (req as any).requestId;
        if (typeof id === "string" && id.length > 0) {
            res.setHeader("x-request-id", id);
            return id;
        }
        return undefined as any; // pino-http will fallback internally if undefined
    },

    customProps: (req) => ({
        requestId: (req as any).requestId
    }),

    serializers: {
        req(req) {
            return { method: req.method, url: req.url, requestId: (req as any).requestId };
        },
        res(res) {
            return { statusCode: res.statusCode };
        }
    }
});
