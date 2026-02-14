import helmet from "helmet";

const isProd = (process.env.NODE_ENV ?? "development") === "production";

export const securityHeaders = helmet({
    // 1. FIX: Disable COEP to allow the browser to load Tailwind from its CDN
    crossOriginEmbedderPolicy: false,

    // 2. FIX: Re-enable and configure CSP for your status page
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Allow Tailwind CDN script
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
            // Allow Google Fonts and Tailwind CSS
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "fonts.googleapis.com",
                "cdn.tailwindcss.com"
            ],
            // Allow Google Fonts hosting
            fontSrc: ["'self'", "fonts.gstatic.com"],
            // Allow Cloudinary images and data URIs
            imgSrc: ["'self'", "data:", "res.cloudinary.com"],
            upgradeInsecureRequests: isProd ? [] : null,
        },
    },

    // 3. HSTS Configuration
    hsts: isProd
        ? { maxAge: 15552000, includeSubDomains: true, preload: true }
        : false,

    // 4. Privacy
    referrerPolicy: { policy: "no-referrer" },

    // 5. Hardening
    xContentTypeOptions: true,
    dnsPrefetchControl: { allow: false },
});