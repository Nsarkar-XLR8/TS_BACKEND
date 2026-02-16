import compression from "compression";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import timeout from "connect-timeout";
import swaggerUi from "swagger-ui-express";
import { mongoSanitize } from "./middlewares/mongoSanitize.js";
import router from "./routes/index.js";
import { openapiSpec } from "./config/swagger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/globalErrorHandler.js";
import { requestId } from "./middlewares/requestId.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { securityHeaders } from "./middlewares/security.js";
import { metricsHandler, metricsMiddleware } from "./observability/metrics.js";


export function createApp() {
    const app = express();
    const trustProxy = process.env.TRUST_PROXY === 'true';

    // 1. SYSTEM SETTINGS
    app.disable("x-powered-by");
    app.set('trust proxy', trustProxy);

    // 2. OBSERVABILITY & IDENTIFICATION (MOVED FROM 6 TO TOP)
    app.use(requestId);
    app.use(metricsMiddleware);
    app.use(httpLogger);

    // 3. EXPRESS 5 COMPATIBILITY SHIM 
    app.use((req, _res, next) => {
        const descriptor = Object.getOwnPropertyDescriptor(req, "query");
        if (descriptor?.writable === false) {
            const originalQuery = req.query;
            Object.defineProperty(req, "query", {
                value: originalQuery,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        next();
    });

    // 4. SECURITY & TRAFFIC CONTROL
    app.use(helmet());
    app.use(cors({ origin: true, credentials: true, exposedHeaders: ["x-request-id"] }));
    app.use(hpp());
    app.use(securityHeaders);
    app.use("/api", rateLimiter.apiRateLimiter); // Protects the parsers below

    // 5. UTILITIES & PERFORMANCE
    app.use(compression());
    app.use(timeout("15s"));

    // 6. REQUEST PARSERS
    app.use(express.json({ limit: "50kb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));

    // 7. DATA SANITIZATION
    app.use(mongoSanitize);

    // 8. TELEMETRY & PUBLIC ROUTES
    app.get("/metrics", metricsHandler);

    // 9. DOCUMENTATION
    const enableDocs = (process.env.SWAGGER_ENABLED ?? "true") === "true";
    const isProd = (process.env.NODE_ENV ?? "development") === "production";
    if (enableDocs && !isProd) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
        app.get("/api-docs.json", (_req, res) => res.json(openapiSpec));
    }

    // 10. VERSIONED ROUTES
    app.use("/api/v1", router);

    // 11. ERROR HANDLING
    app.use(notFound);
    app.use(errorHandler);

    return app;
}
