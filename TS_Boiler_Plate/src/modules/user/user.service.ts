import { buildApiQuery } from '../../utils/apiFeatures.js';
import AppError from '../../errors/AppError.js';
import { IUser } from './user.interface.js';
import { User } from './user.model.js';
import { StatusCodes } from 'http-status-codes';

const getMyProfileFromDB = async (userId: string) => {
    const result = await User.findById(userId).lean();

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
    const { filters, search, pagination } = buildApiQuery(query, {
        searchableFields: ['firstName', 'lastName', 'email'],
        filterableFields: ['role', 'isVerified'],
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'desc'
    });

    const queryObj = { ...filters };

    if (search) {
        queryObj.$or = search.fields.map((field) => ({
            [field]: { $regex: search.term, $options: 'i' }
        }));
    }

    const result = await User.find(queryObj)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();

    const total = await User.countDocuments(queryObj);

    return {
        meta: {
            page: pagination.page,
            limit: pagination.limit,
            total
        },
        data: result,
    };
};

export const UserService = {
    getMyProfileFromDB,
    updateMyProfileInDB,
    getAllUsersFromDB
};