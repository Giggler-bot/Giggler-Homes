import type { Request } from "express";

type AuthenticatedUser = NonNullable<Request["user"]>;

type ManageableProperty = {
    ownerId: string;
};

export function canManageProperty(
    user: Pick<AuthenticatedUser, "id" | "role">,
    property: ManageableProperty,
): boolean {
    return user.role === "ADMIN" || user.id === property.ownerId;
}