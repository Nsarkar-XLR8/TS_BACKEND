import AppError from '../../errors/AppError.js';
import { IUser } from './user.interface.js';
import { User } from './user.model.js';
import { StatusCodes } from 'http-status-codes';

const getMyProfileFromDB = async (userId: string) => {
    const result = await User.findById(userId);

    if (!result) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User profile not found');
    }

    if (!result.isVerified) {
        throw AppError.of(StatusCodes.FORBIDDEN, 'Please verify your account first');
    }

    return result;
};

const updateMyProfileInDB = async (userId: string, payload: Partial<IUser>) => {
    const result = await User.findByIdAndUpdate(
        userId,
        payload,
        {
            new: true, // Return the document AFTER update
            runValidators: true // Ensure Mongoose schema constraints still apply
        }
    );

    if (!result) {
        throw AppError.of(StatusCodes.NOT_FOUND, 'User not found');
    }

    return result;
};


const getAllUsersFromDB = async (query: Record<string, unknown>) => {
    // Basic implementation of Pagination & Filtering
    const { page = 1, limit = 10, searchTerm, ...filters } = query;

    const queryObj = { ...filters };

    // Search logic (optional but recommended)
    if (searchTerm) {
        queryObj.$or = [
            { firstName: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const result = await User.find(queryObj)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit));

    const total = await User.countDocuments(queryObj);

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result,
    };
};

export const UserService = {
    getMyProfileFromDB,
    updateMyProfileInDB,
    getAllUsersFromDB
};