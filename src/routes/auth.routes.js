import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { me, login, logout, refresh, activateAccount, updateUser } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh").post(refresh);
router.route("/update").patch(verifyJWT, upload.single("file"), updateUser);
router.route("/me").get(verifyJWT, me);
router.route("/activate-account").post(activateAccount);

export default router;
