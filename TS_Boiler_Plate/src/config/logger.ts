import pino from "pino";

const isProd = (process.env.NODE_ENV ?? "development") === "production";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    base: null,
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
