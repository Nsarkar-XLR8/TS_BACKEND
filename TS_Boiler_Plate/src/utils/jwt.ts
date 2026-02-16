/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { Secret, SignOptions, type JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError.js";
type StringValue = number | string;


export type JwtUserPayload = JwtPayload & {
    userId?: string;
    role?: string;
    email: string;
};

export const createToken = (
    payload: JwtUserPayload,
    secret: Secret,
    expiresIn: StringValue // Use StringValue directly
): string => {
    return jwt.sign(payload, secret, {
        expiresIn,
    } as SignOptions); // Cast the whole object to bypass strict optional check
};

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Fail fast: auth cannot work without it
        throw AppError.of(StatusCodes.INTERNAL_SERVER_ERROR, "JWT secret not configured", [
            { path: "server", message: "Missing JWT_SECRET" }
        ]);
    }
    return secret;
}

export function verifyAccessToken(token: string): JwtUserPayload {
    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        // jsonwebtoken can return string in some cases (rare with JWT)
        if (typeof decoded === "string") {
            throw AppError.of(StatusCodes.UNAUTHORIZED, "Invalid token", [
                { path: "authorization", message: "Token payload is invalid" }
            ]);
        }
        return decoded as JwtUserPayload;
    } catch (err: any) {
        // Normalize common JWT errors into operational AppError
        const name = err?.name as string | undefined;

        if (name === "TokenExpiredError") {
            throw AppError.of(StatusCodes.UNAUTHORIZED, "Token expired", [
                { path: "authorization", message: "Please login again" }
            ]);
        }

        throw AppError.of(StatusCodes.UNAUTHORIZED, "Invalid token", [
            { path: "authorization", message: "Token is invalid" }
        ]);
    }
}
