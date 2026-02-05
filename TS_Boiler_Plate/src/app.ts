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

    // 1. SYSTEM SETTINGS
    app.disable("x-powered-by");
    app.set("trust proxy", 1);

    // 2. EXPRESS 5 COMPATIBILITY SHIM (MUST BE FIRST)
    // This allows subsequent middlewares to modify req.query
    app.use((req, _res, next) => {
        const originalQuery = req.query;
        Object.defineProperty(req, "query", {
            value: originalQuery,
            writable: true,
            configurable: true,
            enumerable: true
        });
        next();
    });

    // 3. CORE SECURITY HEADERS
    app.use(helmet());
    app.use(cors({ origin: true, credentials: true })); 
    app.use(hpp());
    app.use(securityHeaders);

    // 4. REQUEST PARSERS (Must be before mongoSanitize to parse body)
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));

    // 5. DATA SANITIZATION
    app.use(mongoSanitize());

    // 6. UTILITIES & PERFORMANCE
    app.use(compression());
    app.use(timeout("15s"));
    app.use(requestId);
    app.use(httpLogger);

    // 7. PUBLIC ROUTES
    app.get("/", (req, res) => {
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "OK",
            requestId: req.requestId ?? null
        });
    });

    // 8. API RATE LIMITING
    app.use("/api", rateLimiter.apiRateLimiter);

    // 9. DOCUMENTATION
    const enableDocs = (process.env.SWAGGER_ENABLED ?? "true") === "true";
    const isProd = (process.env.NODE_ENV ?? "development") === "production";
    if (enableDocs && !isProd) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
        app.get("/api-docs.json", (_req, res) => res.json(openapiSpec));
    }

    // 10. VERSIONED ROUTES
    app.use("/api/v1", router);

    // 11. ERROR HANDLING (MUST BE LAST)
    app.use(notFound);
    app.use(errorHandler);

    return app;
}
