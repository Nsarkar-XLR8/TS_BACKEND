import compression from "compression";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import timeout from "connect-timeout";
import swaggerUi from "swagger-ui-express";
import mongoSanitize from "express-mongo-sanitize";

import router from "./routes";
import { openapiSpec } from "./config/swagger";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/globalErrorHandler";
import { requestId } from "./middlewares/requestId";
import { httpLogger } from "./middlewares/httpLogger";
import { rateLimiter } from "./middlewares/rateLimiter";
import { securityHeaders } from "./middlewares/security";

export function createApp() {
    const app = express();

    app.disable("x-powered-by");
    app.set("trust proxy", 1);

    app.use(hpp());
    app.use(helmet());
    app.use(cors({ origin: true, credentials: true })); // TODO: whitelist in prod
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    app.use(securityHeaders);

    // Express 5 compat shim for express-mongo-sanitize (workaround)
    app.use((req, _res, next) => {
        Object.defineProperty(req, "query", {
            value: req.query,
            writable: true,
            configurable: true
        });
        next();
    });

    // ✅ MUST CALL IT
    app.use(mongoSanitize());

    // If you keep connect-timeout, halt timed out requests
    app.use(timeout("15s"));
    app.use((req, _res, next) => {
        if ((req as any).timedout) return;
        next();
    });

    app.use(requestId);
    app.use(httpLogger);

    // Optional: root route so "/" doesn't look broken
    app.get("/", (req, res) => {
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "OK",
            requestId: req.requestId ?? null
        });
    });

    app.use("/api", rateLimiter.apiRateLimiter);

    // Swagger: choose ONE location
    const enableDocs = (process.env.SWAGGER_ENABLED ?? "true") === "true";
    const isProd = (process.env.NODE_ENV ?? "development") === "production";
    if (enableDocs && !isProd) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
        app.get("/api-docs.json", (_req, res) => res.json(openapiSpec));
    }

    app.use("/api/v1", router);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
