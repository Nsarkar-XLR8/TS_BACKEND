/* eslint-disable @typescript-eslint/no-explicit-any */
// src/observability/metrics.ts
import type { Request, Response, NextFunction } from "express";
import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Node/process metrics :contentReference[oaicite:1]{index=1}

/**
 * Histogram is the right choice for latency percentiles in Prometheus.
 * Prometheus computes p95/p99 via histogram_quantile() over _bucket series. :contentReference[oaicite:2]{index=2}
 */
export const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    registers: [register],
    labelNames: ["method", "route", "status_code"] as const,
    // Tune buckets to your SLOs; these are reasonable defaults for APIs
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
});

export const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    registers: [register],
    labelNames: ["method", "route", "status_code"] as const,
});

export const httpErrorsTotal = new client.Counter({
    name: "http_errors_total",
    help: "Total number of HTTP error responses",
    registers: [register],
    labelNames: ["method", "route", "status_code"] as const,
});

export const httpRequestsInFlight = new client.Gauge({
    name: "http_requests_in_flight",
    help: "Number of HTTP requests currently being processed",
    registers: [register],
    labelNames: ["method", "route"] as const,
});

/**
 * IMPORTANT: keep labels LOW cardinality.
 * DO NOT use req.originalUrl or userId as labels.
 */
function getRouteLabel(req: Request): string {
    // If a route matched, Express populates req.route inside route handlers.
    // For middleware, it may be undefined; fall back to a safe label.
    const routePath = (req as any).route?.path;
    const baseUrl = req.baseUrl || "";
    if (routePath) return `${baseUrl}${routePath}`;
    return "unmatched";
}


/**
 * NOTE: We compute route label at finish-time, not at request-start time.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const end = httpRequestDurationSeconds.startTimer();

    // inflight: use a temporary label to avoid cardinality + allow dec() symmetry
    httpRequestsInFlight.inc({ method: req.method, route: "pending" });

    res.on("finish", () => {
        const route = getRouteLabel(req);
        const status_code = String(res.statusCode);

        const common = { method: req.method, route };
        const labels = { ...common, status_code };

        end(labels);
        httpRequestsTotal.inc(labels);
        if (res.statusCode >= 400) httpErrorsTotal.inc(labels);

        httpRequestsInFlight.dec({ method: req.method, route: "pending" });
    });

    next();
}

export async function metricsHandler(_req: Request, res: Response) {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
}