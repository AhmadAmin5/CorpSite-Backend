import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { login, logout, refresh, inviteUser, activateAccount, checkUsername, checkEmail } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh").post(refresh);
router.route("/invite-user").post(verifyJWT, authorizeRoles("admin"), inviteUser);
router.route("/activate-account").post(activateAccount);
router.route("/check-username").post(checkUsername);
router.route("/check-email").post(checkEmail);

export default router;
