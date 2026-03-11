import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../../config/index.js";
import { User } from "../../modules/user/user.model.js";
import { logger } from "../../config/logger.js";

export const getGoogleStrategy = () => new GoogleStrategy(
    {
        clientID: config.oauth.googleClientId ?? "",
        clientSecret: config.oauth.googleClientSecret ?? "",
        callbackURL: config.oauth.googleCallbackUrl ?? "/api/v1/auth/google/callback",
        scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error("No email found in Google profile"), undefined);
            }

            // Find or create user
            let user = await User.findOne({ email }).lean();

            user ??= (await User.create({
                firstName: profile.name?.givenName ?? "Google",
                lastName: profile.name?.familyName ?? "User",
                email,
                password: `oauth_${Date.now()}_${Math.random().toString(36)}`, // Placeholder
                isVerified: true,
                avatar: profile.photos?.[0]?.value,
            })).toObject();

            return done(null, user);
        } catch (err) {
            logger.error({ err }, "Google OAuth error");
            return done(err as Error, undefined);
        }
    }
);
