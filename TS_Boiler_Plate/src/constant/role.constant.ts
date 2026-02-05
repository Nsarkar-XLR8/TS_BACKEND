export const USER_ROLE = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    USER: "USER",
    OWNER: 'owner',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_LIST = Object.values(USER_ROLE) as UserRole[];

export function isUserRole(value: unknown): value is UserRole {
    return typeof value === "string" && (USER_ROLE_LIST as string[]).includes(value);
}
