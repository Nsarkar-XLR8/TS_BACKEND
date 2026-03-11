/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "node:crypto";
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { IUser } from '../user/user.interface.js';
import { User } from '../user/user.model.js';
import AppError from '@/errors/AppError.js';
import { sendEmail } from '@/utils/sendEmail.js';
import { ILoginCredentials, ILoginResponse } from './auth.interface.js';
import { createToken } from '@/utils/jwt.js';
import config from '@/config/index.js';
import { blacklistToken, isTokenBlacklisted } from '@/lib/redis.js';




const registerUser = async (payload: IUser) => {
    // 1. Check existence
    const isUserExists = await User.findOne({ email: payload.email }).lean();
    if (isUserExists) {
        throw AppError.of(StatusCodes.BAD_REQUEST, 'User already exists');
    }

    // 2. Generate cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Create User
    const newUser = await User.create({
        ...payload,
        otp,
        otpExpires,
        isVerified: false,
    });

    if (!newUser) {
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user');
    }

    // 4. Send Email
    const emailResult = await sendEmail({
        to: newUser.email,
        subject: 'Verify Your Email',
        html: `<h1>Your OTP is: ${otp}</h1><p>Expires in 10 minutes.</p>`,
    });

    // 5. Elite Guard: If email fails, remove user so they can try again
    if (!emailResult.success) {
        await User.findByIdAndDelete(newUser._id);
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, 'Email delivery failed. Try again.');
    }

    // 6. Return Clean Data (No password, no OTP)
    return {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
    };
};

const verifyEmail = async (email: string, otp: string) => {
    // 1. Find user (Explicitly select OTP fields)
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User not found');
    }

    // 2. Validate OTP and Expiry
    if (!user.otp || user.otp !== otp) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Invalid OTP');
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'OTP has expired');
    }

    // 3. Update User status and Clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
};


const loginUser = async (payload: ILoginCredentials): Promise<ILoginResponse> => {
    // 1. Check if user exists (Must explicitly select password)
    const user = await User.findOne({ email: payload.email }).select('+password').lean();

    if (!user) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User not found', [
            { path: 'email', message: 'No account associated with this email' }
        ]);
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Email not verified', [
            { path: 'email', message: 'Please verify your email before logging in' }
        ]);
    }

    // 3. Compare Password
    const isPasswordMatch = await User.isPasswordMatch(payload.password, user.password);

    if (!isPasswordMatch) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Invalid credentials', [
            { path: 'password', message: 'Incorrect password' }
        ]);
    }

    // 4. Create JWT Payload
    const jwtPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    };

    // 5. Generate Tokens
    const accessToken = createToken(
        jwtPayload,
        config.jwt.jwtAccessSecret,
        config.jwt.jwtExpiresIn
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt.refreshSecret,
        config.jwt.refreshExpiresIn
    );

    return {
        accessToken,
        refreshToken,
        user: {
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    };

};



const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email }).lean();

    // Security: If user doesn't exist, don't throw error. 
    // Return early so controller can send generic success.
    if (!user) return;

    // 1. Generate cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // 2. Update User Record
    await User.findByIdAndUpdate(user._id, {
        otp,
        otpExpires,
    });

    // 3. Send Email
    const emailResult = await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP',
        html: `<div>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</div>`,
    });

    if (!emailResult.success) {
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send email');
    }
};

const verifyOtp = async (payload: { email: string; otp: string }) => {
    // 1. Find user with matching email, otp, and check if not expired
    const user = await User.findOne({
        email: payload.email,
        otp: payload.otp,
        otpExpires: { $gt: new Date() }, // Check if current time < expiry
    }).lean();

    if (!user) {
        throw AppError.of(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP');
    }

    // 2. Generate a short-lived Reset Token (15 mins)
    const resetToken = jwt.sign(
        { email: user.email, role: user.role, type: 'password_reset' },
        config.jwt.jwtAccessSecret,
        { expiresIn: '15m' }
    );

    return { resetToken };
};


// Remove confirmPassword from here. It is useless at this layer.
const resetPassword = async (token: string, newPassword: string) => {
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt.jwtAccessSecret) as any;
    } catch {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token');
    }

    if (decoded.type !== 'password_reset') {
        throw AppError.of(StatusCodes.FORBIDDEN, 'Invalid token type');
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) throw AppError.of(StatusCodes.NOT_FOUND, 'User not found');

    // Update and Wipe
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save(); // Must use .save() to trigger hashing middleware
};


// ── New: Refresh Access Token ────────────────────────────────────────

const refreshAccessToken = async (refreshToken: string) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    } catch {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token', [
            { path: 'refreshToken', message: 'Please login again' }
        ]);
    }

    const { userId, email, role } = decoded;
    if (!userId || !email) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Malformed refresh token');
    }

    // Check if token has been blacklisted (logout)
    const blacklisted = await isTokenBlacklisted(`refresh:${userId}:${decoded.iat}`);
    if (blacklisted) {
        throw AppError.of(StatusCodes.UNAUTHORIZED, 'Token has been revoked', [
            { path: 'refreshToken', message: 'This refresh token has been revoked. Please login again.' }
        ]);
    }

    // Verify user still exists
    const user = await User.findById(userId).lean();
    if (!user) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User no longer exists');
    }

    // Issue new access token
    const newAccessToken = createToken(
        { userId, email, role },
        config.jwt.jwtAccessSecret,
        config.jwt.jwtExpiresIn
    );

    return { accessToken: newAccessToken };
};


// ── New: Logout (Blacklist refresh token) ────────────────────────────

const logoutUser = async (userId: string, refreshToken?: string) => {
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
            const ttl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;
            if (ttl > 0) {
                await blacklistToken(`refresh:${userId}:${decoded.iat}`, ttl);
            }
        } catch {
            // Token already expired or invalid — nothing to blacklist
        }
    }
    return { message: 'Logged out successfully' };
};


// ── New: Resend OTP ──────────────────────────────────────────────────

const resendOtp = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.isVerified) {
        throw AppError.of(StatusCodes.BAD_REQUEST, 'Email is already verified');
    }

    // Generate new cryptographically secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailResult = await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - New OTP',
        html: `<h1>Your new OTP is: ${otp}</h1><p>Expires in 10 minutes.</p>`,
    });

    if (!emailResult.success) {
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send OTP email');
    }

    return { message: 'OTP resent successfully' };
};

export const AuthService = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    refreshAccessToken,
    logoutUser,
    resendOtp
};

