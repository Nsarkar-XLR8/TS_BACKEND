import compression from 'compression';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/globalErrorHandler";
import { requestId } from "./middlewares/requestId";
import { httpLogger } from "./middlewares/httpLogger";
import { rateLimiter } from "./middlewares/rateLimiter";
import { securityHeaders } from "./middlewares/security";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import timeout from "connect-timeout";
import router from './routes';
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./config/swagger";



export function createApp() {
    const app = express();

    app.disable("x-powered-by");

    app.use(hpp());
    app.use(helmet());
    app.use(cors({ origin: true, credentials: true }));
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(securityHeaders);

    app.use((req, _res, next) => {
        Object.defineProperty(req, "query", {
            value: req.query,      // snapshot current query object
            writable: true,
            configurable: true
        });
        next();
    });
    app.use(mongoSanitize);
    app.use(timeout("15s"));


    // request id before routes (so health also returns requestId)
    app.use(requestId);

    app.use(httpLogger);
    app.use("/api", rateLimiter.apiRateLimiter);

    // base API route
    app.use("/api/v1", router);

    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
    app.get("/api/v1/docs.json", (_req, res) => res.json(openapiSpec));



    // Put this BEFORE routes/notFound/errorHandler
    const enableDocs = (process.env.SWAGGER_ENABLED ?? "true") === "true";
    const isProd = (process.env.NODE_ENV ?? "development") === "production";

    if (enableDocs && !isProd) {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
        app.get("/api-docs.json", (_req, res) => res.json(openapiSpec));
    }

    // 404 handler
    app.use(notFound);

    // global error handler (must be last)
    app.use(errorHandler);

    return app;
}
