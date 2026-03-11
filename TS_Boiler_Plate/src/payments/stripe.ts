import Stripe from "stripe";
import config from "../config/index.js";
import { logger } from "../config/logger.js";

let stripe: Stripe | null = null;

/**
 * Lazily initialise the Stripe SDK.
 * Returns null if STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe | null {
    if (stripe) return stripe;

    const key = config.stripe.stripeSecretKey;
    if (!key) {
        logger.debug("Stripe SDK not initialised — STRIPE_SECRET_KEY not set");
        return null;
    }

    stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
    return stripe;
}

export { Stripe };
