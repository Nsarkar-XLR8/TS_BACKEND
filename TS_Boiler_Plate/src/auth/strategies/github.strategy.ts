import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import config from "../../config/index.js";
import { User } from "../../modules/user/user.model.js";
import { logger } from "../../config/logger.js";
import type { VerifyCallback } from "passport-oauth2";

export const getGithubStrategy = () => new GitHubStrategy(
    {
        clientID: config.oauth.githubClientId ?? "",
        clientSecret: config.oauth.githubClientSecret ?? "",
        callbackURL: config.oauth.githubCallbackUrl ?? "/api/v1/auth/github/callback",
        scope: ["user:email"],
    },
    async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error("No email found in GitHub profile"), undefined);
            }

            let user = await User.findOne({ email }).lean();

            user ??= (await User.create({
                firstName: profile.displayName?.split(" ")[0] ?? "GitHub",
                lastName: profile.displayName?.split(" ").slice(1).join(" ") ?? "User",
                email,
                password: `oauth_${Date.now()}_${Math.random().toString(36)}`,
                isVerified: true,
                avatar: profile.photos?.[0]?.value,
            })).toObject();

            return done(null, user);
        } catch (err) {
            logger.error({ err }, "GitHub OAuth error");
            return done(err as Error, undefined);
        }
    }
);
