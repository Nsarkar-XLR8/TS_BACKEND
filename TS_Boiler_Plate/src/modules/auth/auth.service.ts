import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ILoginCredentials, ILoginResponse } from './auth.interface';
import { createToken } from '../../utils/jwt';
import { IUser } from '../user/user.interface';
import { sendEmail } from '../../utils/sendEmail';



const registerUser = async (payload: IUser) => {
    // 1. Check existence
    const isUserExists = await User.findOne({ email: payload.email });
    if (isUserExists) {
        throw AppError.of(StatusCodes.BAD_REQUEST, 'User already exists');
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
/**
 * Verify Email via OTP
 */
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
    user.otp = undefined; // Using undefined because of our strict interface
    user.otpExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
};


const loginUser = async (payload: ILoginCredentials): Promise<ILoginResponse> => {
    // 1. Check if user exists (Must explicitly select password)
    const user = await User.findOne({ email: payload.email }).select('+password');

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
        config.jwt.jwtAccesSecret as string,
        config.jwt.jwtExpiresIn as string
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt.refreshSecret as string,
        config.jwt.refreshExpiresIn as string
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
            avatar: user.avatar, // This will now pass as string | undefined is allowed
        },
    };

};

export const AuthService = {
    registerUser,
    verifyEmail,
    loginUser,
};