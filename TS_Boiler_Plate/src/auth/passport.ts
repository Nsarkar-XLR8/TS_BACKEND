import passport from "passport";
import { getGoogleStrategy } from "./strategies/google.strategy.js";

import config from "../config/index.js";
import { logger } from "../config/logger.js";
import { localStrategy } from "./strategies/local.strategy.js";
import { getGithubStrategy } from "./strategies/github.strategy.js";

/**
 * Initialise Passport with available strategies.
 * Strategies are only registered if their env vars are set.
 */
export function initPassport(): void {
    // Always register local strategy
    passport.use(localStrategy);
    logger.info("📋 Passport local strategy registered");

    // Google OAuth (if configured)
    if (config.oauth.googleClientId && config.oauth.googleClientSecret) {
        passport.use(getGoogleStrategy());
        logger.info("📋 Passport Google OAuth strategy registered");
    }

    // GitHub OAuth (if configured)
    if (config.oauth.githubClientId && config.oauth.githubClientSecret) {
        passport.use(getGithubStrategy());
        logger.info("📋 Passport GitHub OAuth strategy registered");
    }
}

export { default as passport } from "passport";
