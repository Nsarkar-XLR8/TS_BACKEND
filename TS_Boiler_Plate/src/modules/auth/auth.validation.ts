import { z } from "zod";

const registerSchema = z.object({
    body: z.object({
        firstName: z.string().min(2).max(50),
        lastName: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        avatar: z.string().url().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

const verifyEmailSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp: z.string().length(6, "OTP must be exactly 6 digits"),
    }),
});

export const AuthValidation = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
};