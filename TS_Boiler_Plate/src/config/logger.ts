import pino from "pino";
import { trace, context } from "@opentelemetry/api";

const isProd = (process.env.NODE_ENV ?? "development") === "production";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    base: null,
    // Explicitly inject traceId and spanId via mixin
    mixin() {
        const spanContext = trace.getSpanContext(context.active());
        if (!spanContext) return {};
        return {
            traceId: spanContext.traceId,
            spanId: spanContext.spanId,
            traceFlags: spanContext.traceFlags,
        };
    },
    // Better error objects in logs
    serializers: {
        err: pino.stdSerializers.err,
    },
    ...(isProd
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: { colorize: true, translateTime: "SYS:standard", singleLine: false },
            },
        }),
});
