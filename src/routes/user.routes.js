import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";
import {
    login,
    logout,
    refresh,
    activateAccount,
    checkUsername,
    checkEmail,
    inviteUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
// router.route("/profile").get(verifyJWT, getProfile)
router.route("/refresh").post(refresh);
router.route("/activate-account").post(activateAccount);
router.route("/check-username").post(checkUsername);
router.route("/check-email").post(checkEmail);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_USERS));

router.route("/").post(inviteUser).get(getAllUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
