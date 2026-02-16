import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

import AppError from "../../errors/AppError.js";
import { getAuthTokenMeta } from "../../utils/tokenMeta.js";


const loginUser = catchAsync(async (req, res) => {

    // console.log('RAW BODY:', req.body);
    // console.log('VALIDATED BODY:', req.validated?.body);

    const result = await AuthService.loginUser(req.validated!.body);
    const { refreshToken, accessToken, user } = result;

    const safeUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    };

    const meta = getAuthTokenMeta();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "User logged in successfully",
        data: {
            accessToken,
            refreshToken, // you said you need it in JSON
            ...meta,
            user: safeUser,
        },
    });
});




const registerUser = catchAsync(async (req, res) => {
    const result = await AuthService.registerUser(req.validated!.body);

    // If register returns Mongoose doc, map it to API shape here (id instead of _id)
    const safeUser = {
        id: result._id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
    };

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "User registered successfully. Please check your email for OTP.",
        data: safeUser,
    });
});




const verifyEmail = catchAsync(async (req, res) => {
    const { email, otp } = req.validated!.body;
    const result = await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Email verified successfully. You can now login.",
        data: result,
    });
});




const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.validated!.body;
    await AuthService.forgotPassword(email);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'OTP Sent Successfully.',
        data: null,
    });
});



const verifyOtp = catchAsync(async (req, res) => {
    const result = await AuthService.verifyOtp(req.validated!.body);

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
    await AuthService.resetPassword(token, req.validated!.body.newPassword);

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