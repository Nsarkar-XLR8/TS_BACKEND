import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";
import AppError from "../../errors/AppError";


const loginUser = catchAsync(async (req, res) => {
    const result = await AuthService.loginUser(req.body);
    const { refreshToken, accessToken, user } = result;

    // FIX: Access the property directly and fix the logic
    // Secure should be TRUE in production, FALSE in development (unless using local HTTPS)
    const isProduction = config.nodeEnv === "production";

    res.cookie("refreshToken", refreshToken, {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken,
            refreshToken,
            user,
        },
    });
});


const registerUser = catchAsync(async (req, res) => {
    const result = await AuthService.registerUser(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully. Please check your email for OTP.",
        data: result,
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Email verified successfully. You can now login.",
        data: result,
    });
});




const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    await AuthService.forgotPassword(email);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'OTP Sent Successfully.',
        data: null,
    });
});

const verifyOtp = catchAsync(async (req, res) => {
    const result = await AuthService.verifyOtp(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'OTP verified successfully. You can now reset your password.',
        data: result, // Contains the resetToken
    });
});


// auth.controller.ts
const resetPassword = catchAsync(async (req, res) => {
    // 1. Look for the 'authorization' header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Reset token is required in headers');
    }

    // 2. Extract token safely
    let token: string | undefined;

    if (authHeader.startsWith('Bearer ')) {
        const parts = authHeader.split(' ');
        if (parts.length !== 2) {
            throw AppError.of(StatusCodes.UNAUTHORIZED, 'Malformed Authorization header');
        }
        token = parts[1];
    } else {
        token = authHeader;
    }

    // Double check token exists (handles empty strings or whitespace)
    if (!token) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Token not found in header');
    }

    // 3. TypeScript is now satisfied that 'token' is a string
    await AuthService.resetPassword(token, req.body.newPassword);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Password reset successful.',
        data: null,
    });
});



export const AuthController = {
    loginUser,
    registerUser,
    verifyEmail,
    forgotPassword,
    verifyOtp,
    resetPassword
};