import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../../modules/user/user.model.js";

/**
 * Local strategy wrapping the existing User.isPasswordMatch.
 * Used as an alternative to the JWT-based login.
 */
export const localStrategy = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email }).select("+password");

            if (!user) {
                return done(null, false, { message: "User not found" });
            }

            if (!user.isVerified) {
                return done(null, false, { message: "Email not verified" });
            }

            const isMatch = await User.isPasswordMatch(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Invalid credentials" });
            }

            return done(null, user.toObject());
        } catch (err) {
            return done(err);
        }
    }
);
