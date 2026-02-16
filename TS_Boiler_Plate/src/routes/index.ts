

import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { UserRoutes } from '../modules/user/user.route.js';
import { healthRouter } from './health.route.js';
import { rootRouter } from './root.routes.js';

const router = Router();

const moduleRoutes = [
    {
        path: '/',
        route: rootRouter,
    },
    {
        path: '/',
        route: healthRouter,
    },
    {
        path: '/auth',
        route: AuthRoutes,
    },
    {
        path: '/user',
        route: UserRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;