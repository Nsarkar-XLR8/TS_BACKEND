import { z } from "zod";
import dotenv from "dotenv";


dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    MONGODB_URL: z.string().min(1),

    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),

    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
    JWT_REFRESH_TOKEN_SECRET: z.string().min(1),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1),

    EMAIL_ADDRESS: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),

    RESET_PASSWORD_TOKEN_SECRET: z.string().optional(),
    RESET_EXPIRES_IN: z.string().optional(),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    AES_KEY: z.string().optional(),
    AES_IV: z.string().optional(),

    RESET_PASSWORD_URL: z.string().optional(),
    FRONT_END_URL: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_ADMIN_SECRET: z.string().optional(),
    STRIPE_WEBHOOK_ADMIN_URL: z.string().optional(),

    STRIPE_ONBOARDING_SECRET_KEY: z.string().optional(),
    STRIPE_ONBOARDING_WEBHOOK_URL: z.string().optional()
});

const env = envSchema.parse(process.env);

const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,

    mongodbUrl: env.MONGODB_URL,

    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,

    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        jwtAccesSecret: env.JWT_SECRET,
        jwtExpiresIn: env.JWT_EXPIRES_IN,
        refreshSecret: env.JWT_REFRESH_TOKEN_SECRET,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
    },

    email: {
        emailAddress: env.EMAIL_ADDRESS,
        emailPass: env.EMAIL_PASSWORD,
        adminEmail: env.ADMIN_EMAIL
    },

    reset: {
        tokenSecret: env.RESET_PASSWORD_TOKEN_SECRET,
        expiresIn: env.RESET_EXPIRES_IN
    },

    cloudinary: {
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET
    },

    security: {
        AES_KEY: env.AES_KEY,
        AES_IV: env.AES_IV
    },

    frontend: {
        resetPasswordUrl: env.RESET_PASSWORD_URL,
        url: env.FRONT_END_URL,
    },

    stripe: {
        stripeSecretKey: env.STRIPE_SECRET_KEY,
        stripeAdminWebhookSecret: env.STRIPE_WEBHOOK_ADMIN_SECRET,
        stripeAdminWebhookUrl: env.STRIPE_WEBHOOK_ADMIN_URL,
        stripeOnboardWebhookSecret: env.STRIPE_ONBOARDING_SECRET_KEY,
        stripeOnboardWebhookUrl: env.STRIPE_ONBOARDING_WEBHOOK_URL
    },

    logger: {
        level: env.NODE_ENV === "production" ? "info" : "debug"
    },
     swagger_enabled: true,
};

export default config;
