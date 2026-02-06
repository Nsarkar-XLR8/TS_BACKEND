import { USER_ROLE } from '../../constant/role.constant';
import { Auth } from '../../middlewares/Auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import express from 'express';
import { UserValidation } from './user.validation';

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
    UserController.getAllUsers,
    validateRequest(UserValidation.getAllUsersQuerySchema)
);

export const UserRoutes = router;