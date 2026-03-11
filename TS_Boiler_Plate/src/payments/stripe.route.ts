import { Router } from "express";
import express from "express";
import { handleStripeWebhook } from "./stripe.webhook.js";

const router = Router();

/**
 * Stripe webhooks require the RAW body for signature verification.
 * This route uses express.raw() instead of express.json().
 */
router.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

export const stripeWebhookRouter = router;
