import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { PERMISSIONS } from "../config/roles.js";
import {
    checkUsername,
    checkEmail,
    inviteUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

const router = Router();

router.route("/check-username").post(checkUsername);
router.route("/check-email").post(checkEmail);

router.route("/:id").get(getUser);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_USERS));

router.route("/").post(inviteUser).get(getAllUsers);
router.route("/:id").patch(upload.single("file"), updateUser).delete(deleteUser);

export default router;
