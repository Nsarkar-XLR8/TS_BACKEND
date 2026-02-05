import { Model } from "mongoose";
import { UserRole } from "../../constant/role.constant";


export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isVerified: boolean;
    otp?: string | undefined;
    otpExpires?: Date | undefined;
    avatar?: string | undefined;
}

export interface IUserResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string | undefined;
}


// export type IUserResponse = Pick<IUser, 'firstName' | 'lastName' | 'email' | 'role' | 'avatar'> & { _id: string };

export interface UserModel extends Model<IUser> {
    isPasswordMatch(plainText: string, hashed: string): Promise<boolean>;
}