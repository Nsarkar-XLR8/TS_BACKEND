import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";





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
        message: "User registered successfully. Please check your email for OTP.",
        data: result,
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Email verified successfully. You can now login.",
        data: result,
    });
});

export const AuthController = {
    loginUser,
    registerUser,
    verifyEmail,
};