import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getStripe } from "./stripe.js";
import config from "../config/index.js";
import { logger } from "../config/logger.js";
import type Stripe from "stripe";

/**
 * Stripe webhook handler.
 * Verifies the signature and dispatches events.
 *
 * IMPORTANT: This route MUST use express.raw() — not express.json().
 * It is mounted separately in stripe.route.ts.
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const stripe = getStripe();
    if (!stripe) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ error: "Stripe not configured" });
        return;
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = config.stripe.stripeAdminWebhookSecret;

    if (!sig || !webhookSecret) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing signature or webhook secret" });
        return;
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
        logger.error({ err }, "Stripe webhook signature verification failed");
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid signature" });
        return;
    }

    // ── Dispatch by event type ───────────────────────────────────────
    logger.info({ type: event.type, id: event.id }, "Stripe webhook received");

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            logger.info({ id: paymentIntent.id }, "PaymentIntent succeeded");
            // TODO: Fulfill the order, update DB, send confirmation email
            break;
        }

        case "checkout.session.completed": {
            const session = event.data.object;
            logger.info({ id: session.id }, "Checkout session completed");
            // TODO: Handle checkout completion
            break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
            const subscription = event.data.object;
            logger.info({ id: subscription.id, status: subscription.status }, `Subscription ${event.type}`);
            // TODO: Update subscription status in DB
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object;
            logger.warn({ id: invoice.id }, "Invoice payment failed");
            // TODO: Notify user, retry logic
            break;
        }

        default:
            logger.debug({ type: event.type }, "Unhandled Stripe event type");
    }

    // Always acknowledge receipt
    res.status(200).json({ received: true });
}
