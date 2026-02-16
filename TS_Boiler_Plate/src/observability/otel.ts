// src/observability/otel.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const traceExporter = new OTLPTraceExporter({
    // You can set this via env too (recommended)
    // url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
});

export const otelSdk = new NodeSDK({
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // optional fine-tuning
        }),
    ],
});

// Start ASAP before importing express/http stuff
otelSdk.start();

export default otelSdk;