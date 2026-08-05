

export const USER_ROLES = [
    "USER",
    "OWNER",
    "AGENCY",
    "HOTEL",
    "ADMIN"
] as const;

export type UserRole = (typeof USER_ROLES)[number];