import { User } from "../../modules/user/user.model.js";
import type { CronJob } from "../index.js";

/**
 * Example cron job: Removes unverified users whose OTP has expired.
 * Runs every hour. Prevents stale registrations from clogging the DB.
 */
export const cleanExpiredOtpJob: CronJob = {
    name: "clean-expired-otp",
    schedule: "0 * * * *", // every hour at :00
    enabled: true,
    handler: async () => {
        const result = await User.deleteMany({
            isVerified: false,
            otpExpires: { $lt: new Date() },
        });
        if (result.deletedCount > 0) {
            // Logger is available via the scheduler wrapper
            console.log(`Cleaned ${result.deletedCount} expired unverified users`);
        }
    },
};
