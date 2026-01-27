import { Router, type Router as ExpressRouter } from "express";



// import authRouter from "../modules/auth/auth.router";
// import userRouter from "../modules/user/user.router";
// import dashboardRouter from "../modules/dashboard/dashboard.router";
import { healthRouter } from './health.route';

type ModuleRoute = { path: `/${string}`; route: ExpressRouter };

const router = Router();
router.use(healthRouter);

const admin = Router();

const publicRoutes: ModuleRoute[] = [
    // { path: "/auth", route: authRouter },
    // { path: "/user", route: userRouter }
];

const adminRoutes: ModuleRoute[] = [
    // { path: "/dashboard", route: dashboardRouter }
];

publicRoutes.forEach(({ path, route }) => router.use(path, route));
adminRoutes.forEach(({ path, route }) => admin.use(path, route));

router.use("/admin", admin);

export default router;
