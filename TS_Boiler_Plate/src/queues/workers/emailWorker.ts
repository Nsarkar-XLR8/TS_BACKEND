/**
 * Example Worker: Email Worker
 *
 * Processes email jobs from the "email" queue.
 * Uses the existing `registerProcessor` function from the BullMQ infrastructure.
 */
import { registerProcessor } from "../bullmq.js";
import { logger } from "../../config/logger.js";
import type { EmailJobPayload } from "../jobs/emailJob.js";

/**
 * Start the email worker.
 * Call this after BullMQ is initialized in server.ts.
 */
export function startEmailWorker(): void {
    registerProcessor<EmailJobPayload>("email", async (job) => {
        const { to, subject } = job.data;

        logger.info({ jobId: job.id, to, subject }, "Processing email job");

        // ──────────────────────────────────────────────
        // Replace with your actual email sending logic:
        // e.g., await sendEmail({ to, subject, html: job.data.body });
        //
        // For now, this is a placeholder that simulates work:
        await new Promise((resolve) => setTimeout(resolve, 500));
        // ──────────────────────────────────────────────

        logger.info({ jobId: job.id, to }, "Email job processed successfully");
    }, { concurrency: 3 });
}
