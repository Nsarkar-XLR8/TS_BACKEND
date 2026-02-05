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


const forgotPasswordSchema = z.object({
    body: z.object({ email: z.string().email() }),
})

const resendOtpSchema = z.object({
    body: z.object({ email: z.string().email() }),
})

const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp: z.string().length(6)
    }),
})

const resetPasswordSchema = z.object({
    body: z.object({
        newPassword: z.string().min(6, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(6)
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Error will point to confirmPassword field
    }),
});

export const AuthValidation = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resendOtpSchema,
    verifyOtpSchema,
    resetPasswordSchema
};