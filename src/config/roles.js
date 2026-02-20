export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    EDITOR: "editor",
    VIEWER: "viewer"
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: "Administrator",
    [ROLES.MANAGER]: "Manager",
    [ROLES.EDITOR]: "Content Editor",
    [ROLES.VIEWER]: "Viewer"
};

// (Optional, maybe I'll need it)
export const PERMISSIONS = {
    CAN_MANAGE_USERS: [ROLES.ADMIN],
    CAN_MANAGE_MEDIA: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR],
    CAN_MANAGE_CONTENT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR],
    CAN_MANAGE_SYSTEM: [ROLES.ADMIN],
    CAN_MANAGE_INQUIRIES: [ROLES.ADMIN, ROLES.MANAGER] // <-- Add this
};
