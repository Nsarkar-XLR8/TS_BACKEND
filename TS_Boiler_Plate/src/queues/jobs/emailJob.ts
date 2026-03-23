/**
 * Example Job Producer: Email Queue
 *
 * Demonstrates how to enqueue email-sending jobs via BullMQ.
 * Uses the existing `enqueueJob` function from the BullMQ infrastructure.
 */
import { enqueueJob } from "../bullmq.js";
import { logger } from "../../config/logger.js";

export interface EmailJobPayload {
    to: string;
    subject: string;
    body: string;
    templateId?: string;
}

/**
 * Add an email-sending job to the queue.
 * Returns true if enqueued, false if BullMQ is disabled.
 */
export async function addEmailJob(payload: EmailJobPayload): Promise<boolean> {
    const success = await enqueueJob<EmailJobPayload>("email", "send-email", payload, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000, // 2s, 4s, 8s
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
    });

    if (success) {
        logger.debug({ to: payload.to, subject: payload.subject }, "Email job enqueued");
    }

    return success;
}
