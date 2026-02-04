import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { login, logout, refresh, activateAccount } from "../controllers/auth.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh").post(refresh);
router.route("/activate-account").post(activateAccount);

export default router;
