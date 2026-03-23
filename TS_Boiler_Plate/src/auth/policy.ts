import { USER_ROLE, type UserRole } from "../constant/role.constant.js";

const rolePriority: Record<string, number> = {
    [USER_ROLE.USER]: 1,
    [USER_ROLE.OWNER]: 2,
    [USER_ROLE.ADMIN]: 3,
    [USER_ROLE.SUPER_ADMIN]: 4,
};

export function canAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    if (allowedRoles.length === 0) return true;
    if (allowedRoles.includes(userRole)) return true;

    const userRank = rolePriority[userRole] ?? 0;
    return allowedRoles.some((role) => userRank >= (rolePriority[role] ?? 0));
}
