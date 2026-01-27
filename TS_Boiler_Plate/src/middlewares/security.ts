import helmet from "helmet";

const isProd = (process.env.NODE_ENV ?? "development") === "production";

export const securityHeaders = helmet({
    // CSP is mainly for browser-rendered pages; for pure APIs it can be disabled
    contentSecurityPolicy: false,

    // In production, you can enable HSTS if you are always HTTPS
    hsts: isProd
        ? { maxAge: 15552000, includeSubDomains: true, preload: true } // ~180 days
        : false,

    // Reasonable hardening
    referrerPolicy: { policy: "no-referrer" }
});
