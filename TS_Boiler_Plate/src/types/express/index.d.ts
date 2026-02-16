/* eslint-disable @typescript-eslint/no-explicit-any */
import "express";
import "jsonwebtoken";

declare global {
    namespace Express {
        /**
         * Authenticated user payload attached by Auth() middleware.
         * Keep this aligned with what you sign into JWT.
         */
        interface AuthUser extends Jwt.JwtPayload {
            userId: string;
            role: string;
        }

        interface Request {
            requestId?: string;


            user?: {
                userId: string;
                role: UserRole;
                iat?: number;
                exp?: number;
            };

            validated?: {
                body?: any;
                query?: any;
                params?: any;
            };
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: "development" | "test" | "production";
            PORT?: string;

            /**
             * Required in any environment where Auth() is used.
             * If you want to boot without auth in early dev, make this optional.
             */
            JWT_SECRET: string;

            // Optional but typical additions (add as you introduce them):
            // MONGODB_URL?: string;
            // JWT_EXPIRES_IN?: string;
            // JWT_REFRESH_TOKEN_SECRET?: string;
            // JWT_REFRESH_EXPIRES_IN?: string;
            // CLOUDINARY_CLOUD_NAME?: string;
            // CLOUDINARY_API_KEY?: string;
            // CLOUDINARY_API_SECRET?: string;
        }
    }
}

export { };
