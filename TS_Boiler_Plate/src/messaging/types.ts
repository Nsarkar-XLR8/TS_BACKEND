export type BusKind = "job" | "event" | "command" | "audit";
export type BusTransport = "bullmq" | "kafka" | "rabbitmq";

export type BusEvent<T = Record<string, unknown>> = {
    name: string;
    payload: T;
    kind: BusKind;
    requestId?: string;
    idempotencyKey?: string;
};

export type PublishOptions = {
    transport?: BusTransport;
    delayMs?: number;
    retries?: number;
};

export type SubscribeHandler = (payload: Record<string, unknown>) => Promise<void> | void;

export type BusCapabilities = {
    bullmq: boolean;
    kafka: boolean;
    rabbitmq: boolean;
};
