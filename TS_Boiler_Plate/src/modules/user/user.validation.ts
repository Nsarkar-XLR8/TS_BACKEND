import { z } from 'zod';
import { USER_ROLE } from '../../constant/role.constant.js';

const updateMyProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(2).max(50).optional(),
        lastName: z.string().min(2).max(50).optional(),
        avatar: z.string().url().optional(),
    }).strict(), // CRITICAL: Rejects role, email, password, isVerified
});
// For GET /me, we ensure no body is passed
const getProfileSchema = z.object({
    body: z.object({}).strict(),
});

const getAllUsersQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        searchTerm: z.string().optional(),
        role: z.nativeEnum(USER_ROLE).optional(),
        isVerified: z.string().optional(),
    }),
});

export const UserValidation = {
    updateMyProfileSchema,
    getProfileSchema,
    getAllUsersQuerySchema
};