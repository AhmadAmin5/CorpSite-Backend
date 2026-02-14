import { Router } from "express";
import { getSettings, updateSetting } from "../controllers/setting.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

const router = Router();

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_SYSTEM)); 

router.route("/").get(getSettings).post(updateSetting);

export default router;