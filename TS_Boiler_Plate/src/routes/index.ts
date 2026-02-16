// import { Router, type Router as ExpressRouter } from "express";

// import { healthRouter } from './health.route';


// const router = Router();
// const admin = Router();
// // import authRouter from "../modules/auth/auth.router";
// // import userRouter from "../modules/user/user.router";
// // import dashboardRouter from "../modules/dashboard/dashboard.router";

// type ModuleRoute = { path: `/${string}`; route: ExpressRouter };

// router.use(healthRouter);


// const publicRoutes: ModuleRoute[] = [
//     // { path: "/auth", route: authRouter },
//     // { path: "/user", route: userRouter }
// ];

// const adminRoutes: ModuleRoute[] = [
//     // { path: "/dashboard", route: dashboardRouter }
// ];

// publicRoutes.forEach(({ path, route }) => router.use(path, route));
// adminRoutes.forEach(({ path, route }) => admin.use(path, route));

// router.use("/admin", admin);

// export default router;


import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { UserRoutes } from '../modules/user/user.route.js';

const router = Router();

const moduleRoutes = [
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