import { UserRole } from "@/constant/role.constant.js";
import { IUserResponse } from "../user/user.interface.js";



export interface IJwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

// Input for login
export interface ILoginCredentials {
    email: string;
    password: string;
}

// Unified response for the service/controller
export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: IUserResponse;
}