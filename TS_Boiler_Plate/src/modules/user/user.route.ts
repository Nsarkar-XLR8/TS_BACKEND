import { USER_ROLE } from '../../constant/role.constant.js';
import { Auth } from '../../middlewares/Auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserController } from './user.controller.js';
import express from 'express';
import { UserValidation } from './user.validation.js';

const router = express.Router();

router.get(
    '/me',
    Auth(USER_ROLE.USER, USER_ROLE.ADMIN), // Protect the route
    validateRequest(UserValidation.getProfileSchema),
    UserController.getMyProfile
);

router.patch(
    '/me',
    Auth(USER_ROLE.USER, USER_ROLE.ADMIN),
    validateRequest(UserValidation.updateMyProfileSchema),
    UserController.updateMyProfile
);


router.get(
    '/get-all-users',
    Auth(USER_ROLE.ADMIN), // STRICT: Only admins can list all users
    validateRequest(UserValidation.getAllUsersQuerySchema),
    UserController.getAllUsers
);

export const UserRoutes = router;